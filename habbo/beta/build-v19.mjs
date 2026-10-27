import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Build the V19 composition from the latest approved museum generated pages.
// Never duplicate or re-invent historical records; treat V17/V18 data as read-only.
function renderV19(source,en){
  const locale=en?"en":"pt-br", root=en?"/habbo/beta/en/":"/habbo/beta/";
  const esc=s=>String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const nativeBlock=(start,tag)=>{
    const ix=source.indexOf(start);
    if(ix<0)throw Error("Missing source marker: "+start);
    const re=new RegExp("<(/?)"+tag+"\\b[^>]*>","g");
    re.lastIndex=ix;
    let depth=0,match;
    while((match=re.exec(source))){
      depth+=match[1]?-1:1;
      if(depth===0)return source.slice(ix,re.lastIndex);
      if(depth<0)throw Error("Malformed "+tag+" at "+start);
    }
    throw Error("Unclosed "+tag+" "+start);
  };
  const localize=s=>s
   .replaceAll('data-home-locale="pt-br" href="/habbo/pt-br/"','data-home-locale="pt-br" href="/habbo/beta/"')
   .replaceAll('data-home-locale="en" href="/habbo/en/"','data-home-locale="en" href="/habbo/beta/en/"');
  const dock=nativeBlock('<section id="lugares" class="cinematic-dock"',"section");
  const roomDialog=localize(nativeBlock('<dialog class="room-lightbox"',"dialog"));
  const v9Dialog=nativeBlock('<dialog class="v9-home-dialog"',"dialog");
  const sections=["raros","emblemas","gerentes"].map((id,index)=>{
    const st=source.indexOf('<section class="v8-home-chapter',source.indexOf('<div class="v8-home-chapters">'));
    const first=source.indexOf('<section class="v8-home-chapter',st+(index?1:0));
    // locate by id, preserving all nested family rails and the Staff chapter
    const idx=source.indexOf(' id="'+id+'"',st);
    if(idx<0)throw Error("Missing source collection "+id);
    const segmentStart=source.lastIndexOf('<section class="v8-home-chapter',idx);
    if(segmentStart<0||segmentStart>idx)throw Error("Unexpected source chapter: "+id);
    // block parser variant accepts an offset instead of relying on unique markup
    const chunk=source.slice(segmentStart);
    const re=/<(\/?)section\b[^>]*>/g;
    let depth=0,m,end=-1;
    while((m=re.exec(chunk))){depth+=m[1]?-1:1;if(depth===0){end=re.lastIndex;break;}}
    if(end<0)throw Error("Missing closing chapter "+id);
    const raw=chunk.slice(0,end);
    if(!raw.startsWith('<section class="v8-home-chapter')||!raw.includes(' id="'+id+'"'))throw Error("Bad chapter extraction "+id);
    const topTagEnd=raw.indexOf('>');
    const label=(en?["02 · COLLECTIBLES","03 · ACHIEVEMENTS","04 · PEOPLE"]:["02 · COLEÇÕES","03 · CONQUISTAS","04 · PERSONAGENS"])[index];
    return raw.slice(0,topTagEnd+1)+'<div class="v19-chapter-ident" aria-hidden="true"><span>'+label+'</span><i></i></div>'+raw.slice(topTagEnd+1);
  });
  const totals={rare:(sections[0].match(/data-v9-item(?=\s|>)/g)||[]).length,badge:(sections[1].match(/data-v9-item(?=\s|>)/g)||[]).length,staff:(sections[2].match(/data-v17-person=/g)||[]).length};
  if(totals.rare!==148||totals.badge!==101||totals.staff!==12)throw Error("Collection source totals mismatch "+JSON.stringify(totals));
  if(!dock.includes('data-total="29"')||!dock.includes('data-item-total="36"')||!dock.includes('data-autoplay-ms="4000"'))throw Error("Native Dock contract changed");
  if(!sections[2].includes('flecha-hc-room.gif')||!sections[2].includes('prefeita-classic.gif'))throw Error("Canonical Staff assets missing");
  const labels=en?{
    title:"Habbo Archive / Night Hotel",description:"An independent classic Habbo memory museum. Rooms, rares, badges and classic Staff.",
    brand:"HABBO",sub:"MEMORY ARCHIVE",status:"INDEPENDENT ARCHIVE",rooms:"Rooms",rares:"Rares",badges:"Badges",staff:"Staff",
    year:"2000—2011",classic:"Classic edition",pt:"Português do Brasil",en:"English",
    eyebrow:"HABBO MUSEUM · NIGHT EDITION",headline:"Step back inside.",headlineB:"The Hotel is here.",
    intro:"From the public rooms to the rare furniture and badges: explore the Hotel and the people who shaped it.",
    begin:"Browse rooms",browse:"Explore rares",stage:"PUBLIC SPACES",stageSub:"ARCHIVE PLAYER / 36 SCENES",
    hint:"Navigate with the arrows or open any room to inspect the original archive.",real:"ARCHIVED PIXELS · ORIGINAL SOURCES",
    footerA:"Independent fan-made memory museum.",footerB:"Not an official Habbo or Sulake experience.",back:"Classic light edition",
    locale:"Language",placesA:"29 room groups",rareA:"148 furniture pieces",badgeA:"101 badges",peopleA:"12 Staff characters"
  }:{
    title:"Arquivo Habbo / Night Hotel",description:"Museu independente do Habbo clássico. Salas, raros, emblemas e personagens da Staff.",
    brand:"HABBO",sub:"ARQUIVO DE MEMÓRIAS",status:"ARQUIVO INDEPENDENTE",rooms:"Salas",rares:"Raros",badges:"Emblemas",staff:"Gerentes",
    year:"2000—2011",classic:"Edição Classic",pt:"Português do Brasil",en:"English",
    eyebrow:"MUSEU HABBO · EDIÇÃO NOTURNA",headline:"Entre de novo.",headlineB:"O Hotel está aqui.",
    intro:"Das salas públicas aos mobis raros e emblemas: explore o Hotel e as pessoas que fizeram parte dele.",
    begin:"Explorar salas",browse:"Ver raros",stage:"ESPAÇOS PÚBLICOS",stageSub:"ARQUIVO INTERATIVO / 36 CENAS",
    hint:"Use as setas ou abra qualquer sala para consultar o registro histórico.",real:"PIXELS DE ÉPOCA · FONTES ORIGINAIS",
    footerA:"Museu de memória independente, feito por fãs.",footerB:"Não é uma experiência oficial do Habbo ou da Sulake.",back:"Edição Classic iluminada",
    locale:"Idioma",placesA:"29 grupos de salas",rareA:"148 mobis",badgeA:"101 emblemas",peopleA:"12 gerentes clássicos"
  };
  const tabs=[["#lugares",labels.rooms],["#raros",labels.rares],["#emblemas",labels.badges],["#gerentes",labels.staff]]
    .map(([href,text],i)=>'<a href="'+href+'"'+(i===0?' aria-current="page"':'')+'>'+esc(text)+'</a>').join("");
  const flag=(l,url,alt,active)=>'<a class="lang-button'+(active?' is-active':'')+'" data-lang="'+l+'" data-home-locale="'+l+'" href="'+url+'" aria-label="'+esc(alt)+'" title="'+esc(alt)+'" aria-current="'+(active?'page':'false')+'"><img src="/habbo/assets/flag-'+(l==="en"?"us":"br")+'.svg" alt="" aria-hidden="true" width="24" height="16"></a>';
  const langNav='<nav class="lang-toggle" aria-label="'+esc(labels.locale)+'">'+flag("pt-br","/habbo/beta/",labels.pt,!en)+flag("en","/habbo/beta/en/",labels.en,en)+'</nav>';
  const rights='<p class="rights-disclaimer">This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. This fan site may use the trademarks and other intellectual property of Habbo, which is permitted under Habbo Fan Site Policy.</p>';
  return `<!doctype html><html lang="${en?"en":"pt-BR"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#081016"><meta name="description" content="${esc(labels.description)}"><title>${esc(labels.title)}</title><link rel="stylesheet" href="/habbo/assets/site-20260823-v4-group-columns.css?v=20260823-v4-group-columns"><link rel="stylesheet" href="/habbo/assets/v5-home.css"><link rel="stylesheet" href="/habbo/assets/v13-home.css?v=20261019-v15.1"><link rel="stylesheet" href="/habbo/assets/v17-staff.css?v=20261019-v17.1"><link rel="stylesheet" href="/habbo/beta/v19-night.css?v=20261027-night-refined"><script defer src="/habbo/assets/v13-home.js?v=20261019-v16.1"></script><script defer src="/habbo/assets/v17-staff.js?v=20261019-v17.1"></script></head><body class="habbo-v19-night" data-page="home" data-locale="${locale}" data-root-entry="false"><div class="site-shell"><header class="site-header v19-topbar"><a class="identity" href="${root}" aria-label="${en?"Night Hotel homepage":"Página inicial Night Hotel"}"><span class="v19-monogram" aria-hidden="true">H</span><span class="identity-copy"><strong>${labels.brand}</strong><small>${labels.sub}</small></span></a><nav class="collection-switch" aria-label="${en?"Museum collections":"Coleções do museu"}">${tabs}</nav><div class="v19-meta"><span class="v19-era">${labels.year}</span>${langNav}<a class="v19-classic-link" href="/habbo/beta/${en?"en/":""}classic.html">${esc(labels.classic)} <span aria-hidden="true">↗</span></a></div></header><main class="home-page home-page--v2"><div class="v19-masthead"><span><i class="v19-status-dot" aria-hidden="true"></i>${labels.status}</span><span>${labels.year} <b aria-hidden="true">/</b> NIGHT HOTEL</span></div><section class="v19-theatre" aria-labelledby="v19-intro-title"><aside class="v19-story"><p class="v19-eyebrow">${labels.eyebrow}</p><h1 id="v19-intro-title">${labels.headline}<br><em>${labels.headlineB}</em></h1><p class="v19-summary">${labels.intro}</p><div class="v19-actions"><a href="#lugares" class="v19-button v19-button--orange">${labels.begin}<span aria-hidden="true">↗</span></a><a href="#raros" class="v19-button v19-button--ghost">${labels.browse}<span aria-hidden="true">→</span></a></div><div class="v19-index" aria-label="${en?"Archive contents":"Conteúdo do acervo"}"><span>${labels.placesA}</span><span>${labels.rareA}</span><span>${labels.badgeA}</span><span>${labels.peopleA}</span></div></aside><div class="v19-stage"><header class="v19-stagebar"><span class="v19-stage-ident"><span class="v19-corner-glyph" aria-hidden="true">▦</span>${labels.stage}</span><span class="v19-stage-count">${labels.stageSub}</span><span class="v19-window-mark" aria-hidden="true"><i></i><i></i></span></header><h2 id="home-title" class="sr-only">${en?"Classic Habbo public rooms":"Espaços Públicos clássicos do Habbo"}</h2>${dock}<div class="v19-stage-note"><span>${labels.hint}</span><span>${labels.real}</span></div></div></section>${roomDialog}<div class="v8-home-chapters v19-collections">${sections.join("")}</div></main>${v9Dialog}<footer class="site-footer site-footer--v2 v19-footer"><div class="v19-footer-inner"><div><strong>HABBO / NIGHT HOTEL</strong><p>${labels.footerA} ${labels.footerB}</p></div><div class="v19-footer-links"><a href="/habbo/beta/${en?"en/":""}classic.html">${labels.back} ↗</a><a href="/habbo/${en?"en":"pt-br"}/">${en?"Public museum":"Museu público"} ↗</a></div>${rights}</div></footer></div><script src="/habbo/assets/site-20260823-v4-group-columns.js?v=20260823-v4-group-columns" defer></script></body></html>`;
}
const here=path.dirname(fileURLToPath(import.meta.url));
const base=path.resolve(here,'..');
const pairs=[['pt-br/index.html','index.html',false],['en/index.html','en/index.html',true]];
const check=process.argv.includes('--check');
for(const [source,out,en] of pairs){
 const html=renderV19(fs.readFileSync(path.join(base,source),'utf8'),en);
 const output=path.join(here,out);
 if(check){if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==html)throw Error('Stale V19 output: '+out);}
 else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,html);}
 console.log('V19_'+(check?'CHECK':'BUILD')+' '+out+' '+html.length+' bytes');
}
