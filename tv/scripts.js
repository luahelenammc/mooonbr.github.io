let catalog = [];
let ytPlayer = null;
let currentList = [];
let currentIndex = 0;

// 1️⃣ Carrega o JSON
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

// 2️⃣ Popula selects
function populateCategories() {
  const cats = [...new Set(catalog.map(v => v.cat))];
  const sel = document.getElementById('categorySelect');
  cats.forEach(c => sel.add(new Option(c, c)));
}

function populateSubcategories(cat) {
  const subs = [...new Set(catalog.filter(v => v.cat === cat).map(v => v.sub))];
  const sel = document.getElementById('subCategorySelect');
  sel.innerHTML = '';
  subs.forEach(s => sel.add(new Option(s, s)));
}

// 3️⃣ YouTube IFrame API ready
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width: '100%', height: '100%',
    videoId: '',
    playerVars: { rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => updateChannelList(),
      onStateChange: e => {
        // 0 = vídeo terminou
        if (e.data === YT.PlayerState.ENDED) nextChannel();
      },
      onError: () => nextChannel()
    }
  });
}

// 4️⃣ Atualiza a lista de acordo com selects
function updateChannelList() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog.filter(v => v.cat === cat && v.sub === sub);
  currentIndex = 0;
  document.getElementById('channelKnob').max = currentList.length - 1;
  loadChannel(0);
}

// 5️⃣ Carrega canal por índice
function loadChannel(idx) {
  if (!currentList.length) return;
  currentIndex = idx % currentList.length;
  const vid = currentList[currentIndex];
  ytPlayer.loadVideoById(vid.id);
  document.getElementById('channelKnob').value = currentIndex;
  document.getElementById('knobLabel').textContent = `Canal ${currentIndex}`;
}

// 6️⃣ Próximo canal
function nextChannel() {
  loadChannel(currentIndex + 1);
}

// 7️⃣ Canal anterior
function prevChannel() {
  loadChannel(currentIndex - 1 + currentList.length);
}

// 8️⃣ Shuffle geral (qualquer vídeo do catálogo)
function playRandom() {
  const rnd = Math.floor(Math.random() * catalog.length);
  ytPlayer.loadVideoById(catalog[rnd].id);
  // opcional: resetar currentList/knob para refletir mudança
}

// 9️⃣ Liga controles
function initControls() {
  document.getElementById('categorySelect')
    .addEventListener('change', updateChannelList);

  document.getElementById('subCategorySelect')
    .addEventListener('change', updateChannelList);

  document.getElementById('channelKnob')
    .addEventListener('input', e => loadChannel(+e.target.value));

  document.getElementById('nextInline')
    .addEventListener('click', nextChannel);

  document.getElementById('shuffleAll')
    .addEventListener('click', playRandom);
}

// 🔧 Boot
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  // onYouTubeIframeAPIReady será chamado pela API
});
