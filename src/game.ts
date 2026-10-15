import {DIFFICULTIES,DEFAULT_DIFFICULTY,Difficulty} from './difficulty';

export type {Difficulty} from './difficulty';

import Matter from 'matter-js';

import {makeCharacterParts,drawCupRig} from './characters';

const {Engine,Bodies,Body,Composite,Constraint,Events}=Matter;

// Matter 0.20 supports a pivot argument that the installed typings omit.

const rotateAt=Body.rotate as (body:Matter.Body,angle:number,pivot:Matter.Vector)=>void;

import {TEAMS} from './teams';

export {TEAMS} from './teams';

export type Mode='normal'|'golden'|'practice';



export type Aim={x:number;y:number;pointer?:{x:number;y:number}};

export type CpuTactic='ATTACK'|'PRESS'|'RETREAT'|'GOALKEEP'|'RECOVER';
export type CpuAction='launch'|'hold'|'wait-ground'|'wait-cooldown'|'wait-reaction';
export type CpuStatus={state:CpuTactic;action:CpuAction;reason:string;target:{x:number;y:number};goalIn:number|null;aimRisk:number;grounded:boolean;time?:number;launch?:{x:number;y:number}};
type CpuSample={x:number;y:number;vx:number;vy:number;frame:number;goal:number|null};
type CpuOption={kind:'strike'|'block'|'move'|'recover';x:number;y:number;target:{x:number;y:number};frames:number;score:number;margin:number};
type CpuProbe={touch:boolean;touchFrame:number;touchVX:number;touchVY:number;ownGoal:boolean;goal:boolean;forecast:number|null;endFrame:number;x:number;y:number;vx:number;vy:number;minX:number;cpuX:number;cpuY:number;cpuVX:number;cpuVY:number};

export const WIDTH=1000,HEIGHT=562,GROUND=510,GOAL_TOP=310;

export const PLAYER_BALL_IMPACT_BOOST=.65, BALL_SPEED_LIMIT=42, BALL_RADIUS=18.5;

const BALL_MASS=Bodies.circle(0,0,17,{density:.0045}).mass;

export class Match {

 impactBoost=PLAYER_BALL_IMPACT_BOOST;

 private pendingBallImpact:{x:number;y:number}|null=null;

 private lastBallImpact=-Infinity;

 private roofRestTime=0;

 engine=Engine.create({gravity:{x:0,y:.55},positionIterations:8,velocityIterations:8,constraintIterations:4});players:Matter.Body[][]=[];ball:Matter.Body;objects:Matter.Body[]=[];

 multiplayer=false;score=[0,0];duration=45;time=45;phase='idle';message='';teams=['ARG','BRA'];cooldown=[0,0];standing=[true,true];resetTimer=0;aiTimer=0;mode:Mode='normal';difficulty:Difficulty=DEFAULT_DIFFICULTY;suddenDeath=false;onGoal?:()=>void;

 constructor(private readonly simulation=false){

  const walls=[Bodies.rectangle(500,GROUND+20,1100,40,{isStatic:true,friction:.48}),Bodies.rectangle(-10,280,20,560,{isStatic:true}),Bodies.rectangle(1010,280,20,560,{isStatic:true}),Bodies.rectangle(500,-20,1000,40,{isStatic:true}),Bodies.rectangle(32,GOAL_TOP,64,8,{isStatic:true}),Bodies.rectangle(968,GOAL_TOP,64,8,{isStatic:true})];Composite.add(this.engine.world,walls);

  for(let p=0;p<2;p++){

   const x=p===0?140:860,g=Body.nextGroup(true),opt={collisionFilter:{group:g},friction:.48,restitution:.10,frictionAir:.003};

   const torso=Bodies.rectangle(x,461,42,44,{...opt,chamfer:{radius:2},density:.0022});const head=Bodies.circle(x,426,11,{...opt,density:.002});

   const la=Bodies.rectangle(x-26,460,10,36,{...opt}),ra=Bodies.rectangle(x+26,460,10,36,{...opt});

   const ll=Bodies.rectangle(x-11,497,11,24,{...opt}),rl=Bodies.rectangle(x+11,497,11,24,{...opt});

   const parts=[torso,head,la,ra,ll,rl];

   parts.forEach(part=>Body.setMass(part,part.mass*1.15));this.players.push(parts);

   const joints=[Constraint.create({bodyA:torso,pointA:{x:0,y:-22},bodyB:head,pointB:{x:0,y:11},stiffness:.96,length:2}),...[-1,1].map((side,i)=>Constraint.create({bodyA:torso,pointA:{x:side*21,y:-17},bodyB:parts[i+2],pointB:{x:-side*5,y:-16},stiffness:.96,length:0})),...[-1,1].map((side,i)=>Constraint.create({bodyA:torso,pointA:{x:side*11,y:22},bodyB:parts[i+4],pointB:{x:0,y:-11},stiffness:.95,length:2}))];

   Composite.add(this.engine.world,[...parts,...joints]);

  }

  this.ball=Bodies.circle(500,160,BALL_RADIUS,{restitution:.90,friction:.012,frictionAir:.0003,density:.0045});Body.setMass(this.ball,BALL_MASS);Composite.add(this.engine.world,this.ball);this.objects=[...this.players.flat(),this.ball];

  Events.on(this.engine,'collisionStart',event=>{for(const pair of event.pairs){for(let p=0;p<2;p++){if(!this.standing[p]||(p===1&&this.mode==='practice'))continue;const a=this.players[p].includes(pair.bodyA),b=this.players[p].includes(pair.bodyB);const other=a?pair.bodyB:b?pair.bodyA:null;if(other&&!other.isStatic&&other.speed>2.5)this.release(p);}}});

  Events.on(this.engine,'collisionStart',event=>{

   if(this.phase!=='playing'||this.engine.timing.timestamp-this.lastBallImpact<120)return;

   let strongest:Matter.Pair|undefined,closing=2;

   for(const pair of event.pairs){

    const other=pair.bodyA===this.ball?pair.bodyB:pair.bodyB===this.ball?pair.bodyA:null;

    if(!other||!this.players.some(parts=>parts.includes(other)))continue;

    const n=pair.collision.normal;

    const approach=-((pair.bodyA.velocity.x-pair.bodyB.velocity.x)*n.x+(pair.bodyA.velocity.y-pair.bodyB.velocity.y)*n.y);

    if(approach>closing){closing=approach;strongest=pair;}

   }

   // One amplified impact per contact burst, not one per overlapping limb.

   // Floor/wall restitution, player mass and launch velocity stay unchanged.

   if(strongest){

    const sign=strongest.bodyA===this.ball?1:-1,n=strongest.collision.normal;

    this.pendingBallImpact={x:n.x*sign*closing*this.impactBoost,y:n.y*sign*closing*this.impactBoost};

    this.lastBallImpact=this.engine.timing.timestamp;

   }

  });

  Events.on(this.engine,'afterUpdate',()=>{

   this.limitJoints();

   if(!this.pendingBallImpact)return;

   const boost=this.pendingBallImpact;this.pendingBallImpact=null;

   const vx=this.ball.velocity.x+boost.x,vy=this.ball.velocity.y+boost.y;

   const scale=Math.min(1,BALL_SPEED_LIMIT/Math.max(1,Math.hypot(vx,vy)));

   Body.setVelocity(this.ball,{x:vx*scale,y:vy*scale});

  });

  Events.on(this.engine,'beforeUpdate',()=>this.flexJoints(this.engine.timing.lastDelta));

  this.resetPositions();

 }

 // Internal angular springs preserve anatomy without welding the pieces or

 // steering the figure upright. All angles are relative to its moving torso.

 private flexJoints(delta:number){

  const rest=[0,.16,-.16,.08,-.08],limits=[.45,1.9,1.9,.95,.95];

  const step=Math.min(2,delta/(1000/60));

  for(const parts of this.players){

   const torso=parts[0];if(torso.isStatic)continue;

   parts.slice(1).forEach((part,i)=>{

    const angle=Math.atan2(Math.sin(part.angle-torso.angle),Math.cos(part.angle-torso.angle));

    const excess=angle-Math.max(-limits[i],Math.min(limits[i],angle));

    const relative=part.angularVelocity-torso.angularVelocity;

    const correction=Math.max(-.12,Math.min(.12,((rest[i]-angle)*.0025-excess*.08-relative*.045)*step));

    const inverse=part.inverseInertia+torso.inverseInertia;

    // Equal and opposite angular impulses: joints cannot propel the player.

    Body.setAngularVelocity(part,part.angularVelocity+correction*part.inverseInertia/inverse);

    Body.setAngularVelocity(torso,torso.angularVelocity-correction*torso.inverseInertia/inverse);

   });

  }

 }

 private limitJoints(){

  const limits=[.65,2.15,2.15,1.15,1.15];

  const anchors=[[0,11],[5,-16],[-5,-16],[0,-11],[0,-11]];

  for(const parts of this.players){

   const torso=parts[0];if(torso.isStatic)continue;

   parts.slice(1).forEach((part,i)=>{

    const angle=Math.atan2(Math.sin(part.angle-torso.angle),Math.cos(part.angle-torso.angle));

    const correction=Math.max(-limits[i],Math.min(limits[i],angle))-angle;

    if(!correction)return;

    const [x,y]=anchors[i],c=Math.cos(part.angle),s=Math.sin(part.angle);

    // A rotational joint stop pivots at the attachment, never at the limb's

    // center, so hitting the limit cannot pull the shoulder/hip apart.

    rotateAt(part,correction,{x:part.position.x+c*x-s*y,y:part.position.y+s*x+c*y});

    const relative=part.angularVelocity-torso.angularVelocity;

    if(relative*angle>0){

     const shared=(part.angularVelocity*part.inertia+torso.angularVelocity*torso.inertia)/(part.inertia+torso.inertia);

     Body.setAngularVelocity(part,shared);Body.setAngularVelocity(torso,shared);

    }

   });

  }

 }

 release(p:number){this.standing[p]=false;this.players[p].forEach(b=>Body.setStatic(b,false));}

 resetPositions(){this.roofRestTime=0;this.lastBallImpact=-Infinity;this.pendingBallImpact=null;this.resetBot();this.players.forEach((parts,p)=>{const x=p?860:140,poses=[[x,461],[x,426],[x-26,460],[x+26,460],[x-11,497],[x+11,497]];parts.forEach((b,i)=>{Body.setStatic(b,false);Body.setPosition(b,{x:poses[i][0],y:poses[i][1]});Body.setAngle(b,0);Body.setVelocity(b,{x:0,y:0});Body.setAngularVelocity(b,0);b.collisionFilter.mask=p===1&&this.mode==='practice'?0:0xFFFFFFFF;Body.setStatic(b,true);});});this.standing=[true,true];Body.setPosition(this.ball,{x:500,y:160});Body.setVelocity(this.ball,{x:this.simulation?0:(Math.random()-.5)*5,y:-3});Body.setAngularVelocity(this.ball,.08);this.cooldown=[0,0];this.aiTimer=this.difficulty==='hard'?0:DIFFICULTIES[this.difficulty].delay;}



 start(teams:string[],mode:Mode,difficulty:Difficulty,duration:number){this.teams=teams;this.mode=mode;this.difficulty=difficulty;this.duration=duration;this.time=duration;this.score=[0,0];this.suddenDeath=false;this.phase='countdown';this.message='3';this.resetTimer=2.4;this.resetPositions();}

 extraTime(){this.phase='countdown';this.resetTimer=2.4;this.suddenDeath=true;this.message='3';this.resetPositions();}

 launch(p:number,x:number,y:number){if(this.phase!=='playing'||this.cooldown[p]>0||(p===1&&this.mode==='practice'))return false;const len=Math.hypot(x,y);if(len<1)return false;const f=Math.min(1,18.5/len);if(p===0)this.setHumanAim(null);this.release(p);const vx=x*f,vy=y*f;const spin=Math.sign(vx||1)*Math.min(.045,.015+Math.hypot(vx,vy)*.0016);const parts=this.players[p],mass=parts.reduce((sum,b)=>sum+b.mass,0);

  const center=parts.reduce((c,b)=>({x:c.x+b.position.x*b.mass/mass,y:c.y+b.position.y*b.mass/mass}),{x:0,y:0});

  // One translation and one shared rotation, with the appropriate tangential

  // velocity at each part: the whole figure launches and tumbles together.

  parts.forEach(b=>{Body.setVelocity(b,{x:vx-spin*(b.position.y-center.y),y:vy+spin*(b.position.x-center.x)});Body.setAngularVelocity(b,spin);});this.cooldown[p]=.28;return true;}



 tick(dt:number){

  this.cooldown=this.cooldown.map(v=>Math.max(0,v-dt));

  if(this.phase==='countdown'){this.resetTimer-=dt;this.message=String(Math.max(1,Math.ceil(this.resetTimer)));if(this.resetTimer<=0){this.phase='playing';this.message='';}return;}

  if(this.phase==='goal'){this.engine.timing.timeScale=.08;Engine.update(this.engine,dt*500);Engine.update(this.engine,dt*500);this.engine.timing.timeScale=1;this.resetTimer-=dt;if(this.resetTimer<=0){if((this.mode==='golden'||this.suddenDeath)&&this.mode!=='practice'){this.finish();}else{this.phase='countdown';this.resetTimer=1;this.message='1';this.resetPositions();}}return;}

  if(this.phase!=='playing')return;

  if(this.mode==='normal'&&!this.suddenDeath){this.time=Math.max(0,this.time-dt);if(this.time===0){this.finish();return;}}

  // Observe before each physics substep, even while airborne or cooling down.
  for(let step=0;step<2;step++){
   if(!this.multiplayer&&this.mode!=='practice')this.ai(dt*.5);
   Engine.update(this.engine,dt*500);
  }

  this.releaseRoofBall(dt);

  this.objects.forEach(b=>{const v=b.velocity,l=Math.hypot(v.x,v.y);const limit=b===this.ball?BALL_SPEED_LIMIT:34;if(l>limit)Body.setVelocity(b,{x:v.x*limit/l,y:v.y*limit/l});});

  if(this.ball.position.y>GOAL_TOP+20&&(this.ball.position.x<43||this.ball.position.x>957)){const scorer=this.ball.position.x<53?1:0;this.score[scorer]++;this.phase='goal';this.resetTimer=2.4;this.message='GOAL!';this.onGoal?.();}

 }

 // Ball-only crossbar escape. No AI input or player forces are involved.

 private releaseRoofBall(dt:number){

  const b=this.ball,{x,y}=b.position;

  const roofY=GOAL_TOP-4-BALL_RADIUS;

  const left=x>=BALL_RADIUS&&x<=82;

  const right=x>=918&&x<=WIDTH-BALL_RADIUS;

  // Only correct a slow ball actually resting on a crossbar.

  if(this.phase!=='playing'||(!left&&!right)||Math.abs(y-roofY)>9||

     Math.abs(b.velocity.y)>2.2||Math.abs(b.velocity.x)>3){

   this.roofRestTime=0;return;

  }

  this.roofRestTime+=dt;

  if(this.roofRestTime<.25)return;

  const direction=left?1:-1;

  // Give the ball enough horizontal velocity to leave the roof without

  // teleporting it or altering the bot's movement and targeting.

  Body.setVelocity(b,{x:direction*8,y:-2.8});

  Body.setAngularVelocity(b,direction*.18);

  this.roofRestTime=0;

 }

 // CPU v2: perception -> priority tactics -> legal launch/hold -> observe again.
 // botState keeps the old debug labels compatible; botTactic is the actual FSM.
 botTactic:CpuTactic='ATTACK';
 get botState():'charge'|'defend'|'recover'{return this.botTactic==='RECOVER'?'recover':this.botTactic==='ATTACK'||this.botTactic==='PRESS'?'charge':'defend';}
 botTarget={x:500,y:160};
 botStatus:CpuStatus={state:'ATTACK',action:'hold',reason:'kickoff',target:{x:500,y:160},goalIn:null,aimRisk:0,grounded:true};
 // Opt-in, bounded diagnostics. No logging or growing history during normal play.
 botDebug=false;
 botHistory:CpuStatus[]=[];
 private botOpening=true;
 private botClock=0;
 private botGroundTime=0;
 private botLaunchAge=1;
 private botStuckTime=0;
 private botQuietTime=0;
 private botStateAge=0;
 private botProbeWait=0;
 private botWasReady=false;
 private botLastThreat=false;
 private botAim:{x:number;y:number}|null=null;
 private botAimAge=Infinity;
 private botSandbox:Match|null=null;

 private resetBot(){
  this.botTactic='ATTACK';this.botTarget={x:500,y:160};this.botOpening=true;
  this.botClock=0;this.botGroundTime=0;this.botLaunchAge=1;this.botStuckTime=0;
  this.botQuietTime=0;this.botStateAge=0;this.botProbeWait=0;this.botWasReady=false;this.botLastThreat=false;
  this.botAim=null;this.botAimAge=Infinity;this.botHistory=[];
  this.botStatus={state:'ATTACK',action:'hold',reason:'kickoff',target:{...this.botTarget},goalIn:null,aimRisk:0,grounded:true};
 }

 // Input is the visible arrow in canvas units, just as supplied to paint().
 // A headless caller may supply it directly; release/cancel/reset clears it.
 setHumanAim(aim:Aim|null){
  if(!aim||!Number.isFinite(aim.x)||!Number.isFinite(aim.y)||this.multiplayer||this.mode==='practice'||this.phase!=='playing'){
   this.botAim=null;this.botAimAge=Infinity;return;
  }
  const speed=Math.hypot(aim.x,aim.y)*.058;
  if(speed<1){this.botAim=null;this.botAimAge=Infinity;return;}
  const scale=.058*Math.min(1,18.5/speed);
  this.botAim={x:aim.x*scale,y:aim.y*scale};this.botAimAge=0;
 }

 private botSupported(player:number){
  const parts=this.players[player];
  if(this.standing[player])return true;
  // A rising foot grazing the turf is takeoff, not a fresh landing.
  const floor=parts.some(b=>b.bounds.max.y>=GROUND-3&&b.velocity.y>=-.7);
  if(floor)return true;
  return this.engine.pairs.list.some((pair:Matter.Pair)=>{
   if(!pair.isActive)return false;
   const other=parts.includes(pair.bodyA)?pair.bodyB:parts.includes(pair.bodyB)?pair.bodyA:null;
   if(!other)return false;
   const support=this.players[1-player];
   if(support.includes(other))return other.speed<2.5&&parts[0].position.y<other.position.y
    &&support.some(b=>b.bounds.max.y>=GROUND-3)&&parts[0].velocity.y>=-.7;
   if(other===this.ball)return other.speed<2&&other.bounds.max.y>=GROUND-2
    &&parts[0].position.y<other.position.y&&parts[0].velocity.y>=-.7;
   return other.isStatic&&other.position.y>=GROUND&&parts[0].velocity.y>=-.7;
  });
 }

 private botCenter(player:number){
  let x=0,y=0,vx=0,vy=0,total=0;
  for(const body of this.players[player]){
   const original=(body as Matter.Body&{_original?:{mass:number}})._original;
   const mass=Number.isFinite(body.mass)?body.mass:original?.mass||1;
   x+=body.position.x*mass;y+=body.position.y*mass;
   vx+=body.velocity.x*mass;vy+=body.velocity.y*mass;total+=mass;
  }
  return {x:x/total,y:y/total,vx:vx/total,vy:vy/total};
 }

 // Launch velocity is measured per 60 Hz frame. Integrate the same two half
 // steps and air drag as tick(), rather than mixing seconds and frame units.
 private botMotion(frames:number,drag=.003){
  let distance=0,gravity=0,speed=1,fall=0;
  const g=this.engine.gravity.y*this.engine.gravity.scale*(1000/60)**2;
  for(let f=0;f<frames*2;f++){
   speed*=1-drag*.5;fall=fall*(1-drag*.5)+g*.5;
   distance+=speed*.5;gravity+=fall*.5;
  }
  return {distance,gravity,speed,fall};
 }

 private botTrajectory(frames:number):CpuSample[]{
  let {x,y}=this.ball.position,{x:vx,y:vy}=this.ball.velocity;
  const path:CpuSample[]=[{x,y,vx,vy,frame:0,goal:null}];
  const r=BALL_RADIUS,g=this.engine.gravity.y*this.engine.gravity.scale*(1000/60)**2;
  const roof=GOAL_TOP-4-r,under=GOAL_TOP+4+r;
  for(let frame=1;frame<=frames;frame++){
   for(let step=0;step<2;step++){
    const ox=x,oy=y;vx*=1-this.ball.frictionAir*.5;vy=vy*(1-this.ball.frictionAir*.5)+g*.5;
    x+=vx*.5;y+=vy*.5;
    if(x<r){x=r+(r-x);vx=Math.abs(vx)*.9;}
    if(x>WIDTH-r){x=WIDTH-r-(x-(WIDTH-r));vx=-Math.abs(vx)*.9;}
    if(y<r){y=r+(r-y);vy=Math.abs(vy)*.9;}
    if(y>GROUND-r){y=GROUND-r;vy=-Math.abs(vy)*.9;}
    // Both faces and the inner ends of the two solid crossbars matter.
    if(x<64+r||x>936-r){
     // Circle polygons rest a fraction of a pixel inside the ideal radius.
     if(oy<=roof+2&&y>roof&&vy>0){y=roof;vy=-Math.abs(vy)*.9;}
     else if(oy>=under-2&&y<under&&vy<0){y=under;vy=Math.abs(vy)*.9;}
    }
    if(y>roof&&y<under){
     if(ox>=64+r&&x<64+r){x=64+r;vx=Math.abs(vx)*.9;}
     if(ox<=936-r&&x>936-r){x=936-r;vx=-Math.abs(vx)*.9;}
    }
   }
   const goal=y>GOAL_TOP+20?(x>957?1:x<43?0:null):null;
   path.push({x,y,vx,vy,frame,goal});if(goal!==null)break;
  }
  return path;
 }

 private botOnRoof(){
  const {x,y}=this.ball.position,v=this.ball.velocity;
  return (x<=82||x>=918)&&Math.abs(y-(GOAL_TOP-4-BALL_RADIUS))<=9&&Math.abs(v.x)<=3&&Math.abs(v.y)<=2.2;
 }

 private botAimThreat(path:CpuSample[]){
  if(!this.botAim||this.botAimAge>.12||this.cooldown[0]>0)return 0;
  const human=this.botCenter(0),aim=this.botAim;
  if(aim.x<3||human.x>this.ball.position.x+45)return 0;
  let risk=0;
  for(let f=2;f<Math.min(path.length,29);f+=2){
   const motion=this.botMotion(f),q=path[f];
   const x=human.x+aim.x*motion.distance,y=human.y+aim.y*motion.distance+motion.gravity;
   const gap=Math.hypot(x-q.x,y-q.y);
   if(gap<68&&q.x>450)risk=Math.max(risk,(1-gap/90)*(1-f/70));
  }
  return risk*(this.difficulty==='hard'?1:this.difficulty==='normal'?.65:.3);
 }

 private botPassiveContact(path:CpuSample[],limit=24){
  // This is only a quick geometric filter. A legal hold/launch is verified in
  // the real ragdoll simulation before the controller commits to it.
  for(let f=1;f<Math.min(path.length,limit+1);f++){
   const q=path[f],motion=this.botMotion(f);
   for(let i=0;i<6;i++){
    const part=this.players[1][i],fixed=part.isStatic;
    const a=part.angle+(fixed?0:part.angularVelocity*motion.distance);
    const c=Math.cos(a),s=Math.sin(a),hw=[21,11,5,5,5.5,5.5][i],hh=[22,11,18,18,12,12][i];
    const x=part.position.x+(fixed?0:part.velocity.x*motion.distance);
    const y=fixed?part.position.y:Math.min(GROUND-Math.abs(c)*hh-Math.abs(s)*hw,part.position.y+part.velocity.y*motion.distance+motion.gravity);
    const dx=q.x-x,dy=q.y-y,localX=dx*c+dy*s,localY=-dx*s+dy*c;
    const gap=i===1?Math.hypot(dx,dy)-11:Math.hypot(Math.max(0,Math.abs(localX)-hw),Math.max(0,Math.abs(localY)-hh));
    if(gap<BALL_RADIUS-2)return f;
   }
  }
  return null;
 }

 private botIntercepts(path:CpuSample[],blocking:boolean,deadline=72):CpuOption[]{
  const p=this.botCenter(1),enemy=this.botCenter(0),power=DIFFICULTIES[this.difficulty].power;
  const options:CpuOption[]=[];
  const offsets=blocking?[[24,0],[0,26],[12,-24],[-12,4]]:[[32,12],[25,30],[42,-10],[48,6]];
  for(let f=3;f<Math.min(path.length,deadline+1);f+=2){
   const q=path[f];if(q.goal!==null)break;
   if(q.y<65||(q.x<83||q.x>917)&&q.y<GOAL_TOP+20)continue;
   const motion=this.botMotion(f);
   for(const [ox,oy] of offsets){
    const x=q.x+ox,y=q.y+oy;
    if(x>966||x<35||y<60||y>GROUND-12)continue;
    const vx=(x-p.x)/motion.distance,vy=(y-p.y-motion.gravity)/motion.distance;
    const speed=Math.hypot(vx,vy);
    if(speed>power||speed<2||(!blocking&&vx>=-.65))continue;
    const enemyEta=Math.max(this.cooldown[0]*60,Math.max(0,Math.hypot(q.x-enemy.x,q.y-enemy.y)-45)/18.5);
    const margin=enemyEta-f;
    // A launch aimed right through a ball behind us is not an attacking shot.
    // Defensive desperation candidates are permitted, then checked for own goals.
    const shotQuality=Math.max(0,-vx*motion.speed-q.vx);
    const score=(blocking?210:165)-f*1.15+shotQuality*2.8
     +Math.min(12,margin)*1.1-Math.max(0,-margin)*1.2
     -Math.abs(oy-12)*.14-(blocking?Math.max(0,vx)*3:Math.max(0,q.x-740)*.12);
    options.push({kind:blocking?'block':'strike',x:vx,y:vy,target:{x:q.x,y:q.y},frames:f,score,margin});
   }
  }
  return this.botShortlist(options,blocking?6:6);
 }

 private botShortlist(options:CpuOption[],count:number){
  options.sort((a,b)=>b.score-a.score);const result:CpuOption[]=[];
  for(const option of options){
   if(result.some(old=>Math.hypot(option.x-old.x,option.y-old.y)<1.1))continue;
   result.push(option);if(result.length>=count)break;
  }
  return result;
 }

 private botMoves(target:{x:number;y:number},recover=false):CpuOption[]{
  const p=this.botCenter(1),power=DIFFICULTIES[this.difficulty].power,dx=target.x-p.x;
  if(recover){
   const direction=Math.abs(dx)>45?Math.sign(dx):this.ball.position.x<p.x?-1:1;
   return [-5,-7,-9].map((y,i)=>({kind:'recover',x:direction*(2+i*1.5),y,target,frames:45+i*8,score:80-i,margin:0}));
  }
  const options:CpuOption[]=[];
  for(const frames of [24,36,50,64]){
   const motion=this.botMotion(frames),vx=dx/motion.distance;
   // A shallow hop travels home sooner; larger arcs can clear a loose ball.
   for(const lift of [0,2.5]){
    const vy=(target.y-p.y-motion.gravity)/motion.distance-lift;
    if(Math.hypot(vx,vy)>power||Math.hypot(vx,vy)<1.2)continue;
    const score=90-frames*.4-lift*2-Math.abs(vx)*.15;
    options.push({kind:'move',x:vx,y:Math.min(-1.5,vy),target,frames,score,margin:0});
   }
  }
  // Large deficits may require more than one flight. Never normalize an
  // unreachable target into a misleading "interception".
  if(!options.length&&Math.abs(dx)>40)options.push({kind:'move',x:Math.sign(dx)*Math.min(power*.83,15),y:-4.5,target,frames:50,score:40,margin:0});
  return this.botShortlist(options,4);
 }

 private botCopyWorld(){
  const world=this.botSandbox||(this.botSandbox=new Match(true));
  Engine.clear(world.engine);
  // Engine.clear also empties the detector; repopulate it on every rollout.
  world.engine.world.isModified=true;
  world.engine.timing.timestamp=0;world.engine.timing.timeScale=1;
  world.engine.gravity.x=this.engine.gravity.x;world.engine.gravity.y=this.engine.gravity.y;world.engine.gravity.scale=this.engine.gravity.scale;
  world.multiplayer=true;world.mode='normal';world.phase='playing';world.duration=60;world.time=60;
  world.score=[0,0];world.cooldown=[...this.cooldown];world.standing=[...this.standing];
  world.impactBoost=this.impactBoost;world.pendingBallImpact=null;world.roofRestTime=this.roofRestTime;
  world.lastBallImpact=this.lastBallImpact-this.engine.timing.timestamp;
  for(let i=0;i<this.objects.length;i++){
   const from=this.objects[i],to=world.objects[i];
   type TimedBody=Matter.Body&{deltaTime:number};
   (to as TimedBody).deltaTime=(from as TimedBody).deltaTime;
   Body.setStatic(to,false);Body.setPosition(to,from.position);Body.setAngle(to,from.angle);
   Body.setVelocity(to,from.velocity);Body.setAngularVelocity(to,from.angularVelocity);
   to.force.x=from.force.x;to.force.y=from.force.y;to.torque=from.torque;
   to.collisionFilter.mask=from.collisionFilter.mask;
   // These solver caches exist in Matter 0.20 but are omitted by its typings.
   type SolverBody=Matter.Body&{positionPrev:{x:number;y:number};anglePrev:number;positionImpulse:{x:number;y:number};constraintImpulse:{x:number;y:number;angle:number}};
   const internal=to as SolverBody,source=from as SolverBody;
   Object.assign(internal.positionImpulse,source.positionImpulse);
   Object.assign(internal.constraintImpulse,source.constraintImpulse);
   if(from.isStatic)Body.setStatic(to,true);
   Object.assign(internal.positionPrev,source.positionPrev);internal.anglePrev=source.anglePrev;
   // Restore exact geometry too: repeated rotate/unrotate accumulates enough
   // rounding error to change which limb makes a grazing contact.
   from.vertices.forEach((v,j)=>{to.vertices[j].x=v.x;to.vertices[j].y=v.y;});
   from.axes.forEach((v,j)=>{to.axes[j].x=v.x;to.axes[j].y=v.y;});
   Object.assign(to.bounds.min,from.bounds.min);Object.assign(to.bounds.max,from.bounds.max);
  }
  const sourceJoints=Composite.allConstraints(this.engine.world),copyJoints=Composite.allConstraints(world.engine.world);
  for(let i=0;i<sourceJoints.length;i++){
   type Joint=Matter.Constraint&{angleA:number;angleB:number};
   const from=sourceJoints[i] as Joint,to=copyJoints[i] as Joint;
   Object.assign(to.pointA,from.pointA);Object.assign(to.pointB,from.pointB);
   to.angleA=from.angleA;to.angleB=from.angleB;
  }
  return world;
 }

 private botRollout(option:CpuOption|null,frames:number):CpuProbe{
  const world=this.botCopyWorld();let touch=false,touchFrame=Infinity,touchVX=0,touchVY=0,frame=0;
  let contactNow=false;
  const contact=(event:Matter.IEventCollision<Matter.Engine>)=>{
   for(const pair of event.pairs){
    const other=pair.bodyA===world.ball?pair.bodyB:pair.bodyB===world.ball?pair.bodyA:null;
    if(other&&world.players[1].includes(other)){contactNow=true;if(!touch){touch=true;touchFrame=frame;}}
   }
  };
  Events.on(world.engine,'collisionStart',contact);
  if(option)world.launch(1,option.x,option.y);
  let minX=world.ball.position.x;
  try{
   for(frame=1;frame<=frames&&world.phase==='playing';frame++){
    world.tick(1/60);minX=Math.min(minX,world.ball.position.x);
    if(contactNow){touchVX=world.ball.velocity.x;touchVY=world.ball.velocity.y;contactNow=false;}
    // A missed planned interception is not rescued by an unrelated lucky
    // bounce much later. Stop that candidate instead of spending a full rollout.
    if(option?.kind==='strike'&&!touch&&frame>option.frames+12){
     const center=world.botCenter(1);
     if(Math.hypot(center.x-world.ball.position.x,center.y-world.ball.position.y)>110)break;
    }
   }
  }finally{Events.off(world.engine,'collisionStart',contact);}
  const end=world.botCenter(1),ball=world.ball;
  const forecast=touch&&world.phase==='playing'?world.botTrajectory(90).find(q=>q.goal!==null)?.goal??null:null;
  return {touch,touchFrame,touchVX,touchVY,ownGoal:world.score[0]>0,goal:world.score[1]>0,forecast,endFrame:frame-1,
   x:ball.position.x,y:ball.position.y,vx:ball.velocity.x,vy:ball.velocity.y,minX,cpuX:end.x,cpuY:end.y,cpuVX:end.vx,cpuVY:end.vy};
 }

 private botProbeScore(probe:CpuProbe,option:CpuOption,threat:boolean){
  if(probe.ownGoal)return -Infinity;
  const ball=this.ball.position,p=this.botCenter(1);
  if(option.kind==='strike'||option.kind==='block'){
   if(!probe.touch&&!probe.goal)return -Infinity;
   const progress=ball.x-probe.minX;
   if(option.kind==='strike'&&!probe.goal&&(progress<22||probe.touchVX>-.8))return -Infinity;
   // A touch that merely accelerates the ball into our own box is not a save.
   if(probe.x>900&&probe.vx>1&&!probe.goal)return -Infinity;
   const exposedCounter=probe.vx>4&&probe.x>probe.cpuX+75&&probe.x>450;
   if(option.kind==='strike'&&exposedCounter)return -Infinity;
   return (probe.goal?600:0)+Math.min(450,progress)*.45+Math.max(-24,Math.min(24,-probe.touchVX))*4
    -Math.min(80,probe.touchFrame)*.6-(probe.vx>3&&probe.x>700?85:0)
    -(threat?0:Math.max(0,810-probe.cpuX)*.025)+option.score*.08;
  }
  const before=Math.abs(p.x-option.target.x),after=Math.abs(probe.cpuX-option.target.x);
  if(option.kind==='recover')return 60-after*.1-Math.abs(probe.cpuVY)*.5+(probe.touch&&probe.touchVX<0?25:0);
  if(after>before-12&&after>32)return -Infinity;
  if(probe.touch&&probe.touchVX>3&&ball.x>650)return -Infinity;
  return 110+(before-after)*.7-after*.4-Math.abs(probe.cpuVX)*2-Math.max(0,410-probe.cpuY)*.2;
 }

 private botReport(action:CpuAction,reason:string,goalIn:number|null,aimRisk:number,grounded:boolean,launch?:{x:number;y:number}){
  const old=this.botStatus;
  this.botStatus={state:this.botTactic,action,reason,target:{...this.botTarget},goalIn,aimRisk,grounded,time:this.botClock,...(launch?{launch}: {})};
  if(this.botDebug&&(old.state!==this.botTactic||old.action!==action||old.reason!==reason||action==='launch')){
   this.botHistory.push({...this.botStatus,target:{...this.botTarget}});if(this.botHistory.length>120)this.botHistory.shift();
  }
 }

 ai(dt:number){
  if(this.simulation||this.multiplayer||this.mode==='practice'||this.phase!=='playing')return;
  this.botClock+=dt;this.botStateAge+=dt;this.botLaunchAge+=dt;this.botAimAge+=dt;
  this.aiTimer=Math.max(0,this.aiTimer-dt);this.botProbeWait=Math.max(0,this.botProbeWait-dt);
  const p=this.botCenter(1),enemy=this.botCenter(0),ball=this.ball.position;
  const grounded=this.botSupported(1),ready=grounded&&this.botLaunchAge>=.28&&this.cooldown[1]<=0;
  this.botGroundTime=grounded?this.botGroundTime+dt:0;
  const justReady=ready&&!this.botWasReady;this.botWasReady=ready;
  const path=this.botTrajectory(this.difficulty==='hard'?100:this.difficulty==='normal'?82:66);
  const incoming=path.find(q=>q.goal===1),goalIn=incoming?incoming.frame/60:null;
  const aimRisk=this.botAimThreat(path),roof=this.botOnRoof();
  const enemyNear=Math.hypot(ball.x-enemy.x,ball.y-enemy.y)<160&&enemy.x<ball.x+50;
  const pressure=ball.x>570&&enemyNear&&(this.cooldown[0]<=0||enemy.vx>3);
  const danger=!!incoming;
  const urgent=danger&&!this.botLastThreat;this.botLastThreat=danger;
  const passed=ball.x>p.x+20&&ball.x>680&&!roof;
  const needsCover=danger||aimRisk>.22||pressure||passed;
  const angle=Math.atan2(Math.sin(this.players[1][0].angle),Math.cos(this.players[1][0].angle));
  const tangled=grounded&&Math.hypot(p.vx,p.vy)<4&&(Math.abs(angle)>1.2||this.players[1][1].position.y>p.y+8);
  this.botStuckTime=tangled?this.botStuckTime+dt:0;
  this.botQuietTime=this.ball.speed<2&&Math.hypot(enemy.vx,enemy.vy)<2?this.botQuietTime+dt:0;
  if(roof)this.botOpening=false;
  const home={x:Math.max(850,Math.min(920,ball.x+65)),y:462};
  let options:CpuOption[]=[],next:CpuTactic='GOALKEEP',reason='cover the shooting lane';
  let target={...home},hold=false;

  // Threats preempt both tactical hysteresis and recovery on every observation.
  if(danger){
   next='GOALKEEP';reason='intercept a goal-bound ball';
   options=this.botIntercepts(path,true,incoming!.frame-1);
   const lane=path.find(q=>q.x>=Math.max(830,p.x)&&q.vx>0)||incoming!;
   target={x:Math.max(820,Math.min(935,lane.x)),y:Math.max(340,Math.min(480,lane.y))};
  }else if(!grounded){
   const contact=this.botPassiveContact(path,18);
   if(contact!==null&&this.ball.position.x<p.x+25){next='ATTACK';reason='follow the committed interception';target={x:path[contact].x,y:path[contact].y};}
   else{next='RETREAT';reason='prepare retreat before landing';}
  }else{
   const attacks=roof?[]:this.botIntercepts(path,false,this.difficulty==='easy'?46:72);
   const best=attacks[0];
   const favorable=best&&(this.botOpening||best.margin> -5||ball.x<510||this.botQuietTime>.65);
   const press=best&&ball.x>430&&best.margin>(this.difficulty==='hard'?1:this.difficulty==='normal'?3:6);
   if(this.botStuckTime>.16&&!needsCover){
    next='RECOVER';reason='recover with an ordinary launch';options=this.botMoves(home,true);
   }else if(!roof&&best&&(favorable&&!needsCover||press&&!passed)){
    next=press&&ball.x>520&&!this.botOpening?'PRESS':'ATTACK';
    reason=this.botOpening?'contest kickoff':next==='PRESS'?'win a favorable interception':'strike toward the left goal';
    options=attacks;target={...best.target};
   }else if(Math.abs(p.x-home.x)>40||p.x<ball.x+18&&ball.x>640){
    next='RETREAT';reason=needsCover?'return before the human shot':'return to a useful defensive position';options=this.botMoves(home);
   }else if(!needsCover&&!roof&&ball.x<730&&(this.botQuietTime>.65||!enemyNear)&&!best){
    next='ATTACK';reason='reposition on the defensive side of the ball';
    target={x:Math.max(180,Math.min(855,ball.x+120)),y:462};options=this.botMoves(target);
   }else{hold=true;reason=roof?'cover the crossbar release':needsCover?'hold the shooting lane':'hold a useful defensive position';}
  }

  // A small score margin settles ATTACK/PRESS ties only. It never delays
  // retreat, a new threat, recovery, or an opportunity that has disappeared.
  if((next==='ATTACK'||next==='PRESS')&&(this.botTactic==='ATTACK'||this.botTactic==='PRESS')
   &&next!==this.botTactic&&!danger&&this.botStateAge<.10&&options[0]&&options[0].margin<7)next=this.botTactic;
  if(next!==this.botTactic){this.botTactic=next;this.botStateAge=0;this.botProbeWait=0;}
  this.botTarget=target;
  if(!grounded){this.botReport('wait-ground',reason,goalIn,aimRisk,false);return;}
  if(!ready){this.botReport('wait-cooldown',reason,goalIn,aimRisk,true);return;}
  if(this.aiTimer>0){this.botReport('wait-reaction',reason,goalIn,aimRisk,true);return;}
  if(hold){this.botReport('hold',reason,goalIn,aimRisk,true);return;}
  if(this.botProbeWait>0&&!justReady&&!urgent){this.botReport('hold','tracking the next useful contact',goalIn,aimRisk,true);return;}

  let selected:CpuOption|null=null,bestScore=-Infinity;
  // Test HOLD as an action, including the body's current momentum and spin.
  // Do not jump out of a save that the actual ragdoll already makes.
  if(danger||this.botPassiveContact(path,12)!==null){
   const duration=danger?Math.min(80,incoming!.frame+18):36;
   const stay=this.botRollout(null,duration);
   if(!stay.ownGoal&&(stay.touch||stay.goal)&&!(stay.x>900&&stay.vx>1)){
    this.botProbeWait=.05;this.botReport('hold',danger?'body already blocks the incoming shot':'let the ball reach the existing contact',goalIn,aimRisk,true);return;
   }
  }
  // Quickly screen contact and outgoing direction, then spend the longer
  // counterattack check on the best few shots. This avoids six long searches.
  let candidates=options;
  if(options[0]?.kind==='strike'){
   const screened:{option:CpuOption;score:number}[]=[];
   for(const option of options){
    const probe=this.botRollout(option,Math.min(64,option.frames+10));
    const score=this.botProbeScore(probe,option,false)+(probe.forecast===0?150:0);
    if(Number.isFinite(score))screened.push({option,score});
   }
   screened.sort((a,b)=>b.score-a.score);candidates=screened.slice(0,3).map(s=>s.option);
  }
  let checked=0;
  for(const option of candidates){
   const frames=Math.min(84,Math.max(option.kind==='strike'?84:option.kind==='move'||option.kind==='recover'?64:42,option.frames+24,danger?incoming!.frame+12:0));
   const probe=this.botRollout(option,frames),score=this.botProbeScore(probe,option,danger);
   if(score>bestScore){bestScore=score;selected=option;}
   checked++;
   // Broad analytic ranking, bounded physical verification. Once two useful
   // alternatives have been compared (or a save/goal verified), act now.
   if(selected&&(danger||probe.goal||option.kind==='recover'||checked>=2))break;
   if(checked>=4&&!danger)break;
  }
  if(!selected&&!danger&&(next==='ATTACK'||next==='PRESS')){
   // An apparent interception can fail once limbs, spin and the opponent are
   // simulated. Immediately choose positioning instead of silently doing nothing.
   const advance=!needsCover&&!roof&&ball.x<660&&(!enemyNear||this.botQuietTime>.65);
   target=advance?{x:Math.max(180,Math.min(855,ball.x+110)),y:462}:home;
   this.botTactic=advance?'ATTACK':'RETREAT';this.botTarget=target;
   reason=advance?'improve the next shooting angle':'retreat after rejecting an unsafe challenge';
   if(Math.abs(p.x-target.x)>35){
    let moves=0;
    for(const option of this.botMoves(target)){
     const probe=this.botRollout(option,76),score=this.botProbeScore(probe,option,false);
     if(score>bestScore){bestScore=score;selected=option;}
     if(++moves>=2&&selected)break;
    }
   }
  }
  if(!selected&&danger&&Math.abs(p.x-home.x)>45){
   let moves=0;
   for(const option of this.botMoves(home)){
    const probe=this.botRollout(option,Math.min(80,incoming!.frame+16));
    // Even when every modeled line concedes, recover space if that does not
    // bring the goal forward. A doomed shot must not freeze a stranded CPU.
    const progress=Math.abs(p.x-home.x)-Math.abs(probe.cpuX-home.x);
    const score=probe.ownGoal&&probe.endFrame>=incoming!.frame-1&&progress>25
     ?-1000+probe.endFrame*2+progress*.1:this.botProbeScore(probe,option,true);
    if(score>bestScore){bestScore=score;selected=option;}
    if(++moves>=2&&selected)break;
   }
  }
  if(selected&&this.launch(1,selected.x,selected.y)){
   this.botOpening=false;this.botLaunchAge=0;this.botGroundTime=0;this.botWasReady=false;
   this.botStuckTime=0;this.botProbeWait=0;this.aiTimer=this.difficulty==='hard'?0:DIFFICULTIES[this.difficulty].delay;
   this.botTarget={...selected.target};this.botReport('launch',reason,goalIn,aimRisk,true,{x:selected.x,y:selected.y});
  }else{
   // A bounded recheck is a deliberate hold, never a new reaction delay.
   this.botProbeWait=this.difficulty==='hard'?.06:.12;
   this.botReport('hold',danger?'no safe reachable block; preserve existing cover':'no useful legal launch; track and reposition',goalIn,aimRisk,true);
  }
 }

 finish(){this.phase='finished';this.message=this.score[0]===this.score[1]?'DRAW':this.score[0]>this.score[1]?'YOU WIN!':'YOU LOSE';}

 dispose(){this.botSandbox?.dispose();this.botSandbox=null;Composite.clear(this.engine.world,false);Engine.clear(this.engine);}

}

export type GameArt={stadium:CanvasImageSource;sprites:HTMLImageElement;parts:HTMLCanvasElement[][];playerParts?:(HTMLCanvasElement[]|null)[];ball:HTMLCanvasElement};

// Convert source art to hard-edged, small pixel textures once, not every frame.

export function cropSprite(image:HTMLImageElement,sx=0,sy=0,sw=image.width,sh=image.height,pixelWidth=16,pixelHeight=16):HTMLCanvasElement{

 const c=document.createElement('canvas');c.width=sw;c.height=sh;const ctx=c.getContext('2d')!;ctx.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);const data=ctx.getImageData(0,0,sw,sh);let x0=sw,y0=sh,x1=0,y1=0;

 for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const j=(y*sw+x)*4;if(data.data[j+3]<128){data.data[j+3]=0;}else{data.data[j+3]=255;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}

 ctx.putImageData(data,0,0);const out=document.createElement('canvas');out.width=pixelWidth;out.height=pixelHeight;const o=out.getContext('2d')!;o.imageSmoothingEnabled=false;o.drawImage(c,x0,y0,Math.max(1,x1-x0+1),Math.max(1,y1-y0+1),0,0,pixelWidth,pixelHeight);return out;

}

export function makeParts(_atlas?:HTMLImageElement):HTMLCanvasElement[][]{

 return makeCharacterParts(TEAMS);

}



export function paint(ctx:CanvasRenderingContext2D,m:Match,aim:Aim|null,art:GameArt|null,title=false,aimPlayer=0){

 // Compatibility bridge: existing callers already pass the visible arrow here.
 // Sampling it never launches or moves a body; the next physics observation uses it.
 m.setHumanAim(!title&&aimPlayer===0?aim:null);
 ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,WIDTH,HEIGHT);

 if(art)ctx.drawImage(art.stadium,0,0,WIDTH,HEIGHT);else{ctx.fillStyle='#14130a';ctx.fillRect(0,0,WIDTH,HEIGHT);}

 if(title){if(art){ctx.save();ctx.translate(180,325);ctx.scale(3.2,3.2);ctx.rotate(-.7);drawPlayer(ctx,m,0,art,true);ctx.restore();drawBall(ctx,440,345,-.5,art,2.2);}return;}

 // Goals are collision-aligned game geometry.

 [0,940].forEach(x=>{ctx.fillStyle='#dbded431';ctx.fillRect(x,GOAL_TOP,60,GROUND-GOAL_TOP);ctx.strokeStyle='#bbbcb455';ctx.lineWidth=1;for(let j=0;j<=6;j++){ctx.beginPath();ctx.moveTo(x+j*10,GOAL_TOP);ctx.lineTo(x+j*10,GROUND);ctx.stroke();}for(let y=GOAL_TOP;y<GROUND;y+=10){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+60,y);ctx.stroke();}ctx.fillStyle='#bfc0b7';ctx.fillRect(x,GOAL_TOP-4,60,10);ctx.fillRect(x===0?56:940,GOAL_TOP,9,GROUND-GOAL_TOP);ctx.fillStyle='#faf9ee';ctx.fillRect(x,GOAL_TOP-4,60,4);ctx.fillRect(x===0?56:940,GOAL_TOP,4,GROUND-GOAL_TOP);});

 m.players.forEach((_,p)=>{if(m.mode!=='practice'||p===0)drawPlayer(ctx,m,p,art);});drawBall(ctx,m.ball.position.x,m.ball.position.y,m.ball.angle,art);

 if(aim){const s=m.players[aimPlayer][0].position;const len=Math.min(320,Math.hypot(aim.x,aim.y)),angle=Math.atan2(aim.y,aim.x);if(aim.pointer){ctx.fillStyle='#d6d9b454';ctx.beginPath();ctx.arc(aim.pointer.x,aim.pointer.y,16,0,Math.PI*2);ctx.fill();}ctx.save();ctx.translate(s.x,s.y);ctx.rotate(angle);ctx.globalAlpha=.7;ctx.fillStyle='#f4f4e7';ctx.beginPath();ctx.moveTo(16,-4);ctx.lineTo(Math.max(22,len-21),-5);ctx.lineTo(Math.max(35,len-24),-13);ctx.lineTo(Math.max(42,len),0);ctx.lineTo(Math.max(35,len-24),13);ctx.lineTo(Math.max(22,len-21),5);ctx.lineTo(16,4);ctx.closePath();ctx.fill();ctx.restore();}



}

function drawPlayer(ctx:CanvasRenderingContext2D,m:Match,p:number,art:GameArt|null,showcase=false){

 const parts=m.players[p],teamIndex=Math.max(0,TEAMS.findIndex(t=>t.id===m.teams[p]));const sprites=art&&(art.playerParts?.[p]||art.parts[teamIndex]);const rasterBody=sprites?.[0].width===256;const order=[4,5,2,3,0,1],map=[0,1,2,3,4,5];

 if(!showcase){ctx.fillStyle='#00000066';ctx.beginPath();ctx.ellipse(parts[0].position.x,GROUND-2,25,5,0,0,Math.PI*2);ctx.fill();}

 if(rasterBody&&sprites){ctx.save();if(!showcase){ctx.translate(parts[0].position.x,parts[0].position.y);ctx.rotate(parts[0].angle);}const angles=parts.map((b,i)=>i===0?0:b.angle-parts[0].angle);if(p===1){[angles[2],angles[3]]=[angles[3],angles[2]];[angles[4],angles[5]]=[angles[5],angles[4]];}drawCupRig(ctx,sprites,showcase?[0,0,-.7,.6,.25,-.25]:angles,p===0?1:-1);ctx.restore();return;}

 order.forEach(i=>{const b=parts[i];ctx.save();if(showcase){const poses=[[0,0],[0,-35],[-26,-1],[26,-1],[-11,36],[11,36]];ctx.translate(poses[i][0],poses[i][1]);ctx.rotate(i===2?-.8:i===3?-1.2:i===4?.5:i===5?-.3:0);}else{ctx.translate(Math.round(b.position.x/2)*2,Math.round(b.position.y/2)*2);ctx.rotate(b.angle);}

  const w=i===0?44:i===1?30:14,h=i===0?46:i===1?32:i<4?38:26;

  if(art){const img=(art.playerParts?.[p]||art.parts[teamIndex])[map[i]],raster=img.width>100||img.height>100;const arm=raster&&i>=2&&i<4,wide=arm?20:w,offset=arm?(i===2?(p===0?14:9):(p===0?-9:-14)):0;

   // Shoulder overlap is in body space; mirroring the texture must not move

   // the opponent's arms away from its torso.

   ctx.translate(offset,0);if(raster?p===1:p===0)ctx.scale(-1,1);ctx.drawImage(img,-wide/2,-h/2,wide,h);}ctx.restore();});

}

function drawBall(ctx:CanvasRenderingContext2D,x:number,y:number,angle:number,art:GameArt|null,scale=1){if(!art)return;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(angle);ctx.fillStyle="#22251e";ctx.beginPath();ctx.arc(0,0,BALL_RADIUS-.5,0,Math.PI*2);ctx.fill();ctx.drawImage(art.ball,-BALL_RADIUS,-BALL_RADIUS,BALL_RADIUS*2,BALL_RADIUS*2);ctx.restore();}
