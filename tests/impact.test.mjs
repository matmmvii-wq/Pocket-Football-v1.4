import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import Matter from 'matter-js';
const dir=await mkdtemp(join(tmpdir(),'cup-impact-'));
await build({entryPoints:['src/game.ts'],bundle:true,platform:'node',format:'esm',outfile:join(dir,'game.mjs')});
const {Match,BALL_SPEED_LIMIT}=await import(pathToFileURL(join(dir,'game.mjs')).href);
await rm(dir,{recursive:true,force:true});
const {Body}=Matter;
function setup(boost){const m=new Match();m.multiplayer=true;m.start(['ARG','BRA'],'normal','normal',45);m.phase='playing';m.impactBoost=boost;return m;}
function shot(p,boost){const m=setup(boost);try{
 for(const body of m.players[p])Body.translate(body,{x:p===0?160:-160,y:-160});
 Body.setPosition(m.ball,{x:p===0?380:620,y:301});Body.setVelocity(m.ball,{x:0,y:0});
 m.launch(p,p===0?14:-14,0);const launch=m.players[p].map(b=>[b.velocity.x,b.velocity.y,b.angularVelocity]);
 let peak=0;for(let f=0;f<25;f++){m.tick(1/60);peak=Math.max(peak,m.ball.speed);}
 return {launch,peak,vx:m.ball.velocity.x};
}finally{m.dispose();}}
test('both players hit the ball harder with exactly the same launch velocity',t=>{
 for(const p of [0,1]){const before=shot(p,0),after=shot(p,.65);t.diagnostic(`Player ${p+1}: peak ball speed ${before.peak.toFixed(2)} -> ${after.peak.toFixed(2)}`);assert.deepEqual(after.launch,before.launch);assert.ok(after.peak>before.peak);assert.ok(after.peak<before.peak*1.6);assert.equal(Math.sign(after.vx),p===0?1:-1);}
});
test('floor and wall bounces get no impact amplification',()=>{
 for(const fixture of [{x:500,y:480,vx:0,vy:8},{x:28,y:200,vx:-12,vy:0}]){
  const result=[];for(const boost of [0,.65]){const m=setup(boost);try{Body.setPosition(m.ball,fixture);Body.setVelocity(m.ball,{x:fixture.vx,y:fixture.vy});for(let f=0;f<20;f++)m.tick(1/60);result.push([m.ball.position.x,m.ball.position.y,m.ball.velocity.x,m.ball.velocity.y]);}finally{m.dispose();}}
  assert.deepEqual(result[0],result[1]);
 }
});
test('fast ball is capped separately without raising the player speed cap',()=>{
 const m=setup(.65);try{Body.setPosition(m.ball,{x:500,y:200});Body.setVelocity(m.ball,{x:90,y:0});m.release(0);for(const b of m.players[0]){Body.translate(b,{x:160,y:-160});Body.setVelocity(b,{x:0,y:-80});}m.tick(1/60);assert.ok(m.ball.speed<=BALL_SPEED_LIMIT+1e-6);for(const b of m.players[0])assert.ok(b.speed<=34+1e-6);}finally{m.dispose();}
});
test('contact with several limbs produces at most one boost in a 120ms burst',()=>{
 const m=setup(.65);try{m.release(0);Body.setPosition(m.ball,{x:190,y:450});Body.setVelocity(m.ball,{x:-10,y:0});let boosts=0;
 // Count actual queued impacts after collisionStart; retain normal physics.
 Matter.Events.on(m.engine,'collisionStart',()=>{if(m.pendingBallImpact)boosts++;});
 for(let f=0;f<6;f++)m.tick(1/60);assert.equal(boosts,1);assert.ok(m.ball.speed<=BALL_SPEED_LIMIT);
 }finally{m.dispose();}
});
