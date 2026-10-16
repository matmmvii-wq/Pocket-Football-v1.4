import type {SaveStorage} from './platform';
import {DEFAULT_DIFFICULTY,Difficulty} from './difficulty';
import type {Cup} from './cup';
import {TEAM_BY_ID} from './teams';
export const SETTINGS_KEY='pocket-football.settings.v1';
export const CUP_KEY='pocket-football.cup.v1';
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
export function readSavedCup(storage:Pick<SaveStorage,'getItem'>):Cup|null{
 const raw=storage.getItem(CUP_KEY);
 try{
  const data=JSON.parse(raw||'null'),c=data?.cup;
  if(data?.version!==1||!c||typeof c.runId!=='string'||!c.runId||typeof c.coinEligible!=='boolean')return null;
  if(!['group','playoff','r16','qf','sf','final','done'].includes(c.stage)||!Number.isInteger(c.day)||c.day<0||c.day>2)return null;
  if(!Array.isArray(c.groups)||c.groups.length!==12||c.groups.some((g:unknown)=>!Array.isArray(g)||g.length!==4))return null;
  const teams:string[]=c.groups.flat();if(new Set(teams).size!==48||teams.some(id=>!TEAM_BY_ID[id])||!teams.includes(c.player))return null;
  const teamList=(list:unknown):list is string[]=>Array.isArray(list)&&new Set(list).size===list.length&&list.every(id=>teams.includes(id));
  if(!teamList(c.lots)||c.lots.length!==48||!teamList(c.byes)||!teamList(c.qualified))return null;
  if(!Number.isInteger(c.character)||c.character<0||c.character>5||(c.winner!==undefined&&!teams.includes(c.winner)))return null;
  if(!Array.isArray(c.fixtures)||c.fixtures.length<72||c.fixtures.length>128)return null;
  const ids=new Set<string>();
  for(const f of c.fixtures){
   if(!f||typeof f.id!=='string'||ids.has(f.id)||!teams.includes(f.home)||!teams.includes(f.away)||f.home===f.away)return null;
   ids.add(f.id);
   if(!['group','playoff','r16','qf','sf','final'].includes(f.stage)||!Number.isInteger(f.day)||f.day<0||f.day>2)return null;
   if(f.stage==='group'&&(!Number.isInteger(f.group)||f.group<0||f.group>=12||!c.groups[f.group].includes(f.home)||!c.groups[f.group].includes(f.away)))return null;
   if(f.score!==undefined&&(!Array.isArray(f.score)||f.score.length!==2||f.score.some((n:unknown)=>!Number.isSafeInteger(n)||(n as number)<0)))return null;
   if(f.decider!==undefined&&f.decider!==f.home&&f.decider!==f.away)return null;
  }
  return c as Cup;
 }catch{return null;}
}
export function writeSavedCup(storage:Pick<SaveStorage,'setItem'>,cup:Cup){storage.setItem(CUP_KEY,JSON.stringify({version:1,cup}));}
