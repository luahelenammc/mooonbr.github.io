/* Habbo Museum: international classics 2000–2011.
 * All graphics are original archive GIFs. No generated or substitute imagery.
 * Display is progressively enhanced; existing BR/PT archive remains reachable.
 */
(async ()=>{
 const main=document.querySelector('main'), pt=document.documentElement.lang.toLowerCase().startsWith('pt');
 if(!main || !main.querySelector('.grid.badges'))return;
 const pageRoot='/habbo/', badgeRoute=pt?'pt-br/emblema/':'en/badge/';
 const T=pt?{
  kicker:'EMBLEMAS · ARQUIVO HISTÓRICO',heading:'Os emblemas clássicos',summary:'Staff, Habbo X, jogos, clubes e símbolos antigos. Imagens originais preservadas num catálogo internacional anterior a 2012.',
  caveat:'A presença no arquivo internacional não garante que o emblema tenha sido entregue no Habbo BR.',
  all:'Todos',count:'emblemas no acervo',details:'Abrir ficha e fontes',zoom:'Ampliar emblema',close:'Fechar',next:'Próximo',prev:'Anterior',
  source:'Fonte original',code:'Código original',family:'Família',status:'Arquivo internacional pré-2012',regional:'Arquivo Brasil/Portugal',
  item:'Escolher emblema',expand:'Ver todos',less:'Ver menos'
 }:{
  kicker:'BADGES · HISTORICAL ARCHIVE',heading:'The classic badges',summary:'Staff, Habbo X, games, clubs and early symbols. Authentic GIFs from a pre-2012 international catalogue.',
  caveat:'Appearance in the international archive does not establish that a badge was awarded on the Brazilian hotel.',
  all:'All',count:'archival badges',details:'View record and sources',zoom:'Enlarge badge',close:'Close',next:'Next',prev:'Previous',
  source:'Original source',code:'Original code',family:'Family',status:'Pre-2012 international archive',regional:'Brazil/Portugal archive',
  item:'Choose badge',expand:'Show all',less:'Show less'
 };
 try{
  const resp=await fetch(pageRoot+'assets/v7-classic-badges.json',{cache:'no-cache'});
  if(!resp.ok)throw Error('collection unavailable '+resp.status);
  const ledger=await resp.json();
  if(!Array.isArray(ledger.items)||ledger.items.length<45)throw Error('incomplete historical archive');
  const data=ledger.items,families=ledger.families;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const section=el('section','v7-classic');
  section.setAttribute('aria-label',T.heading);
  const eyebrow=el('p','v7-eyebrow',T.kicker),
   title=el('h1','v7-title',T.heading),
   summary=el('p','v7-summary',T.summary),
   count=el('p','v7-count',data.length+' '+T.count),
   navigation=el('nav','v7-filters'),
   stage=el('div','v7-stage'),
   thumbs=el('div','v7-badge-grid'),
   notice=el('p','v7-caveat',T.caveat);
  navigation.setAttribute('aria-label',T.family);
  thumbs.setAttribute('aria-label',T.item);
  const imageButton=el('button','v7-big-image');
  imageButton.type='button';imageButton.setAttribute('aria-label',T.zoom);
  const img=el('img','v7-main-sprite');
  img.alt='';img.decoding='async';imageButton.append(img);
  const info=el('div','v7-details');
  const category=el('p','v7-category');
  const name=el('h2','v7-badge-name');
  const code=el('p','v7-badge-code');
  const desc=el('p','v7-badge-context',T.status);
  const controls=el('div','v7-controls');
  const previous=el('button','v7-previous','← '+T.prev),next=el('button','v7-next',T.next+' →');
  previous.type=next.type='button';
  const detail=el('a','v7-detail',T.details+' ↗');
  controls.append(previous,next,detail);
  info.append(category,name,code,desc,controls);
  stage.append(imageButton,info);
  section.append(eyebrow,title,summary,count,navigation,stage,thumbs,notice);

  let family='pioneiros', selectedIndex=0, showAll=false, visible=[];
  const getFam=id=>families.find(x=>x.id===id)?.name?.[pt?'ptBr':'en']||id;
  const selected=()=>visible[selectedIndex]||visible[0];
  const refreshStage=()=>{
   const b=selected();if(!b)return;
   img.src=b.image;img.alt=b.label?.[pt?'ptBr':'en']||b.code;
   name.textContent=b.label?.[pt?'ptBr':'en']||b.code;
   category.textContent=getFam(b.family);
   code.textContent=T.code+': '+b.code;
   detail.href=pageRoot+badgeRoute+'classic-'+b.code.toLowerCase()+'/';
   thumbs.querySelectorAll('button').forEach(x=>{
    x.setAttribute('aria-pressed',String(x.dataset.badgeCode===b.code));
   });
  };
  const refresh=()=>{
   visible=family==='all'?data:data.filter(x=>x.family===family);
   if(selectedIndex>=visible.length)selectedIndex=0;
   navigation.replaceChildren();
   for(const f of [{id:'all',name:{ptBr:T.all,en:T.all}},...families]){
    const b=el('button','v7-filter',f.name[pt?'ptBr':'en']);
    b.type='button';b.setAttribute('aria-pressed',String(f.id===family));
    const n=data.filter(x=>f.id==='all'||x.family===f.id).length;
    b.append(el('span','v7-filter-count',String(n)));
    b.addEventListener('click',()=>{family=f.id;selectedIndex=0;showAll=false;refresh();});
    navigation.append(b);
   }
   thumbs.replaceChildren();
   const render=showAll?visible:visible.slice(0,24);
   for(const b of render){
    const btn=el('button','v7-badge-tile');
    btn.type='button';btn.dataset.badgeCode=b.code;
    btn.setAttribute('aria-label',(b.label?.[pt?'ptBr':'en']||b.code)+' ('+b.code+')');
    const pic=el('img','v7-badge-thumbnail');
    pic.src=b.image;pic.alt='';pic.loading='lazy';pic.decoding='async';
    btn.append(pic,el('span','v7-tile-code',b.code));
    btn.addEventListener('click',()=>{selectedIndex=visible.findIndex(x=>x.code===b.code);refreshStage();});
    thumbs.append(btn);
   }
   if(!showAll && visible.length>24){
    const more=el('button','v7-more',T.expand+' ('+(visible.length-24)+') ↓');more.type='button';
    more.addEventListener('click',()=>{showAll=true;refresh();});thumbs.append(more);
   }else if(showAll && visible.length>24){
    const less=el('button','v7-more',T.less+' ↑');less.type='button';
    less.addEventListener('click',()=>{showAll=false;selectedIndex=0;refresh();});thumbs.append(less);
   }
   refreshStage();
  };
  const step=d=>{
    selectedIndex=(selectedIndex+d+visible.length)%visible.length;
    const target=visible[selectedIndex];
    if(!showAll && selectedIndex>=24)showAll=true;
    if(thumbs.querySelector('[data-badge-code="'+target.code+'"]'))refreshStage();else refresh();
  };
  previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
  const dialog=el('dialog','v7-lightbox');
  const close=el('button','v7-lightbox-close','×');
  close.type='button';close.setAttribute('aria-label',T.close);
  const big=el('img','v7-lightbox-art');big.alt='';big.src=data[0].image;
  const dlgName=el('h2','v7-lightbox-name'),dlCode=el('p','v7-lightbox-code');
  const dlgLink=el('a','v7-detail',T.details+' ↗');
  dialog.append(close,big,dlgName,dlCode,dlgLink);
  section.append(dialog);
  const open=()=>{
   const b=selected();
   big.src=b.image;big.alt=b.label?.[pt?'ptBr':'en']||b.code;
   dlgName.textContent=big.alt;dlCode.textContent=b.code;
   dlgLink.href=detail.href;
   dialog.showModal();close.focus();
  };
  imageButton.addEventListener('click',open);
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('keydown',e=>{
   if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
    e.preventDefault();step(e.key==='ArrowRight'?1:-1);openInDialog();
   }
  });
  const openInDialog=()=>{
   const b=selected();big.src=b.image;big.alt=name.textContent;dlgName.textContent=name.textContent;
   dlCode.textContent=b.code;dlgLink.href=detail.href;
  };
  const old=main.querySelector('.v6-global');
  if(old){main.insertBefore(section,old);old.hidden=true;}
  else main.prepend(section);
  const regional=main.querySelector('.v6-regional-title');
  if(regional)regional.querySelector('h2').textContent=T.regional;
  refresh();
  document.documentElement.classList.add('v7-classic-loaded');
 }catch(err){console.warn('Classic badge archive fallback:',err.message);}
})();
