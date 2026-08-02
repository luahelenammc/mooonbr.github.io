import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const repoRoot = path.resolve(root, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const html = read('index.html');
const css = read('assets/site.css');
const js = read('assets/site.js');
const checks = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
  checks.push(message);
}

assert(html.includes('<main id="main-content">'), 'semantic main exists');
assert(html.includes('Contexto que sua IA consegue realmente usar.'), 'new positioning is present');
assert(html.includes('Constituir. Metabolizar.'), 'living-source method is present');
assert(html.includes('downloads/MOON_SOURCE_SETUP.md'), 'Setup is linked locally');
assert(html.includes('downloads/MOON_SOURCE_KERNEL.md'), 'Kernel is linked locally');
assert(html.includes('/downloads/CHAT_WORK_ROUTING_PROTOCOL_V2_MSL_4_3.md'), 'routing pack is linked');
assert(html.includes('/moonsource/knowledge/'), 'knowledge shelf is linked');
assert(exists('downloads/MOON_SOURCE_SETUP.md'), 'Setup file exists');
assert(exists('downloads/MOON_SOURCE_KERNEL.md'), 'Kernel file exists');
assert(fs.existsSync(path.join(repoRoot, 'downloads', 'CHAT_WORK_ROUTING_PROTOCOL_V2_MSL_4_3.md')), 'routing pack exists');
assert(exists('knowledge/index.html'), 'knowledge index exists');
assert(css.includes('@media (max-width: 760px)'), 'mobile rules exist');
assert(css.includes('prefers-reduced-motion'), 'reduced-motion rules exist');
assert(!css.match(/backdrop-filter|linear-gradient|radial-gradient|conic-gradient/), 'design avoids glass and gradient dependence');
assert(js.includes("'method.title': 'Constituir. Metabolizar.'"), 'Portuguese translation covers method');
assert(js.includes("'method.title': 'Constitute. Metabolize.'"), 'English translation covers method');
assert(js.includes('try { return window.localStorage'), 'storage access is guarded');
assert(!html.match(/staging|prototype|placeholder|coming soon/i), 'public surface contains no workflow leakage');

console.log(`Moon Source index smoke tests passed: ${checks.length} checks.`);
