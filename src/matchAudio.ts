import type {GameAudio} from './audio';

export type MatchAudioState={screen:string;paused:boolean;visible:boolean;phase:string;message:string;score:readonly number[];seat:number};
type AudioOutput=Pick<GameAudio,'play'|'setScene'|'setVisible'>;

// Observe the same displayed state for local physics and server snapshots.
// Remember transitions even while silent, so unmuting never replays old goals.
export class MatchAudio {
 private previous:MatchAudioState|null=null;
 constructor(private audio:AudioOutput){}
 update(state:MatchAudioState){
  const previous=this.previous;
  this.previous={...state,score:[...state.score]};
  const inMatch=state.screen==='match',result=state.screen==='result'||inMatch&&state.phase==='finished';
  this.audio.setVisible(state.visible);
  this.audio.setScene(state.paused&&inMatch?'paused':result?'result':inMatch&&state.phase!=='idle'?'match':'menu');
  if(!state.visible||state.paused||(!inMatch&&!result))return;
  const continuous=previous?.screen==='match'||previous?.screen==='result';
  // Do not replay a cue after a paused/hidden online game continued in the
  // background. New transitions after returning still sound normally.
  if(continuous&&(!previous!.visible||previous!.paused))return;
  if(state.phase==='finished'){
   if(continuous&&previous!.phase!=='finished')this.audio.play(state.score[0]===state.score[1]?'draw':state.score[state.seat]>state.score[1-state.seat]?'win':'lose');
   return;
  }
  if(continuous&&state.score[0]+state.score[1]>previous!.score[0]+previous!.score[1]){
   this.audio.play('goal');return;
  }
  if(state.phase==='countdown'&&(!continuous||previous!.phase!=='countdown'||previous!.message!==state.message))this.audio.play('countdown');
  if(state.phase==='playing'&&continuous&&previous!.phase==='countdown')this.audio.play('kickoff');
 }
}
