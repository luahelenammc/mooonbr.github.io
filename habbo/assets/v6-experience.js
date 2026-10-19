/**
 * V6 rarity display: progressive discovery.
 * JS is additive: without JS, V5's entire collection remains visible.
 */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const families = [...main.querySelectorAll('.family')].filter(section => section.querySelector('.grid.rares'));
  const navigation = main.querySelector('.rail');
  if (families.length < 2 || !navigation) return;

  const locale = document.documentElement.lang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  const labels = locale === 'pt'
    ? { all: 'Ver todas as famílias', single: 'Uma família por vez', of: 'de', sr: 'Família selecionada' }
    : { all: 'View all families', single: 'One family at a time', of: 'of', sr: 'Selected family' };

  const items = [...navigation.querySelectorAll('a[href^="#family-"]')];
  const familiesById = new Map(families.map(section => [section.id, section]));
  const navItems = items.filter(link => familiesById.has(decodeURIComponent(link.hash.slice(1))));
  if (!navItems.length) return;

  const summary = document.createElement('div');
  summary.className = 'v6-family-line';
  const indicator = document.createElement('span');
  indicator.setAttribute('aria-live', 'polite');
  indicator.setAttribute('aria-atomic', 'true');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  let showAll = false;
  toggle.textContent = labels.all;
  summary.append(indicator, toggle);
  navigation.insertAdjacentElement('afterend', summary);

  let selectedId = familiesById.has(decodeURIComponent(location.hash.slice(1)))
    ? decodeURIComponent(location.hash.slice(1))
    : families[0].id;

  const render = ({ focus = false } = {}) => {
    const index = families.findIndex(section => section.id === selectedId);
    families.forEach(section => section.dataset.v6Visible = String(section.id === selectedId));
    navItems.forEach(link => {
      const active = decodeURIComponent(link.hash.slice(1)) === selectedId;
      link.setAttribute('aria-current', String(active));
      if (active && focus) link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    });
    indicator.textContent = labels.sr + ': ' + (index + 1) + ' ' + labels.of + ' ' + families.length;
    toggle.textContent = showAll ? labels.single : labels.all;
    main.classList.toggle('v6-show-all', showAll);
  };

  navItems.forEach(link => link.addEventListener('click', event => {
    const id = decodeURIComponent(link.hash.slice(1));
    if (!familiesById.has(id)) return;
    event.preventDefault();
    selectedId = id;
    showAll = false;
    history.replaceState(null, '', '#' + encodeURIComponent(id));
    render({ focus: true });
  }));

  toggle.addEventListener('click', () => { showAll = !showAll; render(); });
  main.classList.add('v6-rare-experience');
  // If CSS was not loaded, this remains the intact V5 listing.
  render();
})();
