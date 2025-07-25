let catalog = [];

async function fetchCatalog() {
  const res = await fetch('videos.json');
  catalog = await res.json();
}

function populateCategories() {
  const categories = [...new Set(catalog.map(v => v.cat))];
  const catSelect = document.getElementById('categorySelect');
  categories.forEach(c => catSelect.add(new Option(c, c)));
}

function populateSubcategories(cat) {
  const subs = [...new Set(catalog.filter(v => v.cat === cat).map(v => v.sub))];
  const subSelect = document.getElementById('subCategorySelect');
  subSelect.innerHTML = '';
  subs.forEach(s => subSelect.add(new Option(s, s)));
}

function loadVideo(id) {
  const player = document.getElementById('player');
  const url = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  url.searchParams.set('rel', '0');
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('enablejsapi', '1');
  url.searchParams.set('origin', window.location.origin);
  url.searchParams.set('host', 'https://www.youtube-nocookie.com');
  player.src = url.toString();
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
