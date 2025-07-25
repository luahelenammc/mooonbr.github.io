let catalog = [];

// instâncias para embed
const providers = [
  id => `https://piped.kavin.rocks/embed/${id}?autoplay=1`,
  id => `https://yewtu.eu/embed/${id}?autoplay=1`
];

async function fetchCatalog() {
  const res = await fetch('videos.json');
  catalog = await res.json();
}

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

// tenta carregar em cada provider até funcionar
function loadVideo(id) {
  const player = document.getElementById('player');
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.style.display = 'none';

  let attempt = 0;
  let loaded = false;

  // limpa src anterior
  player.src = 'about:blank';

  // event listener para detectar carga
  const onLoad = () => {
    loaded = true;
    player.removeEventListener('load', onLoad);
  };
  player.addEventListener('load', onLoad);

  function tryNext() {
    if (loaded) return;
    if (attempt >= providers.length) {
      // todos falharam
      errorMsg.style.display = 'block';
      return;
    }
    const url = providers[attempt++](id);
    player.src = url;
    // se não carregar em 5s, tenta próximo
    setTimeout(tryNext, 5000);
  }

  tryNext();
}

function updateKnob() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  const vids = catalog.filter(v => v.cat === cat && v.sub === sub);
  const knob = document.getElementById('channelKnob');
  knob.max = vids.length - 1;
  knob.value = 0;
  document.getElementById('knobLabel').textContent = `Canal 0`;
  if (vids[0]) loadVideo(vids[0].id);
}

function initControls() {
  document.getElementById('categorySelect').addEventListener('change', e => {
    populateSubcategories(e.target.value);
    updateKnob();
  });
  document.getElementById('subCategorySelect').addEventListener('change', updateKnob);
  document.getElementById('channelKnob').addEventListener('input', e => {
    const cat = document.getElementById('categorySelect').value;
    const sub = document.getElementById('subCategorySelect').value;
    const vids = catalog.filter(v => v.cat === cat && v.sub === sub);
    const idx = parseInt(e.target.value, 10);
    document.getElementById('knobLabel').textContent = `Canal ${idx}`;
    if (vids[idx]) loadVideo(vids[idx].id);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  updateKnob();
});
