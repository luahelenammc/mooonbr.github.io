import fs from 'node:fs';
import path from 'node:path';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function sourceBackedTile(person,en){
 if(!person.spriteArchive)throw Error('Historical avatar source attribution required for '+person.id);
 const alt=en?'Archival Habbo sprite associated with '+person.name:'Sprite de arquivo associado a '+person.name;
 return '<li class="v17-staff-item" data-v17-person="'+esc(person.id)+'" id="staff-'+esc(person.id)+'">'+
   '<a class="v17-staff-link" href="'+esc(person.spriteArchive)+'" target="_blank" rel="noopener noreferrer" title="'+esc(en?'View archival source':'Ver fonte do sprite')+'">'+
   '<span class="v17-staff-stage">'+(person.sprite&&person.spriteSha256
    ?'<img src="'+esc(person.sprite)+'" alt="'+esc(alt)+'" width="'+Number(person.spriteWidth)+'" height="'+Number(person.spriteHeight)+'" loading="lazy" decoding="async">'
    :'<span class="v17-staff-unverified" aria-label="'+esc(en?person.spriteStatusEn:person.spriteStatusPt)+'">'+esc(en?'Sprite not archived':'Sprite não preservado')+'</span>')+'</span>'+
   '<span class="v17-staff-name">'+esc(person.name)+'</span></a></li>';
}
export function renderStaffChapter(manifest,en){
 if(manifest.profiles.length!==12)throw Error('Staff chapter must show 12 actual source-backed Habbo avatars');
 const lang=en?'en':'pt-br';
 const intro=en?'The familiar avatars behind the Brazilian hotel.':'Os personagens que marcaram a história do Habbo brasileiro.';
 const body=manifest.profiles.map(p=>sourceBackedTile(p,en)).join('');
 return '<section class="v8-home-chapter v16-staff-chapter v17-staff-chapter" id="gerentes" aria-labelledby="v17-staff-title">'+
  '<header class="v8-chapter-head v17-staff-intro"><div>'+
   '<p class="v8-overline">'+(en?'BEHIND THE HOTEL':'QUEM FAZIA O HOTEL VIVER')+'</p>'+
   '<h2 id="v17-staff-title">'+esc(en?manifest.titleEn:manifest.titlePt)+'</h2>'+
   '<p>'+esc(intro)+'</p></div></header>'+
  '<div class="v17-staff-rail-head"><span>'+ (en?'Classic Habbo BR staff':'Staff clássica do Habbo BR') +'</span>'+
   '<div class="v17-staff-controls" aria-label="'+(en?'Browse staff sprites':'Navegar pelos sprites')+'">'+
    '<button class="v17-staff-arrow" type="button" data-v17-prev aria-label="'+(en?'Previous avatars':'Avatares anteriores')+'">‹</button>'+
    '<button class="v17-staff-arrow" type="button" data-v17-next aria-label="'+(en?'Next avatars':'Próximos avatares')+'">›</button>'+
   '</div></div>'+
  '<div class="v17-staff-viewport" tabindex="0" role="region" aria-label="'+(en?'Horizontal classic manager sprite gallery':'Galeria horizontal de sprites dos gerentes clássicos')+'">'+
   '<ul class="v17-staff-rail">'+body+'</ul></div>'+
  '</section>';
}
export function renderStaffStandalone(root,dist){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'v16/staff-manifest.json'),'utf8')),written=[];
 for(const en of [false,true]){
  const lang=en?'en':'pt-br',route=en?'managers':'gerentes',title=en?manifest.titleEn:manifest.titlePt;
  const chapter=renderStaffChapter(manifest,en);
  const labels=en?['Public Spaces','Rares','Badges','Managers']:['Espaços Públicos','Raros','Emblemas','Gerentes'];
  const hashes=['lugares','raros','emblemas','gerentes'];
  const nav=hashes.map((hash,i)=>'<a href="/habbo/'+lang+'/#'+hash+'">'+esc(labels[i])+'</a>').join('');
  const html='<!doctype html><html lang="'+(en?'en':'pt-BR')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
   '<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#101520">'+
   '<title>'+esc(title)+' · Habbo Museu Vivo</title>'+
   '<link rel="stylesheet" href="/habbo/assets/v8-museum.css"><link rel="stylesheet" href="/habbo/assets/v13-home.css?v=20261019-v15.1">'+
   '<link rel="stylesheet" href="/habbo/assets/v16-staff.css?v=20261019-v16.1">'+
   '<link rel="stylesheet" href="/habbo/assets/v17-staff-rail.css?v=20261019-v17.1">'+
   '<script defer src="/habbo/assets/v8-museum.js?v=20261019-v16.1"></script>'+
   '<script defer src="/habbo/assets/v17-staff-rail.js?v=20261019-v17.1"></script></head>'+
   '<body class="v16-staff-standalone v17-staff-standalone"><a class="v8-skip" href="#gerentes">'+(en?'Skip to sprites':'Ir aos sprites')+'</a>'+
   '<header class="v8-top"><a class="v8-wordmark" href="/habbo/'+lang+'/"><span class="v8-glyph">✦</span> Habbo <small>'+(en?'Memory museum':'Museu vivo')+'</small></a>'+
   '<nav class="v8-top-links" aria-label="'+(en?'Museum navigation':'Navegação do museu')+'">'+nav+'</nav></header>'+
   '<main class="v8-home-chapters">'+chapter+'</main>'+
   '<footer class="v8-bottom"><a href="/habbo/'+lang+'/">'+(en?'← Back to museum':'← Voltar ao museu')+'</a>'+
   '<p>This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. Historical assets remain the property of their respective owners.</p></footer>'+
   '</body></html>';
  const target=path.join(dist,lang,route,'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
  written.push(lang+'/'+route+'/index.html');
 }
 return written;
}
