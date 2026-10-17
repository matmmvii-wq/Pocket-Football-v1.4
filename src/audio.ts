import type {GamePlatform} from './platform';

export type SoundCue='click'|'launch'|'countdown'|'kickoff'|'goal'|'win'|'lose'|'draw'|'reward';
export type AudioScene='menu'|'match'|'paused'|'result';
type Voice={source:AudioScheduledSourceNode;nodes:AudioNode[];scene:boolean};

// Original, synthesized arcade sounds: no downloads, codecs, or audio assets.
// Every source (including the crowd) passes through the same SDK mute gate.
export class GameAudio {
 private context:AudioContext|null=null;
 private master:GainNode|null=null;
 private noise:AudioBuffer|null=null;
 private crowd:Voice|null=null;
 private voices=new Set<Voice>();
 private lastCue=new Map<SoundCue,number>();
 private enabled=true;
 private visible=true;
 private disposed=false;
 private scene:AudioScene='menu';
 private unsubscribe:()=>void;
 constructor(private portal:Pick<GamePlatform,'audioMuted'|'onAudioChange'>,private createContext=()=>new AudioContext()){
  this.unsubscribe=portal.onAudioChange(()=>this.updateGain());
 }
 private get audible(){return this.enabled&&this.visible&&!this.portal.audioMuted&&!this.disposed;}
 setEnabled(value:boolean){this.enabled=value;this.updateGain();}
 setVisible(value:boolean){if(this.visible===value)return;this.visible=value;this.updateGain();}
 setScene(value:AudioScene){
  if(this.scene===value)return;
  this.scene=value;this.stopVoices(true);this.syncCrowd();
 }
 private updateGain(){
  if(this.master)this.master.gain.value=this.audible?1:0;
  if(!this.audible){this.stopVoices();this.stopCrowd();}
  else this.syncCrowd();
 }
 // Called by real pointer/keyboard gestures, including when returning from a
 // background tab. A blocked context never accumulates delayed countdowns.
 unlock(){
  if(!this.audible)return;
  try{
   if(!this.context){
    const a=this.createContext();this.context=a;
    this.master=a.createGain();this.master.connect(a.destination);
    a.onstatechange=()=>this.syncCrowd();this.updateGain();
   }
   if(this.context.state!=='running')void this.context.resume().catch(()=>{});
   else this.syncCrowd();
  }catch{/* Audio is optional; an unsupported/locked device must not stop play. */}
 }
 private forget(voice:Voice){
  this.voices.delete(voice);voice.source.onended=null;
  for(const node of voice.nodes)node.disconnect();
 }
 private stop(voice:Voice){try{voice.source.stop();}catch{/* Already ended. */}this.forget(voice);}
 private stopVoices(sceneOnly=false){for(const voice of this.voices)if(!sceneOnly||voice.scene)this.stop(voice);}
 private track(source:AudioScheduledSourceNode,nodes:AudioNode[],scene:boolean){
  const voice={source,nodes,scene};this.voices.add(voice);
  source.onended=()=>this.forget(voice);return voice;
 }
 private note(frequency:number,duration:number,volume:number,delay=0,type:OscillatorType='sine',end=frequency,scene=true){
  const a=this.context!,start=a.currentTime+delay,osc=a.createOscillator(),gain=a.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,start);
  osc.frequency.exponentialRampToValueAtTime(end,start+duration);
  gain.gain.setValueAtTime(0,start);
  gain.gain.linearRampToValueAtTime(volume,start+Math.min(.012,duration*.15));
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain);gain.connect(this.master!);this.track(osc,[osc,gain],scene);
  osc.start(start);osc.stop(start+duration+.015);
 }
 private noiseBuffer(){
  if(this.noise)return this.noise;
  const a=this.context!,length=Math.round(a.sampleRate*6),buffer=a.createBuffer(2,length,a.sampleRate);
  // Slowly varying noise resembles a distant stadium. Match the loop ends
  // over 80 ms to remove the seam; reuse this one buffer for every effect.
  for(let channel=0;channel<2;channel++){
   const data=buffer.getChannelData(channel);let smooth=0;
   for(let i=0;i<length;i++){
    const white=Math.random()*2-1;smooth=.96*smooth+.04*white;
    const t=i/a.sampleRate;
    data[i]=(smooth*2.5+white*.12)*(.76+.14*Math.sin(t*Math.PI/3)+.1*Math.sin(t*Math.PI+channel));
   }
   const fade=Math.round(a.sampleRate*.08),first=data[0];
   for(let i=0;i<fade;i++){const blend=i/(fade-1);data[length-fade+i]=data[length-fade+i]*(1-blend)+first*blend;}
  }
  this.noise=buffer;return buffer;
 }
 private noiseVoice(volume:number,duration:number,delay=0,cheer=false){
  const a=this.context!,start=a.currentTime+delay,source=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();
  source.buffer=this.noiseBuffer();source.playbackRate.value=cheer?1.15:1.8;
  filter.type='bandpass';filter.frequency.value=cheer?950:1600;filter.Q.value=.6;
  gain.gain.setValueAtTime(0,start);
  gain.gain.linearRampToValueAtTime(volume,start+(cheer?.16:.008));
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  source.connect(filter);filter.connect(gain);gain.connect(this.master!);
  this.track(source,[source,filter,gain],true);source.start(start);source.stop(start+duration+.02);
 }
 private stopCrowd(){if(this.crowd){this.stop(this.crowd);this.crowd=null;}}
 private syncCrowd(){
  const a=this.context;
  if(!this.audible||this.scene!=='match'||a?.state!=='running'){this.stopCrowd();return;}
  if(this.crowd)return;
  const source=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();
  source.buffer=this.noiseBuffer();source.loop=true;
  filter.type='lowpass';filter.frequency.value=1500;
  gain.gain.setValueAtTime(0,a.currentTime);gain.gain.linearRampToValueAtTime(.03,a.currentTime+.45);
  source.connect(filter);filter.connect(gain);gain.connect(this.master!);
  // The loop has its own lifetime; one-shots cannot accidentally duplicate it.
  this.crowd={source,nodes:[source,filter,gain],scene:true};source.start();
 }
 private whistle(delay=0,long=false){
  const duration=long?.32:.16;
  this.note(2050,duration,.028,delay,'sine',2220);
  this.note(2470,duration,.012,delay,'sine',2350);
 }
 play(cue:SoundCue){
  if(!this.audible)return;
  this.unlock();const a=this.context;
  if(!a||a.state!=='running')return;
  const now=a.currentTime,gap=cue==='click'?.045:cue==='launch'?.09:.25;
  if(now-(this.lastCue.get(cue)??-Infinity)<gap||this.voices.size>48)return;
  this.lastCue.set(cue,now);
  try{
   switch(cue){
    case 'click':this.note(680,.055,.038,0,'sine',470,false);break;
    case 'launch':this.note(180,.15,.065,0,'triangle',75);this.noiseVoice(.09,.12);break;
    case 'countdown':this.note(620,.12,.065,0,'sine',580);break;
    case 'kickoff':this.whistle(0,true);break;
    case 'goal':
     this.noiseVoice(.55,2.1,0,true);
     [523.25,659.25,783.99,1046.5].forEach((f,i)=>this.note(f,.35,.075,i*.1,'triangle'));
     break;
    case 'win':case 'lose':case 'draw':{
     this.whistle();this.whistle(.23);this.whistle(.46,true);
     const notes=cue==='win'?[523.25,659.25,783.99,1046.5]:cue==='lose'?[440,349.23,293.66]:[440,523.25,440];
     notes.forEach((f,i)=>this.note(f,i===notes.length-1?.65:.23,.065,.92+i*.17,'triangle'));
     break;
    }
    case 'reward':[880,1174.66,1567.98].forEach((f,i)=>this.note(f,.24,.055,i*.09,'sine',f,false));break;
   }
  }catch{/* Keep a device-specific audio error out of the game loop. */}
 }
 // Compatibility with the preceding SDK update.
 tone(goal=false){this.play(goal?'goal':'launch');}
 dispose(){
  if(this.disposed)return;this.disposed=true;this.unsubscribe();
  this.stopVoices();this.stopCrowd();this.master?.disconnect();
  if(this.context){this.context.onstatechange=null;void this.context.close().catch(()=>{});}
  this.context=null;this.master=null;this.noise=null;this.lastCue.clear();
 }
}
