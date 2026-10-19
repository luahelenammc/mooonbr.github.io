const endpoints=[
 ['archive2012','https://web.archive.org/web/20120601000000id_/http://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html'],
 ['archive2018','https://web.archive.org/web/20180601000000id_/http://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html'],
 ['rss','https://haddicas-habbo.blogspot.com/feeds/posts/default?alt=json&max-results=200'],
 ['i-bobba-feed','https://i-bobba.blogspot.com/feeds/pages/default?alt=json'],
 ['haddicas-mobile','https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html?m=1']
];
for(const [label,url] of endpoints){
 try{
 const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'Mozilla/5.0'}});
 const s=await r.text();
 console.log('SOURCE',label,r.status,'bytes',s.length,'URL',r.url);
 const names=['Mordomo','Sir-Lawnrence'];
 for(const n of names){
  let idx=s.toLowerCase().indexOf(n.toLowerCase()),parts=[];
  for(let i=0;i<4&&idx>=0;i++){
   parts.push(s.slice(Math.max(0,idx-800),idx+220).replace(/\s+/g,' ').slice(-1000));
   idx=s.toLowerCase().indexOf(n.toLowerCase(),idx+2);
  }
  console.log('ARTICLE_MATCH',label,n,JSON.stringify(parts).slice(0,2700));
 }
 }catch(e){console.log('SOURCE_ERROR',label,e.message)}
}
