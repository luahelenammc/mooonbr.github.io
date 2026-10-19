/* Habbo V6.1 — global-first archive viewer.
   13 verified pre-2012 global/cross-hotel *records*.
   Images intentionally not reproduced until the publication gate is established.
   The legacy 62 BR/PT icons remain available below without modification. */
(() => {
 const main=document.querySelector('main');
 if(!main || !main.querySelector('.grid.badges')) return;
 const pt=document.documentElement.lang.toLowerCase().startsWith('pt');
 const S=pt?{
  label:'Emblemas globais clássicos', sub:'Séries internacionais documentadas até 2011. A presença de um sprite no arquivo não prova que foi distribuído em todos os hotéis.',
  archived:'Arquivo regional BR/PT', status:'Imagem em validação de publicação', series:'Séries', records:'Registros', view:'Ver evidência', choice:'Selecionar emblema', kinds:['Habbo Club clássico','Habbo Club · níveis','VIP · níveis','Hora do Planeta'],missing:'Os sprites originais desta série estão preservados no arquivo de pesquisa, mas não estão liberados para esta apresentação pública.', regional:'Explore abaixo os 62 emblemas documentados do arquivo brasileiro/português.'}:
  {label:'Classic global badges',sub:'International badge lineages documented before 2012. A sprite appearing in an archive does not prove issuance in every hotel.',archived:'Brazil/Portugal regional archive',status:'Image awaiting publication review',series:'Series',records:'Records',view:'View evidence',choice:'Select badge',kinds:['Classic Habbo Club','Habbo Club · levels','VIP · levels','Earth Hour'],missing:'Original sprites for this series are preserved in the research archive but have not been cleared for this public display.', regional:'Browse the 62 documented regional Brazil/Portugal badges below.'};
 const create=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n;};
 const records=[
  {code:'HC1',group:0,label:['Habbo Club · clássico I','Habbo Club · classic I']},
  {code:'HC2',group:0,label:['Habbo Club · clássico II','Habbo Club · classic II']},
  ...Array.from({length:5},(_,i)=>({code:'ACH_BasicClub'+(i+1),group:1,label:['Habbo Club · nível '+(i+1),'Habbo Club · level '+(i+1)]})),
  ...Array.from({length:5},(_,i)=>({code:'ACH_VipClub'+(i+1),group:2,label:['VIP · nível '+(i+1),'VIP · level '+(i+1)]})),
  {code:'EHR',group:3,label:['Hora do Planeta','Earth Hour']}
 ];
 const groups=[records.filter(r=>r.group===0),records.filter(r=>r.group===1),records.filter(r=>r.group===2),records.filter(r=>r.group===3)];
 const section=create('section','v6-global');
 section.setAttribute('aria-label',S.label);
 const kicker=create('p','v6-eyebrow','HABBO · '+(pt?'ATÉ 2011':'THROUGH 2011'));
 const title=create('h2','v6-global-title',S.label);
 const lead=create('p','v6-global-lead',S.sub);
 section.append(kicker,title,lead);
 const selectors=create('nav','v6-global-groups');
 selectors.setAttribute('aria-label',S.series);
 let group=0,index=0;
 const panel=create('div','v6-global-stage');
 const visual=create('div','v6-global-code');
 visual.setAttribute('aria-hidden','true');
 const info=create('div','v6-global-info');
 const code=create('p','v6-code-label');
 const name=create('h3','v6-badge-name');
 const status=create('p','v6-status',S.status);
 const caveat=create('p','v6-caveat',S.missing);
 const source=create('a','v6-global-source',S.view+' ↗');
 source.href='https://habborator.org/badges/general.html';
 source.target='_blank';source.rel='noopener noreferrer';
 const chips=create('div','v6-global-chips');chips.setAttribute('aria-label',S.choice);
 info.append(code,name,status,caveat,source);
 panel.append(visual,info);
 section.append(selectors,panel,chips);
 const regionTitle=create('div','v6-regional-title');
 regionTitle.append(create('h2','',S.archived),create('p','',S.regional));
 const oldRail=main.querySelector('.rail');
 const intro=main.querySelector('.intro');
 if(intro)intro.hidden=true;
 main.insertBefore(section,oldRail);
 main.insertBefore(regionTitle,oldRail);
 const buttonFor=(label,fn)=>{
   const b=create('button','',label);b.type='button';b.addEventListener('click',fn);return b;
 };
 const redraw=()=>{
  selectors.replaceChildren();
  for(let i=0;i<groups.length;i++){
   const n=buttonFor(S.kinds[i],()=>{group=i;index=0;redraw();});
   n.setAttribute('aria-pressed',String(i===group));selectors.append(n);
  }
  chips.replaceChildren();
  groups[group].forEach((r,i)=>{
   const n=buttonFor(r.code.replace('ACH_','').replace('BasicClub','HC').replace('VipClub','VIP'),()=>{
    index=i;redraw();
   });n.setAttribute('aria-pressed',String(i===index));n.title=r.label[pt?0:1];chips.append(n);
  });
  const r=groups[group][index];
  const verified=document.documentElement.dataset.v6ImagesAllowed==='true';
  if(verified){
   const img=document.createElement('img');
   img.src='/habbo/assets/v6/badges/'+encodeURIComponent(r.code)+'.gif';
   img.alt=''; img.decoding='async'; img.className='v6-verified-original';
   visual.replaceChildren(img);
  } else {
   visual.textContent=r.code.startsWith('ACH_')?r.code.replace('ACH_','').replace('BasicClub','HC ').replace('VipClub','VIP '):r.code;
  }
  code.textContent=r.code+' · '+(index+1)+' / '+groups[group].length;
  name.textContent=r.label[pt?0:1];
  status.textContent=verified?(pt?'Sprite original preservado':'Preserved original sprite'):S.status;
  caveat.hidden=verified;
  source.textContent=verified?(pt?'Abrir ficha completa →':'Open full record →'):S.view+' ↗';
  source.href=verified?('/habbo/'+(pt?'pt-br/emblema/':'en/badge/')+r.code.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/'):'https://habborator.org/badges/general.html';
  source.target=verified?'_self':'_blank';
  panel.setAttribute('data-v6-active',r.code);
 };
 redraw();
})();
