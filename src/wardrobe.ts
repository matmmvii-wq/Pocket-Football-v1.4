import {Avatar,DEFAULT_AVATAR,normalizeAvatar,readAvatar} from './avatar';
export type SavedCharacter={id:string;avatar:Avatar};
export type Wardrobe={version:1;characters:SavedCharacter[];equippedId:string|null};
export const WARDROBE_KEY='pocket-football.characters.v1';
export const DEFAULT_PLAYER={...DEFAULT_AVATAR,name:'Default Player'};
export function readWardrobe(storage:Pick<Storage,'getItem'>):Wardrobe{try{const raw=storage.getItem(WARDROBE_KEY);if(raw){const v=JSON.parse(raw);if(v?.version===1&&Array.isArray(v.characters)){const seen=new Set<string>();const characters=v.characters.filter((c:any)=>c&&typeof c.id==='string'&&c.id&&!seen.has(c.id)&&seen.add(c.id)&&c.avatar?.version===1).map((c:any)=>({id:c.id,avatar:normalizeAvatar(c.avatar)}));return {version:1,characters,equippedId:characters.some((c:SavedCharacter)=>c.id===v.equippedId)?v.equippedId:null};}}}catch{}const old=readAvatar(storage);return {version:1,characters:old?[{id:'imported-player',avatar:old}]:[],equippedId:old?'imported-player':null};}
export function equippedAvatar(w:Wardrobe){return w.characters.find(c=>c.id===w.equippedId)?.avatar||DEFAULT_PLAYER;}
export function saveToWardrobe(w:Wardrobe,avatar:Avatar,id:string):Wardrobe{const character={id,avatar:normalizeAvatar(avatar)};return {...w,characters:w.characters.some(c=>c.id===id)?w.characters.map(c=>c.id===id?character:c):[...w.characters,character],equippedId:id};}
export function writeWardrobe(storage:Pick<Storage,'setItem'>,w:Wardrobe){storage.setItem(WARDROBE_KEY,JSON.stringify(w));return w;}
