import fs from 'node:fs';
import path from 'node:path';
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderV13Details(root,dist){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'v13/source-manifest.json'),'utf8'));
 for(const item of manifest.newRares){
  for(const en of [false,true]){
   const lang=en?'en':'pt-br',name=escape(en?item.en:item.pt);
   const gallery='/habbo/'+lang+'/'+(en?'rares':'raros')+'/';
   const intro=en?'International historical source':'Fonte histórica internacional';
   const series=escape(en?(item.subseriesEn||item.familyEn):(item.subseriesPt||item.familyPt));
   const note=en?'Original historical furniture sprite. Archival presence does not establish release on every hotel, including Brazil.':
    'Sprite histórico original. A presença em arquivo não comprova lançamento em todos os hotéis, incluindo o Brasil.';
   const html='<!doctype html><html lang="'+(en?'en':'pt-BR')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1f1f1f">'+
    '<title>'+name+' · Habbo Museu Vivo</title><link rel="stylesheet" href="/habbo/assets/v8-museum.css"><link rel="stylesheet" href="/habbo/assets/v13-detail.css"></head>'+
    '<body class="v8-archive v13-detail"><a class="v8-skip" href="#main">'+(en?'Skip to content':'Ir ao conteúdo')+'</a>'+
    '<header class="v8-top"><a class="v8-wordmark" href="/habbo/'+lang+'/">✦ Habbo <small>'+intro+'</small></a>'+
    '<nav class="v8-top-links"><a href="/habbo/'+lang+'/#lugares">'+(en?'Places':'Lugares')+'</a><a href="/habbo/'+lang+'/#raros">'+(en?'Rares':'Raros')+'</a><a href="/habbo/'+lang+'/#emblemas">'+(en?'Badges':'Emblemas')+'</a></nav></header>'+
    '<main id="main" class="v13-detail-main"><p class="v8-eyebrow">'+intro+' · '+escape(item.period)+'</p><h1>'+name+'</h1>'+
    '<p class="v13-detail-series">'+series+'</p><figure><img src="/'+escape(item.local)+'" alt="'+name+'" decoding="async"><figcaption>'+name+'</figcaption></figure>'+
    '<p class="v13-detail-note">'+note+'</p><nav class="v13-detail-actions"><a href="'+gallery+'">← '+(en?'Rare collection':'Coleção de raros')+'</a>'+
    '<a href="'+escape(item.source)+'" target="_blank" rel="noopener noreferrer">'+(en?'Original archival source ↗':'Fonte histórica original ↗')+'</a></nav></main>'+
    '<footer class="v8-bottom"><a href="/habbo/'+lang+'/">'+(en?'Museum homepage':'Página do museu')+'</a></footer></body></html>';
   const target=path.join(dist,lang,en?'rare':'raro',item.id,'index.html');
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
  }
 }
 return manifest.newRares.length*2;
}
