/* V17 staff sprites: native scroll works without JS; arrows enhance it. */
(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 for(const view of document.querySelectorAll('.v17-staff-viewport')){
  const chapter=view.closest('.v17-staff-chapter');if(!chapter)continue;
  const prev=chapter.querySelector('[data-v17-prev]'),next=chapter.querySelector('[data-v17-next]');
  const update=()=>{const max=Math.max(0,view.scrollWidth-view.clientWidth);
   if(prev)prev.disabled=view.scrollLeft<3;
   if(next)next.disabled=view.scrollLeft>max-3;
  };
  const step=()=>Math.max(210,Math.floor(view.clientWidth*.65));
  const scroll=dir=>view.scrollBy({left:dir*step(),behavior:reduce.matches?'instant':'smooth'});
  prev?.addEventListener('click',()=>scroll(-1));
  next?.addEventListener('click',()=>scroll(1));
  view.addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update,{passive:true});
  update();
 }
})();
