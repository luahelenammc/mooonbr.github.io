let catalog      = [];
let ytPlayer     = null;
let currentList  = [];
let currentIndex = 0;
let isShuffle    = false;
const blockedIds = new Set();

/* 1. Carrega o catálogo ------------------------------ */
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

/* 2. Preenche selects -------------------------------- */
function populateCategories() {
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '';
  [...new Set(catalog.map(v => v.cat))].forEach(c => sel.add(new Option(c, c)));
}

function populateSubcategories(cat) {
  const sel = document.getElementById('subCategorySelect');
  sel.innerHTML = '';
  [...new Set(
    catalog.filter(v => v.cat === cat && !blockedIds.has(v.id)).map(v => v.sub)
  )].forEach(s => sel.add(new Option(s, s)));
}

/* 3. Cria o player ----------------------------------- */
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width : '100%',
    height: '100%',
    host  : 'https://www.youtube-nocookie.com',
    playerVars: { rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady      : () => {
        rebuildList();
        shuffleStart();
      },
      onStateChange: e => { if (e.data === YT.PlayerState.ENDED) next(); },
      onError      : onPlayerError
    }
  });
}

/* 4. Trata erro e evita loop ------------------------ */
function onPlayerError() {
  const badId = currentList[currentIndex]?.id;
  if (badId) blockedIds.add(badId);
  rebuildList();
  next();
}

/* 5. Reconstrói lista -------------------------------- */
function rebuildList() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;

  currentList = catalog
    .filter(v => v.cat === cat && v.sub === sub && !blockedIds.has(v.id));

  if (isShuffle) shuffleArray(currentList);

  currentIndex = 0;
  document.getElementById('channelKnob').max = currentList.length - 1;
  playCurrent();
}

/* 6. Reproduz vídeo atual ---------------------------- */
function playCurrent() {
  if (!currentList.length) return;
  const { id } = currentList[currentIndex];
  ytPlayer.loadVideoById(id);

  document.getElementById('channelKnob').value = currentIndex;
  document.getElementById('knobLabel').textContent = `Canal ${currentIndex}`;
}

/* 7. Navegação -------------------------------------- */
function next() {
  currentIndex = isShuffle
    ? Math.floor(Math.random() * currentList.length)
    : (currentIndex + 1) % currentList.length;
  playCurrent();
}

function prev() {
  currentIndex = isShuffle
    ? Math.floor(Math.random() * currentList.length)
    : (currentIndex - 1 + currentList.length) % currentList.length;
  playCurrent();
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn').style.background =
    isShuffle ? '#d4b67a' : '#e0c097';
}

/* Shuffle inicial ao carregar ----------------------- */
function shuffleStart() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;

  currentList = catalog
    .filter(v => v.cat === cat && v.sub === sub && !blockedIds.has(v.id));

  shuffleArray(currentList);
  currentIndex = 0;
  document.getElementById('channelKnob').max = currentList.length - 1;
  playCurrent();
}

/* Shuffle global (qualquer vídeo) ------------------- */
function shuffleAll() {
  const eligible = catalog.filter(v => !blockedIds.has(v.id));
  const randomVideo = eligible[Math.floor(Math.random() * eligible.length)];

  if (!randomVideo) return;

  // atualiza selects
  document.getElementById('categorySelect').value = randomVideo.cat;
  populateSubcategories(randomVideo.cat);
  document.getElementById('subCategorySelect').value = randomVideo.sub;

  // atualiza lista e index
  currentList = catalog.filter(v =>
    v.cat === randomVideo.cat && v.sub === randomVideo.sub && !blockedIds.has(v.id)
  );

  currentIndex = currentList.findIndex(v => v.id === randomVideo.id);
  document.getElementById('channelKnob').max = currentList.length - 1;
  playCurrent();
}

/* Fisher–Yates Shuffle ------------------------------ */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* 8. Liga controles --------------------------------- */
function initUI() {
  document.getElementById('categorySelect')
    .addEventListener('change', e => {
      populateSubcategories(e.target.value);
      rebuildList();
    });

  document.getElementById('subCategorySelect')
    .addEventListener('change', rebuildList);

  document.getElementById('channelKnob')
    .addEventListener('input', e => {
      currentIndex = +e.target.value;
      playCurrent();
    });

  document.getElementById('prevBtn')    .addEventListener('click', prev);
  document.getElementById('nextBtn')    .addEventListener('click', next);
  document.getElementById('shuffleBtn') .addEventListener('click', toggleShuffle);

  // Controles inline
  document.getElementById('prevInline') .addEventListener('click', prev);
  document.getElementById('nextInline') .addEventListener('click', next);
  document.getElementById('shuffleAll') .addEventListener('click', shuffleAll);
}

/* 9. Inicializa ------------------------------------- */
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initUI();
});
