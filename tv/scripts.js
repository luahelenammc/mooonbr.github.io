let catalog = [];
let ytPlayer = null;
let currentList = [];
let currentIndex = 0;
const blockedIds = new Set();

/* 1. Carrega o catálogo */
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

/* 2. Embaralha array (Fisher–Yates) */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* 3. Preenche selects */
function populateCategories() {
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '';
  [...new Set(catalog.map(v => v.cat))]
    .forEach(c => sel.add(new Option(c, c)));
}

function populateSubcategories(cat) {
  const sel = document.getElementById('subCategorySelect');
  sel.innerHTML = '';
  [...new Set(
    catalog
      .filter(v => v.cat === cat && !blockedIds.has(v.id))
      .map(v => v.sub)
  )].forEach(s => sel.add(new Option(s, s)));
}

/* 4. Cria o player (host = nocookie) */
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width: '100%', height: '100%',
    host: 'https://www.youtube-nocookie.com',
    playerVars: { rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady      : () => rebuildList(true),           // shuffle inicial
      onStateChange: e  => { if (e.data === YT.PlayerState.ENDED) next(); },
      onError      : onPlayerError
    }
  });
}

/* 5. Trata erro de embed (101/150/etc) */
function onPlayerError() {
  const badId = currentList[currentIndex]?.id;
  if (badId) blockedIds.add(badId);
  rebuildList(false);
  next();
}

/* 6. Reconstrói currentList e carrega */
function rebuildList(doShuffle) {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;

  currentList = catalog.filter(v =>
    v.cat === cat &&
    v.sub === sub &&
    !blockedIds.has(v.id)
  );

  if (doShuffle) {
    shuffleArray(currentList);
    currentIndex = Math.floor(Math.random() * currentList.length);
  } else {
    currentIndex = Math.min(currentIndex, currentList.length - 1);
  }

  document.getElementById('channelKnob').max = currentList.length - 1;
  playCurrent();
}

/* 7. Reproduz vídeo e sincroniza slider/label */
function playCurrent() {
  if (!currentList.length) return;
  const id = currentList[currentIndex].id;
  ytPlayer.loadVideoById(id);
  document.getElementById('channelKnob').value = currentIndex;
  document.getElementById('knobLabel').textContent = `Canal ${currentIndex}`;
}

/* 8. Navegação */
function next() {
  currentIndex = (currentIndex + 1) % currentList.length;
  playCurrent();
}
function prev() {
  currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
  playCurrent();
}

/* 9. Shuffle global (qualquer vídeo do catálogo) */
function shuffleAll() {
  const pool = catalog.filter(v => !blockedIds.has(v.id));
  if (!pool.length) return;
  const randomVid = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById('categorySelect').value = randomVid.cat;
  populateSubcategories(randomVid.cat);
  document.getElementById('subCategorySelect').value = randomVid.sub;

  rebuildList(false);
  const idx = currentList.findIndex(v => v.id === randomVid.id);
  currentIndex = idx >= 0 ? idx : 0;
  playCurrent();
}

/* 10. Liga controles */
function initUI() {
  document.getElementById('categorySelect')
    .addEventListener('change', e => {
      populateSubcategories(e.target.value);
      rebuildList(true);
    });

  document.getElementById('subCategorySelect')
    .addEventListener('change', () => rebuildList(true));

  document.getElementById('channelKnob')
    .addEventListener('input', e => {
      currentIndex = +e.target.value;
      playCurrent();
    });

  document.getElementById('prevBtn')   .addEventListener('click', prev);
  document.getElementById('nextBtn')   .addEventListener('click', next);
  document.getElementById('shuffleBtn').addEventListener('click', shuffleAll);
}

/* 11. Bootstrap */
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initUI();
  // onYouTubeIframeAPIReady será chamado pelo SDK quando pronto
});
