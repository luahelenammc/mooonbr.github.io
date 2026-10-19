/* Habbo V7.1 — global classics: original pre-2011 international archive,
   visually searchable and independent from the regional BR/PT collection. */
(() => {
 const main=document.querySelector('main');
 if(!main || !main.querySelector('.grid.badges'))return;
 const pt=document.documentElement.lang.toLowerCase().startsWith('pt');
 const base='/habbo/';
 const t=pt?{
  eyebrow:'ARQUIVO CLÁSSICO · ATÉ 2011',title:'Emblemas globais clássicos',
  intro:'Muito além de HC e VIP. Os emblemas do Habbo antigo, reunidos por famílias e preservados com sua pixel art original.',
  highlights:'Destaques',all:'Todos',count:'peças originais',regional:'Arquivo regional BR/PT',
  regionalNote:'62 emblemas brasileiros e portugueses preservados, com suas fichas e proveniência.',
  provenance:'Origem e evidências',read:'Ficha da peça',zoom:'Ampliar emblema',
  noUniversal:'Este emblema consta no arquivo internacional anterior a 2012. Isso não prova que tenha sido entregue em todos os hotéis ou especificamente no Habbo BR/PT.',
  original:'Sprite original · arquivo histórico',imageUnavailable:'Imagem não disponível',
  close:'Fechar',previous:'Anterior',next:'Próximo',listLabel:'Selecionar emblema',
  empty:'Nenhum emblema nesta coleção',failed:'Não foi possível abrir o acervo global agora.'
 }:{
  eyebrow:'CLASSIC ARCHIVE · THROUGH 2011',title:'Classic global badges',
  intro:'Far beyond HC and VIP. Authentic old Habbo badges, organized by family and preserved in original pixel art.',
  highlights:'Highlights',all:'All',count:'original sprites',regional:'Brazil/Portugal archive',
  regionalNote:'62 regional badges preserved, with their own item pages and provenance.',
  provenance:'Evidence and source',read:'Open badge record',zoom:'Enlarge badge',
  noUniversal:'This badge is present in a pre-2012 international archive. That does not prove it was awarded in every hotel or in Habbo BR/PT.',
  original:'Original sprite · historic archive',imageUnavailable:'Image not available',
  close:'Close',previous:'Previous',next:'Next',listLabel:'Select badge',
  empty:'No badges in this collection',failed:'The global archive could not be opened right now.'
 };
 const el=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e};
 const root=el('section','v7-global');
 root.setAttribute('aria-label',t.title);
 const eyebrow=el('p','v7-eyebrow',t.eyebrow);
 const heading=el('h1','v7-heading',t.title);
 const lead=el('p','v7-lead',t.intro);
 const count=el('p','v7-count');
 const tabs=el('nav','v7-tabs');tabs.setAttribute('aria-label',pt?'Famílias clássicas':'Classic families');
 const hero=el('div','v7-hero');
 const stage=el('button','v7-main-art');stage.type='button';stage.setAttribute('aria-label',t.zoom);
 const mainImg=el('img','v7-main-image');mainImg.decoding='async';mainImg.alt='';
 stage.append(mainImg);
 const facts=el('div','v7-facts');
 const code=el('p','v7-code');
 const name=el('h2','v7-name');
 const status=el('p','v7-status',t.original);
 const caveat=el('p','v7-caveat',t.noUniversal);
 const source=el('a','v7-evidence',t.provenance+' ↗');source.target='_blank';source.rel='noopener noreferrer';
 const detail=el('a','v7-detail',t.read+' →');detail.hidden=true;
 facts.append(code,name,status,caveat,source,detail);
 hero.append(stage,facts);
 const gallery=el('div','v7-gallery');gallery.setAttribute('aria-label',t.listLabel);
 const regional=el('div','v7-regional');
 regional.append(el('h2','',t.regional),el('p','',t.regionalNote));
 root.append(eyebrow,heading,lead,count,tabs,hero,gallery);
 const intro=main.querySelector('.intro'),rail=main.querySelector('.rail');
 if(intro)intro.hidden=true;
 main.insertBefore(root,rail);
 main.insertBefore(regional,rail);

 const dialog=el('dialog','v7-lightbox');
 const close=el('button','v7-close','×');close.type='button';close.setAttribute('aria-label',t.close);
 const largeImg=el('img','v7-large-image');largeImg.alt='';
 const largeName=el('p','v7-large-name');
 const backdrop=el('div','v7-lightbox-image');
 backdrop.append(largeImg,largeName);
 dialog.append(close,backdrop);root.append(dialog);
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 stage.addEventListener('click',()=>{largeImg.src=mainImg.src;largeImg.alt=mainImg.alt;largeName.textContent=name.textContent;dialog.showModal()});
 let data=null,selected=null,category='highlights',visible=[];
 const featured=['HC1','HC2','ADM','VIP','HC3','XXX','HX1','GLA','GL1','BTB','SNW','WBL','BOT','EHR','HC4','Z05'];
 function photo(src,alt,className){
  const img=el('img',className);img.src=src;img.alt=alt;img.loading='lazy';img.decoding='async';return img;
 }
 function selectRecord(record,focus=false){
  selected=record;
  mainImg.src=record.image;mainImg.alt=record.label[pt?'ptBr':'en']+' ('+record.code+')';
  code.textContent=record.code+' · '+(pt?'preservado até 2011':'archived by 2011');
  name.textContent=record.label[pt?'ptBr':'en'];
  source.href=record.archivePage||data.sourcePage;
  detail.hidden=!record.detail;
  if(record.detail)detail.href=record.detail[pt?'ptBr':'en']||record.detail[pt?'ptBr':'en']; // fallback for historical key conventions
  detail.hidden=!record.detail;
  const buttons=[...gallery.querySelectorAll('button[data-code]')];
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.code===record.code)));
  if(focus)hero.scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 function buildGallery(){
  gallery.replaceChildren();
  visible=data.records.filter(r=>category==='highlights'?featured.includes(r.code):category==='all'?true:r.category===category);
  if(category==='highlights')visible.sort((a,b)=>featured.indexOf(a.code)-featured.indexOf(b.code));
  count.textContent=data.records.length+' '+t.count;
  for(const r of visible){
   const item=el('button','v7-tile');item.type='button';item.dataset.code=r.code;
   const image=photo(r.image,r.label[pt?'ptBr':'en'],'v7-tile-image');
   const brief=r.code.startsWith('ACH_BasicClub')?'HC '+r.code.slice(-1):r.code.startsWith('ACH_VipClub')?'VIP '+r.code.slice(-1):r.code;
   const title=el('span','v7-tile-title',brief);
   item.title=r.label[pt?'ptBr':'en'];
   item.append(image,title);
   item.addEventListener('click',()=>selectRecord(r));
   gallery.append(item);
  }
  if(!visible.length)gallery.append(el('p','v7-empty',t.empty));
  selectRecord(visible.find(r=>r.code===selected?.code)||visible[0]||data.records[0]);
 }
 function switchCategory(next){
  category=next;selected=null;
  [...tabs.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
  buildGallery();
 }
 function start(payload){
  data=payload;
  const categories=[{key:'highlights',title:t.highlights},
    {key:'all',title:t.all},
    ...payload.families.map(f=>({key:f.key,title:f.title[pt?'ptBr':'en']}))];
  tabs.replaceChildren();
  categories.forEach(c=>{
   const b=el('button','v7-tab',c.title);b.type='button';b.dataset.category=c.key;
   b.addEventListener('click',()=>switchCategory(c.key));tabs.append(b);
  });
  switchCategory('highlights');
 }
 fetch(base+'assets/v7-classics.json',{cache:'no-cache'}).then(response=>{
  if(!response.ok)throw Error('HTTP '+response.status);
  return response.json();
 }).then(json=>{
  if(!Array.isArray(json.records)||json.records.length<55)throw Error('Unexpected archive coverage');
  start(json);
 }).catch(error=>{
  count.textContent=t.failed;console.error('Classic global badge archive:',error);
 });
})();
