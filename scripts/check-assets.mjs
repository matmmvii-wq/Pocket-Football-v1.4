import {readFile, access} from 'node:fs/promises';
const source=await readFile('src/teams.ts','utf8');
const flags=[...source.matchAll(/"flag":\s*"([^"\n]+)"/g)].map(match=>match[1]);
if(flags.length!==70||new Set(flags).size!==70){throw new Error(`Expected 70 unique team flag references; found ${flags.length} entries and ${new Set(flags).size} unique flags`);}
const missing=[];
for(const flag of flags){try{await access(`public/flags/${flag}.svg`);}catch{missing.push(`public/flags/${flag}.svg`);}}
if(missing.length)throw new Error(`Missing ${missing.length} team flag(s):\n${missing.join('\n')}`);
console.log(`Asset audit passed: ${flags.length} team flags present.`);
