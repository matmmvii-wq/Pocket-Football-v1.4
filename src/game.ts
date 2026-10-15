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

 constructor(){

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

 resetPositions(){this.roofRestTime=0;this.lastBallImpact=-Infinity;this.pendingBallImpact=null;this.botState='charge';this.botTarget={x:500,y:160};this.botStuckTime=0;this.botRecoveryTime=0;this.botRecoveryRest=0;this.botGroundTime=0;this.botLaunchAge=1;this.botTacticHold=0;this.players.forEach((parts,p)=>{const x=p?860:140,poses=[[x,461],[x,426],[x-26,460],[x+26,460],[x-11,497],[x+11,497]];parts.forEach((b,i)=>{Body.setStatic(b,false);Body.setPosition(b,{x:poses[i][0],y:poses[i][1]});Body.setAngle(b,0);Body.setVelocity(b,{x:0,y:0});Body.setAngularVelocity(b,0);b.collisionFilter.mask=p===1&&this.mode==='practice'?0:0xFFFFFFFF;Body.setStatic(b,true);});});this.standing=[true,true];Body.setPosition(this.ball,{x:500,y:160});Body.setVelocity(this.ball,{x:(Math.random()-.5)*5,y:-3});Body.setAngularVelocity(this.ball,.08);this.cooldown=[0,0];this.aiTimer=DIFFICULTIES[this.difficulty].delay;}



 start(teams:string[],mode:Mode,difficulty:Difficulty,duration:number){this.teams=teams;this.mode=mode;this.difficulty=difficulty;this.duration=duration;this.time=duration;this.score=[0,0];this.suddenDeath=false;this.phase='countdown';this.message='3';this.resetTimer=2.4;this.resetPositions();}

 extraTime(){this.phase='countdown';this.resetTimer=2.4;this.suddenDeath=true;this.message='3';this.resetPositions();}

 launch(p:number,x:number,y:number){if(this.phase!=='playing'||this.cooldown[p]>0||(p===1&&this.mode==='practice'))return false;const len=Math.hypot(x,y);if(len<1)return false;const f=Math.min(1,18.5/len);this.release(p);const vx=x*f,vy=y*f;const spin=Math.sign(vx||1)*Math.min(.045,.015+Math.hypot(vx,vy)*.0016);const parts=this.players[p],mass=parts.reduce((sum,b)=>sum+b.mass,0);

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

  if(!this.multiplayer&&this.mode!=='practice')this.ai(dt);

  // Two physics substeps keep fast ball contacts and joints reliable.

  Engine.update(this.engine,dt*500);Engine.update(this.engine,dt*500);

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

 // Track each physics frame; latency gates actions, never the observations.

 botState:'charge'|'defend'|'recover'='charge';

 botTarget={x:500,y:160};

 private botStuckTime=0;

 private botRecoveryTime=0;

 private botRecoveryRest=0;

 private botGroundTime=0;

 private botLaunchAge=1;

 // Tactical hysteresis: retain a decision until the alternative is clearly
 // better, avoiding charge/defend oscillation near the ball.
 private botTacticHold=0;


 private botLaunch(x:number,y:number){

  if(!this.launch(1,x,y))return false;

  this.botLaunchAge=0;this.botGroundTime=0;return true;

 }

 private predictBall(frames:number){

  let {x,y}=this.ball.position;let {x:vx,y:vy}=this.ball.velocity;

  // Ballistic lead only: no candidate worlds, scoring search or trained model.

  for(let f=0;f<frames;f++){

   const oldY=y;vx*=.9997;vy=vy*.9997+.1528;x+=vx;y+=vy;

   if(x<BALL_RADIUS){x=2*BALL_RADIUS-x;vx=Math.abs(vx)*.9;}if(x>WIDTH-BALL_RADIUS){x=2*(WIDTH-BALL_RADIUS)-x;vx=-Math.abs(vx)*.9;}

   const roof=GOAL_TOP-4-BALL_RADIUS;

   const floor=(x<64+BALL_RADIUS||x>936-BALL_RADIUS)&&oldY<roof?roof:GROUND-BALL_RADIUS;

   if(y>floor&&vy>0){y=floor;vy=-vy*.9;}

   if(y<BALL_RADIUS){y=BALL_RADIUS;vy=Math.abs(vy)*.9;}

  }

  return {x,y,vx,vy};

 }

 ai(dt:number){

  const torso=this.players[1][0],p=torso.position,b=this.ball.position,v=this.ball.velocity;

  const tuning=DIFFICULTIES[this.difficulty];
  // Share one predicted ball trajectory across all decisions this frame.
  const horizon=this.difficulty==='hard'?72:this.difficulty==='normal'?54:38;
  const trajectory:{x:number;y:number;vx:number;vy:number}[]=[];
  let px=this.ball.position.x,py=this.ball.position.y;
  let pvx=this.ball.velocity.x,pvy=this.ball.velocity.y;
  trajectory.push({x:px,y:py,vx:pvx,vy:pvy});
  for(let f=1;f<=horizon;f++){
   const oldY=py;pvx*=.9997;pvy=pvy*.9997+.1528;px+=pvx;py+=pvy;
   if(px<BALL_RADIUS){px=2*BALL_RADIUS-px;pvx=Math.abs(pvx)*.9;}
   if(px>WIDTH-BALL_RADIUS){px=2*(WIDTH-BALL_RADIUS)-px;pvx=-Math.abs(pvx)*.9;}
   const roof=GOAL_TOP-4-BALL_RADIUS;
   const floor=(px<64+BALL_RADIUS||px>936-BALL_RADIUS)&&oldY<roof?roof:GROUND-BALL_RADIUS;
   if(py>floor&&pvy>0){py=floor;pvy=-pvy*.9;}
   if(py<BALL_RADIUS){py=BALL_RADIUS;pvy=Math.abs(pvy)*.9;}
   trajectory.push({x:px,y:py,vx:pvx,vy:pvy});
  }
  const future=(frames:number)=>trajectory[Math.max(0,Math.min(horizon,Math.round(frames)))];

  this.aiTimer-=dt;this.botLaunchAge+=dt;this.botRecoveryRest=Math.max(0,this.botRecoveryRest-dt);this.botTacticHold=Math.max(0,this.botTacticHold-dt);

  const angle=Math.atan2(Math.sin(torso.angle),Math.cos(torso.angle));

  const ballOnSurface=this.ball.speed<1.5&&b.y>GROUND-20;

  const ballSupport=ballOnSurface&&p.y<b.y&&Math.hypot(p.x-b.x,p.y-b.y)<70;

  const staticSupport=this.engine.pairs.list.some((pair:Matter.Pair)=>{

   if(!pair.isActive)return false;

   const other=this.players[1].includes(pair.bodyA)?pair.bodyB:this.players[1].includes(pair.bodyB)?pair.bodyA:null;

   if(!other)return false;

   // A goal roof is not the ground: do not rearm a launch from roof contact.
   if(other.isStatic&&other.position.y>=GROUND)return true;

   // A rigid figure can be resting on a grounded opponent without a loose

   // foot reaching the turf. Treat that real contact as support, not flight.

   return this.players[0].includes(other)&&other.speed<3&&p.y<other.position.y

    &&this.players[0].some(part=>part.bounds.max.y>GROUND-4);

  });

  const grounded=staticSupport||ballSupport||this.players[1].some(part=>part.velocity.y>=-.5&&(

   part.bounds.max.y>GROUND-4));

  this.botGroundTime=grounded?this.botGroundTime+dt:0;

  // One committed impulse per flight, even on hard. Brief floor contact during

  // takeoff cannot rearm it; settle after landing before another shot/block.

  // Hard responds faster after a real landing, without allowing midair relaunches.
  const canAct=this.botGroundTime>=(this.difficulty==='hard'?.06:.08)
   &&this.botLaunchAge>=(this.difficulty==='hard'?.48:.6);

  const tangled=grounded&&torso.speed<5&&(Math.abs(angle)>1.15||this.players[1][1].position.y>p.y+8);

  this.botStuckTime=tangled?this.botStuckTime+dt:0;

  const passed=b.x>p.x+8;

  const lob=v.x>2&&b.x>500&&b.y<260&&b.y<p.y-90&&b.x+v.x*20>p.x+35;

  // Project a shot across the actual goal mouth, not just anywhere near
  // the right wall. A high ball above the crossbar is not a scoring threat.
  const imminent=trajectory.slice(1,Math.min(horizon,42)).find(q=>
   q.x>=940-BALL_RADIUS&&q.vx>0&&q.y>GOAL_TOP+BALL_RADIUS*.25&&q.y<GROUND-BALL_RADIUS*.25);
  const danger=!!imminent||(b.x>830&&v.x>3&&b.y>GOAL_TOP);


  if(this.botStuckTime>.12&&this.botRecoveryRest===0&&!danger){this.botRecoveryTime=.32;this.botRecoveryRest=1.2;this.botStuckTime=0;}

  if(this.botRecoveryTime>0&&!danger&&grounded){

   this.botState='recover';this.botTarget={x:p.x,y:Math.max(80,p.y-50)};

   this.botRecoveryTime-=dt;

   // Bounded angular motor, not an angle/position reset. Lift gives joints room.

   this.players[1].forEach(part=>{const error=Math.atan2(Math.sin(part.angle),Math.cos(part.angle));Body.setAngularVelocity(part,Math.max(-.14,Math.min(.14,part.angularVelocity*.7-error*.045)));});

   if(canAct&&this.aiTimer<=0&&this.cooldown[1]===0){this.botLaunch(0,-5);this.aiTimer=tuning.delay;}

   return;

  }

  // The roof escape is handled by ball physics. Do not pursue a ball resting
  // on either crossbar; stay available to defend when it comes back into play.
  const roofY=GOAL_TOP-4-BALL_RADIUS;
  const onRoof=(b.x>=BALL_RADIUS&&b.x<=82)||(b.x>=918&&b.x<=WIDTH-BALL_RADIUS);
  const roofResting=onRoof&&Math.abs(b.y-roofY)<=9
   &&Math.abs(v.y)<=2.2&&Math.abs(v.x)<=3;
  if(roofResting){
   this.botState='defend';
   this.botTarget={x:880,y:455};
   return;
  }

  // Only retreat for a passed ball when it is still threatening our goal.
  // Utility arbitration: defense takes priority for a real incoming shot;
  // otherwise avoid changing tactics on tiny ball-position fluctuations.
  // This is the hysteresis pattern used in established utility AI systems.
  const threatScore=(imminent?120:0)+(b.x>790&&v.x>1?30:0)
   +(passed&&v.x>1?22:0)+(lob?18:0);
  const attackScore=(b.x<740?48:18)+(v.x<0?18:0)+(passed&&v.x<0?15:0);
  const preferred=threatScore>attackScore+8?'defend':'charge';
  if(preferred!==this.botState){
   if(this.botTacticHold===0||!!imminent){this.botState=preferred;this.botTacticHold=.22;}
  }


  // Short flight lead is recalculated from current coordinates every frame.

  const distance=Math.hypot(b.x-p.x,b.y-p.y);

  const frames=Math.max(6,Math.min(32,distance/tuning.power));

  let tx=Math.max(20,Math.min(980,b.x+v.x*frames*.75));

  let ty=Math.min(490,b.y+v.y*frames*.75+.0764*frames*frames);

  let travel=frames;

  if(this.botState==='defend'){

   const defendBall=imminent||future(Math.min(24,Math.max(8,Math.abs(p.x-b.x)/Math.max(2,Math.abs(v.x)))));
   tx=Math.min(925,Math.max(800,defendBall.x+35));
   ty=defendBall.y<340?Math.max(210,Math.min(445,defendBall.y+45)):455;

   // Go over a low ball on the way back, rather than drive it into our net.

   if(p.x<b.x&&b.x-p.x<170&&b.y>410)ty=350;

   travel=Math.max(18,Math.min(38,Math.abs(tx-p.x)/tuning.power));

  }else{

   // Evaluate several intercept times and contact points rather than
   // committing to the first reachable ball position. A good contact
   // approaches from the right, sending the ball toward the left goal.
   const enemy=this.players[0][0].position;
   // Adapted from Yuka's PursuitBehavior: lookahead grows with distance
   // and shrinks as the target and pursuer move faster. Here we use it
   // to prioritize reachable ballistic contact times, not steering forces.
   // Source: github.com/Mugen87/yuka/blob/master/src/steering/behaviors/PursuitBehavior.js
   const pursuitLead=Math.max(6,Math.min(50,
    Math.hypot(b.x-p.x,b.y-p.y)/(tuning.power+Math.hypot(v.x,v.y))));
   const lookahead=this.difficulty==='hard'?56:this.difficulty==='normal'?44:30;
   let best=-Infinity;
   for(let lead=6;lead<=lookahead;lead+=2){
    const ball=future(lead);
    // Ignore predicted positions where the ball is resting on a goal roof.
    const roof=GOAL_TOP-4-BALL_RADIUS;
    if((ball.x<83||ball.x>917)&&Math.abs(ball.y-roof)<11&&Math.abs(ball.vx)<3)continue;
    for(const offset of [24,40,56,72]){
     const sx=Math.min(970,ball.x+offset),sy=Math.min(475,ball.y+Math.min(12,offset*.12));
     const dx=(sx-p.x)/lead,dy=(sy-p.y)/lead-.0764*lead;
     const required=Math.hypot(dx,dy);
     if(dx>=-.2||required>tuning.power)continue;
     // Reward quick, accurate approaches, useful attacking position and
     // interception before the human can reach the same ball.
     const humanDistance=Math.hypot(enemy.x-ball.x,enemy.y-ball.y);
     const urgency=ball.vx>0&&ball.x>610?Math.min(85,(ball.x-610)*.22):0;
     const humanFrames=humanDistance/18.5;
     const contactQuality=Math.max(0,1-Math.abs(offset-48)/64);
     const score=185-lead*1.65-Math.abs(required-tuning.power*.86)*.65
      -Math.abs(lead-pursuitLead)*.18
      +contactQuality*24+(ball.x<500?18:0)
      +(humanFrames>lead?12:-Math.min(25,(lead-humanFrames)*2))
      -urgency-(ball.x>820?55:0)+(ball.vx<0?12:0);
     if(score>best){best=score;tx=sx;ty=sy;travel=lead;}
    }
   }
   // When no attack is reachable, defend space rather than aim for an
   // impossible interception far outside the bot's launch range.
   if(best===-Infinity){
    tx=Math.max(700,Math.min(880,b.x+v.x*12+75));
    ty=Math.max(340,Math.min(465,b.y+v.y*12));
    travel=Math.max(12,Math.min(36,Math.hypot(tx-p.x,ty-p.y)/tuning.power));
   }

  }

  this.botTarget={x:tx,y:ty};

  if(!canAct||this.aiTimer>0||this.cooldown[1]>0)return;

  // Keep a grounded body in the path of an imminent low shot instead of

  // jumping away from a block that is already lined up.

  const arrival=(p.x-b.x)/Math.max(1,v.x);

  if(grounded&&v.y<0&&b.y>400&&v.x>8&&arrival>0&&arrival<14){

   const incoming=future(arrival);

   if(incoming.y>p.y-50&&incoming.y<p.y+40)return;

  }

  let vx=(tx-p.x)/travel,vy=(ty-p.y)/travel-.0764*travel;

  // Low balls get a sliding/downward strike, high balls a jumping lunge.

  if(this.botState==='charge'&&b.y>465&&p.y>410&&Math.abs(b.x-p.x)<155){

   travel=Math.max(4,Math.abs(b.x-p.x)/tuning.power);

   vx=Math.sign(b.x-p.x)*tuning.power;vy=(480-p.y)/travel-.0764*travel;

  }

  const length=Math.hypot(vx,vy),scale=Math.min(1,tuning.power/Math.max(1,length));

  if(this.botLaunch(vx*scale,vy*scale))this.aiTimer=tuning.delay;

 }





 finish(){this.phase='finished';this.message=this.score[0]===this.score[1]?'DRAW':this.score[0]>this.score[1]?'YOU WIN!':'YOU LOSE';}

 dispose(){Composite.clear(this.engine.world,false);Engine.clear(this.engine);}

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
