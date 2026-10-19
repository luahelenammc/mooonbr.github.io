import fs from 'node:fs';
import path from 'node:path';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const langLabel=(en,pt,eng)=>en?eng:pt;
function renderStaffSprite(person,art,en){
 const source=art?.sourcePage||person.sources[0],label=person.name;
 let visual;
 if(art){
  const src='/'+art.local;
  visual=art.format==='webp'&&art.id==='djapamala'
   ?'<span class="v17-staff-portrait v17-archival-crop"><img class="v17-profile-snapshot" src="'+esc(src)+'" alt="" loading="lazy" decoding="async" width="'+art.width+'" height="'+art.height+'"></span>'
   :'<span class="v17-staff-portrait"><img src="'+esc(src)+'" alt="" loading="lazy" decoding="async" width="'+art.width+'" height="'+art.height+'"></span>';
 }else{
  visual='<span class="v17-staff-portrait v17-staff-unavailable" aria-hidden="true">?</span>';
 }
 return '<li class="v17-staff-specimen" data-v17-person="'+esc(person.id)+'" role="listitem">'+
  '<a class="v17-staff-specimen-link" href="'+esc(source)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(label+'. '+langLabel(en, 'Abrir registro histórico em nova aba','Open original historic source in a new tab'))+'">'+
   visual+'<span class="v17-staff-name">'+esc(label)+'</span></a>'+
   (!art?'<span class="v17-staff-image-note">'+(en?'Historical sprite not located':'Sprite não localizado')+'</span>':'')+
  '</li>';
}
export function renderStaffChapter(manifest,ledger,en){
 const arts=new Map(ledger.assets.map(a=>[a.id,a]));
 if(manifest.profiles.length!==12||new Set(manifest.profiles.map(p=>p.id)).size!==12)throw Error('V17 requires precisely 12 historic profile names');
 if(arts.size<10)throw Error('Insufficient archive originals for the V17 visual rail');
 const title=langLabel(en,manifest.titlePt,manifest.titleEn);
 const intro=langLabel(en,'Os personagens que marcaram o Habbo brasileiro.','The characters who made Brazilian Habbo memorable.');
 const tiles=manifest.profiles.map(person=>renderStaffSprite(person,arts.get(person.id),en)).join('');
 return '<section class="v8-home-chapter v17-staff-chapter" id="gerentes" aria-labelledby="v17-staff-title">'+
  '<header class="v8-chapter-head v17-staff-head"><div>'+
   '<p class="v8-overline">'+langLabel(en,'QUEM ESTAVA POR TRÁS DOS PIXELS','THE PEOPLE BEHIND THE PIXELS')+'</p>'+
   '<h2 id="v17-staff-title">'+esc(title)+'</h2>'+
   '<p>'+esc(intro)+'</p></div>'+
  '<div class="v17-staff-arrows" aria-label="'+langLabel(en,'Navegar pelos personagens','Browse staff characters')+'">'+
   '<button type="button" class="v17-staff-arrow" data-v17-scroll="-1" aria-label="'+langLabel(en,'Gerentes anteriores','Previous staff')+'">←</button>'+
   '<button type="button" class="v17-staff-arrow" data-v17-scroll="1" aria-label="'+langLabel(en,'Próximos gerentes','Next staff')+'">→</button>'+
  '</div></header>'+
  '<div class="v17-staff-rail" data-v17-rail role="region" tabindex="0" aria-label="'+langLabel(en,'Galeria horizontal de gerentes clássicos do Habbo BR','Horizontal gallery of classic Habbo Brazil managers')+'">'+
  '<ul class="v17-staff-items" role="list">'+tiles+'</ul></div>'+
  '<div class="v17-staff-progress" aria-hidden="true"><span class="v17-staff-progress-thumb"></span></div>'+
  '</section>';
}
export function renderStaffStandalone(root,dist){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'v16/staff-manifest.json'),'utf8'));
 const originals=JSON.parse(fs.readFileSync(path.join(root,'v17/staff-originals.json'),'utf8'));
 const documents=[];
 for(const en of [false,true]){
  const lang=en?'en':'pt-br',route=en?'managers':'gerentes';
  const title=en?manifest.titleEn:manifest.titlePt;
  const chapter=renderStaffChapter(manifest,originals,en);
  const nav=en?['Public Spaces','Rares','Badges','Managers']:['Espaços Públicos','Raros','Emblemas','Gerentes'];
  const navHtml=[['#lugares',nav[0]],['#raros',nav[1]],['#emblemas',nav[2]],['#gerentes',nav[3]]].map(([hash,label])=>'<a href="/habbo/'+lang+'/'+hash+'">'+esc(label)+'</a>').join('');
  const html='<!doctype html><html lang="'+(en?'en':'pt-BR')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
   '<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#101520">'+
   '<title>'+esc(title)+' · Habbo Museu Vivo</title>'+
   '<link rel="stylesheet" href="/habbo/assets/v8-museum.css"><link rel="stylesheet" href="/habbo/assets/v13-home.css?v=20261019-v15.1">'+
   '<link rel="stylesheet" href="/habbo/assets/v17-staff.css?v=20261019-v17.1">'+
   '<script defer src="/habbo/assets/v17-staff.js?v=20261019-v17.1"></script></head>'+
   '<body class="v17-staff-standalone"><a class="v8-skip" href="#gerentes">'+langLabel(en,'Ir para os gerentes','Skip to managers')+'</a>'+
   '<header class="v8-top"><a class="v8-wordmark" href="/habbo/'+lang+'/"><span class="v8-glyph">✦</span> Habbo <small>'+langLabel(en,'Museu vivo','Memory museum')+'</small></a>'+
   '<nav class="v8-top-links" aria-label="'+langLabel(en,'Navegação do museu','Museum navigation')+'">'+navHtml+'</nav></header>'+
   '<main class="v8-home-chapters">'+chapter+'</main>'+
   '<footer class="v8-bottom"><a href="/habbo/'+lang+'/">'+langLabel(en,'← Voltar ao museu','← Back to museum')+'</a>'+
   '<p>This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. Historical assets remain the property of their respective owners.</p></footer>'+
   '</body></html>';
  const target=path.join(dist,lang,route,'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
  documents.push(lang+'/'+route+'/index.html');
 }
 return documents;
}
