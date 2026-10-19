import fs from 'node:fs';
import path from 'node:path';

// V8 presentation compiler. Retains research/source data but never emits
// the BR/PT regional badge pages or artwork into the public-facing galleries.
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const slug=x=>String(x).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const read=(file)=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(dist,relative,value)=>{const p=path.join(dist,relative);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,value)};
const disclaimer='This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. Historical assets remain the property of their respective owners.';
const rareExtra=[
 ['holiday-romance','Holiday Romance','Holiday Romance','holiday','Holiday Romance'],
 ['santa-and-elf','Santa e Elfo','Santa and Elf','lappland','Lappland Greetings'],
 ['aloe-vera','Aloe Vera','Aloe Vera','aloe','Aloe Vera'],
 ['dj-turntable','Mesa de DJ','DJ Turntable','deck','DJ Turntable'],
 ['crusoes-hammock','Rede de Crusoe',"Crusoe's Hammock",'hammock',"Crusoe's Hammock"],
 ['snow-globe','Globo de neve','Snow Globe','globe','Classic Snow Globe'],
 ['speakers-corner','Palco de oratória',"Speaker's Corner",'speaker',"Speaker's Corner"],
 ['cola-machine','Máquina Habbo Cola','Habbo Cola Machine','cola','Habbo Cola'],
 ['infobus-poster','Cartaz do Infobus','Infobus poster','gallery_infobus','Infobus poster']
];
function rareItems(root) {
 const base=read(path.join(root,'data/v5-rares.json'));
 const old=base.map(item=>({
  id:item.id, family:item.familyId, familyPt:item.familyName.ptBr, familyEn:item.familyName.en,
  pt:item.name.ptBr,en:item.name.en,image:item.image,descriptionPt:item.description?.ptBr||'',descriptionEn:item.description?.en||''
 }));
 const added=rareExtra.map(([id,pt,en,file,family])=>({id,family:id,
  familyPt:pt,familyEn:family,pt,en,image:'/habbo/assets/v6/rares/'+file+'.gif',
  descriptionPt:'Peça histórica de catálogo. A circulação no Habbo BR depende de evidência específica.',
  descriptionEn:'Historic catalogue piece. Availability in Habbo Brazil requires item-specific evidence.'
 }));
 return [...old,...added];
}
function badgeItems(root) {
 const ledger=read(path.join(root,'assets/v7-classic-badges.json'));
 const names=new Map(ledger.families.map(f=>[f.id,f.name]));
 return ledger.items.map(b=>({
  id:b.code,family:b.family,familyPt:names.get(b.family)?.ptBr||b.family,
  familyEn:names.get(b.family)?.en||b.family,pt:b.label?.ptBr||b.code,en:b.label?.en||b.code,
  image:b.image, descriptionPt:'Emblema do arquivo internacional pré-2012; distribuição por hotel não confirmada.',
  descriptionEn:'Pre-2012 international archival badge; distribution by hotel not verified.'
 }));
}
function cssJs(locale) {
 return '<link rel="stylesheet" href="/habbo/assets/v8-museum.css"><script defer src="/habbo/assets/v8-museum.js"></script>';
}
function tile(item,kind,en) {
 const label=en?item.en:item.pt;
 const href=kind==='rares'?(en?'/habbo/en/rare/':'/habbo/pt-br/raro/')+item.id+'/':
   (en?'/habbo/en/badge/':'/habbo/pt-br/emblema/')+'classic-'+String(item.id).toLowerCase()+'/';
 return '<button class="v8-specimen" type="button" data-v8-item data-id="'+escape(item.id)+
  '" data-title="'+escape(label)+'" data-image="'+escape(item.image)+
  '" data-link="'+escape(href)+'" data-family="'+escape(en?item.familyEn:item.familyPt)+
  '" aria-label="'+escape((en?'Inspect ':'Examinar ')+label)+'"><img src="'+escape(item.image)+
  '" alt="" loading="lazy" decoding="async"><span>'+escape(label)+'</span></button>';
}
function groupMap(items) {
 const groups=new Map(); for(const item of items) {
  if(!groups.has(item.family))groups.set(item.family,{pt:item.familyPt,en:item.familyEn,items:[]});
  groups.get(item.family).items.push(item);
 }
 return [...groups].map(([id,group])=>({id,...group}));
}
function renderCollection(root,dist,kind,en) {
 const pt=!en, items=kind==='rares'?rareItems(root):badgeItems(root);
 const groups=groupMap(items), lang=en?'en':'pt-br', name=en?
  (kind==='rares'?'Classic rares':'Classic global badges'):
  (kind==='rares'?'Raros clássicos':'Emblemas clássicos globais');
 const nav=[
  ['Lugares','Places','/habbo/'+lang+'/#lugares'],['Raros','Rares','/habbo/'+lang+'/#raros'],
  ['Emblemas','Badges','/habbo/'+lang+'/#emblemas']
 ].map(([ptn,enn,href])=>'<a href="'+href+'">'+(en?enn:ptn)+'</a>').join('');
 const activeLang= '<nav class="v8-lang" aria-label="'+(en?'Language':'Idioma')+'">'+
  '<a href="/habbo/pt-br/'+(kind==='rares'?'raros':'emblemas')+'/"'+(!en?' aria-current="page"':'')+' aria-label="Português"><img src="/habbo/assets/flag-br.svg" alt="" width="23" height="15"></a>'+
  '<a href="/habbo/en/'+(kind==='rares'?'rares':'badges')+'/"'+(en?' aria-current="page"':'')+' aria-label="English"><img src="/habbo/assets/flag-us.svg" alt="" width="23" height="15"></a></nav>';
 const featured=items[0], featuredLink=kind==='rares'?(en?'/habbo/en/rare/':'/habbo/pt-br/raro/')+featured.id+'/':
   (en?'/habbo/en/badge/':'/habbo/pt-br/emblema/')+'classic-'+slug(featured.id)+'/';
 const rails=groups.map(group=>'<section class="v8-family" id="family-'+escape(group.id)+'" aria-labelledby="family-title-'+escape(group.id)+'">'+
   '<header class="v8-family-heading"><h2 id="family-title-'+escape(group.id)+'">'+escape(en?group.en:group.pt)+'</h2><span>'+group.items.length+'</span></header>'+
   '<div class="v8-specimens'+(kind==='badges'?' v8-specimens--badges':'')+'">'+group.items.map(item=>tile(item,kind,en)).join('')+'</div></section>').join('');
 const jump=groups.map(g=>'<a href="#family-'+escape(g.id)+'">'+escape(en?g.en:g.pt)+'</a>').join('');
 const intro=en?'Browse the originals. Choose an image to inspect it, then open its historical record.':
  'Explore os originais. Selecione uma imagem para ampliá-la e, depois, abra sua ficha histórica.';
 const note=en?'Source images and labels document pre-2012 material; an archived sprite does not prove Brazilian release.':
  'As imagens preservadas não comprovam que cada peça circulou no Habbo BR.';
 const html='<!doctype html><html lang="'+(en?'en':'pt-BR')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#1f1f1f">'+
 '<title>'+escape(name)+' · Habbo Museu Vivo</title>'+cssJs(lang)+'</head><body class="v8-archive v8-'+kind+'">'+
 '<a class="v8-skip" href="#main">'+(en?'Skip to collection':'Ir para a coleção')+'</a><header class="v8-top">'+
 '<a class="v8-wordmark" href="/habbo/'+lang+'/"><span class="v8-glyph">✦</span> Habbo <small>'+ (en?'Memory museum':'Museu vivo')+'</small></a>'+
 '<nav class="v8-top-links" aria-label="'+(en?'Museum':'Museu')+'">'+nav+'</nav>'+activeLang+'</header>'+
 '<main id="main"><div class="v8-collection-intro"><p class="v8-eyebrow">2000–2011 · '+(kind==='rares'?(en?'FURNITURE':'MOBIS'):(en?'BADGES':'EMBLEMAS'))+
 '</p><h1>'+escape(name)+'</h1><p>'+intro+'</p><span class="v8-total">'+items.length+' '+(en?'pieces':'peças')+'</span></div>'+
 '<section class="v8-feature" aria-label="'+(en?'Selected piece':'Peça selecionada')+'"><button class="v8-feature-image" data-v8-feature-open type="button"><img data-v8-feature-img src="'+escape(featured.image)+'" alt="'+escape(en?featured.en:featured.pt)+'"></button>'+
 '<div class="v8-feature-info"><p class="v8-eyebrow" data-v8-family>'+escape(en?featured.familyEn:featured.familyPt)+'</p><h2 data-v8-feature-title>'+escape(en?featured.en:featured.pt)+'</h2>'+
 '<p class="v8-feature-note">'+note+'</p><div class="v8-actions"><button type="button" data-v8-step="-1" aria-label="'+(en?'Previous':'Anterior')+'">←</button><button type="button" data-v8-step="1" aria-label="'+(en?'Next':'Próximo')+'">→</button>'+
 '<a class="v8-feature-link" data-v8-feature-link href="'+featuredLink+'">'+(en?'View historical record ↗':'Abrir ficha histórica ↗')+'</a></div></div></section>'+
 '<nav class="v8-jumps" aria-label="'+(en?'Jump to family':'Ir para família')+'">'+jump+'</nav>'+
 '<div class="v8-continuous">'+rails+'</div>'+
 '</main><dialog class="v8-lightbox" data-v8-lightbox aria-label="'+(en?'Image viewer':'Visualizador de imagens')+'">'+
 '<button class="v8-close" type="button" data-v8-close aria-label="'+(en?'Close':'Fechar')+'">×</button>'+
 '<img class="v8-lightbox-image" data-v8-dialog-img alt=""><h2 data-v8-dialog-title></h2>'+
 '<div class="v8-actions"><button type="button" data-v8-dialog-step="-1" aria-label="'+(en?'Previous':'Anterior')+'">←</button>'+
 '<a class="v8-feature-link" data-v8-dialog-link href="'+featuredLink+'">'+(en?'View historical record ↗':'Abrir ficha histórica ↗')+'</a>'+
 '<button type="button" data-v8-dialog-step="1" aria-label="'+(en?'Next':'Próximo')+'">→</button></div></dialog>'+
 '<footer class="v8-bottom"><a href="/habbo/'+lang+'/#lugares">'+(en?'Back to museum':'Voltar ao museu')+'</a><p>'+disclaimer+'</p></footer></body></html>';
 const route=kind==='rares'?(en?'en/rares/index.html':'pt-br/raros/index.html'):
   (en?'en/badges/index.html':'pt-br/emblemas/index.html');
 write(dist,route,html);
 return {kind,route,count:items.length,groups:groups.length};
}
function homeItem(item,kind,en,ordinal) {
 const label=en?item.en:item.pt, group=en?item.familyEn:item.familyPt;
 const detail=kind==='raros'
  ?'/habbo/'+(en?'en/rare/':'pt-br/raro/')+item.id+'/'
  :'/habbo/'+(en?'en/badge/':'pt-br/emblema/')+'classic-'+String(item.id).toLowerCase()+'/';
 return '<a class="v9-home-item" role="listitem" href="'+detail+'" data-v9-item data-v9-id="'+escape(item.id)+
  '" data-v9-title="'+escape(label)+'" data-v9-family="'+escape(group)+
  '" data-v9-image="'+escape(item.image)+'" data-v9-link="'+detail+'" data-v9-ordinal="'+ordinal+
  '" aria-label="'+escape((en?'Inspect ':'Inspecionar ')+label)+'">'+
  '<span class="v9-item-art"><img loading="lazy" decoding="async" src="'+escape(item.image)+'" alt=""></span>'+
  '<span class="v9-item-caption">'+escape(label)+'</span></a>';
}
function homeChapter(id,title,description,items,en,route) {
 const kind=id, groups=groupMap(items), lang=en?'en':'pt-br', isBadge=id==='emblemas';
 const label=en?(isBadge?'badges':'rares'):(isBadge?'emblemas':'raros');
 const jump=groups.map((group,index)=>'<a href="#'+id+'-family-'+escape(group.id)+
  '" aria-label="'+escape((en?'Go to ':'Ir para ')+(en?group.en:group.pt))+'">'+
  escape(en?group.en:group.pt)+'<small>'+group.items.length+'</small></a>').join('');
 const sections=groups.map((group,index)=>{
  const groupTitle=en?group.en:group.pt, anchor=id+'-family-'+group.id;
  return '<section class="v9-family" id="'+escape(anchor)+'" data-v9-family-section aria-labelledby="'+escape(anchor)+'-title">'+
   '<div class="v9-group-heading"><div class="v9-group-copy"><span class="v9-group-index">'+String(index+1).padStart(2,'0')+' / '+String(groups.length).padStart(2,'0')+
   '</span><h3 id="'+escape(anchor)+'-title">'+escape(groupTitle)+'</h3>'+
   '<p>'+group.items.length+' '+(en?(group.items.length===1?'piece':'pieces'):(group.items.length===1?'peça':'peças'))+'</p></div>'+
   '<div class="v9-group-controls" aria-label="'+escape(groupTitle)+'">'+
   '<button type="button" data-v9-slide="-1" aria-label="'+(en?'Scroll back':'Deslizar para trás')+'">←</button>'+
   '<button type="button" data-v9-slide="1" aria-label="'+(en?'Scroll forward':'Deslizar para frente')+'">→</button></div></div>'+
   '<div class="v9-group-rail v8-home-rail'+(isBadge?' v9-badge-rail':' v9-rare-rail')+
   '" role="list" data-v9-rail aria-label="'+escape(groupTitle)+'">'+
   group.items.map(item=>homeItem(item,id,en,items.indexOf(item)+1)).join('')+
   '</div></section>';
 }).join('');
 return '<section class="v8-home-chapter v9-home-archive" id="'+id+'" data-v9-chapter="'+id+'" aria-labelledby="v8-title-'+id+'">'+
 '<div class="v8-chapter-head"><div><p class="v8-overline">'+(isBadge?(en?'BADGES':'EMBLEMAS'):(en?'FURNITURE':'MOBIS'))+' · 2000–2011</p>'+
 '<h2 id="v8-title-'+id+'">'+title+'</h2><p>'+description+'</p>'+
 '<p class="v9-archive-total">'+items.length+' '+(en?'pieces across ':'peças · ')+groups.length+' '+(en?'families':'famílias')+'</p></div>'+
 '<a class="v8-full-collection" href="/habbo/'+lang+'/'+route+'/">'+(en?'Standalone collection':'Coleção separada')+' ↗</a></div>'+
 '<nav class="v9-family-index" aria-label="'+(en?'Jump to a family of ':'Ir para uma família de ')+label+'">'+jump+'</nav>'+
 '<div class="v9-families">'+sections+'</div></section>';
}
export function buildUnified({root,dist}) {
 const rare=rareItems(root), badge=badgeItems(root);
 const outcomes=[renderCollection(root,dist,'rares',false),renderCollection(root,dist,'rares',true),
  renderCollection(root,dist,'badges',false),renderCollection(root,dist,'badges',true)];
 for(const [file,en] of [['index.html',false],['pt-br/index.html',false],['en/index.html',true]]){
  const target=path.join(dist,file); if(!fs.existsSync(target))throw Error('Missing homepage '+file);
  let html=fs.readFileSync(target,'utf8');
  // This operation is idempotent: a rebuild replaces the previous V8 chapters.
  html=html.replace(/<div class="v8-home-chapters"[\s\S]*?<!-- END V8 HOME CHAPTERS -->/g,'');
  html=html.replace(/<link rel="stylesheet" href="\/habbo\/assets\/v8-home.css">/g,'');
  html=html.replace(/<script defer src="\/habbo\/assets\/v9-home.js"><\/script>/g,'');
  html=html.replace('id="lugares" ','');
  html=html.replace('<section class="cinematic-dock"','<section id="lugares" class="cinematic-dock"');
  const lang=en?'en':'pt-br';
  const chapter='<div class="v8-home-chapters">'+
   homeChapter('raros',en?'Classic rares':'Raros clássicos',
    en?'The furniture we dreamed of owning.':'Os mobis que a gente sonhava em ter.',
    rare,en,en?'rares':'raros')+
   homeChapter('emblemas',en?'Classic badges':'Emblemas clássicos',
    en?'Symbols of belonging, discovery and achievement.':'Símbolos de pertencimento, descobertas e conquistas.',
    badge,en,en?'badges':'emblemas')+
   '</div><!-- END V8 HOME CHAPTERS -->';
  const end=html.lastIndexOf('</main>');if(end<0)throw Error('Missing main on '+file);
  html=html.slice(0,end)+chapter+html.slice(end);
  const v9Dialog='<dialog class="v9-home-dialog" data-v9-dialog aria-label="'+(en?'Historical specimen viewer':'Visualizador de peça histórica')+'">'+
   '<button class="v9-dialog-close" type="button" data-v9-close aria-label="'+(en?'Close':'Fechar')+'">×</button>'+
   '<p class="v9-dialog-family" data-v9-dialog-family></p><img class="v9-dialog-image" data-v9-dialog-image alt="">'+
   '<h3 data-v9-dialog-title></h3><p class="v9-dialog-counter" data-v9-dialog-counter aria-live="polite"></p>'+
   '<div class="v9-dialog-controls"><button type="button" data-v9-dialog-step="-1" aria-label="'+(en?'Previous':'Anterior')+'">←</button>'+
   '<a href="#" data-v9-dialog-link>'+(en?'Historical record and sources ↗':'Ficha histórica e fontes ↗')+'</a>'+
   '<button type="button" data-v9-dialog-step="1" aria-label="'+(en?'Next':'Próximo')+'">→</button></div></dialog>';
  html=html.replace('</main>', '</main>'+v9Dialog);
  html=html.replace('</head>','<link rel="stylesheet" href="/habbo/assets/v8-home.css"><script defer src="/habbo/assets/v9-home.js"></script></head>');
  const rewrites=[
   [en?'/habbo/en/rares/':'/habbo/pt-br/raros/','#raros'],
   [en?'/habbo/en/badges/':'/habbo/pt-br/emblemas/','#emblemas']
  ];
  // Only redirect header collection chapter links; collection details still have normal routes.
  for(const [old,targetHref] of rewrites)html=html.replace('<a href="'+old+'">','<a href="'+targetHref+'">');
  write(dist,file,html);
 }
 // Only the international/cross-hotel corpus is presented; regional V5 routes
 // and old regional sprite files are pruned from the GENERATED Pages output.
 for(const locale of ['pt-br/emblema','en/badge']){
  const dir=path.join(dist,locale);
  if(fs.existsSync(dir))for(const name of fs.readdirSync(dir)){
   if(name.startsWith('badge-br'))fs.rmSync(path.join(dir,name),{recursive:true,force:true});
  }
 }
 const regional=path.join(dist,'assets/v5/badges');
 if(fs.existsSync(regional))fs.rmSync(regional,{recursive:true,force:true});
 for(const [source,dest] of [['v8/museum.css','assets/v8-museum.css'],
  ['v8/museum.js','assets/v8-museum.js'],['v8/home.css','assets/v8-home.css'],['v9/home.js','assets/v9-home.js']]){
  fs.copyFileSync(path.join(root,source),path.join(dist,dest));
 }
 return {outcomes,homepage:['index.html','pt-br/index.html','en/index.html'],regionalPublished:0};
}
