let catalog      = [];
let ytPlayer     = null;
let currentList  = [];
let currentIndex = 0;
let isShuffle    = false;
const blockedIds = new Set();

// 1️⃣ Carrega o JSON de vídeos
async function fetchCatalog() {
  catalog = await (await fetch('videos.json')).json();
}

// 2️⃣ Popula selects
function populateCategories() {
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '';
  [...new Set(catalog.map(v => v.cat))]
    .forEach(c => sel.add(new Option(c, c)));
}
function populateSubcategories(cat) {
  const sel = document.getElementById('subCategorySelect');
  sel.innerHTML = '';
  [...new Set(
    catalog.filter(v => v.cat === cat && !blockedIds.has(v.id))
           .map(v => v.sub)
  )].forEach(s => sel.add(new Option(s, s)));
}

// 3️⃣ Quando a API estiver pronta
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('player', {
    width : '100%', height: '100%',
    host  : 'https://www.youtube-nocookie.com',
    playerVars: {
      rel: 0, autoplay: 1, modestbranding: 1, playsinline: 1
    },
    events: {
      onReady      : () => rebuildList(),
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED) nextChannel();
      },
      onError      : handleError
    }
  });
}

// 4️⃣ Marca bloqueados e segue adiante
function handleError() {
  const badId = currentList[currentIndex]?.id;
  if (badId) blockedIds.add(badId);
  rebuildList();
  nextChannel();
}

// 5️⃣ Refiltra a lista e reseta
function rebuildList() {
  const cat = document.getElementById('categorySelect').value;
  const sub = document.getElementById('subCategorySelect').value;
  currentList = catalog
    .filter(v => v.cat === cat && v.sub === sub && !blockedIds.has(v.id));
  currentIndex = 0;
  document.getElementById('channelKnob').max = currentList.length - 1;
  playCurrent();
}

// 6️⃣ Reproduz o vídeo atual
function playCurrent() {
  if (!currentList.length) return;
  const { id } = currentList[currentIndex];
  ytPlayer.loadVideoById(id);
  document.getElementById('channelKnob').value = currentIndex;
  document.getElementById('knobLabel').textContent = `Canal ${currentIndex}`;
}

// 7️⃣ Próximo e anterior
function nextChannel() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * currentList.length);
  } else {
    currentIndex = (currentIndex + 1) % currentList.length;
  }
  playCurrent();
}
function prevChannel() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * currentList.length);
  } else {
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
  }
  playCurrent();
}

// 8️⃣ Shuffle de canais
function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn')
    .style.background = isShuffle ? '#d4b67a' : '#e0c097';
}

// 9️⃣ Sorteio global “Aleatório” inline
function randomAll() {
  const rnd = catalog[Math.floor(Math.random() * catalog.length)];
  // ajusta selects
  document.getElementById('categorySelect').value = rnd.cat;
  populateSubcategories(rnd.cat);
  document.getElementById('subCategorySelect').value = rnd.sub;
  rebuildList();
  // encontra posição e toca
  currentIndex = currentList.findIndex(v => v.id === rnd.id);
  playCurrent();
}

// 🔟 Liga toda a interface
function initUI() {
  // selects
  document.getElementById('categorySelect')
    .addEventListener('change', e => {
      populateSubcategories(e.target.value);
      rebuildList();
    });
  document.getElementById('subCategorySelect')
    .addEventListener('change', rebuildList);

  // slider
  document.getElementById('channelKnob')
    .addEventListener('input', e => {
      currentIndex = +e.target.value;
      playCurrent();
    });

  // inline buttons
  document.getElementById('nextInline')
    .addEventListener('click', nextChannel);
  document.getElementById('randomInline')
    .addEventListener('click', randomAll);

  // controls abaixo
  document.getElementById('prevBtn')
    .addEventListener('click', prevChannel);
  document.getElementById('shuffleBtn')
    .addEventListener('click', toggleShuffle);
  document.getElementById('nextBtn')
    .addEventListener('click', nextChannel);
}

// 🚀 Startup
window.addEventListener('DOMContentLoaded', async () => {
  await fetchCatalog();
  populateCategories();
  populateSubcategories(document.getElementById('categorySelect').value);
  initUI();
  // onYouTubeIframeAPIReady dispara após o SDK carregar
});
