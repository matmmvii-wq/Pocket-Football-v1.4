import {build} from 'esbuild';
import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/client',{recursive:true});
await cp('public','dist/client',{recursive:true});
await cp('index.html','dist/client/index.html');
await build({entryPoints:['src/main.tsx'],bundle:true,minify:true,format:'esm',target:'es2022',outfile:'dist/client/game.js',loader:{'.png':'file','.woff2':'file'},assetNames:'assets/[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'}});
await build({entryPoints:['server/index.mjs'],bundle:true,platform:'node',format:'esm',target:'node22',outfile:'dist/server.mjs',external:['bufferutil','utf-8-validate'],banner:{js:'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);'}});
console.log('Built dist/client (static game) and dist/server.mjs (standalone server).');
