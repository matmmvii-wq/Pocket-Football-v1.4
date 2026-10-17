// Small observable Web Audio graph for lifetime/mute tests (no device needed).
export function audioContext(state='running'){
 const gains=[],oscillators=[],buffers=[],sources=[];
 const param=()=>({value:0,setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;}});
 const node=()=>({connections:[],disconnected:false,connect(n){this.connections.push(n);},disconnect(){this.disconnected=true;this.connections=[];}});
 const source=()=>({...node(),onended:null,startAt:null,stopAt:Infinity,start(t=context.currentTime){this.startAt=t;},stop(t=context.currentTime){this.stopAt=t;}});
 const context={currentTime:4,sampleRate:8000,state,destination:node(),onstatechange:null,
  resume:async()=>{},close:async()=>{context.state='closed';},
  createGain(){const g={...node(),gain:param()};gains.push(g);return g;},
  createOscillator(){const o={...source(),frequency:param()};oscillators.push(o);sources.push(o);return o;},
  createBufferSource(){const s={...source(),playbackRate:param(),loop:false};buffers.push(s);sources.push(s);return s;},
  createBiquadFilter(){return {...node(),frequency:param(),Q:param()};},
  createBuffer(channels,length,sampleRate){const data=Array.from({length:channels},()=>new Float32Array(length));return {length,sampleRate,numberOfChannels:channels,getChannelData:c=>data[c]};}
 };
 return {context,gains,oscillators,buffers,sources,
  advance(seconds){context.currentTime+=seconds;for(const s of sources)if(s.stopAt<=context.currentTime&&s.onended)s.onended();},
  active(){return sources.filter(s=>!s.disconnected&&s.startAt!==null&&s.stopAt>context.currentTime);},
  setState(value){context.state=value;context.onstatechange?.();}
 };
}
