import {test} from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {pathToFileURL} from 'node:url';import Matter from 'matter-js';
const dir=await mkdtemp(join(tmpdir(),'cup-feel-'));await build({entryPoints:['src/game.ts'],bundle:true,platform:'node',format:'esm',outfile:join(dir,'game.mjs')});const {Match}=await import(pathToFileURL(join(dir,'game.mjs')).href);await rm(dir,{recursive:true,force:true});
function match(){const m=new Match();m.multiplayer=true;m.start(['ARG','BRA'],'normal','normal',45);m.phase='playing';return m;}
const {Body}=Matter;
test('flight sheds speed gradually while retaining the initial launch impulse',()=>{
 const travel=[];for(const old of [true,false]){const m=match();try{m.engine.gravity.y=0;m.ball.collisionFilter.mask=0;for(const b of m.players[0]){Body.translate(b,{x:150,y:-210});if(old)b.frictionAir=.0008;}m.launch(0,12,0);const mass=m.players[0].reduce((v,b)=>v+b.mass,0),vx=()=>m.players[0].reduce((v,b)=>v+b.mass*b.velocity.x,0)/mass;assert.ok(Math.abs(vx()-12)<1e-9);for(let f=0;f<30;f++)m.tick(1/60);travel.push(vx());}finally{m.dispose();}}
 assert.ok(travel[1]<travel[0]*.94);assert.ok(travel[1]>travel[0]*.7,'glide must not abruptly stop');
});
test('goal slow motion continues physics, holds score, and resumes at normal time',()=>{
 const m=match();try{let goals=0;m.onGoal=()=>goals++;Body.setPosition(m.ball,{x:970,y:420});Body.setVelocity(m.ball,{x:12,y:0});m.tick(1/60);assert.equal(m.phase,'goal');assert.equal(goals,1);const score=[...m.score],time=m.time;
 let outside=false;for(let f=0;f<130;f++){m.tick(1/60);outside ||= m.ball.position.x<957;assert.deepEqual(m.score,score);assert.equal(m.time,time);assert.equal(m.phase,'goal');}
 assert.ok(outside,'ball remains physical and can rebound out of the goal');assert.equal(goals,1);
 for(let f=0;f<30;f++)m.tick(1/60);assert.equal(m.phase,'countdown');assert.equal(m.engine.timing.timeScale,1);
 for(let f=0;f<65;f++)m.tick(1/60);assert.equal(m.phase,'playing');assert.equal(m.engine.timing.timeScale,1);
 }finally{m.dispose();}
});
test('goal ball moves at near-freeze speed instead of normal match speed',()=>{
 const distances=[];for(const slow of [false,true]){const m=match();try{m.engine.gravity.y=0;Body.setPosition(m.ball,{x:500,y:250});Body.setVelocity(m.ball,{x:10,y:0});if(slow){m.phase='goal';m.resetTimer=2.4;}for(let f=0;f<10;f++)m.tick(1/60);distances.push(m.ball.position.x-500);}finally{m.dispose();}}
 assert.ok(distances[1]>0);assert.ok(distances[1]/distances[0]>.07&&distances[1]/distances[0]<.09);
});
