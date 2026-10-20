// CrazyGames SDK v3. Initialize before mounting React or reading any saves.
import {displayUsername,invitationRequest,startupMultiplayer,roomCode,roomPresence,InviteParams,MultiplayerRequest,RoomPresence} from './multiplayer';
export type SaveStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type PortalSettings={muteAudio?:boolean;disableChat?:boolean};
export interface CrazyGamesSDK {
 init():Promise<void>;
 readonly environment:'crazygames'|'local'|'disabled';
 data:SaveStorage;
 game:{settings:PortalSettings;addSettingsChangeListener:(listener:(settings:PortalSettings)=>void)=>void;removeSettingsChangeListener:(listener:(settings:PortalSettings)=>void)=>void;loadingStart:()=>void;loadingStop:()=>void;gameplayStart:()=>void;gameplayStop:()=>void;
  isInstantMultiplayer?:boolean;inviteParams?:InviteParams|null;
  updateRoom?:(room:RoomPresence)=>void;leftRoom?:()=>void;
  addJoinRoomListener?:(listener:(params:InviteParams)=>void)=>void;removeJoinRoomListener?:(listener:(params:InviteParams)=>void)=>void;
  inviteLink?:(params:InviteParams)=>string;
 };
 user?:{isUserAccountAvailable:boolean;getUser:()=>Promise<{username:string}|null>;addAuthListener?:(listener:(user:{username:string}|null)=>void)=>void;removeAuthListener?:(listener:(user:{username:string}|null)=>void)=>void};
}
declare global {interface Window {CrazyGames?:{SDK:CrazyGamesSDK}}}
export const SAVE_KEYS=['pocket-football.shop.v1','pocket-football.characters.v1','pocket-football.avatar.v1','pocket-football.settings.v1'] as const;

export class GamePlatform {
 private sdk:CrazyGamesSDK|null=null;
 private initialized=false;
 private initialization:Promise<void>|null=null;
 private muted=false;
 private loading=false;
 private playing=false;
 private listeners=new Set<(muted:boolean)=>void>();
 private pendingMultiplayer:MultiplayerRequest|null=null;
 private multiplayerListeners=new Set<(request:MultiplayerRequest)=>void>();
 private usernameListeners=new Set<(username:string|null)=>void>();
 private currentUsername:string|null=null;
 private currentRoom:RoomPresence|null=null;
 private userRevision=0;
 private disposed=false;
 constructor(private sdkProvider:()=>CrazyGamesSDK|undefined,private localStorageProvider:()=>SaveStorage){}
 get usesDataModule(){return this.sdk!==null;}
 get audioMuted(){return this.muted;}
 get isCrazyGames(){return this.sdk?.environment==='crazygames';}
 get username(){return this.currentUsername;}
 get canInviteLink(){return typeof this.sdk?.game.inviteLink==='function';}
 private invited=(params:InviteParams)=>{
  if(this.disposed)return;
  const request=invitationRequest(params);
  if(this.multiplayerListeners.size){for(const listener of this.multiplayerListeners)listener(request);}
  else this.pendingMultiplayer=request;
 };
 private userChanged=(user:{username:string}|null)=>{
  if(this.disposed)return;this.userRevision++;
  const name=displayUsername(user?.username);if(name===this.currentUsername)return;
  this.currentUsername=name;for(const listener of this.usernameListeners)listener(name);
 };
 private settingsChanged=(settings:PortalSettings)=>{
  this.muted=settings.muteAudio===true;
  for(const listener of this.listeners)listener(this.muted);
 };
 initialize():Promise<void>{
  if(this.initialized)return Promise.resolve();
  if(this.initialization)return this.initialization;
  this.initialization=this.initializeOnce().catch(error=>{this.initialization=null;throw error;});
  return this.initialization;
 }
 private async initializeOnce(){
  const sdk=this.sdkProvider();
  // Never start with empty local data when the portal SDK failed to load.
  if(!sdk)throw new Error('Game services could not load. Please retry.');
  try{await sdk.init();}catch(error){if(sdk.environment!=='disabled')throw error;}
  if(sdk.environment==='crazygames'||sdk.environment==='local'){
   // Check availability before any readers can turn a storage error into defaults.
   // The SDK has already loaded this player's data during init().
   for(const key of SAVE_KEYS)sdk.data.getItem(key);
   sdk.game.addSettingsChangeListener(this.settingsChanged);
   this.settingsChanged(sdk.game.settings);
   this.sdk=sdk;
   this.pendingMultiplayer=startupMultiplayer(sdk.game.inviteParams,sdk.game.isInstantMultiplayer===true);
   try{sdk.game.addJoinRoomListener?.(this.invited);}catch(error){console.warn('Friend invitations are unavailable',error);}
   if(sdk.user?.isUserAccountAvailable){
    try{
     sdk.user.addAuthListener?.(this.userChanged);
     const revision=this.userRevision;
     // Account lookup may finish after assets; never block guests on it.
     void Promise.resolve(sdk.user.getUser()).then(user=>{if(revision===this.userRevision)this.userChanged(user);}).catch(()=>{});
    }catch{/* Account services may be unavailable on embedded domains. */}
   }
  }else if(sdk.environment!=='disabled')throw new Error('Unknown game service environment.');
  this.initialized=true;
 }
 private backend(){
  if(!this.initialized)throw new Error('Progress is not ready yet.');
  // On CrazyGames, both guests and members use SDK.data exclusively. Never
  // fall back to a different save if the Data Module reports an error.
  return this.sdk?this.sdk.data:this.localStorageProvider();
 }
 readonly storage:SaveStorage={
  getItem:key=>this.backend().getItem(key),
  setItem:(key,value)=>this.backend().setItem(key,value),
  removeItem:key=>this.backend().removeItem(key)
 };
 onAudioChange(listener:(muted:boolean)=>void){this.listeners.add(listener);listener(this.muted);return()=>{this.listeners.delete(listener);};}
 onUsernameChange(listener:(username:string|null)=>void){this.usernameListeners.add(listener);listener(this.currentUsername);return()=>{this.usernameListeners.delete(listener);};}
 onMultiplayerRequest(listener:(request:MultiplayerRequest)=>void){
  this.multiplayerListeners.add(listener);
  if(this.pendingMultiplayer){const pending=this.pendingMultiplayer;this.pendingMultiplayer=null;listener(pending);}
  return()=>{this.multiplayerListeners.delete(listener);};
 }
 updateRoom(room:{code:string;players:unknown[];isJoinable?:boolean}|null){
  const next=roomPresence(room);if(JSON.stringify(next)===JSON.stringify(this.currentRoom))return;
  try{
   if(next)this.sdk?.game.updateRoom?.(next);else this.sdk?.game.leftRoom?.();
   this.currentRoom=next;
  }catch(error){console.warn('Room presence could not update',error);}
 }
 inviteLink(code:string):string|null{
  const value=roomCode(code);if(!value||!this.canInviteLink)return null;
  const link=this.sdk!.game.inviteLink!({roomCode:value});
  const url=new URL(link);if(!['https:','http:'].includes(url.protocol))throw Error('Invalid invitation link.');
  return link;
 }
 private event(name:'loadingStart'|'loadingStop'|'gameplayStart'|'gameplayStop'){
  if(!this.sdk)return;
  try{this.sdk.game[name]();}catch(error){console.warn(`CrazyGames ${name} failed`,error);}
 }
 setLoading(value:boolean){if(value===this.loading)return;this.loading=value;this.event(value?'loadingStart':'loadingStop');}
 setGameplay(value:boolean){if(value===this.playing)return;this.playing=value;this.event(value?'gameplayStart':'gameplayStop');}
 dispose(){
  this.updateRoom(null);this.disposed=true;this.setGameplay(false);this.setLoading(false);
  this.sdk?.game.removeSettingsChangeListener(this.settingsChanged);
  this.sdk?.game.removeJoinRoomListener?.(this.invited);this.sdk?.user?.removeAuthListener?.(this.userChanged);
  this.listeners.clear();this.multiplayerListeners.clear();this.usernameListeners.clear();this.pendingMultiplayer=null;
 }
}
export function isGameplay(screen:string,paused:boolean,phase:string){return screen==='match'&&!paused&&phase==='playing';}
export const platform=new GamePlatform(()=>window.CrazyGames?.SDK,()=>window.localStorage);
