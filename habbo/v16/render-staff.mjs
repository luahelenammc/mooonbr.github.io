import fs from 'node:fs';
import path from 'node:path';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function profileCard(person,en,index){
 const note=en?person.en:person.pt,role=en?person.roleEn:person.rolePt;
 const sources=person.sources.map((url,i)=>{
  const label=i===0?(en?'Moon’s original post':'Post original da Moon'):(en?'Historical reference '+i:'Referência histórica '+i);
  return '<a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(label)+' ↗</a>';
 }).join('');
 return '<article class="v16-person" data-v16-person="'+esc(person.id)+'" id="staff-'+esc(person.id)+'">'+
  '<div class="v16-person-heading"><div class="v16-person-mark" aria-hidden="true"><span>✦</span><small>HABBO BR</small></div>'+
  '<div class="v16-person-identity"><p class="v16-person-role">'+esc(role)+'</p><h4>'+esc(person.name)+'</h4></div></div>'+
  '<p class="v16-person-note">'+esc(note)+'</p>'+
  '<details class="v16-person-details"><summary>'+(en?'Historical references':'Fontes e contexto')+' <span aria-hidden="true">↗</span></summary><div class="v16-person-sources">'+sources+'</div></details></article>';
}
export function renderStaffChapter(manifest,en){
 if(manifest.profiles.length!==12||manifest.groups.length!==3)throw Error('V16 staff manifest requires 12 historical names across three editorial groups');
 const grouped=manifest.groups.map(group=>{
  const people=manifest.profiles.filter(person=>person.group===group.id);
  if(!people.length)throw Error('Empty staff group '+group.id);
  return '<section class="v16-staff-era" id="staff-'+esc(group.id)+'" aria-labelledby="staff-'+esc(group.id)+'-title">'+
   '<div class="v16-era-head"><div><p class="v16-era-period">'+esc(group.period)+'</p><h3 id="staff-'+esc(group.id)+'-title">'+esc(en?group.en:group.pt)+'</h3>'+
   '<p>'+esc(en?group.subtitleEn:group.subtitlePt)+'</p></div><span class="v16-era-line" aria-hidden="true"></span></div>'+
   '<div class="v16-staff-grid">'+people.map(p=>profileCard(p,en)).join('')+'</div></section>';
 }).join('');
 const intro=en?'Behind the crowded Theatre, the competitions and the news there were actual people. These are the twelve names remembered in Moon’s essay, not a claim to list every person who worked at the hotel.':
  'Por trás do Teatro lotado, das competições e das notícias havia gente de verdade. Aqui estão os doze nomes lembrados no post da Moon, não uma lista de todas as pessoas que trabalharam no hotel.';
 const lang=en?'en':'pt-br', standalone=en?'managers':'gerentes';
 return '<section class="v8-home-chapter v16-staff-chapter" id="gerentes" aria-labelledby="v16-staff-title">'+
  '<header class="v8-chapter-head v16-staff-intro"><div>'+
   '<p class="v8-overline">'+(en?'PEOPLE WHO KEPT THE HOTEL ALIVE':'AS PESSOAS QUE FAZIAM O HOTEL VIVER')+'</p>'+
   '<h2 id="v16-staff-title">'+esc(en?manifest.titleEn:manifest.titlePt)+'</h2>'+
   '<p>'+esc(intro)+'</p></div>'+
   '<a class="v8-full-collection" href="/habbo/'+lang+'/'+standalone+'/">'+(en?'Read the staff archive ↗':'Ver arquivo da Staff ↗')+'</a></header>'+
  '<p class="v16-editorial-caveat">'+esc(en?manifest.editorialNoteEn:manifest.editorialNotePt)+'</p>'+
  '<div class="v16-staff-eras">'+grouped+'</div>'+
  '<aside class="v16-staff-postscript"><p class="v16-staff-label">'+(en?'THE MODERATION TEAM':'E A MODERAÇÃO?')+'</p><p>'+
  esc(en?manifest.moderators.en:manifest.moderators.pt)+'</p></aside>'+
  '<footer class="v16-staff-footer"><p>'+(en?'Moon’s essay recalls an early-team video by Emiseis and interviews by Igor Saringer with 4Queijos, Disco-Lee and MissFurby. Follow the links in the original article; no unverified interview URLs have been reconstructed.':
    'O post lembra um vídeo de Emiseis sobre a equipe pioneira e as entrevistas de Igor Saringer com 4Queijos, Disco-Lee e MissFurby. Os links estão no texto original; nenhuma URL não verificada foi inventada.')+'</p>'+
  '<a href="'+esc(manifest.sourceBlog)+'" target="_blank" rel="noopener noreferrer">'+(en?'Read Moon’s original Habbo retrospective':'Ler o post original da Moon')+' ↗</a></footer></section>';
}
export function renderStaffStandalone(root,dist){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'v16/staff-manifest.json'),'utf8'));
 const documents=[];
 for(const en of [false,true]){
  const lang=en?'en':'pt-br',route=en?'managers':'gerentes';
  const title=en?manifest.titleEn:manifest.titlePt;
  const chapter=renderStaffChapter(manifest,en);
  const nav=en?['Public Spaces','Rares','Badges','Managers']:['Espaços Públicos','Raros','Emblemas','Gerentes'];
  const items=[['#lugares',nav[0]],['#raros',nav[1]],['#emblemas',nav[2]],['#gerentes',nav[3]]];
  const navHtml=items.map(([hash,label])=>'<a href="/habbo/'+lang+'/'+hash+'">'+esc(label)+'</a>').join('');
  const html='<!doctype html><html lang="'+(en?'en':'pt-BR')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
   '<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#101520">'+
   '<title>'+esc(title)+' · Habbo Museu Vivo</title>'+
   '<link rel="stylesheet" href="/habbo/assets/v8-museum.css"><link rel="stylesheet" href="/habbo/assets/v13-home.css?v=20261019-v15.1">'+
   '<link rel="stylesheet" href="/habbo/assets/v16-staff.css?v=20261019-v16.1"><script defer src="/habbo/assets/v8-museum.js?v=20261019-v16.1"></script></head>'+
   '<body class="v16-staff-standalone"><a class="v8-skip" href="#gerentes">'+(en?'Skip to staff':'Ir para a Staff')+'</a>'+
   '<header class="v8-top"><a class="v8-wordmark" href="/habbo/'+lang+'/"><span class="v8-glyph">✦</span> Habbo <small>'+(en?'Memory museum':'Museu vivo')+'</small></a>'+
   '<nav class="v8-top-links" aria-label="'+(en?'Museum navigation':'Navegação do museu')+'">'+navHtml+'</nav></header>'+
   '<main class="v8-home-chapters">'+chapter+'</main>'+
   '<footer class="v8-bottom"><a href="/habbo/'+lang+'/">'+(en?'← Back to museum':'← Voltar ao museu')+'</a>'+
   '<p>This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. Historical assets remain the property of their respective owners.</p></footer>'+
   '</body></html>';
  const target=path.join(dist,lang,route,'index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
  documents.push(lang+'/'+route+'/index.html');
 }
 return documents;
}
