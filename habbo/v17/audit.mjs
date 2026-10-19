import fs from 'node:fs';
const pages=[
 ['haddicas2011','https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html'],
 ['mist2021','https://viajovem.blogspot.com/2021/02/staffs.html'],
 ['habblindados','https://habblindados.com.br/pagina/staff-habbo'],
 ['wiki','https://habbo.fandom.com/pt-br/wiki/Gerentes'],
 ['4queijos','https://viajovem.blogspot.com/2021/04/a-historia-e-vida-4queijos.html'],
 ['blog','https://nostalgia.mooon.com.br/2025/12/habbo-hotel.html']
];
const names=['Flecha','Mordomo','Paty-Nestle','4Queijos','Disco-Lee','MissFurby','Reeet','TheDJHabbo','Acapulca','Sir-Lawnrence','Prefeita','DJapamala'];
fs.mkdirSync('habbo/v17/source-audit',{recursive:true});
for(const [key,url] of pages){
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'Mozilla/5.0 (archival research browser)'}});
  const html=await response.text();
  fs.writeFileSync('habbo/v17/source-audit/'+key+'.html',html);
  console.log('\n== PAGE',key,url,response.status,'bytes',html.length);
  const imgRefs=[...html.matchAll(/<img\b[^>]*>/gi)].map(m=>({at:m.index,tag:m[0]}));
  console.log('total images',imgRefs.length);
  if(key==='mist2021'||key==='haddicas2011'){
   const normalized=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'')
    .replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi,(_m,u)=>' [SPRITE '+(u.match(/image\d+\.\w+/i)||u.match(/AEn0k_[^=]+/i)||['unknown'])[0].slice(0,70)+'] ')
    .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
   console.log('ARTICLE_BODY_MATCHES',key);
   for(const name of names){
    const candidates=[...normalized.matchAll(new RegExp(name,'gi'))].slice(0,12);
    console.log('READING',name,JSON.stringify(candidates.map(m=>normalized.slice(Math.max(0,m.index-100),m.index+240)).filter(x=>x.includes('[SPRITE')).slice(0,5)).slice(0,1450));
   }
  }
  for(const n of names){
   let pos=html.toLowerCase().indexOf(n.toLowerCase());
   const choices=[];
   for(let i=0;i<7&&pos>=0;i++){
    const near=imgRefs.filter(x=>Math.abs(x.at-pos)<2000).sort((a,b)=>Math.abs(a.at-pos)-Math.abs(b.at-pos)).slice(0,3);
    for(const ref of near){
      const rawSrc=ref.tag.match(/\b(?:data-src|src)=["']([^"']+)["']/i)?.[1];
      const anchor=html.slice(Math.max(0,ref.at-300),ref.at);
      const href=[...anchor.matchAll(/\bhref=["']([^"']+)["']/gi)].at(-1)?.[1];
      if(rawSrc&&!choices.some(x=>x.src===rawSrc))choices.push({src:rawSrc,href,tag:ref.tag.slice(0,370),offset:ref.at-pos});
    }
    const next=html.toLowerCase().indexOf(n.toLowerCase(),pos+1);pos=next;
   }
   console.log('PERSON',n,JSON.stringify(choices.slice(0,9)).slice(0,4500));
  }
 }catch(e){console.log('ERROR',key,e.message)}
}

// V17 source scan (retrigger after PR registration).
