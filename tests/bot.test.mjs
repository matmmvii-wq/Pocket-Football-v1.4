import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import Matter from 'matter-js';
const dir=await mkdtemp(join(tmpdir(),'pocket-cup-bot-'));
await build({entryPoints:['src/game.ts'],bundle:true,platform:'node',format:'esm',outfile:join(dir,'game.mjs')});
const {Match,GROUND,GOAL_TOP}=await import(pathToFileURL(join(dir,'game.mjs')).href);
await rm(dir,{recursive:true,force:true});
const {Body}=Matter;
function seeded(seed,run){const original=Math.random;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);try{return run();}finally{Math.random=original;}}
function match(level='normal'){const m=new Match();m.start(['ARG','BRA'],'normal',level,45);m.phase='playing';m.aiTimer=0;return m;}

test('CPU stays active and scores through 18 full matches against idle and moving opponents',t=>{
 const totals=new Map();
 for(const moving of [false,true])for(const level of ['easy','normal','hard'])for(const seed of [1,17,103])seeded(seed,()=>{
  const m=new Match();m.start(['ARG','BRA'],'normal',level,45);
  let contacts=0;const recent=[];
  Matter.Events.on(m.engine,'collisionStart',event=>{for(const pair of event.pairs)if((pair.bodyA===m.ball&&m.players[1].includes(pair.bodyB))||(pair.bodyB===m.ball&&m.players[1].includes(pair.bodyA)))contacts++;});
  try{
   for(let f=0;f<9000&&m.phase!=='finished';f++){
    if(moving&&m.phase==='playing'&&f%36===0&&m.players[0].some(body=>body.bounds.max.y>GROUND-4)){const p=m.players[0][0].position,b=m.ball.position;m.launch(0,(b.x-p.x)*.1,(b.y-p.y)*.13-2);}
    m.tick(1/60);
    if(m.phase==='playing'){
     recent.push({...m.ball.position});if(recent.length>720)recent.shift();
     if(recent.length===720&&f%60===0){const xs=recent.map(p=>p.x),ys=recent.map(p=>p.y);assert.ok(Math.max(...xs)-Math.min(...xs)>30||Math.max(...ys)-Math.min(...ys)>30,`${level}/${seed}/${moving}: pinned at ${JSON.stringify(m.ball.position)}, CPU ${JSON.stringify(m.players[1][0].position)}, state ${m.botState}`);}
    }else recent.length=0;
   }
   assert.equal(m.phase,'finished');
   assert.ok(m.score[1]>=1,`${level}/${seed}, moving=${moving}: CPU must score during the match`);
   const key=`${level}/${moving}`,total=totals.get(key)||[0,0];total[0]+=m.score[0];total[1]+=m.score[1];totals.set(key,total);
   assert.ok(contacts>20,'must repeatedly contest the ball throughout the match');
  }finally{m.dispose();}
 });
 // Win ratios are balance diagnostics, not invariants when ball impact strength changes.
 for(const [key,total] of totals)t.diagnostic(`${key}: CPU ${total[1]}, baseline ${total[0]}`);
});

test('CPU clears four incoming shots, including shots an inactive defender concedes',()=>{
 let inactiveGoals=0;
 for(const setup of [[650,370,12,-1],[750,350,8,0],[700,450,16,-3],[550,250,12,2]]){
  for(const active of [false,true])seeded(7,()=>{
   const m=match();m.multiplayer=!active;
   Body.setPosition(m.ball,{x:setup[0],y:setup[1]});Body.setVelocity(m.ball,{x:setup[2],y:setup[3]});
   let cleared=false;
   try{for(let f=0;f<240&&m.phase==='playing';f++){m.tick(1/60);if(m.ball.position.x<650&&m.ball.velocity.x< -2)cleared=true;}
    if(active)assert.equal(m.score[0],0,`shot ${setup}, CPU ${active}`);
    else inactiveGoals+=m.score[0];
    if(active)assert.ok(cleared,'save must clear the ball away from its goal');
   }finally{m.dispose();}
  });
 }
 assert.ok(inactiveGoals>=3,'at least three fixtures must beat the inactive defender');
});

test('goal roof anti-stuck physics moves the ball without AI intervention',()=>seeded(29,()=>{
 for(const x of [20,980]){
  const m=match();m.multiplayer=true; // Disables CPU; the ball must escape on its own.
  Body.setPosition(m.ball,{x,y:GOAL_TOP-4-18.5});Body.setVelocity(m.ball,{x:0,y:0});
  const initialX=m.ball.position.x;
  let furthest=0;
  try{
   for(let f=0;f<90;f++){
    m.tick(1/60);
    furthest=Math.max(furthest,Math.abs(m.ball.position.x-initialX));
    assert.ok(Number.isFinite(m.ball.position.x)&&Number.isFinite(m.ball.position.y),'ball remains physically valid');
   }
   // The ball may rebound toward its starting x after escaping; checking only
   // the final frame incorrectly treats that successful escape as a failure.
   assert.ok(furthest>20,`ball at ${initialX} must move away from roof without CPU (maximum movement ${furthest})`);
  }finally{m.dispose();}
 }
}));

test('rules change only CPU launch velocity, within human launch limits',()=>seeded(31,()=>{
 const m=match();const snapshot=body=>[body.position.x,body.position.y,body.angle,body.velocity.x,body.velocity.y,body.angularVelocity];
 const ball=snapshot(m.ball),human=m.players[0].map(snapshot),positions=m.players[1].map(b=>[b.position.x,b.position.y,b.angle]);
 try{m.ai(1/60);assert.deepEqual(snapshot(m.ball),ball);assert.deepEqual(m.players[0].map(snapshot),human);
  assert.deepEqual(m.players[1].map(b=>[b.position.x,b.position.y,b.angle]),positions);
  for(const body of m.players[1])assert.ok(body.speed<=18.5+1e-6);
 }finally{m.dispose();}
}));

test('CPU stays disabled in practice and multiplayer; matches finish with finite physics',()=>{
 for(const mode of ['practice','multiplayer']){const m=match();if(mode==='practice'){m.mode='practice';m.resetPositions();}else m.multiplayer=true;m.ai=()=>assert.fail(`AI ran in ${mode}`);try{for(let f=0;f<120;f++)m.tick(1/60);}finally{m.dispose();}}
 seeded(71,()=>{const m=match();try{for(let f=0;f<60*150&&m.phase!=='finished';f++){m.tick(1/60);for(const body of m.objects)assert.ok([body.position.x,body.position.y,body.velocity.x,body.velocity.y].every(Number.isFinite));}assert.equal(m.phase,'finished');assert.ok(m.score[1]>=3);}finally{m.dispose();}});
});


test('tracking and defend state update every frame even while launch is unavailable',()=>{
 const m=match();m.aiTimer=10;m.cooldown[1]=10;
 try{
  Body.setPosition(m.ball,{x:500,y:300});Body.setVelocity(m.ball,{x:0,y:0});m.ai(1/60);
  const first={...m.botTarget};assert.equal(m.botState,'charge');
  Body.setPosition(m.ball,{x:910,y:190});Body.setVelocity(m.ball,{x:8,y:1});m.ai(1/60);
  assert.equal(m.botState,'defend');assert.notDeepEqual(m.botTarget,first);
  assert.ok(m.botTarget.x>=875);assert.ok(m.players[1].every(p=>p.speed===0),'observation must not bypass reaction delay');
 }finally{m.dispose();}
});

test('an overturned grounded ragdoll uses bounded recovery and resumes play',()=>seeded(81,()=>{
 const m=match();m.aiTimer=.5;m.release(1);
 for(const body of m.players[1]){Body.rotate(body,Math.PI,{x:860,y:461});Body.setVelocity(body,{x:0,y:0});Body.setAngularVelocity(body,0);}
 Body.setPosition(m.ball,{x:350,y:493});Body.setVelocity(m.ball,{x:0,y:0});
 let recovered=false,resumed=false,tilt=Math.PI;
 try{
  for(let f=0;f<180;f++){
   m.tick(1/60);
   if(m.botState==='recover'){recovered=true;tilt=Math.min(tilt,Math.abs(Math.atan2(Math.sin(m.players[1][0].angle),Math.cos(m.players[1][0].angle))));}
   else if(recovered)resumed=true;
  }
  assert.ok(recovered,'must enter recovery for an upside-down ragdoll');assert.ok(tilt<2.5,'motor must rotate it toward upright');assert.ok(resumed,'recovery must end and pursuit resume');
 }finally{m.dispose();}
}));


test('CPU tracks but cannot relaunch or apply recovery torque in free flight',()=>{
 for(const level of ['easy','normal','hard']){
  const m=match(level);m.release(1);
  for(const body of m.players[1]){Body.translate(body,{x:0,y:-240});Body.setVelocity(body,{x:-8,y:-2});Body.setAngularVelocity(body,.08);}
  Body.setPosition(m.ball,{x:750,y:210});Body.setVelocity(m.ball,{x:-8,y:-2});
  const before=m.players[1].map(b=>[b.velocity.x,b.velocity.y,b.angularVelocity]);
  let launches=0;const launch=m.launch.bind(m);m.launch=(...args)=>{launches++;return launch(...args);};
  try{for(let f=0;f<120;f++){m.aiTimer=0;m.cooldown[1]=0;m.ai(1/60);}
   assert.equal(launches,0,`${level}: no fresh impulse while airborne, even with cooldown cleared`);
   assert.deepEqual(m.players[1].map(b=>[b.velocity.x,b.velocity.y,b.angularVelocity]),before);
  }finally{m.dispose();}
 }
});

test('a launch stays committed until landing, then the CPU can launch again',()=>{
 const m=match('hard');m.ball.collisionFilter.mask=0;
 // Isolate a floor landing; resting on a grounded opponent is valid support.
 for(const body of m.players[0])body.collisionFilter.mask=0;
Body.setVelocity(m.ball,{x:0,y:0});let launches=0,airborne=false,landed=false;
 const launch=m.launch.bind(m);m.launch=(...args)=>{const fired=launch(...args);if(fired)launches++;return fired;};
 try{for(let f=0;f<600&&m.phase==='playing';f++){
   const free=m.players[1].every(b=>b.bounds.max.y<GROUND-35)&&m.players[1][0].position.x>100&&m.players[1][0].position.x<900;
   const prior=launches;m.tick(1/60);
   if(free){airborne=true;assert.equal(launches,prior,'no airborne touch correction');}
   if(airborne&&m.players[1].some(b=>b.bounds.max.y>GROUND-4))landed=true;
   if(landed&&launches>=2)break;
  }
  assert.ok(airborne&&landed&&launches>=2,'must land before starting the next lunge');
 }finally{m.dispose();}
});
