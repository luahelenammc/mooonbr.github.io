let catalog = [];
let ytPlayer = null;
let currentList = [];
let currentIndex = 0;
let isShuffle = false;
const blockedIds = new Set();

// 1️⃣ Busca o catálogo
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

// 2️⃣ Popula selects
function populateCategories() {
  const cats = [...new Set(catalog.map(v => v.cat))];
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '';
  cats.forEach(c => sel.add(new Option(c, c)));
}

function populateSubcategories(cat) {
  const subs = [...new Set(
    catalog.filter(v => v.cat === cat && !blockedIds.has(v.id)).map(v => v.sub)
  )];
  const sel = document.getElementById('subCategorySelect');
  sel.innerHTML = '';
  subs.forEach(s => sel.add(new Option(s, s)));
}

// 3️⃣ Inicializa o player (nocookie)
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width: '100%', height: '100%',
    // vamos setar via loadVideoById
    videoId: '',
    playerVars: {
      rel: 0,
      autoplay: 1,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: () => updateKnob(),
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED) nextChannel();
      },
      onError: onPlayerError
    }
  });
}

// 4️⃣ Ao dar erro (códigos de embed bloqueado), marca e passa adiante
function onPlayerError(e) {
  const errorId = currentList[currentIndex]?.id;
  if (errorId) blockedIds.add(errorId);
  // re-filtra a lista para remover bloqueados
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog
    .filter(v => v.cat === cat && v.sub === sub)
    .filter(v => !blockedIds.has(v.id));

  // atualiza slider máximo
  document.getElementById('channelKnob').max = currentList.length - 1;
  // tenta próximo
  nextChannel();
}

// 5️⃣ Carrega o vídeo atual e sincroniza knob/label
function loadCurrentVideo() {
  if (!currentList.length) return;
  // corrige índice caso fora de faixa
  if (currentIndex >= currentList.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = currentList.length - 1;

  const vid = currentList[currentIndex];
  ytPlayer.loadVideoById(vid.id);

  const knob = document.getElementById('channelKnob');
  knob.value = currentIndex;
  document.getElementById('knobLabel').textContent = `Canal ${currentIndex}`;
}

// 6️⃣ Próximo canal (ou shuffle)
function nextChannel() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * currentList.length);
  } else {
    currentIndex = (currentIndex + 1) % currentList.length;
  }
  loadCurrentVideo();
}

// 7️⃣ Canal anterior (ou shuffle)
function prevChannel() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * currentList.length);
  } else {
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
  }
  loadCurrentVideo();
}

// 8️⃣ Alterna shuffle
function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn')
    .style.background = isShuffle ? '#d4b67a' : '#e0c097';
}

// 9️⃣ Atualiza a lista de vídeos e reseta o índice
function updateKnob() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog
    .filter(v => v.cat === cat && v.sub === sub)
    .filter(v => !blockedIds.has(v.id));

  currentIndex = 0;
  const knob = document.getElementById('channelKnob');
  knob.max = currentList.length - 1;
  loadCurrentVideo();
}

// 🔟 Liga os controles
function initControls() {
  document.getElementById('categorySelect')
    .addEventListener('change', e => {
      populateSubcategories(e.target.value);
      updateKnob();
    });

  document.getElementById('subCategorySelect')
    .addEventListener('change', updateKnob);

  document.getElementById('channelKnob')
    .addEventListener('input', e => {
      currentIndex = +e.target.value;
      loadCurrentVideo();
    });

  document.getElementById('prevBtn')
    .addEventListener('click', prevChannel);

  document.getElementById('shuffleBtn')
    .addEventListener('click', toggleShuffle);

  document.getElementById('nextBtn')
    .addEventListener('click', nextChannel);
}

// 🚀 Bootstrapping
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  // a API do YouTube vai chamar onYouTubeIframeAPIReady quando pronta
});
