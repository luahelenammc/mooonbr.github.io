import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const origin=path.join(root,'assets');
const manifest=JSON.parse(fs.readFileSync(path.join(origin,'v7-classics.json'),'utf8'));
if(manifest.coverage.newlyVerified<45||manifest.records.length<58)throw Error('Insufficient verified classic globals for release');
for(const record of manifest.records){
 const p=path.join(root,record.image.replace(/^\/habbo\//,''));
 if(!fs.existsSync(p))throw Error('Missing original image: '+record.code);
 const src=fs.readFileSync(p);
 if(src.subarray(0,3).toString('ascii')!=='GIF')throw Error('Not a GIF: '+record.code);
 const dst=path.join(dist,record.image.replace(/^\/habbo\//,''));
 fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(p,dst);
}
const assets=[
 ['v7/classic-badges.js','v7-classic-badges.js'],
 ['v7/classic-badges.css','v7-classic-badges.css'],
 ['assets/v7-classics.json','v7-classics.json']
];
for(const [from,to] of assets)fs.copyFileSync(path.join(root,from),path.join(dist,'assets',to));
for(const lang of ['pt-br/emblemas','en/badges']){
 const p=path.join(dist,lang,'index.html');
 let html=fs.readFileSync(p,'utf8');
 html=html.replace(/<script defer src="\/habbo\/assets\/v6-global-badges\.js"><\/script>/g,'');
 html=html.replace('</head>','<link rel="stylesheet" href="/habbo/assets/v7-classic-badges.css"><script defer src="/habbo/assets/v7-classic-badges.js"></script></head>');
 if(!html.includes('v7-classic-badges.js')||html.includes('src="/habbo/assets/v6-global-badges.js"'))
  throw Error('V7 renderer wiring invalid on '+lang);
 fs.writeFileSync(p,html);
}
console.log('V7 generator: '+manifest.records.length+' authentic global classics, '+manifest.coverage.newlyVerified+' newly recovered. Regional 62 preserved.');
