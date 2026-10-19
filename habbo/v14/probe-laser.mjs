const source='https://habborator.org/furniture/sub/v7_laser.html';
const res=await fetch(source,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0 (museum source audit)'}});
const html=await res.text();
const tags=[...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)].map(m=>m[1]);
const originals=tags.filter(x=>/^v7_rare\/.+\.gif$/i.test(x));
console.log(JSON.stringify({url:source,status:res.status,title:html.match(/<title>(.*?)<\/title>/i)?.[1],tags,originals},null,2));
if(!res.ok||originals.length!==10)throw Error('V7 laser set must provide 10 distinct room-render originals');
