import {useEffect,useRef,useState} from 'react';
export type TitleMode='Int Cup'|'Online Friendly'|'Ranked'|'Practice';
export function launchTitleMode(mode:TitleMode,actions:{cup:()=>void;friendly:()=>void;practice:()=>void}){
 if(mode==='Int Cup')actions.cup();
 else if(mode==='Online Friendly')actions.friendly();
 else if(mode==='Practice')actions.practice();
}
const modes:TitleMode[]=['Int Cup','Online Friendly','Ranked','Practice'];
export function TitleScreen({mode,onMode,onPlay,onSettings,onCreate,onShop}:{mode:TitleMode;onMode:(mode:TitleMode)=>void;onPlay:()=>void;onSettings:()=>void;onCreate?:()=>void;onShop?:()=>void}){
 const [videoFailed,setVideoFailed]=useState(false),[open,setOpen]=useState(false);
 const modeControl=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),options=useRef<(HTMLButtonElement|null)[]>([]);
 useEffect(()=>{if(!open)return;options.current[modes.indexOf(mode)]?.focus();const outside=(e:PointerEvent)=>{if(!modeControl.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 function close(){setOpen(false);trigger.current?.focus();}
 function choose(value:TitleMode){onMode(value);close();}
 return <section className="video-title" aria-label="Pocket Football main menu">
  <img className="title-motion" src="./video/title-poster.jpg" alt=""/>
  {!videoFailed&&<video className="title-motion" src="./video/title-loop.mp4" poster="./video/title-poster.jpg" autoPlay muted loop playsInline preload="auto" aria-hidden="true" onError={()=>setVideoFailed(true)}/>}
  <h1 className="sr-only">Pocket Football</h1>
  <div ref={modeControl} className="title-mode-control" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
   <button ref={trigger} className="title-mode-trigger" aria-label={`Game mode: ${mode}`} aria-haspopup="listbox" aria-expanded={open} aria-controls="title-mode-options" onClick={()=>setOpen(v=>!v)} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);}if(e.key==='Escape'){e.preventDefault();close();}}}>
    {mode!=='Int Cup'&&<span className="title-mode-label" data-long={mode==='Online Friendly'} aria-hidden="true"><span>Mode: {mode}</span></span>}
    <span className="title-inner-effect" aria-hidden="true"/>
   </button>
   {open&&<div className="title-mode-options" id="title-mode-options" role="listbox" aria-label="Game mode">{modes.map((m,i)=><button key={m} ref={node=>{options.current[i]=node;}} role="option" aria-selected={mode===m} onClick={()=>choose(m)} onKeyDown={e=>{let next=i;if(e.key==='ArrowDown')next=(i+1)%modes.length;else if(e.key==='ArrowUp')next=(i+modes.length-1)%modes.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=modes.length-1;else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}else return;e.preventDefault();options.current[next]?.focus();}}><span>{m==='Int Cup'?'Int. Cup':m}</span>{mode===m&&<span className="title-mode-tick" aria-hidden="true">✓</span>}{m==='Ranked'&&<small>SOON</small>}</button>)}</div>}
  </div>
  <button className="title-hotspot title-create" aria-label="Create character" onClick={onCreate}><span className="title-inner-effect" aria-hidden="true"/></button>
  <button className="title-hotspot title-shop" aria-label="Shop" onClick={onShop}><span className="title-inner-effect" aria-hidden="true"/></button>
  <button className="title-hotspot title-settings" aria-label="Settings" onClick={onSettings}><span className="title-inner-effect" aria-hidden="true"/></button>
  <button className="title-hotspot title-play" aria-label={mode==='Ranked'?'Ranked — unavailable':`Play ${mode}`} title={mode==='Ranked'?'Ranked is not available yet':`Play ${mode}`} disabled={mode==='Ranked'} onClick={onPlay}><span className="title-inner-effect" aria-hidden="true"/></button>
 </section>;
}
