/* V9 · Complete home archive. Does not interfere with the Places Dock.
 * 69 rares + 101 global badges live on the homepage itself.
 * Static links remain usable without JS; the viewer is an enhancement.
 */
(() => {
 const root=document.querySelector('.v8-home-chapters');
 const dialog=document.querySelector('[data-v9-dialog]');
 if(!root||!dialog)return;
 const image=dialog.querySelector('[data-v9-dialog-image]');
 const title=dialog.querySelector('[data-v9-dialog-title]');
 const family=dialog.querySelector('[data-v9-dialog-family]');
 const counter=dialog.querySelector('[data-v9-dialog-counter]');
 const link=dialog.querySelector('[data-v9-dialog-link]');
 const close=dialog.querySelector('[data-v9-close]');
 const pt=document.documentElement.lang.toLowerCase().startsWith('pt');
 const chapters=[...root.querySelectorAll('[data-v9-chapter]')];
 let selection={items:[],index:0},opener=null;
 const render=()=>{
  const item=selection.items[selection.index];
  if(!item)return;
  image.src=item.dataset.v9Image;
  image.alt=item.dataset.v9Title;
  title.textContent=item.dataset.v9Title;
  family.textContent=item.dataset.v9Family;
  link.href=item.dataset.v9Link;
  const label=pt?'Peça':'Item';
  counter.textContent=label+' '+(selection.index+1)+' / '+selection.items.length;
 };
 const step=delta=>{
  if(!selection.items.length)return;
  selection.index=(selection.index+delta+selection.items.length)%selection.items.length;
  render();
 };
 for(const chapter of chapters){
  const items=[...chapter.querySelectorAll('[data-v9-item]')];
  items.forEach((item,index)=>item.addEventListener('click',e=>{
   if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   e.preventDefault();
   opener=item;
   selection={items,index};
   render();
   if(!dialog.open)dialog.showModal();
   close.focus();
  }));
 }
 dialog.querySelectorAll('[data-v9-dialog-step]').forEach(button=>
  button.addEventListener('click',()=>step(Number(button.dataset.v9DialogStep))));
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
   event.preventDefault();
   step(event.key==='ArrowRight'?1:-1);
  }
 });
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
 });
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
 let startX=null;
 dialog.addEventListener('touchstart',event=>{
  if(event.touches.length===1)startX=event.touches[0].clientX;
 },{passive:true});
 dialog.addEventListener('touchend',event=>{
  if(startX===null||event.changedTouches.length!==1)return;
  const dx=event.changedTouches[0].clientX-startX;startX=null;
  if(Math.abs(dx)>=64)step(dx<0?1:-1);
 },{passive:true});
 const scrollControls=[...root.querySelectorAll('[data-v9-slide]')];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const move=e=>{
  const rail=e.currentTarget.closest('[data-v9-family-section]')?.querySelector('[data-v9-rail]');
  if(!rail)return;
  const direction=Number(e.currentTarget.dataset.v9Slide);
  rail.scrollBy({left:direction*Math.max(180,rail.clientWidth*0.8),
    behavior:reduced.matches?'instant':'smooth'});
 };
 scrollControls.forEach(control=>control.addEventListener('click',move));
 // Disable navigation where all specimens already fit in the viewport.
 const updateControls=()=>{
  root.querySelectorAll('[data-v9-family-section]').forEach(section=>{
   const rail=section.querySelector('[data-v9-rail]');
   if(!rail)return;
   const overflows=rail.scrollWidth>rail.clientWidth+2;
   section.querySelectorAll('[data-v9-slide]').forEach(control=>{
    control.disabled=!overflows;
    control.setAttribute('aria-disabled',String(!overflows));
   });
  });
 };
 // Defer initial check until CSS layout and images are sufficiently settled.
 requestAnimationFrame(updateControls);
 window.addEventListener('resize',updateControls,{passive:true});
 // V10: compact group navigator. All archival records remain in the document,
 // and without JavaScript every family is still visible.
 const pagerLabels=pt?
  {previous:'Família anterior',next:'Próxima família',of:'de'}:
  {previous:'Previous family',next:'Next family',of:'of'};
 const controllers=new Map();
 for(const chapter of chapters){
  const sections=[...chapter.querySelectorAll('[data-v9-family-section]')];
  const chips=[...chapter.querySelectorAll('.v9-family-index a')];
  const header=chapter.querySelector('.v8-chapter-head');
  if(!sections.length||!chips.length||!header)continue;
  const page=document.createElement('nav');
  page.className='v10-family-pager';
  page.setAttribute('aria-label',pt?'Navegar entre famílias':'Browse families');
  const prev=document.createElement('button');
  const next=document.createElement('button');
  const indicator=document.createElement('span');
  prev.type=next.type='button';
  prev.textContent='←';next.textContent='→';
  prev.setAttribute('aria-label',pagerLabels.previous);
  next.setAttribute('aria-label',pagerLabels.next);
  indicator.className='v10-family-indicator';
  indicator.setAttribute('aria-live','polite');
  page.append(prev,indicator,next);
  const chip=chapter.querySelector('.v9-family-index');
  chip.before(page);
  let index=0;
  const activate=(i,{scroll=false,historyUpdate=false}={})=>{
   index=(i+sections.length)%sections.length;
   sections.forEach((el,n)=>{
    const active=n===index;
    el.dataset.v10Active=String(active);
    el.toggleAttribute('inert',!active);
    el.setAttribute('aria-hidden',String(!active));
   });
   chips.forEach((el,n)=>{
    if(n===index)el.setAttribute('aria-current','location');
    else el.removeAttribute('aria-current');
   });
   const label=sections[index].querySelector('h3')?.textContent||'';
   indicator.textContent=String(index+1).padStart(2,'0')+' / '+
    String(sections.length).padStart(2,'0')+' · '+label;
   // Scroll the chips, not the entire document. Avoid jumpiness on mobile.
   const activeChip=chips[index], chipRail=activeChip?.parentElement;
   if(chipRail && activeChip) {
    const left=activeChip.offsetLeft-chipRail.offsetLeft;
    if(left<chipRail.scrollLeft||left+activeChip.offsetWidth>chipRail.scrollLeft+chipRail.clientWidth)
     chipRail.scrollTo({left:Math.max(0,left-(chipRail.clientWidth-activeChip.offsetWidth)/2),behavior:'instant'});
   }
   // Hidden-family images are lazy by default; load the newly selected family.
   sections[index].querySelectorAll('img[loading="lazy"]').forEach(img=>{img.loading='eager';});
   const rail=sections[index].querySelector('[data-v9-rail]');
   if(rail)rail.scrollLeft=0;
   if(historyUpdate)history.replaceState(null,'',location.pathname+location.search+'#'+sections[index].id);
   if(scroll)chapter.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
   requestAnimationFrame(updateControls);
  };
  prev.addEventListener('click',()=>activate(index-1));
  next.addEventListener('click',()=>activate(index+1));
  chips.forEach((el,n)=>el.addEventListener('click',e=>{
    e.preventDefault();activate(n,{scroll:true,historyUpdate:true});
  }));
  page.addEventListener('keydown',event=>{
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();activate(index+(event.key==='ArrowRight'?1:-1));
   }
  });
  controllers.set(chapter.id,{sections,activate});
  activate(0);
 }
 const locateHash=()=>{
  const id=decodeURIComponent(location.hash.slice(1));
  if(!id)return;
  for(const {sections,activate} of controllers.values()){
   const i=sections.findIndex(x=>x.id===id);
   if(i>=0){activate(i);return;}
  }
 };
 locateHash();
 window.addEventListener('hashchange',locateHash);
 document.documentElement.classList.add('v10-family-ready');
 // Full historical room sprites load at their native pixel dimensions; no icon enlargement.

})();
