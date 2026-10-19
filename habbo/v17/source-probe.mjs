import fs from 'node:fs';
const targets=[
 ['old-memories','https://aquelasimagem.blogspot.com/p/hb-06-11.html'],
 ['staffs-archive','https://viajovem.blogspot.com/2021/02/staffs.html'],
 ['wiki-managers','https://habbo.fandom.com/pt-br/wiki/Gerentes'],
 ['wiki-flecha','https://habbo.fandom.com/pt-br/wiki/Flecha'],
 ['wiki-4queijos','https://habbo.fandom.com/pt-br/wiki/4Queijos'],
 ['wiki-disco','https://habbo.fandom.com/pt-br/wiki/Disco-Lee'],
 ['wiki-miss','https://habbo.fandom.com/pt-br/wiki/MissFurby'],
 ['habbox','https://habboxwiki.com/Habbo.com.br'],
 ['older-staff','https://habbeet.webnode.page/modera%C3%A7%C3%A3o%20e%20ger%C3%AAncia/']
];
const names=['Flecha','Mordomo','Paty-nestle','4Queijos','Disco-Lee','MissFurby','Reeet','TheDJHabbo','Acapulca','Sir-Lawnrence','Prefeita','DJapamala'];
const unescape=x=>String(x).replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
fs.mkdirSync('habbo/v17/probe',{recursive:true});
for(const [id,url] of targets){
 try{
  const resp=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0'}});
  const html=await resp.text();fs.writeFileSync('habbo/v17/probe/'+id+'.html',html);
  const imgs=[...html.matchAll(/<img\b[^>]*>/gi)].map(x=>({index:x.index,html:x[0],
   src:unescape((x[0].match(/\b(?:data-src|src)="([^"]+)"/)||[])[1]||''),
   alt:unescape((x[0].match(/\b(?:alt|title)="([^"]+)"/)||[])[1]||'')
  }));
  console.log('\nPAGE',id,resp.status,html.length,'images',imgs.length);
  for(const name of names){
   const match=[...html.matchAll(new RegExp(name.replace(/[^A-Za-z0-9]/g,'\\$&'),'gi'))].slice(0,6);
   const nearby=match.map(m=>{
    const before=imgs.filter(i=>i.index<=m.index).slice(-3);
    const after=imgs.filter(i=>i.index>m.index).slice(0,3);
    return {position:m.index,before:before.map(x=>({src:x.src.slice(0,260),alt:x.alt.slice(0,70)})),after:after.map(x=>({src:x.src.slice(0,260),alt:x.alt.slice(0,70)}))};
   });
   if(nearby.length)console.log('NAME',name,JSON.stringify(nearby).slice(0,2500));
  }
  const explicit=imgs.filter(x=>names.some(n=>(x.src+' '+x.alt).toLowerCase().includes(n.toLowerCase())));
  console.log('EXPLICIT',JSON.stringify(explicit.map(x=>({src:x.src.slice(0,280),alt:x.alt.slice(0,90)})).slice(0,70)));
 }catch(e){console.log('FAILED',id,e.message)}
}
