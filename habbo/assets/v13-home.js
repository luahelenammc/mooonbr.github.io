/* V13 · Animated original archival atlas. Does not interfere with the Places Dock.
 * 148 historical rare/HC furniture records + 101 global badges live on the homepage itself.
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
  image.src=reduced.matches&&item.dataset.v9StaticImage?item.dataset.v9StaticImage:item.dataset.v9Image;
  image.alt=item.dataset.v9Title;
  title.textContent=item.dataset.v9Title;
  family.textContent=item.dataset.v9Family;
  link.href=item.dataset.v9Link;
  counter.textContent=selection.items.length>1?(selection.index+1)+' / '+selection.items.length:'';
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
   const section=item.closest('[data-v9-family-section]');
   const scoped=section?[...section.querySelectorAll('[data-v9-item]')]:items;
   selection={items:scoped,index:scoped.indexOf(item)};
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
 // V11: one always-visible, immediately scannable directory per collection.
 // Families remain explicit links; progressive enhancement only changes the
 // selected specimen rail, never the visibility of the directory itself.
 const directories=new Map();
 for(const chapter of chapters){
  const sections=[...chapter.querySelectorAll('[data-v9-family-section]')];
  const tiles=[...chapter.querySelectorAll('.v11-family-grid a')];
  if(!sections.length||tiles.length!==sections.length)continue;
  let active=0;
  const activate=(i,{scroll=false,historyUpdate=false,focus=false}={})=>{
   active=(i+sections.length)%sections.length;
   sections.forEach((section,n)=>{
    const selected=n===active;
    section.dataset.v11Active=String(selected);
    section.toggleAttribute('inert',!selected);
    section.setAttribute('aria-hidden',String(!selected));
   });
   tiles.forEach((tile,n)=>{
    if(n===active)tile.setAttribute('aria-current','location');
    else tile.removeAttribute('aria-current');
   });
   const target=sections[active];
   target.querySelectorAll('img[loading="lazy"]').forEach(img=>{img.loading='eager';});
   const rail=target.querySelector('[data-v9-rail]');
   if(rail)rail.scrollLeft=0;
   if(historyUpdate)history.replaceState(null,'',location.pathname+location.search+'#'+target.id);
   requestAnimationFrame(updateControls);
   if(scroll){
    target.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
    if(focus){
     const heading=target.querySelector('h3');
     if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
    }
   }
  };
  tiles.forEach((tile,i)=>tile.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   event.preventDefault();
   activate(i,{scroll:true,historyUpdate:true,focus:true});
  }));
  directories.set(chapter.id,{sections,activate});
  activate(0);
 }
 const locateHash=()=>{
  let id;
  try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  if(!id)return;
  for(const {sections,activate} of directories.values()){
   const index=sections.findIndex(section=>section.id===id || (section.dataset.v12Aliases||'').split(',').includes(id));
   if(index>=0){activate(index,{scroll:true});return;}
  }
 };
 locateHash();
 window.addEventListener('hashchange',locateHash);
 document.documentElement.classList.add('v11-family-ready','v12-quiet-ready');
 // Chapter-aware header navigation. The old template permanently highlighted
 // Places even when the reader had entered Rares or Badges.
 const headerTabs=[...document.querySelectorAll('.collection-switch a')];
 const places=document.getElementById('lugares');
 if(headerTabs.length===3 && places){
  const timeline=[places,...chapters];
  let scheduled=false;
  const updateChapter=()=>{
   scheduled=false;
   const probe=window.scrollY+Math.min(240,window.innerHeight*0.32);
   let chapterId='lugares';
   for(const section of timeline){
    if(section.getBoundingClientRect().top+window.scrollY<=probe)chapterId=section.id;
   }
   headerTabs.forEach(tab=>{
    const href=tab.getAttribute('href')||'';
    const id=href==='#raros'?'raros':href==='#emblemas'?'emblemas':'lugares';
    if(id===chapterId)tab.setAttribute('aria-current','location');
    else tab.removeAttribute('aria-current');
   });
  };
  window.addEventListener('scroll',()=>{
   if(!scheduled){scheduled=true;requestAnimationFrame(updateChapter);}
  },{passive:true});
  window.addEventListener('resize',updateChapter,{passive:true});
  updateChapter();
 }
})();
