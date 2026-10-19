const urls=['https://habborator.org/furniture/poster.html','https://habborator.org/furniture/posters.html','https://habboxwiki.com/Infobus_(Furni)','https://habboxwiki.com/Posters_and_Flags','https://habbox.com/rares/super-rares/infobus'];
for(const url of urls){
 try {
  const resp=await fetch(url,{signal:AbortSignal.timeout(13000)});
  const body=await resp.text();let i=0,parts=[];
  for(const m of body.matchAll(/infobus/ig)){
   if(parts.length>=8)break;
   parts.push(body.slice(Math.max(0,m.index-270),Math.min(body.length,m.index+370)).replace(/\s+/g,' ').slice(0,640));
  }
  const images=[...body.matchAll(/(?:src|href|srcset)=["']([^"']+\.(?:gif|png|webp)(?:\?[^"']*)?)["']/gi)].map(x=>x[1]);
  console.log('INFOBUS_SOURCES',url,'HTTP',resp.status,'LENGTH',body.length,'MATCHES',JSON.stringify(parts),'IMAGES',JSON.stringify(images.filter(x=>/infobus|gallery|poster|bus/i.test(x)).slice(0,30)));
 }catch(e){console.log('ERROR',url,String(e));}
}
