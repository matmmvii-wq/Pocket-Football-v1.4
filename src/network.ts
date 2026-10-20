import type {Avatar} from './avatar';
import Matter from 'matter-js';
import {Match,Mode} from './game';
export type RoomState={code:string;stadium?:number;isJoinable?:boolean;players:{team:string;ready:boolean;username?:string|null;avatar?:Avatar|null}[];mode:Mode;duration:number};
type Snapshot={type:string;seq:number;score:number[];time:number;duration:number;phase:string;message:string;teams:string[];mode:Mode;sudden:boolean;bodies:number[][]};
export class RoomClient {
 socket:WebSocket;seat=0;room:RoomState|null=null;active=false;closed=false;
 frames:{at:number;state:Snapshot}[]=[];
 constructor(url:string,public onRoom:(r:RoomState)=>void,public onStart:()=>void,public onError:(s:string)=>void,public onClose:(s:string)=>void){
  this.socket=new WebSocket(url);
  this.socket.onmessage=e=>{if(this.closed)return;const d=JSON.parse(e.data);if(d.type==='seat')this.seat=d.seat;if(d.type==='room'){this.room=d;onRoom(d);}if(d.type==='start'){this.frames=[];this.active=true;onStart();}if(d.type==='snapshot'){this.frames.push({at:performance.now(),state:d});if(this.frames.length>8)this.frames.shift();}if(d.type==='error')onError(d.message);if(d.type==='closed'){this.active=false;this.room=null;this.frames=[];onClose(d.message);}};
  this.socket.onclose=()=>{this.active=false;if(!this.closed)onClose('Connection lost. Rejoin or create a room.');};
  this.socket.onerror=()=>{if(!this.closed)onError('Online matches are unavailable. Please try again shortly.');};
 }
 async connect(){if(this.closed)throw Error('Connection cancelled.');if(this.socket.readyState===WebSocket.OPEN)return;await new Promise<void>((resolve,reject)=>{
  const done=(error?:Error)=>{clearTimeout(timer);this.socket.removeEventListener('open',opened);this.socket.removeEventListener('error',failed);this.socket.removeEventListener('close',closed);error?reject(error):resolve();};
  const opened=()=>done(this.closed?Error('Connection cancelled.'):undefined),failed=()=>done(Error('Online matches are unavailable. Please try again shortly.')),closed=()=>done(Error('Connection cancelled.'));
  const timer=setTimeout(()=>{done(Error('Connection timed out. Please try again.'));this.close();},8000);
  this.socket.addEventListener('open',opened,{once:true});this.socket.addEventListener('error',failed,{once:true});this.socket.addEventListener('close',closed,{once:true});
 });}
 send(data:object){if(!this.closed&&this.socket.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(data));}
 render(m:Match){if(!this.frames.length)return;const now=performance.now()-75;let a=this.frames[0],b=a;for(const f of this.frames){if(f.at<=now)a=f;if(f.at>=now){b=f;break;}b=f;}const alpha=b.at===a.at?1:Math.max(0,Math.min(1,(now-a.at)/(b.at-a.at)));const s=a.state;
  m.score=[...s.score];m.time=s.time;m.duration=s.duration;m.phase=s.phase;m.message=s.message;m.teams=[...s.teams];m.mode=s.mode;m.suddenDeath=s.sudden;
  m.objects.forEach((body,i)=>{const x=a.state.bodies[i],y=b.state.bodies[i];const t=a.state.phase===b.state.phase?alpha:0;Matter.Body.setPosition(body,{x:x[0]+(y[0]-x[0])*t,y:x[1]+(y[1]-x[1])*t});Matter.Body.setAngle(body,x[2]+(y[2]-x[2])*t);});
 }
 close(){this.closed=true;this.active=false;this.socket.close();}
}
export function serverURL(){const configured=(window as unknown as {POCKET_CUP_SERVER?:string}).POCKET_CUP_SERVER;return configured||`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/ws`;}
