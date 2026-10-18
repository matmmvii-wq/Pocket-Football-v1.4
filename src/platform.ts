// CrazyGames SDK v3. Initialize before mounting React or reading any saves.
export type SaveStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type PortalSettings={muteAudio?:boolean;disableChat?:boolean};
export interface CrazyGamesSDK {
 init():Promise<void>;
 readonly environment:'crazygames'|'local'|'disabled';
 data:SaveStorage;
 game:{settings:PortalSettings;addSettingsChangeListener:(listener:(settings:PortalSettings)=>void)=>void;removeSettingsChangeListener:(listener:(settings:PortalSettings)=>void)=>void;loadingStart:()=>void;loadingStop:()=>void;gameplayStart:()=>void;gameplayStop:()=>void};
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
 constructor(private sdkProvider:()=>CrazyGamesSDK|undefined,private localStorageProvider:()=>SaveStorage){}
 get usesDataModule(){return this.sdk!==null;}
 get audioMuted(){return this.muted;}
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
 private event(name:'loadingStart'|'loadingStop'|'gameplayStart'|'gameplayStop'){
  if(!this.sdk)return;
  try{this.sdk.game[name]();}catch(error){console.warn(`CrazyGames ${name} failed`,error);}
 }
 setLoading(value:boolean){if(value===this.loading)return;this.loading=value;this.event(value?'loadingStart':'loadingStop');}
 setGameplay(value:boolean){if(value===this.playing)return;this.playing=value;this.event(value?'gameplayStart':'gameplayStop');}
 dispose(){this.setGameplay(false);this.setLoading(false);this.sdk?.game.removeSettingsChangeListener(this.settingsChanged);this.listeners.clear();}
}
export function isGameplay(screen:string,paused:boolean,phase:string){return screen==='match'&&!paused&&phase==='playing';}
export const platform=new GamePlatform(()=>window.CrazyGames?.SDK,()=>window.localStorage);
