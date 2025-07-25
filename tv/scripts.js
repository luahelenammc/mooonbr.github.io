let catalog = [];

async function fetchCatalog() {
  const res = await fetch('videos.json');
  catalog = await res.json();
}

function populateCategories() {
  const cats = [...new Set(catalog.map(v => v.cat))];
  const catSel = document.getElementById('categorySelect');
  cats.forEach(c => catSel.add(new Option(c, c)));
}

function populateSubcategories(cat) {
  const subs = [...new Set(catalog.filter(v => v.cat === cat).map(v => v.sub))];
  const subSel = document.getElementById('subCategorySelect');
  subSel.innerHTML = '';
  subs.forEach(s => subSel.add(new Option(s, s)));
}

// **Troca o embed para Invidious** (yewtu.be)
function loadVideo(id) {
  const player = document.getElementById('player');
  // domínio Invidious livre de bloqueios de login
  const embedUrl = `https://yewtu.be/embed/${id}?autoplay=1&quality=hq`;
  player.src = embedUrl;
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
  // inicia subcats e player
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  updateKnob();
});
