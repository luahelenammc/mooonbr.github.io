const pages=[
['y2008','https://viajovem.blogspot.com/2021/01/a-historia-o-ano-de-2008.html'],
['haddicas','https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html'],
['staff2011','https://viajovem.blogspot.com/2021/02/staffs.html'],
['wikia','https://habbo.fandom.com/pt-br/wiki/Gerentes'],
['sources2006','https://aquelasimagem.blogspot.com/p/hb-06-11.html']
];
for(const [key,url] of pages){
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0'}});
  const s=await r.text();
  console.log('PAGE',key,r.status,s.length);
  for(const name of ['Prefeita','DJapamala']){
   let count=0,from=0;
   while(count<5){
    const i=s.toLowerCase().indexOf(name.toLowerCase(),from);
    if(i<0)break;
    const around=s.slice(Math.max(0,i-900),Math.min(s.length,i+600));
    const imgs=[...around.matchAll(/<img\b[^>]*src=["']([^"']+)["']/gi)].map(x=>x[1]);
    console.log('CONTEXT',key,name,'at',i,'imgs',JSON.stringify(imgs.slice(-4)),'text',around.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(-250));
    from=i+name.length;count++;
   }
  }
 }catch(e){console.log('FAIL',key,e.message)}
}
const cdn=[
 'https://static.wikia.nocookie.net/habbo/images/c/cf/Perfil_DJapamala.png',
 'https://vignette.wikia.nocookie.net/habbo/images/c/cf/Perfil_DJapamala.png/revision/latest',
 'https://static.wikia.nocookie.net/habbo/images/c/cf/Perfil_DJapamala.png/revision/latest/scale-to-width-down/185?cb=20111113160839&path-prefix=pt'
];
for(const url of cdn){
 try{const r=await fetch(url,{signal:AbortSignal.timeout(14000),headers:{'User-Agent':'Mozilla/5.0','Referer':'https://habbo.fandom.com/'}});
 const b=Buffer.from(await r.arrayBuffer());console.log('CDN',r.status,r.headers.get('content-type'),b.length,b.subarray(0,18).toString('hex'),url);}
 catch(e){console.log('CDN_FAIL',e.message)}
}
