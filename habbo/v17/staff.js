// V17: native swipe/keyboard rail plus optional arrows; no carousel dependency.
(()=>{
 const rail=document.querySelector('[data-v17-rail]');
 if(!rail)return;
 const chapter=rail.closest('#gerentes'),buttons=[...chapter.querySelectorAll('[data-v17-scroll]')];
 const thumb=chapter.querySelector('.v17-staff-progress-thumb');
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 const update=()=>{
  const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
  const ratio=max?rail.scrollLeft/max:0;
  if(thumb){
   const width=Math.min(100,Math.max(12,100*rail.clientWidth/Math.max(1,rail.scrollWidth)));
   thumb.style.width=width+'%';
   thumb.style.left=(100-width)*ratio+'%';
  }
  for(const button of buttons){const delta=Number(button.dataset.v17Scroll);button.disabled=delta<0?rail.scrollLeft<=2:rail.scrollLeft>=max-2;}
 };
 for(const button of buttons){
  button.addEventListener('click',()=>{
   const delta=Number(button.dataset.v17Scroll);
   const item=rail.querySelector('.v17-staff-specimen');
   const gap=parseFloat(getComputedStyle(rail.querySelector('.v17-staff-items')).gap)||12;
   const stride=item?item.getBoundingClientRect().width+gap:130;
   rail.scrollBy({left:delta*stride*2,behavior:media.matches?'auto':'smooth'});
  });
 }
 rail.addEventListener('scroll',update,{passive:true});
 window.addEventListener('resize',update,{passive:true});
 update();
})();
