(() => {
 const dialog=document.querySelector('dialog'); if(!dialog)return;
 const triggers=[...document.querySelectorAll('[data-view]')]; const buttons=triggers.filter((b,i)=>triggers.findIndex(t=>t.dataset.view===b.dataset.view)===i); let selected=0, opener=null;
 const languageLinks=[...document.querySelectorAll('a[hreflang]')].map(link=>({link,base:link.href.split('#')[0]}));
 const render=()=>{const b=buttons[selected];dialog.querySelector('.viewer-content').replaceChildren(document.querySelector(`#view-${CSS.escape(b.dataset.view)}`).content.cloneNode(true));const hash=`#view-${encodeURIComponent(b.dataset.view)}`;history.replaceState(null,'',hash);languageLinks.forEach(({link,base})=>link.href=base+hash);};
 const open=(i)=>{selected=i;opener=document.activeElement;render();if(!dialog.open)dialog.showModal();dialog.querySelector('.close').focus();};
 triggers.forEach(b=>b.addEventListener('click',()=>open(buttons.findIndex(t=>t.dataset.view===b.dataset.view))));
 dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 const step=delta=>{selected=(selected+delta+buttons.length)%buttons.length;render();};
 dialog.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.step))));
 dialog.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
 dialog.addEventListener('close',()=>{history.replaceState(null,'',location.pathname+location.search);languageLinks.forEach(({link,base})=>link.href=base);opener?.focus();});
 const hash=decodeURIComponent(location.hash.slice(1)); if(hash.startsWith('view-')){const i=buttons.findIndex(b=>b.dataset.view===hash.slice(5));if(i>=0)open(i);}
 document.querySelectorAll('[data-paginate]').forEach(section=>{const size=+section.dataset.paginate;if(!size)return;const cards=[...section.querySelectorAll('.item')],total=Math.ceil(cards.length/size);if(total<=1)return;const nav=section.querySelector('.pagination');let current=0;const show=p=>{current=p;cards.forEach((c,i)=>c.hidden=Math.floor(i/size)!==p);nav.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-current',i===p?'page':'false');});};for(let p=0;p<total;p++){const b=document.createElement('button');b.textContent=p+1;b.addEventListener('click',()=>show(p));nav.append(b);}show(0);});
})();
