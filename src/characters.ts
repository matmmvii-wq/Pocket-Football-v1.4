import {SHOP_SKINS,SkinId} from './shopCatalog';
// Original raster character assets. Int Cup does not use the custom-avatar renderer.
import {TEAMS} from './teams';
type Kit={id:string;color:string;shorts:string;skinId?:SkinId};
const shopSheets=new Map<string,CanvasImageSource>();
export function setShopAsset(id:SkinId,image:CanvasImageSource){shopSheets.set(id,image);cache.clear();}
export async function loadShopAssets(){await Promise.all(SHOP_SKINS.map(s=>new Promise<void>((resolve,reject)=>{const im=new Image();im.onload=()=>{setShopAsset(s.id,im);resolve();};im.onerror=reject;im.src=`./art/shop/${s.id}.png`;})));}
function shopKit(id:SkinId):Kit{return {id:`skin-${id}`,color:id==='haaland'?'#83c8de':'#85cfe9',shorts:id==='haaland'?'#eeeeee':'#202b39',skinId:id};}
export const makeShopParts=(id:SkinId)=>makeCharacterParts([shopKit(id)],false,[id==='haaland'?3:5])[0];
export const makeShopPreview=(id:SkinId)=>makeSelectionCharacter(shopKit(id),id==='haaland'?3:5);
export const CUP_CHARACTERS=[{name:'Alex',id:'alex'},{name:'Jordan',id:'jordan'},{name:'Sam',id:'sam'},{name:'Casey',id:'casey'},{name:'Riley',id:'riley'},{name:'Morgan',id:'morgan'}];
let sheets:CanvasImageSource[]=[];const cache=new Map<string,HTMLCanvasElement[]>();
export function setCupCharacterAssets(images:CanvasImageSource[]){if(images.length!==6)throw Error('Six Cup atlases required');sheets=images;cache.clear();}
export async function loadCupCharacterAssets(){const images=await Promise.all(CUP_CHARACTERS.map(({id})=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=`./art/cup-v25/${id}.png`;})));setCupCharacterAssets(images);}
const patterns=['plain','stripes','chest band','diagonal','split','chevron','pinstripes','shoulders'];
export function teamCharacter(team:Kit,index?:number){const n=Math.max(0,TEAMS.findIndex(t=>t.id===team.id));const trim:Record<string,string>={SPA:'#efc052',POR:'#e7be52',BRA:'#27804b',AUS:'#27804b',GER:'#282c32',BEL:'#edc64d',MEX:'#c9313c',ENG:'#a52c3b',JPN:'#eee9dd',FRA:'#eee9dd',ARG:'#eee9dd',CRO:'#eeeeea'};return {character:((index??n)%6+6)%6,topColor:team.color,bottomColor:team.shorts,sockColor:team.color,trimColor:trim[team.id]||['#eee9dd',team.shorts,'#202935'][Math.floor(n/8)%3],pattern:team.id==='ARG'?'stripes':patterns[n%8],n};}
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
export function makeCharacterParts(teams:Kit[],_simple=false,indices?:number[]):HTMLCanvasElement[][]{return teams.map((team,i)=>{
 const a=teamCharacter(team,indices?.[i]),raw=team.skinId?shopSheets.get(team.skinId):undefined,key=team.id+':'+a.character;if(team.skinId==='messi'){a.pattern='stripes';a.trimColor='#f3f0ea';}if(team.skinId==='haaland')a.pattern='plain';if(cache.has(key))return cache.get(key)!;if(sheets.length!==6)throw Error('Cup character art has not loaded');
 const main=rgb(a.topColor),shorts=rgb(a.bottomColor),socks=rgb(a.sockColor),trim=rgb(a.trimColor);
 const c=document.createElement('canvas');c.width=256;c.height=384;const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(raw||sheets[a.character],0,0,256,384);
 const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data;
 // Retain source material identity before national colors replace magenta.
 const shirtMask=new Uint8Array(c.width*c.height);
 for(let n=0;n<shirtMask.length;n++){const q=n*4;shirtMask[n]=Number(d[q]>d[q+1]*1.35&&d[q+2]>d[q+1]*1.35);}
 for(let p=0;!raw&&p<d.length;p+=4){if(d[p+3]<180){d[p+3]=0;continue;}if(Math.floor(p/4/c.width)<125)continue;const [r,g,b]=[d[p],d[p+1],d[p+2]],x=((p/4)%c.width-100)/70,y=(Math.floor(p/4/c.width)-130)/100;let target:number[]|null=null;
 if(r>g*1.35&&b>g*1.35){target=main;let detail=false;if(true){const pat=a.pattern;detail=pat==='stripes'&&(x>.2&&x<.32||x>.64&&x<.76)||pat==='chest band'&&y>.32&&y<.44||pat==='diagonal'&&Math.abs(x-y*.9-.08)<.06||pat==='split'&&x>.55||pat==='chevron'&&Math.abs(y-(.38-Math.abs(x-.5)*.35))<.045||pat==='pinstripes'&&Math.floor(x*18)%3===0||pat==='shoulders'&&y<.22&&(x<.24||x>.76);if(team.id==='CRO')detail=(Math.floor(x*6)+Math.floor(y*8))%2===0;const bit=Math.floor(x*9)-1;if(y>.67&&y<.69&&bit>=0&&bit<7&&(a.n&(1<<bit)))detail=true;}else detail=y>.23&&y<.25;if(detail)target=trim;
 }else if(g>r*1.2&&g>b*1.12)target=shorts;else if(b>r*1.4&&g>r*1.25)target=socks;
 if(target){const light=Math.max(r,g,b)/205;for(let ch=0;ch<3;ch++)d[p+ch]=Math.min(255,Math.round(target[ch]*Math.min(1,light)+(light>1?(255-target[ch])*(light-1)*.65:0)));}}
 ctx.putImageData(pixels,0,0);
 // Each layer is cut from this one drawing at its original scale and position.
 // Overlapping joint regions remain hidden in the neutral pose.
 const regions=[
 [[400,520],[490,510],[490,490],[590,490],[590,520],[620,520],[667,600],[668,905],[684,1085],[350,1085],[410,900],[420,670]],
 [[280,75],[805,75],[805,510],[280,510]],
 [[320,530],[467,530],[448,635],[426,735],[422,1008],[246,1008],[264,695]],
 [[610,534],[702,550],[730,725],[769,1008],[660,1008],[642,716],[634,620]],
 [[370,1045],[533,1045],[514,1130],[508,1310],[527,1500],[290,1500],[300,1320]],
 [[537,1045],[685,1045],[795,1500],[531,1500],[519,1320],[524,1130]]
 ];
 const parts=regions.map((poly,part)=>{const layer=document.createElement('canvas');layer.width=256;layer.height=384;const g=layer.getContext('2d')!;g.save();g.beginPath();poly.forEach(([x,y],j)=>j?g.lineTo(x/4,y/4):g.moveTo(x/4,y/4));g.closePath();g.clip();g.drawImage(c,0,0);g.restore();
 // The inner arm cut overlaps the adjacent shirt by a few pixels. Exclude
 // that shirt material below the sleeve, without deleting dark skin or kit-
 // colored skin highlights. Keep shoulder overlap and the actual sleeve.
 if(!raw&&(part===2||part===3)){const arm=g.getImageData(0,0,256,384);for(let n=185*256;n<shirtMask.length;n++)if(shirtMask[n])arm.data[n*4+3]=0;g.putImageData(arm,0,0);}
 return layer;});
 // Gameplay uses equal-size limbs, mirrored around their shoulder pivots.
 // The complete portrait above retains the original foreshortened far arm.
 const far=parts[3].getContext('2d')!;far.clearRect(0,0,256,384);far.save();far.translate(650/4,590/4);far.scale(-1,1);far.drawImage(parts[2],-432/4,-584/4);far.restore();
 fullCharacters.set(parts[0],c);cache.set(key,parts);return parts;
});}
const fullCharacters=new WeakMap<HTMLCanvasElement,HTMLCanvasElement>();
export function makeSelectionCharacter(team:Kit,index?:number){const c=document.createElement('canvas');c.width=512;c.height=656;const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;const parts=makeCharacterParts([team],true,index===undefined?undefined:[index])[0];ctx.fillStyle='#07131b66';ctx.fillRect(160,596,204,18);ctx.drawImage(fullCharacters.get(parts[0])!,22,74,468,528);return c;}
// All limb pivots are defined on the complete drawing, not independently sized
// body-part rectangles. Physics supplies joint angles; the artwork owns joints.
export function drawCupRig(ctx:CanvasRenderingContext2D,parts:HTMLCanvasElement[],angles:number[],facing:number){
 const pivots=[[535,790],[545,512],[432,584],[650,590],[451,1058],[593,1058]];
 // Approved Alex dimensions shared by all six; soles keep their ground anchor.
 ctx.save();ctx.scale(facing*.098,.078);ctx.translate(-535,-825);
 for(const i of [5,4,3,0,2,1]){const [x,y]=pivots[i];ctx.save();ctx.translate(x,y);ctx.rotate((angles[i]||0)*facing);ctx.translate(-x,-y);ctx.drawImage(parts[i],0,0,1024,1536);ctx.restore();}
 ctx.restore();
}
