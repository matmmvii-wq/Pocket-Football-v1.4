import {test} from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {pathToFileURL} from 'node:url';import Matter from 'matter-js';
const dir=await mkdtemp(join(tmpdir(),'cup-body-'));await build({entryPoints:['src/game.ts'],bundle:true,platform:'node',format:'esm',outfile:join(dir,'game.mjs')});const {Match,BALL_RADIUS}=await import(pathToFileURL(join(dir,'game.mjs')).href);await rm(dir,{recursive:true,force:true});const {Body,Bodies}=Matter;
function match(){const m=new Match();m.multiplayer=true;m.start(['ARG','BRA'],'normal','normal',45);m.phase='playing';return m;}
const anchors=[[[0,-22],[0,11],2], [[-21,-17],[5,-16],0], [[21,-17],[-5,-16],0], [[-11,22],[0,-11],2], [[11,22],[0,-11],2]];
function world(b,p){const c=Math.cos(b.angle),s=Math.sin(b.angle);return {x:b.position.x+c*p[0]-s*p[1],y:b.position.y+s*p[0]+c*p[1]};}
function jointErrors(parts){return parts.slice(1).map((b,i)=>{const [a,z,len]=anchors[i],p=world(parts[0],a),q=world(b,z);return Math.abs(Math.hypot(p.x-q.x,p.y-q.y)-len);});}
function angles(parts){return parts.slice(1).map(b=>Math.abs(Math.atan2(Math.sin(b.angle-parts[0].angle),Math.cos(b.angle-parts[0].angle))));}
test('limbs swing independently during flight while shoulder, neck and hip anchors stay attached',()=>{
 const m=match();try{for(const b of m.players[0])Body.translate(b,{x:200,y:-180});m.launch(0,10,-5);
 let swing=0;for(let f=0;f<60;f++){m.tick(1/60);for(const gap of jointErrors(m.players[0]))assert.ok(gap<2,'no stretched/detached body pieces');swing=Math.max(swing,...angles(m.players[0]).slice(1));}
 assert.ok(swing>.3,'limbs must visibly bend relative to the torso, not remain welded');
 }finally{m.dispose();}
});
test('launch uses a single shared spin and preserves requested center-of-mass velocity',()=>{
 const m=match();try{m.launch(0,12,-10);const parts=m.players[0],mass=parts.reduce((s,b)=>s+b.mass,0);assert.ok(parts.every(b=>b.angularVelocity===parts[0].angularVelocity));
 const vx=parts.reduce((s,b)=>s+b.velocity.x*b.mass,0)/mass,vy=parts.reduce((s,b)=>s+b.velocity.y*b.mass,0)/mass;
 assert.ok(Math.abs(vx-12)<1e-9);assert.ok(Math.abs(vy+10)<1e-9);
 }finally{m.dispose();}
});
test('joints stay connected and within anatomical rotation stops through impacts and relaunches',()=>{
 const m=match();m.ball.collisionFilter.mask=0;try{m.launch(0,14,-10);for(let f=0;f<480;f++){
 if(f===180)m.launch(0,-14,-10);m.tick(1/60);
 for(const gap of jointErrors(m.players[0]))assert.ok(Number.isFinite(gap)&&gap<6,`joint gap ${gap}`);
 angles(m.players[0]).forEach((angle,i)=>assert.ok(angle<=[.65,2.15,2.15,1.15,1.15][i]+1e-8));
 }}finally{m.dispose();}
});
test('ball diameter increases modestly while its mass is preserved',()=>{
 const m=match();try{assert.equal(BALL_RADIUS,18.5);assert.equal(m.ball.circleRadius,18.5);assert.ok(BALL_RADIUS/17<1.1);assert.ok(Math.abs(m.ball.mass-Bodies.circle(0,0,17,{density:.0045}).mass)<1e-9);}finally{m.dispose();}
});
