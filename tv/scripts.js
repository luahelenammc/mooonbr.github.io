let catalog = [];
let ytPlayer = null;
let currentList = [];

// 1. Carrega o JSON
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

// 2. Popula selects
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

// 3. Chamado automaticamente pela API do YouTube
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: '', 
    playerVars: { rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => updateKnob(),
      onError: () => advanceChannel()
    }
  });
}

// 4. Carrega o vídeo atual na lista
function loadCurrentVideo() {
  const idx = +document.getElementById('channelKnob').value;
  const vid = currentList[idx];
  if (!vid) return;
  ytPlayer.loadVideoById(vid.id);
  document.getElementById('knobLabel').textContent = `Canal ${idx}`;
}

// 5. Avança para o próximo canal
function advanceChannel() {
  const knob = document.getElementById('channelKnob');
  const next = (knob.valueAsNumber + 1) % currentList.length;
  knob.value = next;
  loadCurrentVideo();
}

// 6. Atualiza a lista e o knob sempre que categoria/sub muda
function updateKnob() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog.filter(v => v.cat === cat && v.sub === sub);
  const knob = document.getElementById('channelKnob');
  knob.max = currentList.length - 1;
  knob.value = 0;
  loadCurrentVideo();
}

// 7. Eventos dos controles
function initControls() {
  document.getElementById('categorySelect')
    .addEventListener('change', e => {
      populateSubcategories(e.target.value);
      updateKnob();
    });
  document.getElementById('subCategorySelect')
    .addEventListener('change', updateKnob);
  document.getElementById('channelKnob')
    .addEventListener('input', loadCurrentVideo);
}

// 8. Bootstrapping
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  // A chamada definitiva acontece dentro de onReady da API
});
