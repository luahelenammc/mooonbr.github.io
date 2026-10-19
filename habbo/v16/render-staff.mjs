import fs from 'node:fs';
import path from 'node:path';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function staffWithSprites(root){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'v16/staff-manifest.json'),'utf8'));
 const ledger=JSON.parse(fs.readFileSync(path.join(root,'v17/sprite-ledger.json'),'utf8'));
 const sprites=new Map(ledger.sprites.map(s=>[s.id,s]));
 manifest.profiles=manifest.profiles.map(person=>{
  const source=sprites.get(person.id);
  return {...person,sprite:source?'/'+source.local:null,spriteSource:source?.sourceArticle||'',verifiedSprite:!!source};
 });
 return manifest;
}
export function renderStaffChapter(manifest,en){
 if(manifest.profiles.length!==12)throw Error('V17 must retain 12 source-named staff figures');
 const pending=manifest.profiles.filter(p=>!p.sprite).length;
 const tiles=manifest.profiles.map((person,index)=>{
  const art=person.sprite
   ?'<img src="'+esc(person.sprite)+'" alt="" loading="'+(index<5?'eager':'lazy')+'" decoding="async" width="64" height="110">'
   :'<span class="v17-staff-unverified" aria-hidden="true">?</span>';
  const sourceText=person.sprite
   ?(en?'Historic full-body sprite of ':'Sprite de corpo inteiro arquivado de ')+person.name
   :(en?'Historic sprite not yet documented for ':'Sprite histórico ainda não documentado para ')+person.name;
  return '<figure class="v17-staff-item'+(!person.sprite?' v17-staff-pending':'')+'" role="listitem" data-v17-staff="'+esc(person.id)+'" data-v17-verified="'+(person.verifiedSprite?'true':'false')+'" title="'+esc(sourceText)+'">'+
   '<span class="v17-staff-stage">'+art+'</span><figcaption>'+esc(person.name)+'</figcaption></figure>';
 }).join('');
 return '<section class="v8-home-chapter v16-staff-chapter v17-staff-chapter" id="gerentes" aria-labelledby="v17-staff-title">'+
  '<header class="v8-chapter-head v17-staff-head"><div><p class="v8-overline">'+
  (en?'THE PEOPLE BEHIND THE HOTEL':'QUEM FAZIA O HOTEL ACONTECER')+'</p>'+
  '<h2 id="v17-staff-title">'+esc(en?manifest.titleEn:manifest.titlePt)+'</h2></div></header>'+
  '<section class="v17-staff-carousel" data-v9-family-section aria-label="'+(en?'Classic Brazilian staff':'Gerentes clássicos do Brasil')+'">'+
  '<div class="v17-staff-controls"><button type="button" data-v9-slide="-1" aria-label="'+(en?'Previous staff':'Gerentes anteriores')+'">←</button>'+
  '<button type="button" data-v9-slide="1" aria-label="'+(en?'Next staff':'Próximos gerentes')+'">→</button></div>'+
  '<div class="v17-staff-rail" data-v9-rail role="list" tabindex="0" aria-label="'+(en?'Scroll horizontally to explore classic managers':'Role horizontalmente para explorar os gerentes clássicos')+'">'+tiles+'</div></section>'+
  (pending?'<p class="v17-staff-source-note">'+(en
    ?pending+' classic looks could not be verified in contemporary historical sources; silhouettes are deliberately not fabricated.'
    :pending+' visuais clássicos ainda não foram encontrados em fontes históricas verificáveis; os sprites não foram inventados.')+'</p>':'')+
  '</section>';
}
export function renderStaffStandalone(root,dist){
 const manifest=staffWithSprites(root),files=[];
 for(const en of [false,true]){
  const lang=en?'en':'pt-br',route=en?'managers':'gerentes',title=en?manifest.titleEn:manifest.titlePt;
  const nav=en?['Public Spaces','Rares','Badges','Managers']:['Espaços Públicos','Raros','Emblemas','Gerentes'];
  const items=[['#lugares',nav[0]],['#raros',nav[1]],['#emblemas',nav[2]],['#gerentes',nav[3]]];
  const navHtml=items.map(([hash,label])=>'<a href="/habbo/'+lang+'/'+hash+'">'+esc(label)+'</a>').join('');
  const html='<!doctype html><html lang="'+(en?'en':'pt-BR')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
   '<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#101520">'+
   '<title>'+esc(title)+' · Habbo Museu Vivo</title><link rel="stylesheet" href="/habbo/assets/v8-museum.css">'+
   '<link rel="stylesheet" href="/habbo/assets/v13-home.css?v=20261019-v15.1">'+
   '<link rel="stylesheet" href="/habbo/assets/v16-staff.css?v=20261019-v17.1">'+
   '<script defer src="/habbo/assets/v8-museum.js?v=20261019-v17.1"></script><script defer src="/habbo/assets/v17-staff.js?v=20261019-v17.1"></script></head>'+
   '<body class="v16-staff-standalone v17-staff-standalone"><a class="v8-skip" href="#gerentes">'+(en?'Skip to managers':'Ir para os gerentes')+'</a>'+
   '<header class="v8-top"><a class="v8-wordmark" href="/habbo/'+lang+'/"><span class="v8-glyph">✦</span> Habbo <small>'+(en?'Memory museum':'Museu vivo')+'</small></a>'+
   '<nav class="v8-top-links" aria-label="'+(en?'Museum navigation':'Navegação do museu')+'">'+navHtml+'</nav></header>'+
   '<main class="v8-home-chapters">'+renderStaffChapter(manifest,en)+'</main>'+
   '<footer class="v8-bottom"><a href="/habbo/'+lang+'/">'+(en?'← Back to museum':'← Voltar ao museu')+'</a><p>This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. Historical assets remain the property of their respective owners.</p></footer></body></html>';
  const target=path.join(dist,lang,route,'index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);files.push(lang+'/'+route+'/index.html');
 }
 return files;
}
