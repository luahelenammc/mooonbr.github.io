// carrega o catálogo de vídeos
let catalog;

async function fetchCatalog() {
  const res = await fetch('videos.json');
  catalog = await res.json();
}

function populateCategories() {
  const cats = [...new Set(catalog.map(v => v.cat))];
  const catSel = document.getElementById('categorySelect');
  cats.forEach(c => {
    const o = new Option(c, c);
    catSel.add(o);
  });
}

function populateSubcategories(cat) {
  const subs = [...new Set(catalog.filter(v => v.cat === cat).map(v => v.sub))];
  const subSel = document.getElementById('subCategorySelect');
  subSel.innerHTML = '';
  subs.forEach(s => {
    const o = new Option(s, s);
    subSel.add(o);
  });
}

function updateKnob() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  const vids = catalog.filter(v => v.cat === cat && v.sub === sub);
  const knob = document.getElementById('channelKnob');
  knob.max = vids.length - 1;
  knob.value = 0;
  document.getElementById('knobLabel').textContent = `Canal 0`;
  loadVideo(vids[0].id);
}

function loadVideo(id) {
  const player = document.getElementById('player');
  player.src = `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
}

function initControls() {
  document.getElementById('categorySelect').addEventListener('change', () => {
    populateSubcategories(this.value);
    updateKnob();
  });

  document.getElementById('subCategorySelect').addEventListener('change', updateKnob);

  document.getElementById('channelKnob').addEventListener('input', e => {
    const cat = document.getElementById('categorySelect').value;
    const sub = document.getElementById('subCategorySelect').value;
    const vids = catalog.filter(v => v.cat === cat && v.sub === sub);
    const idx = parseInt(e.target.value, 10);
    document.getElementById('knobLabel').textContent = `Canal ${idx}`;
    loadVideo(vids[idx].id);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initControls();
  updateKnob();
});
