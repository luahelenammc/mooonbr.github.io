import fs from 'node:fs';
const sources=[
 ['viajovem','https://viajovem.blogspot.com/2021/02/staffs.html'],
 ['habblindados','https://habblindados.com.br/pagina/staff-habbo'],
 ['habbo-wiki','https://habbo.fandom.com/pt-br/wiki/Gerentes'],
 ['habbo-misterio-4queijos','https://viajovem.blogspot.com/2021/04/a-historia-e-vida-4queijos.html'],
 ['old-staff-2011','https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html'],
 ['retrospective','https://aquelasimagem.blogspot.com/p/hb-06-11.html']
];
const staff=['Flecha','Mordomo','Paty-Nestle','4Queijos','Disco-Lee','MissFurby','Reeet','TheDJHabbo','Acapulca','Sir-Lawnrence','Prefeita','DJapamala'];
fs.mkdirSync('habbo/v17/probe',{recursive:true});
for(const [id,url] of sources){
 try{
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (historic Habbo sprite provenance) HappyMuseumBot/1.0'},signal:AbortSignal.timeout(30000)});
  const html=await r.text();fs.writeFileSync('habbo/v17/probe/'+id+'.html',html);
  console.log('\nSOURCE',id,url,'status',r.status,'html length',html.length);
  for(const name of staff){
   const matches=[...html.matchAll(new RegExp(name.replaceAll('-','\\-'),'ig'))];
   const hits=matches.slice(0,3).map(m=>html.slice(Math.max(0,m.index-1350),m.index+350).replace(/\s+/g,' ').slice(0,1650));
   console.log('STAFF',name,matches.length,'CONTEXT',JSON.stringify(hits).slice(0,5100));
  }
  const imgs=[...html.matchAll(/<img\b[^>]{0,5000}>/gi)].map(x=>x[0]);
  console.log('STAFF_IMG_TAGS',JSON.stringify(imgs.filter(x=>staff.some(name=>x.toLowerCase().includes(name.toLowerCase()))).slice(0,45)).slice(0,12000));
 }catch(e){console.log('FAILED',id,String(e));}
}

for(const name of ['Acapulca','DJapamala','Prefeita']){
 const u='https://www.habbo.com.br/habbo-imaging/avatarimage?user='+encodeURIComponent(name)+'&direction=2&head_direction=3&action=std&gesture=std&size=m';
 try{
  const r=await fetch(u,{signal:AbortSignal.timeout(22000),headers:{'User-Agent':'Mozilla/5.0'}});
  const arr=Buffer.from(await r.arrayBuffer());
  console.log('LATEST_AVATAR_PROBE',name,'HTTP',r.status,'CT',r.headers.get('content-type'),'BYTES',arr.length,'HEX',arr.subarray(0,20).toString('hex'),'URL',r.url);
 }catch(e){console.log('LATEST_AVATAR_FAILED',name,e.message)}
}
