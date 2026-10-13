import {TEAMS,TEAM_BY_ID} from './teams';
export type Score=[number,number];
export type Stage='group'|'playoff'|'r16'|'qf'|'sf'|'final'|'done';
export type Fixture={id:string;home:string;away:string;stage:Stage;day:number;group?:number;score?:Score;decider?:string};
export type Cup={runId?:string;coinEligible?:boolean;player:string;character?:number;groups:string[][];fixtures:Fixture[];stage:Stage;day:number;byes:string[];qualified:string[];lots:string[];winner?:string};
export type Row={id:string;p:number;w:number;d:number;l:number;gf:number;ga:number;gd:number;pts:number};
export const STAGE_NAMES:Record<Stage,string>={group:'GROUP STAGE',playoff:'KNOCKOUT PLAYOFF',r16:'ROUND OF 16',qf:'QUARTER-FINAL',sf:'SEMI-FINAL',final:'FINAL',done:'CUP COMPLETE'};
export function shuffle<T>(values:T[],rng= Math.random):T[]{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createCup(player:string,rng=Math.random):Cup{
 if(!TEAM_BY_ID[player])throw Error('Unknown team');
 const selected=shuffle([player,...shuffle(TEAMS.filter(t=>t.id!==player).map(t=>t.id),rng).slice(0,47)],rng);
 const groups=Array.from({length:12},(_,i)=>selected.slice(i*4,i*4+4));
 const schedule=[[[0,1],[2,3]],[[0,2],[3,1]],[[3,0],[1,2]]];
 const fixtures:Fixture[]=[];groups.forEach((g,gi)=>schedule.forEach((pairs,day)=>pairs.forEach(([a,b],i)=>fixtures.push({id:`g${gi}-${day}-${i}`,home:g[a],away:g[b],stage:'group',group:gi,day}))));
 return {player,groups,fixtures,stage:'group',day:0,byes:[],qualified:[],lots:shuffle(selected,rng)};
}
function compare(a:Row,b:Row,cup:Cup){return b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||cup.lots.indexOf(a.id)-cup.lots.indexOf(b.id);}
export function table(cup:Cup,group:number):Row[]{
 const rows=cup.groups[group].map(id=>({id,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}));
 for(const f of cup.fixtures){if(f.group!==group||!f.score)continue;const a=rows.find(r=>r.id===f.home)!,b=rows.find(r=>r.id===f.away)!;const [x,y]=f.score;
  a.p++;b.p++;a.gf+=x;a.ga+=y;b.gf+=y;b.ga+=x;
  if(x>y){a.w++;b.l++;a.pts+=3;}else if(x<y){b.w++;a.l++;b.pts+=3;}else{a.d++;b.d++;a.pts++;b.pts++;}
 }rows.forEach(r=>r.gd=r.gf-r.ga);return rows.sort((a,b)=>compare(a,b,cup));
}
export function currentFixtures(cup:Cup){return cup.fixtures.filter(f=>f.stage===cup.stage&&(cup.stage!=='group'||f.day===cup.day));}
export function playerFixture(cup:Cup){return currentFixtures(cup).find(f=>!f.score&&(f.home===cup.player||f.away===cup.player));}
export function stageLabel(cup:Cup){return cup.stage==='group'?`GROUP MATCHDAY ${cup.day+1}`:STAGE_NAMES[cup.stage];}
// Poisson goals: stars shift expected scoring; draws and underdog wins remain possible.
function poisson(mean:number,rng:()=>number){let p=1,k=0;do{k++;p*=rng();}while(p>Math.exp(-mean)&&k<20);return k-1;}
export function simulate(home:string,away:string,knockout=false,rng=Math.random):{score:Score;decider?:string}{
 const diff=TEAM_BY_ID[home].stars-TEAM_BY_ID[away].stars;
 const score:Score=[poisson(1.35*Math.exp(diff*.22),rng),poisson(1.35*Math.exp(-diff*.22),rng)];
 return {score,...(knockout&&score[0]===score[1]?{decider:rng()<1/(1+Math.exp(-diff*.3))?home:away}:{})};
}
export function fixtureWinner(f:Fixture){return f.decider||(f.score&&f.score[0]!==f.score[1]?(f.score[0]>f.score[1]?f.home:f.away):undefined);}
function addRound(cup:Cup,stage:Stage,ids:string[]){cup.stage=stage;for(let i=0;i<ids.length;i+=2)cup.fixtures.push({id:`${stage}-${i/2}`,home:ids[i],away:ids[i+1],stage,day:0});}
export function roundToken(cup:Cup){return `${cup.stage}-${cup.day}`;}
// expectedToken makes repeated result submissions a no-op. Player score is always left/player first.
export function completeRound(source:Cup,expectedToken:string,score?:Score,rng=Math.random):Cup{
 if(source.stage==='done'||roundToken(source)!==expectedToken)return source;
 const pf=playerFixture(source);if(pf&&!score)throw Error('Play your match first');
 if(score&&score.some(n=>!Number.isInteger(n)||n<0))throw Error('Invalid score');
 if(pf&&source.stage!=='group'&&score![0]===score![1])throw Error('Knockout draw needs golden goal');
 const cup: Cup={...source,fixtures:source.fixtures.map(f=>({...f})),byes:[...source.byes]};
 for(const f of currentFixtures(cup)){if(f.score)continue;if(f.id===pf?.id)f.score=f.home===cup.player?[...score!] as Score:[score![1],score![0]];else Object.assign(f,simulate(f.home,f.away,cup.stage!=='group',rng));}
 if(cup.stage==='group'){
  if(cup.day<2){cup.day++;return cup;}
  const tables=cup.groups.map((_,i)=>table(cup,i));cup.qualified=tables.flatMap(t=>t.slice(0,2).map(r=>r.id));
  const winners=tables.map(t=>t[0]).sort((a,b)=>compare(a,b,cup));cup.byes=winners.slice(0,8).map(r=>r.id);
  addRound(cup,'playoff',shuffle(cup.qualified.filter(id=>!cup.byes.includes(id)),rng));
 }else{
  const winners=currentFixtures(cup).map(f=>fixtureWinner(f)!);
  if(cup.stage==='final'){cup.winner=winners[0];cup.stage='done';}
  else if(cup.stage==='playoff'){addRound(cup,'r16',cup.byes.flatMap((id,i)=>[id,winners[i]]));cup.byes=[];}
  else addRound(cup,({r16:'qf',qf:'sf',sf:'final'} as Record<string,Stage>)[cup.stage],winners);
 }return cup;
}
