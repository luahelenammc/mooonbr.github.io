import fs from 'node:fs';
const urls=[
 'https://habborator.org/furniture/sub/v7_smoke.html',
 'https://habborator.org/furniture/sub/v7_mono.html',
 'https://habborator.org/furniture/rare.html',
 'https://habborator.org/furniture/v11.html',
 'https://habborator.org/furniture/v7.html',
 'https://habboxwiki.com/Collectibles'
];
fs.mkdirSync('habbo/v13/probe',{recursive:true});
for(const url of urls){
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(22000),headers:{'User-Agent':'Mozilla/5.0 (historical catalog verification)'}});
  const html=await response.text();
  const slug=url.split('/').pop().replace(/\..*$/,'');
  fs.writeFileSync('habbo/v13/probe/'+slug+'.html',html);
  const hits=[...html.matchAll(/<(?:img|a|source)\b[^>]{0,700}>/gi)].map(x=>x[0]).filter(x=>/(gif|png|jpg|webp|holo|smoke|mono|collect|totem|data-|rare)/i.test(x));
  const scripts=[...html.matchAll(/<script\b[^>]{0,500}>/gi)].map(x=>x[0]);
  console.log('\nSOURCE',url,'HTTP',response.status,'chars',html.length,'IMAGE-LIKE',hits.length,'scripts',scripts.length);
  for(const match of hits.slice(0,65))console.log(match.slice(0,400));
  for(const scr of scripts.slice(0,12))console.log('SCRIPT',scr.slice(0,250));
 }catch(e){console.log('FAILED',url,e.message);}
}
