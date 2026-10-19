const pages=[
['secondary-archive','https://aquelasimagem.blogspot.com/p/hb-06-11.html'],
['prefeita-file','https://habbo.fandom.com/pt-br/api.php?action=query&titles=File:Prefeita.png&prop=imageinfo&iiprop=url&format=json'],
['prefeita-file-en','https://habbo.fandom.com/api.php?action=query&titles=File:Prefeita.png&prop=imageinfo&iiprop=url&format=json']
];
for(const [name,url] of pages){
 try {const r=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0'}});const h=await r.text();console.log(name,r.status,h.length,r.url);
 if(r.ok&&name==='secondary-archive'){
  const body=h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  const imgs=[...body.matchAll(/<img\b[^>]*>/gi)].map(m=>({at:m.index,src:m[0].match(/\bsrc=["']([^"']+)["']/i)?.[1],width:m[0].match(/\bwidth=["']([^"']+)/i)?.[1]}));
  for(const person of ['Mordomo','Sir-Lawnrence','Prefeita','DJapamala','Flecha','4Queijos','Disco-Lee']){
   const pos=body.toLowerCase().indexOf(person.toLowerCase());
   const nearest=imgs.map(i=>({...i,d:Math.abs(i.at-pos)})).sort((a,b)=>a.d-b.d).slice(0,3);
   console.log('NAME',person,'position',pos,JSON.stringify(nearest));
  }
 }
 else console.log('EXCERPT',h.slice(0,350));
 }catch(e){console.log(name,'error',e.message)}
}
for(const name of ['Mordomo','Sir-Lawnrence','Prefeita','DJapamala']){
 for(const host of ['https://images.habbo.com','https://www.habbo.com.br','https://www.habbo.com','https://habbo.com.br']){
  const url=host+'/habbo-imaging/avatarimage?user='+encodeURIComponent(name)+'&size=m&direction=2&head_direction=3&action=std';
  try {const r=await fetch(url,{signal:AbortSignal.timeout(10000),redirect:'follow',headers:{'User-Agent':'Mozilla/5.0','Accept':'image/png,image/gif,image/*'}});const b=Buffer.from(await r.arrayBuffer());
   console.log('IMAGER',name,host,r.status,r.headers.get('content-type'),b.length, b.subarray(0,14).toString('hex'));
  }catch(e){console.log('IMAGER',name,host,'ERR',e.message)}
 }
}

for(const name of ['Mordomo','Sir-Lawnrence','Prefeita','DJapamala']){
 for(const hotel of ['com.br','br','com']){
  const url='https://habbohistory.com/habbo-imaging/avatarimage?user='+encodeURIComponent(name)+'&hotel='+encodeURIComponent(hotel)+'&direction=2&head_direction=2&gesture=std&action=std&size=l&format=png';
  try{const r=await fetch(url,{signal:AbortSignal.timeout(18000),headers:{'User-Agent':'Mozilla/5.0'}});const b=Buffer.from(await r.arrayBuffer());
   console.log('HISTORYIMAGER',name,hotel,r.status,r.headers.get('content-type'),b.length,b.subarray(0,15).toString('hex'));}
  catch(e){console.log('HISTORYIMAGER',name,hotel,'ERROR',e.message)}
 }
}
