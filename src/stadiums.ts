export const STADIUM_NAMES=['Dusk Arena','Sunset Arena','The Aztec Bowl','The Fortress','The Colossus','The Yellow Wall','The Concrete Giant','The Steel Cathedral'];
export const STADIUM_FILES=['stadium-dusk.png','stadium-sunset.png','stadium-aztec.jpg','stadium-fortress.jpg','stadium-colossus.jpg','stadium-yellow-wall.jpg','stadium-concrete.jpg','stadium-steel.jpg'];
export function chooseStadium(previous:number,rng=Math.random){const choices=STADIUM_NAMES.map((_,i)=>i).filter(i=>i!==previous);return choices[Math.min(choices.length-1,Math.floor(Math.max(0,rng())*choices.length))];}
export function makeStadiums(...images:CanvasImageSource[]):CanvasImageSource[]{return images.map((im,i)=>{if(i<2)return im;const source=im as HTMLImageElement;const c=document.createElement('canvas');c.width=1000;c.height=562;const g=c.getContext('2d')!;
 // Frame out the reference's top caption strip; keep the playable background clear.
 const top=Math.ceil(source.height*.09);g.drawImage(im,0,top,source.width,source.height-top,0,0,1000,562);return c;});}
export async function loadStadiums(){const images=await Promise.all(STADIUM_FILES.map(file=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=`./art/${file}`;})));return makeStadiums(...images);}
