import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'pf-friends-'));
await build({stdin:{contents:"export * from './src/platform';export * from './src/multiplayer';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:join(dir,'friends.mjs')});
const A=await import(pathToFileURL(join(dir,'friends.mjs')).href);await rm(dir,{recursive:true,force:true});
function fixture({inviteParams=null,instant=false,user=null,available=true,environment='crazygames',getUser}={}){
 const joins=new Set(),auth=new Set(),settings=new Set(),events=[];let lookups=0;
 const sdk={environment,init:async()=>{},data:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},game:{
  settings:{},addSettingsChangeListener:l=>settings.add(l),removeSettingsChangeListener:l=>settings.delete(l),loadingStart(){},loadingStop(){},gameplayStart(){},gameplayStop(){},
  inviteParams,isInstantMultiplayer:instant,addJoinRoomListener:l=>joins.add(l),removeJoinRoomListener:l=>joins.delete(l),
  updateRoom:room=>events.push(['room',room]),leftRoom:()=>events.push(['left']),
  inviteLink:params=>{events.push(['invite',params]);return `https://www.crazygames.com/game/pocket-football?roomCode=${params.roomCode}`;}
 },user:{isUserAccountAvailable:available,getUser:()=>{lookups++;return getUser?getUser():Promise.resolve(user);},addAuthListener:l=>auth.add(l),removeAuthListener:l=>auth.delete(l)}};
 const platform=new A.GamePlatform(()=>sdk,()=>sdk.data);
 return {platform,sdk,events,joins,auth,settings,get lookups(){return lookups;},invite:params=>{for(const l of joins)l(params);},signIn:user=>{for(const l of auth)l(user);}};
}
test('startup invitations take priority over Instant Multiplayer; invalid invitations never create rooms',()=>{
 assert.deepEqual(A.startupMultiplayer({roomCode:' abc234 '},true),{kind:'join',code:'ABC234'});
 assert.deepEqual(A.startupMultiplayer(null,true),{kind:'create'});
 assert.deepEqual(A.startupMultiplayer({},true),{kind:'create'});
 assert.equal(A.startupMultiplayer(null,false),null);
 for(const params of [{roomCode:'bad'},{roomCode:'TEST-COINS'},{roomCode:'https://elsewhere/ws'},{other:'ABC234'},'ABC234'])assert.deepEqual(A.startupMultiplayer(params,true),{kind:'invalid'});
 assert.deepEqual(A.invitationRequest({roomCode:'ABC234',server:'wss://untrusted.test/ws'}),{kind:'join',code:'ABC234'});
});
test('invitations wait for assets, then runtime invitations arrive without reloading or replaying old requests',async()=>{
 const f=fixture({instant:true});await f.platform.initialize();assert.equal(f.joins.size,1);
 f.invite({roomCode:'ABC234'});const seen=[];const off=f.platform.onMultiplayerRequest(r=>seen.push(r));
 assert.deepEqual(seen,[{kind:'join',code:'ABC234'}]);f.invite({roomCode:'XYZ789'});assert.deepEqual(seen[1],{kind:'join',code:'XYZ789'});
 off();const next=[];f.platform.onMultiplayerRequest(r=>next.push(r));assert.deepEqual(next,[]);
 f.invite({roomCode:'invalid'});assert.deepEqual(next,[{kind:'invalid'}]);f.platform.dispose();assert.equal(f.joins.size,0);
});
test('a leader gets one automatic create request, and ordinary startup stays at the menu',async()=>{
 const f=fixture({instant:true}),normal=fixture();await Promise.all([f.platform.initialize(),normal.platform.initialize()]);
 const requests=[];const off=f.platform.onMultiplayerRequest(r=>requests.push(r));off();f.platform.onMultiplayerRequest(r=>requests.push(r));
 assert.deepEqual(requests,[{kind:'create'}]);normal.platform.onMultiplayerRequest(r=>requests.push(r));assert.equal(requests.length,1);
});
test('room presence opens the solo lobby, closes full/active rooms, and clears on leave/disposal',async()=>{
 const f=fixture();await f.platform.initialize();const room={code:'ABC234',players:[{}],isJoinable:true};
 f.platform.updateRoom(room);f.platform.updateRoom({...room,players:[{ready:true}]});
 f.platform.updateRoom({...room,players:[{},{}]});f.platform.updateRoom({...room,players:[{},{}],isJoinable:false});
 f.platform.updateRoom(null);f.platform.updateRoom(null);
 assert.deepEqual(f.events,[['room',{roomId:'ABC234',isJoinable:true,inviteParams:{roomCode:'ABC234'}}],['room',{roomId:'ABC234',isJoinable:false,inviteParams:{roomCode:'ABC234'}}],['left']]);
 f.platform.updateRoom({...room,isJoinable:false});assert.equal(f.events.at(-1)[1].isJoinable,false);f.platform.dispose();assert.deepEqual(f.events.at(-1),['left']);
 assert.equal(f.auth.size,0);assert.equal(f.settings.size,0);
});
test('SDK invitation links carry only the validated room code',async()=>{
 const f=fixture();await f.platform.initialize();assert.equal(f.platform.canInviteLink,true);
 assert.equal(f.platform.inviteLink('abc234'),'https://www.crazygames.com/game/pocket-football?roomCode=ABC234');
 assert.deepEqual(f.events,[['invite',{roomCode:'ABC234'}]]);assert.equal(f.platform.inviteLink('bad'),null);
 f.sdk.game.inviteLink=()=> 'javascript:alert(1)';assert.throws(()=>f.platform.inviteLink('ABC234'),/Invalid invitation/);
});
test('CrazyGames account names update observers; unavailable or guest accounts keep Guest names',async()=>{
 const f=fixture({user:{username:'Friend_One'}});await f.platform.initialize();const names=[];f.platform.onUsernameChange(n=>names.push(n));
 assert.equal(f.platform.username,'Friend_One');f.signIn({username:'Friend.Two'});f.signIn(null);assert.deepEqual(names,['Friend_One','Friend.Two',null]);
 const noAccount=fixture({available:false});await noAccount.platform.initialize();assert.equal(noAccount.lookups,0);assert.equal(noAccount.auth.size,0);
 assert.equal(A.playerName({username:noAccount.platform.username},0),'Guest 1');assert.equal(A.playerName({},1),'Guest 2');
 const failed=fixture({getUser:()=>Promise.reject(Error('unavailable'))});await failed.platform.initialize();await Promise.resolve();assert.equal(failed.platform.username,null);
});
test('a late initial account lookup cannot overwrite a newer sign-in or resurrect a disposed game',async()=>{
 let finish;const f=fixture({getUser:()=>new Promise(resolve=>{finish=resolve;})});await f.platform.initialize();const names=[];f.platform.onUsernameChange(n=>names.push(n));
 f.signIn({username:'New_User'});finish({username:'Old_User'});await Promise.resolve();assert.equal(f.platform.username,'New_User');assert.deepEqual(names,[null,'New_User']);
 let late;const disposed=fixture({getUser:()=>new Promise(resolve=>{late=resolve;})});await disposed.platform.initialize();disposed.platform.dispose();late({username:'Too_Late'});await Promise.resolve();assert.equal(disposed.platform.username,null);
});
test('standalone and older SDKs retain manual room support without optional Friends services',async()=>{
 const disabled=fixture({environment:'disabled',instant:true,user:{username:'Ignored'}});await disabled.platform.initialize();const requests=[];disabled.platform.onMultiplayerRequest(r=>requests.push(r));
 assert.equal(disabled.platform.canInviteLink,false);assert.equal(disabled.platform.username,null);assert.deepEqual(requests,[]);assert.equal(disabled.lookups,0);assert.equal(disabled.joins.size,0);
 const legacy=fixture();delete legacy.sdk.user;for(const key of ['addJoinRoomListener','removeJoinRoomListener','updateRoom','leftRoom','inviteLink'])delete legacy.sdk.game[key];
 await legacy.platform.initialize();legacy.platform.updateRoom({code:'ABC234',players:[{}]});legacy.platform.dispose();assert.equal(legacy.platform.inviteLink('ABC234'),null);
});
test('online avatars cannot disclose private character labels, while approved cosmetic names remain intact',()=>{
 const input={name:'Private Wardrobe Name',hair:'long',topColor:'#ABCDEF'};const avatar=A.publicAvatar(input);
 assert.equal(avatar.name,'Custom Player');assert.equal(avatar.hair,'long');assert.equal(avatar.topColor,'#abcdef');assert.equal(input.name,'Private Wardrobe Name');
 assert.notEqual(A.publicAvatar({skinId:'lamine',name:'Injected label'}).name,'Injected label');
 for(const name of ['', 'bad name','<script>','a'.repeat(21),'\u202ebad'])assert.equal(A.displayUsername(name),null);
 assert.equal(A.displayUsername('Player_Name.123'),'Player_Name.123');
});
