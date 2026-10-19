import fs from 'node:fs';
const pages=[
 ['wiki','https://habbo.fandom.com/pt-br/wiki/Gerentes'],
 ['blog2011','https://mundo-habbiano.blogspot.com/2011/07/gerentes-e-moderadores.html'],
 ['staff2011','https://viajovem.blogspot.com/2021/02/staffs.html'],
 ['looks2011','https://visitehabbo.blogspot.com/2011/04/'],
 ['2011retrospective','https://aquelasimagem.blogspot.com/p/hb-06-11.html']
];
fs.mkdirSync('habbo/v17/source-pages',{recursive:true});
for(const [key,url] of pages){
 try {
  const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'Mozilla/5.0 (historic Habbo room sprite study)'}});
  const html=await r.text();fs.writeFileSync('habbo/v17/source-pages/'+key+'.html',html);
  console.log('PAGE',key,r.status,html.length,url);
  const names=['Flecha','Mordomo','Paty-nestle','4Queijos','Disco-Lee','MissFurby','Reeet','TheDJHabbo','Acapulca','Sir-Lawnrence','Prefeita','DJapamala'];
  for(const name of names){
   let at=html.toLowerCase().indexOf(name.toLowerCase());if(at<0)continue;
   const part=html.slice(Math.max(0,at-1100),Math.min(html.length,at+850));
   console.log('NAME',key,name,'CONTEXT',part.replace(/\s+/g,' ').slice(0,1600));
  }
 }catch(e){console.log('ERROR',key,e.message);}
}
