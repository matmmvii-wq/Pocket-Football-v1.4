import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {WebSocket} from 'ws';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('two-player authoritative rooms, direct launches, isolation, rematches and cleanup',async()=>{
 const processServer=spawn(process.execPath,['dist/server.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','inherit']});
 const port=await new Promise((resolve,reject)=>{processServer.stdout.on('data',b=>{const m=b.toString().match(/port (\d+)/);if(m)resolve(Number(m[1]));});processServer.on('error',reject);});
 const clients=[];
 async function client(){const ws=new WebSocket(`ws://localhost:${port}/ws`);const messages=[];ws.on('message',b=>messages.push(JSON.parse(b)));await new Promise(r=>ws.once('open',r));const c={ws,messages,send:d=>ws.send(JSON.stringify(d)),wait:async(predicate,timeout=6000)=>{const until=Date.now()+timeout;while(Date.now()<until){const i=messages.findIndex(predicate);if(i>=0)return messages.splice(i,1)[0];await sleep(10);}throw Error('Timed out waiting for server message');}};clients.push(c);return c;}
 try{
  const a=await client(),b=await client(),c=await client();
  a.send({type:'create',team:'ARG',duration:45,avatar:{name:'Captain',hair:'long',skin:'#6b402c',topColor:'#ABCDEF'}});const room=await a.wait(m=>m.type==='room');assert.match(room.code,/^[A-Z2-9]{6}$/);
  b.send({type:'join',code:'ZZZZZZ'});assert.match((await b.wait(m=>m.type==='error')).message,/not found/);
  b.send({type:'join',code:room.code,team:'BRA',avatar:{name:'Guest',headwear:'cap',skin:'invalid',extra:'ignored'}});assert.equal((await b.wait(m=>m.type==='seat')).seat,1);const shared=await b.wait(m=>m.type==='room');assert.equal(shared.players[0].avatar.name,'Captain');assert.equal(shared.players[0].avatar.hair,'long');assert.equal(shared.players[0].avatar.topColor,'#abcdef');assert.equal(shared.players[1].avatar.headwear,'cap');assert.match(shared.players[1].avatar.skin,/^#[0-9a-f]{6}$/);assert.ok(!('extra' in shared.players[1].avatar));const hostShared=await a.wait(m=>m.type==='room'&&m.players.length===2);assert.deepEqual(hostShared.players,shared.players);assert.ok(Number.isInteger(room.stadium)&&room.stadium>=0&&room.stadium<8);assert.equal(hostShared.stadium,room.stadium);assert.equal(shared.stadium,room.stadium);
  c.send({type:'join',code:room.code});assert.match((await c.wait(m=>m.type==='error')).message,/full/);
  c.send({type:'create',team:'JPN'});const other=await c.wait(m=>m.type==='room');assert.notEqual(other.code,room.code);assert.equal(other.players[0].avatar,null);
  a.send({type:'avatar',avatar:{name:'Equipped',hair:'warrior cut'}});const equipped=await b.wait(m=>m.type==='room'&&m.players[0].avatar.name==='Equipped');assert.equal(equipped.players[0].avatar.hair,'warrior cut');assert.ok(equipped.players.every(p=>!p.ready));
  a.send({type:'ready'});await b.wait(m=>m.type==='room'&&m.players[0].ready&&!m.players[1].ready);
  await sleep(120);assert.ok(!a.messages.some(m=>m.type==='start'));assert.ok(!b.messages.some(m=>m.type==='start'));
  a.send({type:'avatar',avatar:{name:'Changed while ready'}});await b.wait(m=>m.type==='room'&&m.players[0].avatar.name==='Changed while ready'&&!m.players[0].ready&&!m.players[1].ready);
  b.send({type:'ready'});await a.wait(m=>m.type==='room'&&!m.players[0].ready&&m.players[1].ready);
  await sleep(120);assert.ok(!a.messages.some(m=>m.type==='start'));
  a.send({type:'ready'});await a.wait(m=>m.type==='start');await b.wait(m=>m.type==='start');
  const initial=await a.wait(m=>m.type==='snapshot'&&m.phase==='playing');assert.equal(initial.bodies.length,13);assert.deepEqual(initial.teams,['ARG','BRA']);
  a.messages.length=0;b.messages.length=0;a.send({type:'launch',x:12,y:-15});b.send({type:'launch',x:-12,y:-15});
  const moved=await a.wait(m=>m.type==='snapshot'&&m.bodies[0][0]>170&&m.bodies[6][0]<830);assert.ok(moved.bodies[0][1]<461);assert.ok(moved.bodies[6][1]<461);
  const same=await b.wait(m=>m.type==='snapshot'&&m.seq===moved.seq);assert.deepEqual(same,moved);
  // Invalid vectors cannot corrupt physics; clients never supply positions or scores.
  a.send({type:'launch',x:'bad',y:0});a.send({type:'launch',x:1e99,y:0});a.send({type:'score',score:[999,0]});
  await sleep(300);assert.equal(c.messages.filter(m=>m.type==='snapshot').length,0);
  const end=await a.wait(m=>m.type==='snapshot'&&m.phase==='finished',65000);assert.ok(end.score[0]<999);assert.ok(end.bodies.flat().every(Number.isFinite));
  a.send({type:'ready'});b.send({type:'ready'});await a.wait(m=>m.type==='start');const replay=await a.wait(m=>m.type==='snapshot'&&m.phase==='countdown'&&m.time===45);assert.deepEqual(replay.score,[0,0]);const newArena=await a.wait(m=>m.type==='room'&&m.stadium!==room.stadium);const guestArena=await b.wait(m=>m.type==='room'&&m.stadium!==room.stadium);assert.equal(newArena.stadium,guestArena.stadium);assert.ok(newArena.stadium>=0&&newArena.stadium<8);
  b.ws.close();assert.match((await a.wait(m=>m.type==='closed')).message,/left/);
  c.send({type:'leave'});await c.wait(m=>m.type==='closed');await sleep(80);
  const health=await (await fetch(`http://localhost:${port}/health`)).json();assert.equal(health.rooms,0);
  const html=await (await fetch(`http://localhost:${port}/`)).text();assert.match(html,/<title>Pocket Football<\/title>/);
 }finally{for(const c of clients)c.ws.close();processServer.kill('SIGTERM');}
});
