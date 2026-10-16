import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import Matter from 'matter-js';
const dir=await mkdtemp(join(tmpdir(),'pocket-cpu-roof-'));
await build({entryPoints:['src/game.ts'],bundle:true,platform:'node',format:'esm',outfile:join(dir,'game.mjs')});
const {Match,GOAL_TOP}=await import(pathToFileURL(join(dir,'game.mjs')).href);await rm(dir,{recursive:true,force:true});
const {Body}=Matter;
function match(){const m=new Match();m.start(['ARG','BRA'],'normal','hard',45);m.phase='playing';m.multiplayer=true;m.botOpening=false;m.botDebug=true;Body.setPosition(m.ball,{x:500,y:490});Body.setVelocity(m.ball,{x:0,y:0});return m;}
function roof(side,angle=0){
 const m=match();m.release(1);const parts=m.players[1],origin={...parts[0].position};parts.forEach(b=>Body.rotate(b,angle,origin));
 const bottom=Math.max(...parts.map(b=>b.bounds.max.y));
 parts.forEach(b=>{Body.translate(b,{x:(side<0?38:962)-origin.x,y:GOAL_TOP-4-bottom-.1});Body.setVelocity(b,{x:0,y:0});Body.setAngularVelocity(b,0);});
 for(let f=0;f<30;f++)m.tick(1/60);m.multiplayer=false;return m;
}
for(const side of [-1,1])for(const [label,angle] of [['upright',0],['sideways',Math.PI/2],['inverted',Math.PI]])test(`CPU launches off the ${side<0?'left':'right'} roof from a ${label} landing`,()=>{
 const m=roof(side,angle);
 try{
  assert.equal(m.botRoofSupport(1),side,'fixture must have a real supporting crossbar contact');
  m.ai(1/120);assert.equal(m.botStatus.action,'launch');assert.equal(m.botTactic,'RECOVER');
  assert.equal(Math.sign(m.botStatus.launch.x),-side,'escape should point back into the pitch');
  assert.ok(Math.hypot(m.botStatus.launch.x,m.botStatus.launch.y)<=18.5);
  let enteredPitch=false;
  for(let f=0;f<120&&m.phase==='playing';f++){
   m.tick(1/60);const p=m.players[1][0].position;
   if(p.y>350&&p.x>90&&p.x<910){enteredPitch=true;break;}
  }
  assert.ok(enteredPitch,'must physically descend into play within two seconds');
 }finally{m.dispose();}
});

test('roof escape still observes the existing launch cooldown',()=>{
 const m=roof(1);m.cooldown[1]=.2;m.botLaunchAge=.1;
 const before=m.players[1].map(b=>[b.velocity.x,b.velocity.y,b.angularVelocity]);
 try{m.ai(1/120);assert.equal(m.botStatus.action,'wait-cooldown');assert.equal(m.botTactic,'RECOVER');assert.deepEqual(m.players[1].map(b=>[b.velocity.x,b.velocity.y,b.angularVelocity]),before);
 for(let f=0;f<20;f++)m.tick(1/60);assert.ok(m.botHistory.some(e=>e.action==='launch'));
 }finally{m.dispose();}
});

test('an incoming shot does not strand the CPU on the roof in a hold loop',()=>{
 const m=roof(1);Body.setPosition(m.ball,{x:650,y:370});Body.setVelocity(m.ball,{x:12,y:-1});
 try{m.ai(1/120);assert.equal(m.botTactic,'GOALKEEP');assert.equal(m.botStatus.action,'launch');assert.ok(m.botStatus.goalIn>0);}finally{m.dispose();}
});

for(const [label,x,y] of [['nearby flight',900,250],['inner side',910,326],['underside',965,350]])test(`${label} is not misclassified as a roof landing`,()=>{
 const m=match();m.release(1);const origin={...m.players[1][0].position};
 m.players[1].forEach(b=>{Body.translate(b,{x:x-origin.x,y:y-origin.y});Body.setVelocity(b,{x:0,y:0});Body.setAngularVelocity(b,0);});m.tick(1/60);m.multiplayer=false;
 const before=m.players[1].map(b=>[b.velocity.x,b.velocity.y,b.angularVelocity]);
 try{assert.equal(m.botRoofSupport(1),0);m.ai(1/120);assert.equal(m.botStatus.action,'wait-ground');assert.deepEqual(m.players[1].map(b=>[b.velocity.x,b.velocity.y,b.angularVelocity]),before);}finally{m.dispose();}
});

test('a well-positioned goalkeeper can still hold instead of making pointless launches',()=>{
 const m=match();m.multiplayer=false;Body.setPosition(m.ball,{x:20,y:GOAL_TOP-4-18.5});Body.setVelocity(m.ball,{x:0,y:0});
 try{for(let f=0;f<120;f++)m.ai(1/120);assert.equal(m.botTactic,'GOALKEEP');assert.equal(m.botStatus.action,'hold');assert.ok(m.standing[1]);assert.ok(!m.botHistory.some(e=>e.action==='launch'));}finally{m.dispose();}
});
