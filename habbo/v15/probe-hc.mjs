import fs from 'node:fs';
const sources=['https://habborator.org/furniture/hc.html','https://habboxwiki.com/HC'];
for(const url of sources){
  const res=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0 (Habbo fan preservation archival verification)'}});
  const html=await res.text();
  const name=url.includes('habborator')?'habborator-hc':'habbox-hc';
  fs.mkdirSync('habbo/v15/probe',{recursive:true});
  fs.writeFileSync('habbo/v15/probe/'+name+'.html',html);
  console.log('SOURCE',url,'HTTP',res.status,'BYTES',html.length);
  if(name==='habborator-hc'){
    let i=0;
    for(const m of html.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)){
      const near=html.slice(Math.max(0,m.index-190),Math.min(html.length,m.index+240)).replace(/\s+/g,' ');
      console.log('ORIGINAL_CANDIDATE',++i,m[1],'CONTEXT',near.slice(0,360));
    }
    console.log('PAGE',html.slice(0,1900));
  }else{
    const section=html.indexOf('1st Generation');
    console.log('WIKI_HC_GENERATIONS',html.slice(Math.max(0,section),section+22000).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,7000));
  }
}
