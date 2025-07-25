let catalog = [];
let ytPlayer = null;
let currentList = [];

// Carrega o JSON
async function fetchCatalog() {
  const res = await fetch('videos.json');
  catalog = await res.json();
}

// Popula selects
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

// Chamado pela API do YouTube quando está pronta
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: '', // vazio inicialmente
    playerVars: {
      rel: 0,
      autoplay: 1,
      modestbranding: 1
    },
    events: {
      onReady: () => { /* nada*/ },
      onError: onPlayerError
    }
  });
}

// Trata erro 101/150 de embed bloqueado
function onPlayerError(event) {
  const code = event.data;
  if (code === 101 || code === 150) {
    document.getElementById('errorMsg').style.display = 'block';
    // tenta pular para próximo canal após 2s
    setTimeout(() => {
      document.getElementById('errorMsg').style.display = 'none';
      advanceChannel();
    }, 2000);
  }
}

// Carrega o vídeo atual na lista
function loadCurrentVideo() {
  const idx = parseInt(document.getElementById('channelKnob').value, 10);
  const vid = currentList[idx];
  if (!vid) return;
  ytPlayer.loadVideoById(vid.id);
  document.getElementById('knobLabel').textContent = `Canal ${idx}`;
}

// Avança o knob para o próximo canal
function advanceChannel() {
  const knob = document.getElementById('channelKnob');
  const next = (parseInt(knob.value,10) + 1) % currentList.length;
  knob.value = next;
  loadCurrentVideo();
}

// Atualiza currentList a partir dos selects
function updateKnob() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog.filter(v => v.cat === cat && v.sub === sub);
  const knob = document.getElementById('channelKnob');
  knob.max = currentList.length - 1;
  knob.value = 0;
  loadCurrentVideo();
}

// Inicializa eventos dos controles
function initControls() {
  document.getElementById('categorySelect').addEventListener('change', e => {
    populateSubcategories(e.target.value);
    updateKnob();
  });
  document.getElementById('subCategorySelect').addEventListener('change', updateKnob);
  document.getElementById('channelKnob').addEventListener('input', loadCurrentVideo);
}

window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  updateKnob();
});
