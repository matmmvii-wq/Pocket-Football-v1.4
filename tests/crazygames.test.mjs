import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'pf-crazygames-'));
await build({stdin:{contents:"export * from './src/platform';export * from './src/audio';export * from './src/progress';export * from './src/shop';export * from './src/wardrobe';export * from './src/avatar';export * from './src/cup';export * from './src/rewards';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:join(dir,'sdk.mjs')});
const A=await import(pathToFileURL(join(dir,'sdk.mjs')).href);await rm(dir,{recursive:true,force:true});
function memory(){const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};}
function fixture(environment='crazygames',muted=false){
 const data=memory(),local=memory(),events=[],listeners=new Set();let ready=false,initializations=0,localReads=0;
 const sdk={environment,init:async()=>{initializations++;await Promise.resolve();ready=true;},data:{getItem:k=>{assert.ok(ready,'read before SDK initialization');return data.getItem(k);},setItem:(k,v)=>data.setItem(k,v),removeItem:k=>data.removeItem(k)},game:{settings:{muteAudio:muted},addSettingsChangeListener:l=>listeners.add(l),removeSettingsChangeListener:l=>listeners.delete(l),...Object.fromEntries(['loadingStart','loadingStop','gameplayStart','gameplayStop'].map(n=>[n,()=>events.push(n)]))}};
 const platform=new A.GamePlatform(()=>sdk,()=>{localReads++;return local;});
 return {sdk,platform,data,local,events,listeners,get initializations(){return initializations;},get localReads(){return localReads;},mute(value){sdk.game.settings={muteAudio:value};for(const l of listeners)l(sdk.game.settings);}};
}
test('SDK initialization is awaited once; cloud data wins over unrelated local progress',async()=>{
 const f=fixture();f.data.setItem(A.SHOP_KEY,JSON.stringify({...A.emptyWallet(),coins:77}));f.local.setItem(A.SHOP_KEY,JSON.stringify({...A.emptyWallet(),coins:99999}));
 assert.throws(()=>f.platform.storage.getItem(A.SHOP_KEY),/not ready/);
 await Promise.all([f.platform.initialize(),f.platform.initialize()]);
 assert.equal(f.initializations,1);assert.equal(A.readWallet(f.platform.storage).coins,77);assert.equal(f.localReads,0);assert.equal(f.data.values.size,1);
});
test('Data Module failure blocks initialization rather than starting with a fresh local save',async()=>{
 const f=fixture();f.sdk.data.getItem=()=>{throw Error('dataModuleDisabled');};
 await assert.rejects(f.platform.initialize(),/dataModuleDisabled/);assert.equal(f.localReads,0);assert.equal(f.data.values.size,0);assert.equal(f.listeners.size,0);
 assert.throws(()=>f.platform.storage.setItem('x','y'),/not ready/);
});
test('missing SDK and failed initialization show failure; retries can succeed without duplicate subscriptions',async()=>{
 const absent=new A.GamePlatform(()=>undefined,()=>{throw Error('must not fall back');});await assert.rejects(absent.initialize(),/could not load/);
 const f=fixture();const init=f.sdk.init;f.sdk.init=async()=>{throw Error('offline');};await assert.rejects(f.platform.initialize(),/offline/);f.sdk.init=init;await f.platform.initialize();assert.equal(f.listeners.size,1);
});
test('standalone uses existing browser saves; local SDK testing uses the Data Module',async()=>{
 const f=fixture('disabled');f.local.setItem(A.SHOP_KEY,JSON.stringify({...A.emptyWallet(),coins:123}));await f.platform.initialize();assert.equal(A.readWallet(f.platform.storage).coins,123);assert.equal(f.platform.usesDataModule,false);assert.equal(f.listeners.size,0);
 f.platform.setGameplay(true);assert.deepEqual(f.events,[]);
 const local=fixture('local');await local.platform.initialize();assert.equal(local.platform.usesDataModule,true);assert.equal(local.localReads,0);
});
test('wallet, skin, character and preferences survive a fresh game session through the SDK',async()=>{
 const f=fixture();await f.platform.initialize();
 const wallet=A.equipSkin(A.purchaseSkin({...A.emptyWallet(),coins:3000},'lamine'),'lamine');
 const wardrobe=A.saveToWardrobe({version:1,characters:[],equippedId:null},{...A.DEFAULT_AVATAR,name:'Cloud Player'},'player-1');
 const prefs={difficulty:'normal',duration:90,sound:false,team:'BRA',cupCharacter:4};
 A.writeWallet(f.platform.storage,wallet);A.writeWardrobe(f.platform.storage,wardrobe);A.writePreferences(f.platform.storage,prefs);
 const next=new A.GamePlatform(()=>f.sdk,()=>{throw Error('local save must not be used');});await next.initialize();
 assert.deepEqual(A.readWallet(next.storage),wallet);assert.deepEqual(A.readWardrobe(next.storage),wardrobe);assert.deepEqual(A.readPreferences(next.storage),prefs);
 assert.equal(f.localReads,0);
});
test('read and write failures do not become an empty wallet or a successful save',async()=>{
 const f=fixture();await f.platform.initialize();f.sdk.data.getItem=()=>{throw Error('service error');};
 for(const read of [A.readWallet,A.readWardrobe,A.readPreferences,A.readSavedCup])assert.throws(()=>read(f.platform.storage),/service error/);
 f.sdk.data.setItem=()=>{throw Error('dataLimitExcedeed');};assert.throws(()=>A.writeWallet(f.platform.storage,A.emptyWallet()),/dataLimitExcedeed/);assert.equal(f.localReads,0);
});
function audioContext(){
 const gains=[],oscillators=[];const param=()=>({value:0,setValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;}});
 const context={currentTime:4,destination:{},resume:async()=>{},close:async()=>{},createGain(){const g={gain:param(),connect(){},disconnect(){}};gains.push(g);return g;},createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(){},stop(){},onended:null};oscillators.push(o);return o;}};
 return {context,gains,oscillators};
}
test('SDK mute silences active audio immediately and cannot be overridden by the sound toggle',async()=>{
 const f=fixture();await f.platform.initialize();const a=audioContext();const audio=new A.GameAudio(f.platform,()=>a.context);
 audio.tone(true);assert.equal(a.oscillators.length,1);assert.equal(a.gains[0].gain.value,1);
 f.mute(true);assert.equal(a.gains[0].gain.value,0);audio.setEnabled(true);audio.tone();assert.equal(a.gains[0].gain.value,0);assert.equal(a.oscillators.length,1);
 f.mute(false);assert.equal(a.gains[0].gain.value,1);audio.tone();assert.equal(a.oscillators.length,2);
 audio.setEnabled(false);f.mute(true);f.mute(false);audio.tone();assert.equal(a.gains[0].gain.value,0);assert.equal(a.oscillators.length,2);audio.dispose();
});
test('initial SDK mute prevents audio from being created; settings listeners are removed on cleanup',async()=>{
 const f=fixture('crazygames',true);await f.platform.initialize();let created=0;
 const audio=new A.GameAudio(f.platform,()=>{created++;return audioContext().context;});audio.tone();assert.equal(created,0);audio.dispose();f.platform.dispose();assert.equal(f.listeners.size,0);
});
test('loading and gameplay events occur once per real transition, including goal breaks and explicit pause',async()=>{
 const f=fixture();await f.platform.initialize();f.platform.setLoading(true);f.platform.setLoading(true);f.platform.setLoading(false);
 for(const state of [['title',false,'idle'],['match',false,'countdown'],['match',false,'playing'],['match',false,'playing'],['match',true,'playing'],['match',false,'playing'],['match',false,'goal'],['match',false,'countdown'],['match',false,'playing'],['result',false,'finished']])f.platform.setGameplay(A.isGameplay(...state));
 assert.deepEqual(f.events,['loadingStart','loadingStop','gameplayStart','gameplayStop','gameplayStart','gameplayStop','gameplayStart','gameplayStop']);
});
test('every completed Cup round reloads exactly, including eligibility and the final result',async()=>{
 const f=fixture();await f.platform.initialize();let cup={...A.createCup('ARG'),runId:'cloud-cup',coinEligible:true,character:2},rounds=0;
 while(cup.stage!=='done'){
  A.writeSavedCup(f.platform.storage,cup);assert.deepEqual(A.readSavedCup(f.platform.storage),cup);
  cup=A.completeRound(cup,A.roundToken(cup),A.playerFixture(cup)?[9,0]:undefined);assert.ok(++rounds<12);
 }
 A.writeSavedCup(f.platform.storage,cup);const restored=A.readSavedCup(f.platform.storage);assert.equal(restored.winner,'ARG');
 const first=A.claimCupReward(A.emptyWallet(),restored,()=>.99);A.writeWallet(f.platform.storage,first.wallet);
 const again=A.claimCupReward(A.readWallet(f.platform.storage),restored,()=>0);assert.deepEqual(again.wallet,first.wallet);assert.equal(again.wallet.coins,135);
});
test('malformed progress and preferences are rejected without deleting stored data',()=>{
 const storage=memory();storage.setItem(A.CUP_KEY,'{"version":1,"cup":{"groups":[]}}');assert.equal(A.readSavedCup(storage),null);assert.ok(storage.getItem(A.CUP_KEY));
 storage.setItem(A.SETTINGS_KEY,JSON.stringify({version:1,difficulty:'impossible',duration:9,sound:'false',team:'BAD',cupCharacter:99}));assert.deepEqual(A.readPreferences(storage),{difficulty:'hard',duration:45,sound:true,team:'ARG',cupCharacter:0});
});
