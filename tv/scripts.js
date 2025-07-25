/* Moon TV – zapping estável + shuffle inicial + botões inline */

let catalog = [];              // todo o JSON
let ytPlayer = null;           // instância YouTube
let currentList = [];          // lista filtrada (cat/sub) = ordem embaralhada
let currentIndex = 0;          // posição dentro da currentList
let isShuffle = false;         // modo shuffle local
const blockedIds = new Set();  // vídeos que pedem login → ignorados

/* util ─────────────────────────────────────────────── */
const $ = sel => document.getElementById(sel);
const shuffleArray = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

/* 1. Carrega catálogo -------------------------------- */
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

/* 2. Selects ---------------------------------------- */
function populateCategories() {
  const sel = $('categorySelect');
  sel.innerHTML = '';
  [...new Set(catalog.map(v => v.cat))].forEach(c => sel.add(new Option(c, c)));
}
function populateSubcategories(cat) {
  const sel = $('subCategorySelect');
  sel.innerHTML = '';
  [...new Set(
    catalog.filter(v => v.cat === cat && !blockedIds.has(v.id)).map(v => v.sub)
  )].forEach(s => sel.add(new Option(s, s)));
}

/* 3. Player (host = nocookie) ------------------------ */
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width: '100%', height: '100%',
    host: 'https://www.youtube-nocookie.com',
    playerVars: { rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady      : () => rebuildList(true),          // shuffle inicial
      onStateChange: e => e.data === YT.PlayerState.ENDED && next(),
      onError      : onPlayerError
    }
  });
}

/* 4. Erro de embed → marca bloqueado e avança -------- */
function onPlayerError() {
  const bad = currentList[currentIndex]?.id;
  if (bad) blockedIds.add(bad);
  rebuildList(false);   // mantém ordem atual
  next();
}

/* 5. Reconstrói lista filtrada ---------------------- */
function rebuildList(doShuffle) {
  const cat = $('categorySelect').value;
  const sub = $('subCategorySelect').value;

  currentList = catalog
    .filter(v => v.cat === cat && v.sub === sub && !blockedIds.has(v.id));

  if (doShuffle) shuffleArray(currentList);

  currentIndex = doShuffle
    ? Math.floor(Math.random() * currentList.length)   // começa aleatório
    : Math.min(currentIndex, currentList.length - 1);  // mantém posição

  $('channelKnob').max = currentList.length - 1;
  playCurrent();
}

/* 6. Reproduz índice atual e sincroniza UI ---------- */
function playCurrent() {
  if (!currentList.length) return;
  const id = currentList[currentIndex].id;
  ytPlayer.loadVideoById(id);
  $('channelKnob').value = currentIndex;
  $('knobLabel').textContent = `Canal ${currentIndex}`;
}

/* 7. Navegação básica ------------------------------- */
const next = () => {
  currentIndex = isShuffle
    ? Math.floor(Math.random() * currentList.length)
    : (currentIndex + 1) % currentList.length;
  playCurrent();
};
const prev = () => {
  currentIndex = isShuffle
    ? Math.floor(Math.random() * currentList.length)
    : (currentIndex - 1 + currentList.length) % currentList.length;
  playCurrent();
};
function toggleShuffle() {
  isShuffle = !isShuffle;
  $('shuffleBtn').style.background = isShuffle ? '#d4b67a' : '#e0c097';
}

/* 8. Shuffle global 🔀 (toda a base) ----------------- */
function shuffleAll() {
  const pool = catalog.filter(v => !blockedIds.has(v.id));
  if (!pool.length) return;
  const vid = pool[Math.floor(Math.random() * pool.length)];

  // sincroniza selects
  $('categorySelect').value = vid.cat;
  populateSubcategories(vid.cat);
  $('subCategorySelect').value = vid.sub;

  rebuildList(false);                       // mantém ordem default
  currentIndex = currentList.findIndex(v => v.id === vid.id);
  if (currentIndex === -1) currentIndex = 0;
  playCurrent();
}

/* 9. Liga UI ---------------------------------------- */
function initUI() {
  $('categorySelect').addEventListener('change', e => {
    populateSubcategories(e.target.value);
    rebuildList(true);                      // embaralha a cada troca
  });
  $('subCategorySelect').addEventListener('change', () => rebuildList(true));

  $('channelKnob').addEventListener('input', e => {
    currentIndex = +e.target.value;
    playCurrent();
  });

  $('prevBtn')   .addEventListener('click', prev);
  $('nextBtn')   .addEventListener('click', next);
  $('shuffleBtn').addEventListener('click', toggleShuffle);

  // botões inline na tela:
  $('nextInline')  .addEventListener('click', next);
  $('shuffleAll')  .addEventListener('click', shuffleAll);
}

/* 🔟 Boot ------------------------------------------- */
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories($('categorySelect').value);
  initUI();
  // player será criado pela API quando disponível
});
