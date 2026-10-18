import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {audioContext} from './helpers/audio-context.mjs';
const dir=await mkdtemp(join(tmpdir(),'pf-audio-'));
await build({stdin:{contents:"export * from './src/audio';export * from './src/matchAudio';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:join(dir,'audio.mjs')});
const {GameAudio,MatchAudio}=await import(pathToFileURL(join(dir,'audio.mjs')).href);await rm(dir,{recursive:true,force:true});
function fixture(state,loadMenu=()=>new Promise(()=>{})){
 const graph=audioContext(state),listeners=new Set(),portal={audioMuted:false,onAudioChange(fn){listeners.add(fn);fn(false);return()=>listeners.delete(fn);}};
 const audio=new GameAudio(portal,()=>graph.context,loadMenu);
 return {...graph,audio,listeners,mute(v){portal.audioMuted=v;for(const l of listeners)l(v);}};
}
function director(){
 const cues=[],scenes=[],visibility=[],audio={play:cue=>cues.push(cue),setScene:s=>scenes.push(s),setVisible:v=>visibility.push(v)};
 const match=new MatchAudio(audio);let state={screen:'title',paused:false,visible:true,phase:'idle',message:'',score:[0,0],seat:0};
 return {cues,scenes,visibility,update(change={}){state={...state,...change};match.update(state);}};
}
test('countdown, kickoff, goals, restart and result play once across repeated frames',()=>{
 const f=director();f.update();f.update({screen:'match',phase:'countdown',message:'3'});
 for(let i=0;i<50;i++)f.update();f.update({message:'2'});f.update({message:'1'});f.update({phase:'playing',message:''});
 f.update({phase:'goal',score:[1,0]});for(let i=0;i<60;i++)f.update();
 f.update({phase:'countdown',message:'1'});f.update({phase:'playing'});f.update({phase:'finished'});f.update({screen:'result'});
 assert.deepEqual(f.cues,['countdown','countdown','countdown','kickoff','goal','countdown','kickoff','win']);assert.equal(f.scenes.at(-1),'result');
});
test('online snapshot score changes work without the local goal callback; right seat wins correctly',()=>{
 const f=director();f.update();f.update({screen:'match',phase:'playing',score:[0,0],seat:1});
 f.update({score:[0,1]});f.update();f.update({phase:'finished'});assert.deepEqual(f.cues,['goal','win']);
 const loss=director();loss.update({screen:'match',phase:'playing',seat:1});loss.update({phase:'finished',score:[1,0]});assert.deepEqual(loss.cues,['lose']);
 const draw=director();draw.update({screen:'match',phase:'playing'});draw.update({phase:'finished'});assert.deepEqual(draw.cues,['draw']);
});
test('pause, hidden snapshots and late joins do not replay stale cues',()=>{
 const f=director();f.update({screen:'match',phase:'playing',score:[4,3]});assert.deepEqual(f.cues,[]);
 f.update({paused:true});f.update({phase:'goal',score:[5,3]});f.update({paused:false});assert.deepEqual(f.cues,[]);
 f.update({visible:false});f.update({score:[5,4]});f.update({visible:true});assert.deepEqual(f.cues,[]);
 f.update({score:[5,5]});assert.deepEqual(f.cues,['goal']);
 f.update({screen:'title'});f.update({screen:'match',phase:'countdown',score:[0,0],message:'3'});assert.equal(f.cues.at(-1),'countdown');
});
test('single crowd loop survives repeated state updates and stops on pause/menu/result',()=>{
 const f=fixture();f.audio.unlock();f.audio.setScene('match');
 for(let i=0;i<100;i++)f.audio.setScene('match');
 assert.equal(f.active().filter(s=>s.loop).length,1);assert.equal(f.buffers.length,1);
 const buffer=f.buffers[0].buffer;assert.equal(buffer.numberOfChannels,2);
 for(let c=0;c<2;c++){const samples=buffer.getChannelData(c);assert.ok(samples.every(Number.isFinite));assert.equal(samples[0],samples.at(-1));}
 for(const scene of ['paused','menu','result']){f.audio.setScene(scene);assert.equal(f.active().length,0);f.audio.setScene('match');assert.equal(f.active().filter(s=>s.loop).length,1);assert.equal(f.buffers.at(-1).buffer,buffer);}
 f.audio.dispose();assert.equal(f.active().length,0);assert.equal(f.context.state,'closed');assert.equal(f.listeners.size,0);
});
test('mute, sound off and background visibility stop loops and scheduled fanfares, then restore only the crowd',()=>{
 const f=fixture();f.audio.unlock();f.audio.setScene('match');f.audio.play('win');assert.ok(f.active().length>5);
 f.mute(true);assert.equal(f.gains[0].gain.value,0);assert.equal(f.active().length,0);
 f.mute(false);assert.equal(f.active().length,1);assert.equal(f.active()[0].loop,true);
 f.audio.setVisible(false);assert.equal(f.active().length,0);f.audio.play('goal');assert.equal(f.active().length,0);
 f.audio.setVisible(true);assert.equal(f.active().length,1);
 f.audio.setEnabled(false);f.mute(true);f.mute(false);assert.equal(f.active().length,0);assert.equal(f.gains[0].gain.value,0);
 f.audio.setEnabled(true);assert.equal(f.active().length,1);f.audio.dispose();
});
test('all cues produce bounded one-shots, end cleanly, and connect to the master gate',()=>{
 const f=fixture();
 for(const cue of ['click','launch','countdown','kickoff','goal','win','lose','draw','reward']){
  const before=f.sources.length;f.audio.play(cue);assert.ok(f.sources.length>before,cue);
  for(const source of f.sources.slice(before)){
   assert.ok(source.stopAt<=f.context.currentTime+3,cue);
   let node=source,limit=6;while(node!==f.gains[0]&&limit-->0)node=node.connections[0];assert.equal(node,f.gains[0],cue+' bypassed mute');
  }
  f.advance(3);assert.equal(f.active().length,0,cue);
 }
 f.audio.dispose();
});
test('rapid repeats are rate limited; suspended audio never queues old cues',()=>{
 const f=fixture();f.audio.play('launch');const n=f.sources.length;for(let i=0;i<500;i++)f.audio.play('launch');assert.equal(f.sources.length,n);
 f.advance(.1);f.audio.play('launch');assert.ok(f.sources.length>n);f.audio.dispose();
 const locked=fixture('suspended');locked.audio.setScene('match');locked.audio.play('countdown');locked.audio.play('goal');assert.equal(locked.sources.length,0);
 locked.setState('running');assert.equal(locked.active().length,1);assert.equal(locked.active()[0].loop,true);locked.audio.dispose();locked.audio.play('goal');assert.equal(locked.active().length,0);
});
test('leaving a result cancels future notes while menu feedback stays available',()=>{
 const f=fixture();f.audio.setScene('result');f.audio.play('win');assert.ok(f.active().some(s=>s.startAt>f.context.currentTime));
 f.audio.setScene('menu');assert.equal(f.active().length,0);f.audio.play('click');assert.equal(f.active().length,1);f.audio.dispose();
});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('menu theme loads once, keeps its place across menus, and never overlaps match audio',async()=>{
 let loads=0;
 const f=fixture('running',async context=>{loads++;return context.createBuffer(2,8000*32,8000);});
 assert.equal(loads,0);f.audio.unlock();await flush();
 const first=f.active()[0];assert.equal(first.loop,true);assert.equal(first.buffer.duration,32);
 assert.equal(first.connections[0].connections[0],f.gains[0]);
 f.advance(5);for(let i=0;i<30;i++){f.audio.setScene('menu');f.audio.unlock();}
 await flush();assert.equal(loads,1);assert.deepEqual(f.active(),[first]);
 f.audio.setScene('match');assert.equal(first.disconnected,true);assert.equal(f.active().length,1);assert.notEqual(f.active()[0].buffer,first.buffer);
 f.audio.setScene('paused');assert.equal(f.active().length,0);f.audio.setScene('result');assert.equal(f.active().length,0);
 f.audio.setScene('menu');assert.equal(f.active().length,1);assert.equal(f.active()[0].offset,5);
 f.audio.dispose();assert.equal(f.active().length,0);
});
test('menu music obeys user mute, SDK mute, background visibility and context interruption',async()=>{
 const f=fixture('running',async context=>context.createBuffer(2,8000*32,8000));f.audio.unlock();await flush();assert.equal(f.active().length,1);
 f.mute(true);assert.equal(f.active().length,0);f.audio.setEnabled(true);assert.equal(f.active().length,0);
 f.mute(false);assert.equal(f.active().length,1);f.audio.setEnabled(false);f.mute(true);f.mute(false);assert.equal(f.active().length,0);
 f.audio.setEnabled(true);assert.equal(f.active().length,1);f.audio.setVisible(false);assert.equal(f.active().length,0);
 f.audio.setVisible(true);assert.equal(f.active().length,1);f.setState('suspended');assert.equal(f.active().length,0);
 f.setState('running');assert.equal(f.active().length,1);f.audio.dispose();
});
test('late menu downloads stay silent during matches, while muted, or after disposal',async()=>{
 for(const action of ['match','mute','dispose']){
  let resolve;const f=fixture('running',()=>new Promise(r=>resolve=r));f.audio.unlock();await flush();
  if(action==='match')f.audio.setScene('match');else if(action==='mute')f.mute(true);else f.audio.dispose();
  const music=f.context.createBuffer(2,8000*32,8000);resolve(music);await flush();
  assert.ok(!f.active().some(s=>s.buffer===music),action);
  if(action==='match'){f.audio.setScene('menu');assert.equal(f.active()[0].buffer,music);}
  if(action==='mute'){f.mute(false);assert.equal(f.active()[0].buffer,music);}
  f.audio.dispose();
 }
});
test('failed music fetch does not break effects or refetch on every menu click',async()=>{
 let attempts=0;const f=fixture('running',async()=>{attempts++;throw Error('offline');});f.audio.unlock();await flush();
 f.audio.play('click');for(let i=0;i<100;i++)f.audio.unlock();await flush();
 assert.equal(attempts,1);assert.ok(f.active().some(s=>s.frequency));f.audio.dispose();
});
test('bundled theme is a complete, non-clipping stereo WAV with a joined loop boundary',async()=>{
 const wav=await readFile('public/audio/pocket-football-menu.wav');
 assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
 assert.equal(wav.readUInt16LE(22),2);assert.equal(wav.readUInt32LE(24),32000);assert.equal(wav.readUInt16LE(34),16);
 assert.equal(wav.readUInt32LE(40),32*32000*4);assert.equal(wav.length,44+32*32000*4);
 let peak=0,sum=0;for(let i=44;i<wav.length;i+=2){const v=wav.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(v));sum+=v*v;}
 assert.ok(peak<.8&&peak>.2);assert.ok(Math.sqrt(sum/((wav.length-44)/2))>.05);
 for(let c=0;c<2;c++)assert.equal(wav.readInt16LE(44+c*2),wav.readInt16LE(wav.length-4+c*2));
});
