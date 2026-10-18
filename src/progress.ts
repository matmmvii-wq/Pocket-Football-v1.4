import type {SaveStorage} from './platform';
import {DEFAULT_DIFFICULTY,Difficulty} from './difficulty';
import {TEAM_BY_ID} from './teams';
export const SETTINGS_KEY='pocket-football.settings.v1';
export type Preferences={difficulty:Difficulty;duration:number;sound:boolean;team:string;cupCharacter:number};
const defaults:Preferences={difficulty:DEFAULT_DIFFICULTY,duration:45,sound:true,team:'ARG',cupCharacter:0};
export function readPreferences(storage:Pick<SaveStorage,'getItem'>):Preferences{
 const raw=storage.getItem(SETTINGS_KEY);
 try{
  const v=JSON.parse(raw||'null');if(v?.version!==1)return {...defaults};
  return {difficulty:['easy','normal','hard'].includes(v.difficulty)?v.difficulty:defaults.difficulty,duration:v.duration===90?90:45,sound:typeof v.sound==='boolean'?v.sound:true,team:TEAM_BY_ID[v.team]?v.team:'ARG',cupCharacter:Number.isInteger(v.cupCharacter)&&v.cupCharacter>=0&&v.cupCharacter<6?v.cupCharacter:0};
 }catch{return {...defaults};}
}
export function writePreferences(storage:Pick<SaveStorage,'setItem'>,value:Preferences){storage.setItem(SETTINGS_KEY,JSON.stringify({version:1,...value}));}
