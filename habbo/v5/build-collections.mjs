import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifiedCandidateRecords} from '../v6/release-candidates.mjs';
const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rights = new Set(['approved_under_policy','cleared_by_permission']);
export function validateCollection(records, {root} = {}) {
 if (!Array.isArray(records)) throw new Error('Collection must be an array');
 const ids = new Set();
 for (const r of records) {
  if (!/^[a-zA-Z0-9_-]+$/.test(r.id || '') || ids.has(r.id)) throw new Error(`Invalid/duplicate id: ${r.id}`); ids.add(r.id);
  if (r.cutoffStatus !== 'verified_pre2012') throw new Error(`Unverified cutoff: ${r.id}`);
  if (!['unknown','br_probable','international_only','br_documented'].includes(r.hotelStatus)) throw new Error(`Invalid hotel status: ${r.id}`);
  if (typeof r.year === 'number' && (!Number.isInteger(r.year) || r.year > 2011 || r.year < 1999)) throw new Error(`Invalid historical year: ${r.id}`);
  for (const key of ['year','firstDocumentedInternationalReleaseDate','originalIssueDate']) {
   const years=JSON.stringify(r[key] ?? '').match(/\b(?:19|20)\d{2}\b/g) || [];
   if (years.some(year=>Number(year)>2011)) throw new Error(`Post-cutoff historical date: ${r.id}: ${key}`);
  }
  if (!rights.has(r.rightsStatus)) throw new Error(`Unapproved rights: ${r.id}: ${r.rightsStatus}`);
  if (!r.name?.ptBr || !r.name?.en || !Array.isArray(r.provenanceRefs) || !r.provenanceRefs.length) throw new Error(`Missing names/provenance: ${r.id}`);
  for (const ref of r.provenanceRefs) if (!/^https?:\/\//.test(typeof ref === 'string' ? ref : ref.url || '')) throw new Error(`Invalid provenance: ${r.id}`);
  if (!/^\/habbo\/assets\/v5\/[a-zA-Z0-9_./-]+$/.test(r.image || '') || r.image.includes('..')) throw new Error(`Nonlocal image: ${r.id}`);
  if (root && !fs.existsSync(path.join(root, r.image.replace(/^\/habbo\//,'')))) throw new Error(`Missing image: ${r.image}`);
 }
 return records;
}
export function buildCollections({root, dist, basePath = ''}) {
 basePath = basePath.replace(/\/$/,'');
 const out = (file,body) => {const p=path.join(dist,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body);};
 const local = url => basePath + url.replace(/^\/habbo/,'');
 const data = {};
 for (const kind of ['rares','badges']) {
  const p=path.join(root,'data',`v5-${kind}.json`);
  const raw=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):[];
  data[kind]=validateCollection(Array.isArray(raw)?raw:raw.items || raw.records, {root});
 }

 const releaseReceipt=path.join(root,'v6','asset-release-approval.json');
 let approvedOriginalSprites=false;
 if(fs.existsSync(releaseReceipt)){
  const receipt=JSON.parse(fs.readFileSync(releaseReceipt,'utf8'));
  const policyCondition=receipt.status==='conditional_policy_reuse' &&
    receipt.noncommercial===true && receipt.nonaffiliationDisclaimer===true &&
    receipt.individualPermissionClaimed===false &&
    receipt.evidenceUrl==='https://help.habbo.com/hc/en-us/articles/360011512480-Habbo-Fansite-Policy';
  if(!(receipt.status==='approved'||policyCondition)||!receipt.evidenceUrl||!/^https?:\/\//.test(receipt.evidenceUrl)){
   throw new Error('V6 rights approval receipt missing valid documented evidence');
  }
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'v6','expected-original-assets.json'),'utf8'));
  for(const asset of manifest.assets){
   const file=path.join(root,'..',asset.path);
   if(!fs.existsSync(file))throw new Error('V6 approved asset missing: '+asset.path);
   const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
   if(sha!==asset.sha256)throw new Error('V6 original asset integrity mismatch: '+asset.path);
  }
  approvedOriginalSprites=true;
  for(const asset of manifest.assets){
   const rel=asset.path.replace(/^habbo\//,'');
   const dest=path.join(dist,rel);
   fs.mkdirSync(path.dirname(dest),{recursive:true});
   fs.copyFileSync(path.join(root,'..',asset.path),dest);
  }
 }
 fs.mkdirSync(path.join(dist,'assets'),{recursive:true});

 const classicFile=path.join(root,'v7','classic-catalogue.json');
 let classics=null;
 if(fs.existsSync(classicFile)){
  classics=JSON.parse(fs.readFileSync(classicFile,'utf8'));
  if(!Array.isArray(classics.items)||classics.items.length<45)throw Error('Historic general badge gallery requires at least 45 verified originals');
  for(const item of classics.items){
   if(!/^[A-Z0-9_]+$/.test(item.code)||!/^\/habbo\/assets\/v7\/classic-badges\/[A-Z0-9_]+\.gif$/.test(item.image))throw Error('Invalid historical badge path: '+item.code);
   const file=path.join(root,item.image.replace(/^\/habbo\//,''));
   if(!fs.existsSync(file))throw Error('Historical badge GIF missing: '+item.code);
   const raw=fs.readFileSync(file);
   const hash=crypto.createHash('sha256').update(raw).digest('hex');
   if(hash!==item.sha256 || !['GIF87a','GIF89a'].includes(raw.subarray(0,6).toString('ascii')))throw Error('Historical badge integrity mismatch: '+item.code);
   const dest=path.join(dist,item.image.replace(/^\/habbo\//,''));
   fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);
  }
  const legacy=[
   'HC1','HC2','ACH_BasicClub1','ACH_BasicClub2','ACH_BasicClub3','ACH_BasicClub4','ACH_BasicClub5',
   'ACH_VipClub1','ACH_VipClub2','ACH_VipClub3','ACH_VipClub4','ACH_VipClub5','EHR'
  ].map(code=>{
   const family=code.startsWith('ACH_Vip')?'conquistas':code==='EHR'?'conquistas':'club';
   const pt=code.startsWith('ACH_BasicClub')?'Habbo Club · nível '+code.slice(-1):code.startsWith('ACH_VipClub')?'VIP · nível '+code.slice(-1):code==='EHR'?'Hora do Planeta':code==='HC1'?'Habbo Club':'Habbo Club Ouro';
   const en=code.startsWith('ACH_BasicClub')?'Habbo Club · level '+code.slice(-1):code.startsWith('ACH_VipClub')?'VIP · level '+code.slice(-1):code==='EHR'?'Earth Hour':code==='HC1'?'Habbo Club':'Habbo Club Gold';
   return {code,family,label:{ptBr:pt,en},image:'/habbo/assets/v6/badges/'+code+'.gif',
    sourceUrl:'https://images.habbo.com/c_images/album1584/'+code+'.gif',
    archiveSource:'https://habborator.org/badges/general.html',
    hotelDistribution:'not_verified_per_hotel'};
  });
  classics.items=[...classics.items,...legacy];
  fs.writeFileSync(path.join(dist,'assets','v7-classic-badges.json'),JSON.stringify(classics));
  for(const ext of ['css','js'])fs.copyFileSync(path.join(root,'v7',\`classic-display.\${ext}\`),path.join(dist,'assets',\`v7-classic-display.\${ext}\`));
 }

 for (const ext of ['css','js']) fs.copyFileSync(path.join(root,'v5',`collections.${ext}`),path.join(dist,'assets',`v5-collections.${ext}`));
 for (const ext of ['css','js']) fs.copyFileSync(path.join(root,'v6',`experience.${ext}`),path.join(dist,'assets',`v6-experience.${ext}`));
 for (const ext of ['css','js']) fs.copyFileSync(path.join(root,'v6',`global-badges.${ext}`),path.join(dist,'assets',`v6-global-badges.${ext}`));
 const route=(kind,en,id='')=>`${basePath}/${en?'en':'pt-br'}/${kind==='rares'?(id?(en?'rare':'raro'):(en?'rares':'raros')):(id?(en?'badge':'emblema'):(en?'badges':'emblemas'))}/${id?`${id}/`:''}`;
 const outputPath=(kind,en,id='')=>route(kind,en,id).slice(basePath.length+1)+'index.html';
 const title=(kind,en)=>kind==='rares'?(en?'Rare showroom':'Galeria de raros'):(en?'Badge constellation':'Constelação de emblemas');
 const shell=(en,kind,id,body)=>`<!doctype html><html lang="${en?'en':'pt-BR'}" data-v6-images-allowed="${approvedOriginalSprites}"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title(kind,en))} · Habbo Museu Vivo</title><link rel="stylesheet" href="${basePath}/assets/v5-collections.css"><script defer src="${basePath}/assets/v5-collections.js"></script><link rel="stylesheet" href="${basePath}/assets/v6-experience.css"><script defer src="${basePath}/assets/v6-experience.js"></script><link rel="stylesheet" href="${basePath}/assets/v6-global-badges.css"><script defer src="${basePath}/assets/v6-global-badges.js"></script>${classics?`<link rel="stylesheet" href="${basePath}/assets/v7-classic-display.css"><script defer src="${basePath}/assets/v7-classic-display.js"></script>`:""}</head><body><a class="skip" href="#main">${en?'Skip to collection':'Ir para coleção'}</a><header><a class="brand" href="${basePath}/${en?'en/':''}">HABBO <small>${en?'Living museum':'Museu vivo'}</small></a><nav aria-label="${en?'Collections':'Coleções'}"><a href="${basePath}/${en?'en/':''}">${en?'Places':'Lugares'}</a><a ${kind==='rares'?'aria-current="page"':''} href="${route('rares',en)}">${en?'Rares':'Raros'}</a><a ${kind==='badges'?'aria-current="page"':''} href="${route('badges',en)}">${en?'Badges':'Emblemas'}</a></nav><a hreflang="${en?'pt-BR':'en'}" href="${route(kind,!en,id)}"><img class="flag" src="${basePath}/assets/${en?'flag-br.svg':'flag-us.svg'}" alt=""> ${en?'PT-BR':'EN'}</a></header><main id="main">${body}</main><footer>This fan site is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Oy or its Affiliates. This fan site may use the trademarks and other intellectual property of Habbo, which is permitted under Habbo Fan Site Policy. <a href="https://help.habbo.com/hc/en-us/articles/360011512480-Habbo-Fansite-Policy" target="_blank" rel="noopener noreferrer">Habbo Fan Site Policy</a></footer></body></html>`;
 const humanHotel=(status,en)=>({unknown:en?'Brazilian availability unconfirmed':'Disponibilidade brasileira não confirmada',br_probable:en?'Brazilian availability probable; not confirmed':'Disponibilidade brasileira provável; não confirmada',international_only:en?'International evidence only; Brazilian availability unconfirmed':'Evidência internacional; disponibilidade brasileira não confirmada',br_documented:en?'Brazilian availability documented':'Disponibilidade brasileira documentada'}[status]);
 const field=(value,en)=>typeof value==='object'?value?.[en?'en':'ptBr'] || '':value || '';
 const contextMeta=(r,en)=>['historicalContext','brReleaseDate','firstDocumentedInternationalReleaseDate','originalIssueDate','dateEvidence','nameNote'].filter(key=>r[key]).map(key=>`<p><strong>${esc(({historicalContext:en?'Historical context':'Contexto histórico',firstDocumentedInternationalReleaseDate:en?'Earliest international date documented here':'Data internacional mais antiga documentada aqui',originalIssueDate:en?'Documented original issue date':'Data documentada da emissão original',brReleaseDate:en?'Brazilian date':'Data brasileira',dateEvidence:en?'Date evidence':'Evidência da data',nameNote:en?'Naming note':'Nota sobre o nome'})[key])}:</strong> ${esc(field(r[key],en))}</p>`).join('');
 const meta=(r,en)=>`<dl><dt>${en?'Code':'Código'}</dt><dd>${esc(r.code || r.id)}</dd><dt>${en?'Documented year':'Ano documentado'}</dt><dd>${esc(r.year || (en?'Before 2012; exact year unconfirmed':'Anterior a 2012; ano exato não confirmado'))}</dd><dt>${en?'Hotel / availability':'Hotel / disponibilidade'}</dt><dd>${esc(r.hotelLabel?.[en?'en':'ptBr'] || humanHotel(r.hotelStatus,en))}</dd><dt>${en?'Rights record':'Registro de direitos'}</dt><dd>${esc(en?'Conditional reuse under the fansite policy':'Uso condicionado à política de fã-sites')}</dd></dl>`;
 const recoveredV6=approvedOriginalSprites?verifiedCandidateRecords(root):{rares:[],globalBadges:[]};
 if(approvedOriginalSprites)data.rares.push(...recoveredV6.rares);
 for(const en of [false,true]) for(const kind of ['rares','badges']) {
  const records=data[kind], lang=en?'en':'ptBr';
  const groups=[...new Set(records.map(r=>r.familyId || r.groupId || 'collection'))];
  const card=r=>`<article class="item" id="item-${r.id}" data-group="${esc(r.familyId || r.groupId || 'collection')}"><button class="inspect" data-view="${esc(r.id)}" aria-label="${en?'Inspect':'Examinar'} ${esc(r.name[lang])}"><img loading="lazy" src="${local(r.image)}" alt="${esc(r.name[lang])}"></button><h3><a href="${route(kind,en,r.id)}">${esc(r.name[lang])}</a></h3></article>`;
  const content=`<section class="intro"><p class="eyebrow">HABBO · ${en?'BEFORE 2012':'ANTES DE 2012'}</p><h1>${title(kind,en)}</h1><p>${kind==='rares'?(en?'Classic rare furniture across hotels. Each record distinguishes Brazilian circulation.':'Raros clássicos entre hotéis e épocas. Cada ficha distingue a circulação brasileira.'):(en?'Campaign symbols from the Brazil/Portugal archive. A documented selection from 2009–2010.':'Símbolos de campanhas no arquivo Brasil/Portugal. Um recorte documentado de 2009–2010.')}</p><p class="count">${records.length} ${en?'documented items':'peças documentadas'}</p></section>${records.length?`${kind==='rares'?`<section class="rare-hero"><button class="inspect" data-view="${esc(records[0].id)}" aria-label="${esc(records[0].name[lang])}"><img src="${local(records[0].image)}" alt="${esc(records[0].name[lang])}"></button><h2>${esc(records[0].name[lang])}</h2><p>${esc(records[0].description?.[lang] || '')}</p></section>`:''}<nav class="rail" aria-label="${en?'Families':'Famílias'}">${groups.map(g=>`<a href="#family-${esc(g)}">${esc((records.find(r=>(r.familyId||r.groupId||'collection')===g)?.familyName?.[lang] || records.find(r=>(r.familyId||r.groupId||'collection')===g)?.groupName?.[lang] || g.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())))}</a>`).join('')}</nav>${groups.map(g=>`<section class="family" id="family-${esc(g)}" data-paginate="${kind==='badges'?'48':'0'}"><h2>${esc((records.find(r=>(r.familyId||r.groupId||'collection')===g)?.familyName?.[lang] || records.find(r=>(r.familyId||r.groupId||'collection')===g)?.groupName?.[lang] || g.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())))}</h2><div class="grid ${kind}">${records.filter(r=>(r.familyId||r.groupId||'collection')===g).map(card).join('')}</div><div class="pagination" aria-label="${en?'Pagination':'Paginação'}"></div></section>`).join('')}`:`<p>${en?'This collection is awaiting verified archival records.':'Esta coleção aguarda registros arquivísticos verificados.'}</p>`}<dialog aria-labelledby="viewer-title"><button class="close" aria-label="${en?'Close':'Fechar'}">×</button><div class="viewer-content"></div><nav class="viewer-controls" aria-label="${en?'Browse items':'Navegar pelas peças'}"><button type="button" data-step="-1">← ${en?'Previous':'Anterior'}</button><button type="button" data-step="1">${en?'Next':'Próxima'} →</button><a class="viewer-language" hreflang="${en?'pt-BR':'en'}" href="${route(kind,!en)}">${en?'Português':'English'}</a></nav><p><kbd>←</kbd> <kbd>→</kbd> · <kbd>Esc</kbd></p></dialog>${records.map(r=>`<template id="view-${esc(r.id)}"><img class="viewer-image" src="${local(r.image)}" alt="${esc(r.name[lang])}"><h2 id="viewer-title">${esc(r.name[lang])}</h2><p>${esc(r.description?.[lang] || '')}</p><a href="${route(kind,en,r.id)}">${en?'Item record and sources':'Ficha e fontes da peça'} →</a></template>`).join('')}`;
  out(outputPath(kind,en),shell(en,kind,'',content));
  for(const r of records) out(outputPath(kind,en,r.id),shell(en,kind,r.id,`<a class="back" href="${route(kind,en)}#item-${esc(r.id)}">← ${title(kind,en)}</a><article class="detail"><div class="stage"><img src="${local(r.image)}" alt="${esc(r.name[lang])}"></div><div><p class="eyebrow">${esc(r.familyId||r.groupId||kind)}</p><h1>${esc(r.name[lang])}</h1><p>${esc(r.description?.[lang]||'')}</p>${meta(r,en)}${contextMeta(r,en)}<h2>${en?'Sources':'Fontes'}</h2><ul>${r.provenanceRefs.map(ref=>{let url=typeof ref==='string'?ref:ref.url;return `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(typeof ref==='string'?ref:ref.label||url)}</a></li>`;}).join('')}</ul></div></article>`));
 }

 // Global records have a focused public series viewer, but still need stable
 // standalone scholarly URLs. They are generated only when originals are cleared.
 for(const en of [false,true]){
  const lang=en?'en':'ptBr';
  for(const r of recoveredV6.globalBadges){
   const record=out;
   record(outputPath('badges',en,r.id),shell(en,'badges',r.id,
    `<a class="back" href="${route('badges',en)}">← ${title('badges',en)}</a><article class="detail"><div class="stage"><img src="${local(r.image)}" alt="${esc(r.name[lang])}"></div><div><p class="eyebrow">GLOBAL · ${esc(r.badgeCode)}</p><h1>${esc(r.name[lang])}</h1><p>${esc(r.description[lang])}</p>${meta(r,en)}<h2>${en?'Sources':'Fontes'}</h2><ul>${r.provenanceRefs.map(url=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a></li>`).join('')}</ul></div></article>`));
  }
 }

 // Independent archival pages for all verified classic international badges.
 // Prefix classic- avoids collisions with V6 club and VIP records.
 if(classics){
  for(const en of [false,true]){
   const lang=en?'en':'ptBr';
   for(const r of classics.items){
    const id='classic-'+r.code.toLowerCase();
    const safeName=esc(r.label?.[lang]||r.code);
    const context=en?
     'Documented in an international general badge archive before 2012; hotel-by-hotel issuance is not assumed.':
     'Registrado em um arquivo internacional de emblemas anterior a 2012; não se presume distribuição em todos os hotéis.';
    const links=[r.sourceUrl,r.archiveSource].filter(Boolean).map(url=>\`<li><a href="\${esc(url)}" target="_blank" rel="noopener noreferrer">\${esc(url)}</a></li>\`).join('');
    out(outputPath('badges',en,id),shell(en,'badges',id,
     \`<a class="back" href="\${route('badges',en)}">← \${title('badges',en)}</a><article class="detail"><div class="stage"><img src="\${local(r.image)}" alt="\${safeName}"></div><div><p class="eyebrow">CLASSIC INTERNATIONAL · \${esc(r.code)}</p><h1>\${safeName}</h1><p>\${context}</p><dl><dt>\${en?'Original code':'Código original'}</dt><dd>\${esc(r.code)}</dd><dt>\${en?'Historical scope':'Recorte histórico'}</dt><dd>\${en?'Before 2012':'Antes de 2012'}</dd><dt>\${en?'Hotel availability':'Disponibilidade por hotel'}</dt><dd>\${en?'Not established':'Não estabelecida'}</dd></dl><h2>\${en?'Provenance':'Proveniência'}</h2><ul>\${links}</ul></div></article>\`));
   }
  }
 }

 // Copy only validated local collection assets; no remote runtime image dependency.
 for(const r of [...data.rares,...data.badges]) {let rel=r.image.replace(/^\/habbo\//,'');let dest=path.join(dist,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,rel),dest);}
 return {rares:data.rares.length,badges:data.badges.length};
}
