(() => {
 const main=document.querySelector('main');
 if(!main||!document.body.classList.contains('v8-archive'))return;
 const items=[...main.querySelectorAll('[data-v8-item]')];
 const feature=main.querySelector('[data-v8-feature-img]');
 const name=main.querySelector('[data-v8-feature-title]');
 const family=main.querySelector('[data-v8-family]');
 const link=main.querySelector('[data-v8-feature-link]');
 const dialog=document.querySelector('[data-v8-lightbox]');
 const dialogImg=dialog.querySelector('[data-v8-dialog-img]');
 const dialogTitle=dialog.querySelector('[data-v8-dialog-title]');
 const dialogLink=dialog.querySelector('[data-v8-dialog-link]');
 const pt=document.documentElement.lang.toLowerCase().startsWith('pt');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const asset=target=>reduced.matches&&target.dataset.staticImage?target.dataset.staticImage:target.dataset.image;
 let current=0,lastFocus=null;
 if(!items.length)return;
 function select(index) {
  current=(index+items.length)%items.length;
  const target=items[current];
  items.forEach((x,i)=>x.dataset.v8Active=String(i===current));
  feature.src=asset(target);feature.alt=target.dataset.title;
  name.textContent=target.dataset.title;
  family.textContent=target.dataset.family;
  link.href=target.dataset.link;
  if(dialog.open){
   dialogImg.src=asset(target);dialogImg.alt=target.dataset.title;
   dialogTitle.textContent=target.dataset.title;dialogLink.href=target.dataset.link;
  }
  // Deep-link to a record without polluting the browser history while browsing.
  history.replaceState(null,'',location.pathname+location.search+'#item-'+encodeURIComponent(target.dataset.id));
 }
 const open=from=>{
  if(!dialog.open){lastFocus=from||document.activeElement;dialog.showModal();}
  select(current);
  dialog.querySelector('[data-v8-close]').focus();
 };
 items.forEach((button,i)=>button.addEventListener('click',()=>{select(i);open(button);}));
 main.querySelector('[data-v8-feature-open]').addEventListener('click',e=>open(e.currentTarget));
 main.querySelectorAll('[data-v8-step]').forEach(button=>button.addEventListener('click',()=>{
  select(current+Number(button.dataset.v8Step));
 }));
 dialog.querySelectorAll('[data-v8-dialog-step]').forEach(button=>button.addEventListener('click',()=>{
  select(current+Number(button.dataset.v8DialogStep));
 }));
 dialog.querySelector('[data-v8-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const box=dialog.getBoundingClientRect();
  if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close();
 });
 dialog.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(current+(e.key==='ArrowRight'?1:-1));}
 });
 dialog.addEventListener('close',()=>{lastFocus?.focus();});
 // Simple passive arrow controls on the featured panel; no unsolicited autoplay.
 const hash=decodeURIComponent(location.hash.slice(1));
 const start=hash.startsWith('item-')?items.findIndex(el=>el.dataset.id===hash.slice(5)):-1;
 select(start>=0?start:0);
 // Family chips are anchors, not filters. All original archive items exist at first render.
 main.querySelectorAll('.v8-jumps a').forEach(a=>a.addEventListener('click',()=>{
  main.querySelectorAll('.v8-jumps a').forEach(x=>x.removeAttribute('aria-current'));
  a.setAttribute('aria-current','location');
 }));
})();