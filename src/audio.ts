import {GamePlatform} from './platform';

// All audible game effects share one master gain. A portal mute therefore
// silences an effect that is already playing, as well as all future effects.
export class GameAudio {
 private context:AudioContext|null=null;
 private master:GainNode|null=null;
 private enabled=true;
 private unsubscribe:()=>void;
 constructor(private portal:GamePlatform,private createContext=()=>new AudioContext()){
  this.unsubscribe=portal.onAudioChange(()=>this.updateGain());
 }
 setEnabled(value:boolean){this.enabled=value;this.updateGain();}
 private updateGain(){if(this.master)this.master.gain.value=this.enabled&&!this.portal.audioMuted?1:0;}
 tone(goal=false){
  if(!this.enabled||this.portal.audioMuted)return;
  try{
   if(!this.context){this.context=this.createContext();this.master=this.context.createGain();this.master.connect(this.context.destination);this.updateGain();}
   const a=this.context;
   void a.resume().catch(()=>{});
   const oscillator=a.createOscillator(),gain=a.createGain();
   oscillator.connect(gain);gain.connect(this.master!);
   oscillator.type=goal?'sine':'triangle';
   oscillator.frequency.setValueAtTime(goal?740:230,a.currentTime);
   oscillator.frequency.exponentialRampToValueAtTime(goal?1100:110,a.currentTime+.12);
   gain.gain.setValueAtTime(goal?.12:.05,a.currentTime);
   gain.gain.exponentialRampToValueAtTime(.001,a.currentTime+(goal?.7:.16));
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
   oscillator.start();oscillator.stop(a.currentTime+(goal?.7:.17));
  }catch{/* Browser audio may remain locked until a user gesture. */}
 }
 dispose(){this.unsubscribe();this.master?.disconnect();void this.context?.close().catch(()=>{});this.context=null;this.master=null;}
}
