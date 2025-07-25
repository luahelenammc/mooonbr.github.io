// scripts.js — versão estável anterior

let catalog = [];
let ytPlayer = null;
let currentList = [];
let currentIndex = 0;

// 1️⃣ Carrega o JSON de vídeos
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

// 2️⃣ Popula selects de categoria e subcategoria
function populateCategories() {
  const cats = [...new Set(catalog.map(v => v.cat))];
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '';
  cats.forEach(c => sel.add(new Option(c, c)));
}

function populateSubcategories(cat) {
  const subs = [...new Set(
    catalog
      .filter(v => v.cat === cat)
      .map(v => v.sub)
  )];
  const sel = document.getElementById('subCategorySelect');
  sel.innerHTML = '';
  subs.forEach(s => sel.add(new Option(s, s)));
}

// 3️⃣ YouTube IFrame API
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width: '100%', height: '100%',
    videoId: '',
    playerVars: { rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => updateKnob(),
      onStateChange: e => {
        // ao terminar, vai pro próximo
        if (e.data === YT.PlayerState.ENDED) nextChannel();
      },
      onError: () => nextChannel() // pula vídeos bloqueados
    }
  });
}

// 4️⃣ Carrega o vídeo no índice atual
function loadCurrentVideo() {
  if (!currentList.length) return;
  const vid = currentList[currentIndex];
  ytPlayer.loadVideoById(vid.id);
  // sincroniza o slider e o label
  document.getElementById('channelKnob').value = currentIndex;
  document.getElementById('knobLabel').textContent = `Canal ${currentIndex}`;
}

// 5️⃣ Próximo canal
function nextChannel() {
  currentIndex = (currentIndex + 1) % currentList.length;
  loadCurrentVideo();
}

// 6️⃣ Atualiza a lista e reseta para o canal 0
function updateKnob() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog.filter(v => v.cat === cat && v.sub === sub);
  currentIndex = 0;
  document.getElementById('channelKnob').max = currentList.length - 1;
  loadCurrentVideo();
}

// 7️⃣ Liga os controles
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
}

// 🔧 Bootstrapping
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  updateKnob();
});
