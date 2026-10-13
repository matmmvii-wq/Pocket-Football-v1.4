import {Cup,fixtureWinner,STAGE_NAMES} from './cup';
import type {Wallet} from './shop';
export const WINNER_BONUSES=[15,25,35,45,60,100] as const;
export type CupReward={base:number;bonus:number;total:number;won:boolean;label:string};
const EXIT_COINS={group:5,playoff:10,r16:15,qf:20,sf:25,final:30,done:35};
export function cupOutcome(c:Cup):Omit<CupReward,'bonus'|'total'>|null{
 if(c.winner===c.player)return {base:35,won:true,label:'CUP WINNER'};
 const loss=c.fixtures.find(f=>f.stage!=='group'&&f.score&&(f.home===c.player||f.away===c.player)&&fixtureWinner(f)&&fixtureWinner(f)!==c.player);
 if(loss)return {base:EXIT_COINS[loss.stage],won:false,label:STAGE_NAMES[loss.stage]+' EXIT'};
 const group=c.fixtures.filter(f=>f.stage==='group'&&(f.home===c.player||f.away===c.player));
 if(group.length===3&&group.every(f=>f.score)&&c.stage!=='group'&&!c.qualified.includes(c.player))return {base:5,won:false,label:'GROUP STAGE EXIT'};
 return null;
}
export function claimCupReward(w:Wallet,c:Cup,rng=Math.random):{wallet:Wallet;reward:CupReward}{
 if(!c.runId||!c.coinEligible)throw Error('Coins require a complete Int. Cup run on Hard.');
 const outcome=cupOutcome(c);if(!outcome)throw Error('Your cup run is still in progress.');
 const existing=w.cupRewards?.[c.runId];if(existing)return {wallet:w,reward:existing};
 const bonus=outcome.won?WINNER_BONUSES[Math.min(5,Math.floor(Math.max(0,rng())*6))]:0;
 const reward={...outcome,bonus,total:outcome.base+bonus};
 return {wallet:{...w,coins:w.coins+reward.total,cupRewards:{...w.cupRewards,[c.runId]:reward}},reward};
}
