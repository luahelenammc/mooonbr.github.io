let catalog = [];
let ytPlayer = null;
let currentList = [];
let currentIndex = 0;
let isShuffle = false;

// Carrega o JSON de vídeos
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

// Popula categorias e subcategorias
function populateCategories() {
  const cats = [...new Set(catalog.map(v => v.cat))];
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '';
  cats.forEach(c => sel.add(new Option(c, c)));
}
function populateSubcategories(cat) {
  const subs = [...new Set(catalog.filter(v => v.cat === cat).map(v => v.sub))];
  const sel = document.getElementById('subCategorySelect');
  sel.innerHTML = '';
  subs.forEach(s => sel.add(new Option(s, s)));
}

// YouTube IFrame API callback
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width: '100%', height: '100%',
    videoId: '',
    playerVars: { rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => updateKnob(),
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED) nextChannel();
      },
      onError: () => nextChannel()
    }
  });
}

// Carrega o vídeo atual e sincroniza o knob
function loadCurrentVideo() {
  if (!currentList.length) return;
  const vid = currentList[currentIndex];
  ytPlayer.loadVideoById(vid.id);
  document.getElementById('channelKnob').value = currentIndex;
  document.getElementById('knobLabel').textContent = `Canal ${currentIndex}`;
}

// Vai para o próximo canal ou shuffle se ativo
function nextChannel() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * currentList.length);
  } else {
    currentIndex = (currentIndex + 1) % currentList.length;
  }
  loadCurrentVideo();
}

// Vai para o canal anterior ou shuffle se ativo
function prevChannel() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * currentList.length);
  } else {
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
  }
  loadCurrentVideo();
}

// Alterna shuffle
function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn')
    .style.background = isShuffle ? '#d4b67a' : '#e0c097';
}

// Atualiza a lista de vídeos e reseta para o canal 0
function updateKnob() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog.filter(v => v.cat === cat && v.sub === sub);
  currentIndex = 0;
  document.getElementById('channelKnob').max = currentList.length - 1;
  loadCurrentVideo();
}

// Inicializa os controles
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

// Bootstrapping
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  // onYouTubeIframeAPIReady será disparado pela API
});
