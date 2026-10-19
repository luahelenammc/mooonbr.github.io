/* V17 standalone staff rail: home uses the existing V13 native rail controls. */
(() => {
 const track=document.querySelector('.v17-staff-carousel');
 if(!track)return;
 const rail=track.querySelector('.v17-staff-rail');
 const controls=[...track.querySelectorAll('[data-v9-slide]')];
 if(!rail)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const refresh=()=>{
  const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
  for(const button of controls){
   const left=button.dataset.v9Slide==="-1";
   button.disabled=left?rail.scrollLeft<2:rail.scrollLeft>=max-2;
  }
 };
 for(const button of controls)button.addEventListener('click',()=>{
  const step=Number(button.dataset.v9Slide);
  rail.scrollBy({left:Math.max(132,Math.floor(rail.clientWidth*0.7))*step,behavior:reduced.matches?'instant':'smooth'});
 });
 rail.addEventListener('scroll',refresh,{passive:true});
 window.addEventListener('resize',refresh,{passive:true});
 requestAnimationFrame(refresh);
})();
