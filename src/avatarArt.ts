import {makeShopParts,makeShopPreview} from './characters';
import {Avatar,normalizeAvatar} from './avatar';
function shade(hex:string,f:number){const n=parseInt(hex.slice(1),16);return '#'+[n>>16,n>>8&255,n&255].map(x=>Math.max(0,Math.min(255,Math.round(x*f))).toString(16).padStart(2,'0')).join('');}
function sprite(w:number,h:number,draw:(r:(x:number,y:number,w:number,h:number,color:string)=>void)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')!;draw((x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);});return c;}
export function makeAvatarParts(profile:Avatar):HTMLCanvasElement[]{if(normalizeAvatar(profile).skinId)return makeShopParts(normalizeAvatar(profile).skinId!);const a=normalizeAvatar(profile),outline='#15202a',skin=a.skin,light=shade(skin,1.16),shadow=shade(skin,.72),hair=a.hairColor,beard=a.facialHairColor;
 const torso=sprite(44,46,r=>{r(1,2,41,43,outline);r(2,3,32,36,a.topColor);r(34,3,7,36,shade(a.topColor,.65));r(3,3,30,3,shade(a.topColor,1.18));
 if(a.pattern==='stripes')for(const x of [8,23])r(x,8,5,29,a.trimColor);if(a.pattern==='chest band')r(3,17,31,7,a.trimColor);
 if(a.pattern==='diagonal')for(let y=6;y<36;y++)r(4+Math.floor((y-6)*.7),y,6,1,a.trimColor);
 if(a.pattern==='split')r(20,6,14,31,a.trimColor);
 if(a.pattern==='chevron')for(let x=3;x<34;x++)r(x,13+Math.floor(7-Math.abs(x-18)/2),1,4,a.trimColor);
 if(a.pattern==='pinstripes')for(const x of [7,14,21,28])r(x,8,1,28,a.trimColor);
 if(a.pattern==='shoulders'){r(3,5,9,7,a.trimColor);r(29,5,6,7,a.trimColor);}
 if(a.top==='jersey'){r(15,2,14,4,outline);r(18,3,8,4,skin);r(16,7,12,2,a.trimColor);}
 if(a.top==='t-shirt'){r(16,2,12,5,outline);r(18,3,8,4,skin);r(16,7,12,2,a.trimColor);r(4,33,29,2,shade(a.topColor,.85));}
 if(a.top==='hoodie'){r(11,2,22,9,shade(a.topColor,.7));r(16,3,12,5,skin);r(14,8,3,9,a.trimColor);r(29,8,2,9,a.trimColor);r(12,27,19,7,shade(a.topColor,.75));r(14,28,15,2,shade(a.topColor,1.1));}
 if(a.necklace!=='none'){const metal=a.necklace==='beads'?'#e8dfc9':a.accessoryColor;for(let x=13;x<31;x+=a.necklace==='beads'?3:1)r(x,10+Math.floor(7-Math.abs(x-22)*.7),a.necklace==='beads'?2:1,2,metal);if(a.necklace==='pendant')r(20,18,4,6,metal);}
 r(2,39,39,6,a.bottomColor);r(34,39,7,6,shade(a.bottomColor,.65));r(20,40,2,6,outline);
 });
 const head=sprite(30,32,r=>{r(3,7,25,24,outline);r(4,8,19,22,skin);r(23,9,4,21,shadow);r(5,10,4,15,light);r(27,18,2,6,skin);
 if(a.hair==='long'){r(1,5,28,10,hair);r(1,8,4,22,hair);r(24,8,5,23,shade(hair,.7));r(4,4,23,7,shade(hair,1.2));}
 if(a.hair==='crop'){r(3,5,24,7,hair);r(5,4,20,3,shade(hair,1.3));r(3,10,3,5,hair);}
 if(a.hair==='middle part'){
 // Two curtain sections, exposed center part and tapered lengths at both temples.
 r(4,3,10,6,hair);r(16,3,10,6,hair);r(3,6,10,5,hair);r(17,6,10,5,hair);
 r(2,10,8,4,hair);r(20,10,8,4,hair);r(3,14,4,4,hair);r(24,14,3,4,hair);
 r(13,5,4,3,shadow);r(12,8,6,3,skin);r(10,11,10,3,skin);
 r(5,4,7,2,shade(hair,1.35));r(18,4,6,2,shade(hair,1.35));
 r(4,7,3,5,shade(hair,1.2));r(22,7,3,5,shade(hair,1.2));
 }
 if(a.hair==='mod cut'||a.hair==='highlights'){r(2,5,27,8,hair);for(const [x,y] of [[3,3],[8,1],[13,0],[18,2],[23,4],[5,7],[11,6],[17,7],[23,8]]){r(x,y,5,5,hair);r(x,y,3,2,shade(hair,1.45));}}
 if(a.hair==='highlights')for(const [x,y] of [[5,4],[11,2],[18,5],[23,7]])r(x,y,3,4,'#c7a16b');
 if(a.hair==='dreads short'||a.hair==='dreads long'){r(3,4,24,7,hair);for(let x=1;x<29;x+=5){const n=(x%3)*2;r(x,3+n,4,a.hair==='dreads long'?(x<6||x>22?26:12):10+n,hair);r(x,5+n,2,5,shade(hair,1.4));}}
 if(a.hair==='warrior cut'){
 // Short tapered sides and irregular, forward-swept textured spikes.
 r(3,7,25,5,shade(hair,.7));r(4,11,3,4,shade(hair,.75));r(24,11,3,4,shade(hair,.75));
 r(5,5,20,6,hair);r(7,3,5,6,hair);r(10,1,4,6,hair);r(14,3,5,7,hair);r(18,2,4,7,hair);r(22,5,4,7,hair);
 r(6,10,4,3,hair);r(11,9,4,5,hair);r(16,10,4,2,hair);r(21,10,4,4,hair);
 r(9,4,2,4,shade(hair,1.5));r(14,6,2,5,shade(hair,1.4));r(19,4,2,4,shade(hair,1.4));r(23,7,2,3,shade(hair,1.3));
 }
 if(a.hair==='buzz cut'){r(4,6,23,5,shade(hair,.85));for(let x=5;x<27;x+=3)r(x,7+(x%2),1,1,shade(hair,1.3));}
 if(a.hair==='afro'){r(0,6,30,7,hair);r(2,3,27,12,hair);r(6,1,19,14,hair);r(10,0,11,3,hair);for(let x=1;x<29;x+=5){r(x,3,3,2,shade(hair,1.4));r(x+1,8,3,2,shade(hair,1.2));}r(1,13,4,5,hair);r(25,12,4,5,hair);}
 const eyeH=a.eyes==='wide'?7:a.eyes==='focused'?4:6,eyeY=a.eyes==='focused'?18:16;for(const x of [7,18]){r(x,eyeY,4,eyeH,'#fff9ec');r(x+1,eyeY+1,3,eyeH-1,a.eyeColor);r(x+3,eyeY+2,1,Math.max(1,eyeH-3),'#151c22');r(x,14,4,a.brows==='thick'?3:1,a.browColor);if(a.brows==='angled')r(x+2,15,3,1,a.browColor);if(a.brows==='arched'){r(x+1,13,2,1,a.browColor);}if(a.brows==='straight')r(x-1,14,6,2,a.browColor);}
 r(13,23,3,2,shadow);if(a.facialHair==='stubble'){r(8,27,15,3,beard);}if(a.facialHair==='beard'){r(5,23,4,7,beard);r(21,23,4,7,beard);r(8,25,3,5,beard);r(19,25,3,5,beard);r(8,28,15,3,beard);}if(a.facialHair==='mustache'||a.facialHair==='beard'||a.facialHair==='mustache and goatee'){r(10,25,11,2,beard);}
 if(a.facialHair==='goatee'||a.facialHair==='mustache and goatee')r(12,29,8,2,beard);if(a.facialHair==='chin strap'){r(5,24,2,6,beard);r(23,24,2,6,beard);r(7,30,16,1,beard);}
 if(a.mouth==='neutral')r(12,28,7,1,shade(skin,.45));else if(a.mouth==='grin'){r(11,27,9,3,'#fff3de');r(11,30,9,1,shadow);}else{r(11,27,2,1,shadow);r(13,28,6,1,shadow);r(19,27,2,1,shadow);}
 if(a.glasses!=='none'){for(const x of [5,16]){r(x,15,9,9,outline);r(x+1,16,7,6,a.glasses==='sunglasses'?'#293e50':'#b1dddf');if(a.glasses==='round'){r(x,15,2,2,skin);r(x+7,15,2,2,skin);r(x,22,2,2,skin);r(x+7,22,2,2,skin);}if(a.glasses==='sport'){r(x+1,16,7,3,'#5bbbc7');r(x+1,21,7,2,a.accessoryColor);}if(a.glasses==='clear')r(x+5,17,2,4,a.eyeColor);}r(14,18,2,2,outline);r(25,17,3,2,outline);}
 if(a.headwear==='headband'){r(2,10,26,3,a.accessoryColor);r(2,10,26,1,shade(a.accessoryColor,1.3));}if(a.headwear==='cap'){r(3,3,24,8,a.accessoryColor);r(7,1,17,4,a.accessoryColor);r(1,10,27,3,shade(a.accessoryColor,.7));r(22,11,8,2,a.accessoryColor);}
 if(a.headwear==='beanie'){r(3,2,25,10,a.accessoryColor);r(7,0,17,3,a.accessoryColor);r(2,10,27,4,shade(a.accessoryColor,.7));for(let x=5;x<27;x+=4)r(x,3,1,7,shade(a.accessoryColor,1.2));}
 if(a.earrings==='hoops'){r(26,23,4,6,a.accessoryColor);r(27,24,2,3,shadow);r(1,23,4,6,a.accessoryColor);r(2,24,2,3,shadow);}
 if(a.earrings==='studs'){r(27,23,2,2,a.accessoryColor);r(3,23,2,2,a.accessoryColor);}
 });
 const arms=[0,1].map(arm=>sprite(14,38,r=>{const length=a.sleeves==='long'?29:13;r(1,1,12,36,outline);r(2,2,10,34,skin);r(2,14,3,20,light);r(10,14,2,22,shadow);r(2,2,10,length,a.topColor);r(2,2,3,length-1,shade(a.topColor,1.18));r(10,3,2,length-1,shade(a.topColor,.65));r(2,length,10,2,a.trimColor);if(a.wristwear==='watch'&&arm===0){r(2,29,10,3,'#272a32');r(4,28,6,5,a.accessoryColor);r(5,29,4,3,'#d7e6de');}if(a.wristwear==='wristbands')r(2,29,10,4,a.accessoryColor);}));
 const legs=[0,1].map(()=>sprite(14,26,r=>{r(1,0,11,25,outline);r(2,0,9,5,a.bottomColor);r(2,5,9,5,skin);r(2,5,3,5,light);r(2,10,9,10,a.sockColor);r(9,10,2,10,shade(a.sockColor,.7));if(a.bottom==='trousers'){r(2,0,9,20,a.bottomColor);r(2,1,3,18,shade(a.bottomColor,1.2));r(9,1,2,19,shade(a.bottomColor,.7));}r(1,19,11,5,a.shoeColor);r(0,22,14,3,a.shoeColor);r(0,25,14,1,outline);r(10,21,3,3,shade(a.shoeColor,.6));r(3,21,6,1,a.trimColor);if(a.shoes==='trainers'){r(0,24,14,1,'#f9f4e4');r(3,20,2,4,'#eeeeeb');}else{r(2,25,2,1,'#b4ad8e');r(10,25,2,1,'#b4ad8e');}}));
 return [torso,head,...arms,...legs];
}
export function makeAvatarPreview(a:Avatar){if(normalizeAvatar(a).skinId)return makeShopPreview(normalizeAvatar(a).skinId!);const c=document.createElement('canvas');c.width=128;c.height=164;const ctx=c.getContext('2d')!,parts=makeAvatarParts(a);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#07131b66';ctx.fillRect(29,146,66,7);const poses=[[39,66,49,51],[43,27,40,42],[26,69,16,44],[87,69,16,44],[44,115,16,30],[67,115,16,30]];for(const i of [4,5,2,3,0,1]){const [x,y,w,h]=poses[i];ctx.drawImage(parts[i],x,y,w,h);}return c;}
