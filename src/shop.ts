import type {CupReward} from './rewards';
import {SHOP_SKINS,isSkinId,SkinId} from './shopCatalog';
import {DEFAULT_AVATAR,Avatar} from './avatar';
export {SHOP_SKINS};
export const SHOP_KEY='pocket-football.shop.v1';
export const TEST_COIN_CODE='coins124325)#((#K';
export type Wallet={version:1;coins:number;owned:SkinId[];equipped:SkinId|null;cupRewards?:Record<string,CupReward>};
export const emptyWallet=():Wallet=>({version:1,coins:0,owned:[],equipped:null});
export function readWallet(storage:Pick<Storage,'getItem'>):Wallet{try{const v=JSON.parse(storage.getItem(SHOP_KEY)||'null');if(!v||v.version!==1)return emptyWallet();const owned:SkinId[]=Array.isArray(v.owned)?[...new Set(v.owned.filter(isSkinId))] as SkinId[]:[];const cupRewards:Record<string,CupReward>={};if(v.cupRewards&&typeof v.cupRewards==='object')for(const [id,value] of Object.entries(v.cupRewards)){const r=value as CupReward;if(r&&Number.isSafeInteger(r.base)&&r.base>=5&&r.base<=35&&Number.isSafeInteger(r.bonus)&&r.bonus>=0&&r.bonus<=100&&r.total===r.base+r.bonus&&typeof r.won==='boolean'&&typeof r.label==='string')cupRewards[id]=r;}return {...(Object.keys(cupRewards).length?{cupRewards}:{}),version:1,coins:Number.isSafeInteger(v.coins)&&v.coins>=0?v.coins:0,owned,equipped:owned.includes(v.equipped)?v.equipped:null};}catch{return emptyWallet();}}
export function writeWallet(storage:Pick<Storage,'setItem'>,wallet:Wallet){storage.setItem(SHOP_KEY,JSON.stringify(wallet));}
export function purchaseSkin(w:Wallet,id:SkinId):Wallet{const skin=SHOP_SKINS.find(s=>s.id===id);if(!skin)throw Error('Unknown skin.');if(w.owned.includes(id))return w;if(w.coins<skin.price)throw Error('Not enough coins.');return {...w,coins:w.coins-skin.price,owned:[...w.owned,id]};}
export function equipSkin(w:Wallet,id:SkinId|null):Wallet{if(id!==null&&!w.owned.includes(id))throw Error('Purchase this skin first.');return {...w,equipped:id};}
export function redeemTestCoins(w:Wallet,code:string):Wallet{if(code!==TEST_COIN_CODE)return w;const remaining=SHOP_SKINS.reduce((n,s)=>n+(w.owned.includes(s.id)?0:s.price),0);return {...w,coins:Math.max(w.coins,remaining)};}
export function skinAvatar(id:SkinId):Avatar{return {...DEFAULT_AVATAR,name:SHOP_SKINS.find(s=>s.id===id)!.name,skinId:id};}
