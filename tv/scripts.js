let catalog=[], ytPlayer=null, currentList=[], currentIndex=0;
let isShuffle=false; const blockedIds=new Set();

/* …funções fetchCatalog, populateCategories, populateSubcategories
      onYouTubeIframeAPIReady, onPlayerError, rebuildList e playCurrent
      continuam EXACTAMENTE como na versão estável anterior … */

/* navegação básica */
function next(){ currentIndex=isShuffle
  ? Math.floor(Math.random()*currentList.length)
  : (currentIndex+1)%currentList.length; playCurrent(); }
function prev(){ currentIndex=isShuffle
  ? Math.floor(Math.random()*currentList.length)
  : (currentIndex-1+currentList.length)%currentList.length; playCurrent(); }
function toggleShuffle(){ isShuffle=!isShuffle;
  document.getElementById('shuffleBtn').style.background=
    isShuffle?'#d4b67a':'#e0c097'; }

/* 🔀 sorteia em TODO o catálogo e sincroniza UI */
function shuffleAll(){
  const pool=catalog.filter(v=>!blockedIds.has(v.id));
  if(!pool.length) return;
  const vid=pool[Math.floor(Math.random()*pool.length)];

  // ajusta selects
  document.getElementById('categorySelect').value=vid.cat;
  populateSubcategories(vid.cat);
  document.getElementById('subCategorySelect').value=vid.sub;

  rebuildList();                              // refaz currentList sem bloqueados
  const idx=currentList.findIndex(v=>v.id===vid.id);
  currentIndex=idx>=0?idx:0;
  playCurrent();
}

/* liga controles */
function initUI(){
  document.getElementById('categorySelect')
          .addEventListener('change',e=>{
            populateSubcategories(e.target.value); rebuildList();});
  document.getElementById('subCategorySelect')
          .addEventListener('change',rebuildList);
  document.getElementById('channelKnob')
          .addEventListener('input',e=>{
            currentIndex=+e.target.value; playCurrent();});
  document.getElementById('prevBtn')   .addEventListener('click',prev);
  document.getElementById('nextBtn')   .addEventListener('click',next);
  document.getElementById('shuffleBtn').addEventListener('click',toggleShuffle);

  // novos botões inline
  document.getElementById('nextInline') .addEventListener('click',next);
  document.getElementById('shuffleAll') .addEventListener('click',shuffleAll);
}

/* boot */
window.addEventListener('DOMContentLoaded',async()=>{
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initUI();
  // player será criado pela API
});
