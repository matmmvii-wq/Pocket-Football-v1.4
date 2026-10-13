export const SHOP_SKINS=[
 {id:'lamine',name:'Blue & garnet jersey',kit:'Blue & garnet',price:1400,color:'#ae3152'},
 {id:'mbappe',name:'White & gold jersey',kit:'White & gold',price:1500,color:'#e7e6dd'},
 {id:'haaland',name:'Sky blue jersey',kit:'Sky blue',price:1400,color:'#83c8de'},
 {id:'mora',name:'Green jersey',kit:'Green & white',price:800,color:'#329468'},
 {id:'kvaratskhelia',name:'Navy & red jersey',kit:'Navy & red',price:1100,color:'#b4354c'},
 {id:'kane',name:'White & navy jersey',kit:'White & navy',price:1200,color:'#eee7da'},
 {id:'vozinha',name:'Royal blue jersey',kit:'Royal blue',price:600,color:'#467cdb'},
 {id:'messi',name:'Sky blue striped jersey',kit:'Sky blue & white',price:1800,color:'#85cfe9'},
 {id:'ronaldo',name:'Red & green jersey',kit:'Red & green',price:1800,color:'#d34742'},
 {id:'raphinha',name:'Yellow & green jersey',kit:'Yellow & green',price:1000,color:'#e6c94c'}
] as const;
export type SkinId=typeof SHOP_SKINS[number]['id'];
export const isSkinId=(id:unknown):id is SkinId=>SHOP_SKINS.some(s=>s.id===id);
