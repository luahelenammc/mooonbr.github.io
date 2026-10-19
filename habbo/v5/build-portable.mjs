import fs from 'node:fs';
import path from 'node:path';
import {buildCollections} from './build-collections.mjs';
import {buildUnified} from '../v8/build-unified.mjs';
// The published normalized V4 shell is the source when private atlas inputs are absent.
// It retains approved room markup; new collections are always generated from curated JSON.
export function buildPortable({root,dist,basePath='/habbo'}) {
 fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
 for(const name of ['assets','data','docs','pt-br','en','internal','index.html','PUBLICATION_MANIFEST.md'])if(fs.existsSync(path.join(root,name)))fs.cpSync(path.join(root,name),path.join(dist,name),{recursive:true});
 const css=fs.readFileSync(path.join(root,'styles/base.css'),'utf8');
 const extra=css.slice(css.indexOf('/* V5: a quiet chapter selector'));
 fs.writeFileSync(path.join(dist,'assets/v5-home.css'),extra);
 for(const route of ['index.html','pt-br/index.html','en/index.html']) {
  const p=path.join(dist,route);let html=fs.readFileSync(p,'utf8'),en=route.startsWith('en/');
  const nav=`<nav class="collection-switch" aria-label="${en?'Collections':'Coleções'}"><a href="${basePath}/${en?'en':'pt-br'}/" aria-current="page">${en?'Places':'Lugares'}</a><a href="${basePath}/${en?'en/rares':'pt-br/raros'}/">${en?'Rares':'Raros'}</a><a href="${basePath}/${en?'en/badges':'pt-br/emblemas'}/">${en?'Badges':'Emblemas'}</a></nav>`;
  html=html.replace(/<nav class="collection-switch"[\s\S]*?<\/nav>/g,'');
  html=html.replace('<nav class="lang-toggle"',nav+'<nav class="lang-toggle"');
  if(!html.includes('/assets/v5-home.css'))html=html.replace('</head>',`<link rel="stylesheet" href="${basePath}/assets/v5-home.css"></head>`);
  fs.writeFileSync(p,html);
 }
 const result=buildCollections({root,dist,basePath});
 const unified=buildUnified({root,dist});
 console.log(JSON.stringify({mode:'normalized-v8-museum',...result,unified,dist}));
}
