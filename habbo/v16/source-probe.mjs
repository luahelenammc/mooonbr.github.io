import fs from 'node:fs';
const pages=[
  ['post','https://nostalgia.mooon.com.br/2025/12/habbo-hotel.html'],
  ['wiki','https://habbo.fandom.com/pt-br/wiki/Gerentes'],
  ['hotel','https://habbo.fandom.com/pt-br/wiki/Habbo_Brasil'],
  ['staff','https://viajovem.blogspot.com/2021/02/staffs.html'],
  ['habbox','https://habboxwiki.com/Habbo.com.br'],
];
fs.mkdirSync('habbo/v16/research-cache',{recursive:true});
for(const [key,url] of pages){
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0 (Habbo historical research)'}});
  const html=await response.text();
  fs.writeFileSync('habbo/v16/research-cache/'+key+'.html',html);
  const i=html.toLowerCase().indexOf(key==='post'?'recapitula':key==='staff'?'flecha':key==='wiki'?'disco-lee':'4queijos');
  console.log('SOURCE',key,url,'status',response.status,'chars',html.length,'context:',html.slice(Math.max(0,i-400),i+800).replace(/\s+/g,' ').slice(0,1250));
  if(key==='post'){
   let v=html.indexOf('4Queijos');let snippet=html.slice(Math.max(0,v-1800),v+12000);
   console.log('BLOG_VIDEO_ANCHORS',JSON.stringify([...snippet.matchAll(/<a\b[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/g)].map(x=>({href:x[1],label:x[2].replace(/<[^>]+>/g,'').slice(0,100)})).filter(x=>/4Queijos|Disco-Lee|MissFurby|Emiseis|Igor|youtube|youtu.be/i.test(x.href+' '+x.label)).slice(0,30)));
  }
  const pictures=[...html.matchAll(/(?:src|data-src|content)=["'](https?:\/\/[^"']+\.(?:png|gif|jpg|jpeg|webp)[^"']*)["']/gi)].map(x=>x[1]).filter(x=>/flecha|mordomo|queijos|disco|missfurby|staff|avatar|paty|reeet|acapulca/i.test(x));
  console.log('POTENTIAL_IMAGE_REFERENCES',key,JSON.stringify([...new Set(pictures)].slice(0,25)));
 }catch(e){console.log('FAILED',key,e.message)}
}
