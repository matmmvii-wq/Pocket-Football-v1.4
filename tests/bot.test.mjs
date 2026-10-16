import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import Matter from 'matter-js';
const dir=await mkdtemp(join(tmpdir(),'pocket-cpu-v2-'));
await build({entryPoints:['src/game.ts'],bundle:true,platform:'node',format:'esm',outfile:join(dir,'game.mjs')});
const {Match,GROUND,GOAL_TOP,BALL_RADIUS,paint}=await import(pathToFileURL(join(dir,'game.mjs')).href);
await rm(dir,{recursive:true,force:true});
const {Body,Events}=Matter;
function seeded(seed,fn){const previous=Math.random;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);try{return fn();}finally{Math.random=previous;}}
function match(difficulty='hard'){const m=new Match();m.start(['ARG','BRA'],'normal',difficulty,45);m.phase='playing';m.botOpening=false;m.aiTimer=0;m.botDebug=true;Body.setVelocity(m.ball,{x:0,y:0});return m;}
function player(m,id,x,y=461){const p=m.players[id][0].position,d={x:x-p.x,y:y-p.y};m.players[id].forEach(b=>Body.translate(b,d));}
function ball(m,x,y,vx=0,vy=0){Body.setPosition(m.ball,{x,y});Body.setVelocity(m.ball,{x:vx,y:vy});}
function run(m,frames){for(let i=0;i<frames&&m.phase==='playing';i++)m.tick(1/60);}
function physical(m){return m.objects.map(b=>({p:{...b.position},v:{...b.velocity},a:b.angle,w:b.angularVelocity,static:b.isStatic,force:{...b.force},torque:b.torque}));}
function launches(m){return m.botHistory.filter(e=>e.action==='launch');}

for(const [name,x,y,vx,vy] of [['low',650,450,16,-3],['high',650,370,12,-1],['flat high',750,350,8,0],['lob',550,250,12,2]])test('saves and clears the '+name+' incoming shot',()=>seeded(7,()=>{
 const m=match();ball(m,x,y,vx,vy);let cleared=false;
 try{for(let i=0;i<180&&m.phase==='playing';i++){m.tick(1/60);if(m.ball.position.x<600&&m.ball.velocity.x< -2)cleared=true;}
 assert.equal(m.score[0],0);assert.ok(cleared,'must produce an actual clearance');assert.ok(launches(m).some(e=>e.state==='GOALKEEP'));
 }finally{m.dispose();}
}));

test('holding an already covered low shot does not launch out of its path',()=>{
 const m=match();ball(m,780,465,12,0);
 try{m.ai(1/120);assert.equal(m.botStatus.action,'hold');assert.equal(m.botTactic,'GOALKEEP');assert.ok(m.standing[1]);run(m,100);assert.equal(m.score[0],0);}finally{m.dispose();}
});

for(const [name,y] of [['ground strike',490],['elevated strike',360]])test(name+' produces a goal through real contacts',()=>{
 const m=match();player(m,1,730);ball(m,620,y);
 try{run(m,240);assert.equal(m.score[0],0);assert.ok(m.score[1]>0,'must score, not just select an attack');assert.ok(launches(m).some(e=>e.state==='PRESS'||e.state==='ATTACK'));}finally{m.dispose();}
});

test('wins a reachable loose ball with useful leftward contact',()=>{
 const m=match();player(m,1,720);ball(m,590,430);let useful=false;
 try{for(let f=0;f<90&&m.phase==='playing';f++){m.tick(1/60);if(m.ball.velocity.x< -5)useful=true;}assert.ok(useful);assert.equal(m.score[0],0);}finally{m.dispose();}
});

test('reads only a plausible visible aim and retreats immediately from midfield',()=>{
 const m=match();player(m,1,430);player(m,0,560);ball(m,675,470);
 try{m.setHumanAim({x:320,y:0});m.ai(1/120);assert.ok(m.botStatus.aimRisk>.22);assert.equal(m.botTactic,'RETREAT');assert.equal(m.botStatus.action,'launch');assert.ok(m.botStatus.launch.x>0);assert.ok(m.botTarget.x>=850);
 m.setHumanAim({x:-320,y:0});m.ai(1/120);assert.equal(m.botStatus.aimRisk,0);
 m.setHumanAim({x:NaN,y:0});m.ai(1/120);assert.equal(m.botStatus.aimRisk,0);
 }finally{m.dispose();}
});

test('paint bridges the existing visible arrow; cancel, release and expiry clear it',()=>{
 const m=match();player(m,0,600);ball(m,690,460);const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
 try{paint(ctx,m,{x:320,y:0},null);assert.ok(m.botAim);paint(ctx,m,null,null);assert.equal(m.botAim,null);
 m.setHumanAim({x:320,y:0});m.launch(0,1,-1);assert.equal(m.botAim,null);
 m.cooldown[0]=0;m.setHumanAim({x:320,y:0});m.aiTimer=10;m.cooldown[1]=10;m.ai(.13);assert.equal(m.botStatus.aimRisk,0);
 paint(ctx,m,{x:320,y:0},null,true);assert.equal(m.botAim,null);
 }finally{m.dispose();}
});

test('continues defense perception in flight without changing a body or applying torque',()=>{
 for(const difficulty of ['easy','normal','hard']){
  const m=match(difficulty);m.release(1);player(m,1,500,240);m.players[1].forEach(b=>{Body.setVelocity(b,{x:-4,y:-1});Body.setAngularVelocity(b,.08);});ball(m,740,400,8,0);
  const before=physical(m);
  try{for(let i=0;i<30;i++)m.ai(1/120);assert.deepEqual(physical(m),before);assert.equal(m.botTactic,'GOALKEEP');assert.equal(m.botStatus.action,'wait-ground');assert.ok(m.botStatus.goalIn>0);}finally{m.dispose();}
 }
});

test('plans a retreat in flight and launches on the first legal landing observation',()=>{
 const m=match();m.release(1);player(m,1,430,240);m.players[1].forEach(b=>Body.setVelocity(b,{x:-3,y:0}));ball(m,940,GOAL_TOP-4-BALL_RADIUS);
 try{m.ai(1/120);assert.equal(m.botTactic,'RETREAT');assert.equal(m.botStatus.action,'wait-ground');const before=physical(m);
 m.ai(1/120);assert.deepEqual(physical(m),before);
 player(m,1,430,461);m.players[1].forEach(b=>{Body.setVelocity(b,{x:0,y:0});Body.setAngularVelocity(b,0);});m.botLaunchAge=2;m.cooldown[1]=0;m.ai(1/120);
 assert.equal(m.botStatus.action,'launch');assert.equal(m.botTactic,'RETREAT');assert.ok(m.botStatus.launch.x>0);
 }finally{m.dispose();}
});

test('a ball behind the CPU never becomes a rightward attacking strike',()=>{
 const m=match();player(m,1,620);ball(m,740,445,8,0);
 try{m.ai(1/120);assert.equal(m.botTactic,'GOALKEEP');assert.ok(m.botTarget.x>820);assert.ok(m.botStatus.action==='launch'||m.botStatus.action==='hold');assert.ok(m.botStatus.goalIn>0);}finally{m.dispose();}
});

test('a resting roof ball is not mistaken for a shot or chased onto the roof',()=>{
 const m=match();player(m,1,430);ball(m,968,GOAL_TOP-4-BALL_RADIUS+.4);
 try{m.ai(1/120);assert.equal(m.botStatus.goalIn,null);assert.equal(m.botTactic,'RETREAT');assert.ok(m.botTarget.y>430);run(m,45);assert.ok(m.ball.position.x<918,'existing ball-only roof release must still work');assert.equal(m.score[0],0);}finally{m.dispose();}
});

test('recovery uses a capped ordinary launch, ends, and leaves threat perception active',()=>{
 const m=match();m.release(1);m.players[1].forEach(b=>Body.rotate(b,Math.PI,{x:860,y:461}));const bottom=Math.max(...m.players[1].map(b=>b.bounds.max.y));m.players[1].forEach(b=>Body.translate(b,{x:0,y:GROUND-bottom}));ball(m,20,GOAL_TOP-4-BALL_RADIUS);
 const commands=[];const launch=m.launch.bind(m);m.launch=(p,x,y)=>{if(p===1)commands.push({x,y,state:m.botTactic});return launch(p,x,y);};
 try{run(m,180);assert.ok(commands.some(c=>c.state==='RECOVER'));assert.ok(commands.every(c=>Math.hypot(c.x,c.y)<=18.5+1e-8));assert.notEqual(m.botTactic,'RECOVER');
 m.phase='playing';ball(m,850,370,12,0);m.ai(1/120);assert.equal(m.botTactic,'GOALKEEP');
 }finally{m.dispose();}
});

test('repeated shadow rollouts keep collisions, repeat their result, and never mutate the live match',()=>{
 const m=match();ball(m,650,370,12,-1);const path=m.botTrajectory(100),goal=path.find(q=>q.goal===1);const option=m.botIntercepts(path,true,goal.frame-1)[0],before=physical(m);
 try{const first=m.botRollout(option,60),second=m.botRollout(option,60);assert.deepEqual(physical(m),before);assert.ok(first.touch&&second.touch);assert.equal(first.ownGoal,second.ownGoal);for(const key of ['x','y','vx','vy','cpuX','cpuY'])assert.ok(Math.abs(first[key]-second[key])<1e-6,`${key}: ${first[key]} / ${second[key]}`);assert.deepEqual(m.score,[0,0]);assert.equal(m.phase,'playing');}finally{m.dispose();}
});

test('prediction stays close to the actual free ball and models roof/underside bounces',()=>{
 for(const setup of [[400,220,7,-2],[960,250,0,4],[900,370,8,-6]]){
  const m=match();m.multiplayer=true;for(const b of m.players.flat())b.collisionFilter.mask=0;ball(m,...setup);const path=m.botTrajectory(18);
  try{run(m,18);const end=path.at(-1);assert.ok(Math.hypot(end.x-m.ball.position.x,end.y-m.ball.position.y)<20,JSON.stringify({setup,end,actual:m.ball.position}));}finally{m.dispose();}
 }
});

test('practice and multiplayer never run CPU decisions',()=>{
 for(const mode of ['practice','multiplayer']){
  const m=match();if(mode==='practice'){m.mode='practice';m.resetPositions();}else m.multiplayer=true;
  m.ai=()=>assert.fail('CPU must be disabled');try{run(m,120);}finally{m.dispose();}
 }
});

test('all difficulties execute capped launches; Hard reacts first; no midair correction',()=>{
 const first=[];
 for(const difficulty of ['easy','normal','hard'])seeded(31,()=>{
  const m=new Match();m.start(['ARG','BRA'],'normal',difficulty,45);m.phase='playing';const commands=[];let frame=0;
  const launch=m.launch.bind(m);m.launch=(p,x,y)=>{if(p===1){assert.ok(m.botSupported(1));assert.ok(Math.hypot(x,y)<=({easy:14,normal:18,hard:18.5})[difficulty]+1e-6);commands.push(frame);}return launch(p,x,y);};
  try{for(frame=0;frame<180&&m.phase==='playing';frame++)m.tick(1/60);assert.ok(commands.length>0);first.push(commands[0]);for(const b of m.objects)assert.ok([b.position.x,b.position.y,b.velocity.x,b.velocity.y].every(Number.isFinite));}finally{m.dispose();}
 });assert.ok(first[0]>first[1]&&first[1]>first[2],JSON.stringify(first));
});

test('reset clears stale plans/aim and diagnostic history remains bounded',()=>{
 const m=match();
 try{for(let i=0;i<150;i++)m.botReport('hold','reason '+i,null,0,true);assert.equal(m.botHistory.length,120);m.setHumanAim({x:320,y:0});m.resetPositions();assert.equal(m.botHistory.length,0);assert.equal(m.botAim,null);assert.equal(m.botTactic,'ATTACK');assert.ok(m.botOpening);assert.equal(m.cooldown[1],0);}finally{m.dispose();}
});
