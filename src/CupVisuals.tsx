import {useEffect,useRef} from 'react';
import {makeSelectionCharacter} from './characters';
import type {Avatar} from './avatar';
import {makeAvatarPreview} from './avatarArt';
import {TEAM_BY_ID} from './teams';
export function Stars({id}:{id:string}){const n=Math.max(0,Math.min(5,TEAM_BY_ID[id].stars));return <span className="cup-stars" role="img" aria-label={`${n} out of 5 stars`}><span className="star-empty" aria-hidden="true">★★★★★</span><span className="star-fill" aria-hidden="true" style={{width:`${n/5*100}%`}}>★★★★★</span></span>;}
export function Team({id}:{id:string}){const t=TEAM_BY_ID[id];return <span className="cup-team"><img src={`./flags/${t.flag}.svg`} alt=""/><span>{t.name}</span></span>;}
export function CharacterPreview({id,mirrored=false,avatar,character}:{id:string;mirrored?:boolean;avatar?:Avatar|null;character?:number}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,512,656);ctx.imageSmoothingEnabled=false;ctx.drawImage(avatar?makeAvatarPreview(avatar):makeSelectionCharacter(TEAM_BY_ID[id],character),0,0,512,656);},[id,avatar,character]);
 return <canvas className="selection-character" style={mirrored?{transform:'scaleX(-1)'}:undefined} ref={canvas} width={512} height={656} role="img" aria-label={avatar?`${avatar.name} character`:`${TEAM_BY_ID[id].name} character in a simple national-team kit`}/>;
}
export function CupTrophy(){return <svg viewBox="0 0 24 32" aria-hidden="true" className="pixel-cup" shapeRendering="crispEdges"><path fill="#131d2b" d="M4 0h16v4h4v11h-4v4h-5v5h4v3h3v5H2v-5h3v-3h4v-5H4v-4H0V4h4z"/><path fill="#bd8129" d="M1 5h5v3H3v5h4v3H3v-2H1zm17 0h5v9h-2v2h-4v-3h4V8h-3z"/><path fill="#f4bd3e" d="M5 1h14v13h-2v3h-3v9h5v3H5v-3h5v-9H7v-3H5z"/><path fill="#ffe38a" d="M6 2h5v12H8V6H6zm0 25h12v2H6z"/><path fill="#ca8d27" d="M16 3h2v11h-2v3h-3v7h-2v-9h3v-3h2z"/></svg>;}
