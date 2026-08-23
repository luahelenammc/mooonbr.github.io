import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(PROJECT_ROOT, "dist");
const BASE = "/habbo";
const ASSET_VERSION = String(process.env.ASSET_VERSION || "20260823-v2-effects-hotfix").replace(/[^a-zA-Z0-9._~-]/g, "");
const CSS_ASSET = `${BASE}/assets/site.css?v=${ASSET_VERSION}`;
const JS_ASSET = `${BASE}/assets/site.js?v=${ASSET_VERSION}`;
const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function filesUnder(dir, suffix = "") {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) out.push(...filesUnder(full, suffix));
    else if (!suffix || item.name.endsWith(suffix)) out.push(full);
  }
  return out;
}

const htmlFiles = filesUnder(DIST, ".html");
const assetFiles = filesUnder(path.join(DIST, "assets", "archive-reference", "assets"));
const expectedRoutes = [
  "index.html",
  "pt-br/index.html",
  "en/index.html",
  "pt-br/topologia/index.html",
  "en/topology/index.html",
  "pt-br/metodo/index.html",
  "en/method/index.html",
  "internal/calibration/index.html"
];

for (const route of expectedRoutes) check(fs.existsSync(path.join(DIST, route)), `missing route: ${route}`);
for (const locale of ["pt-br", "en"]) {
  const prefix = locale === "pt-br" ? "pt-br/lugar" : "en/place";
  for (const place of JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "data", "places.json"), "utf8"))) {
    check(fs.existsSync(path.join(DIST, prefix, place.slug, "index.html")), `missing place route: ${prefix}/${place.slug}`);
  }
}

check(htmlFiles.length === 62, `expected 62 HTML files, found ${htmlFiles.length}`);
check(assetFiles.length === 27, `expected 27 published image assets, found ${assetFiles.length}`);
check(fs.existsSync(path.join(DIST, "PUBLICATION_MANIFEST.md")), "publication manifest missing from public build");
check(fs.existsSync(path.join(DIST, "assets", "flag-br.svg")), "Brazil flag asset missing from public build");
check(fs.existsSync(path.join(DIST, "assets", "flag-us.svg")), "US flag asset missing from public build");
check(fs.existsSync(path.join(DIST, "assets", "site.css")), "site stylesheet missing from public build");
check(fs.existsSync(path.join(DIST, "assets", "site.js")), "site script missing from public build");
check(fs.readFileSync(path.join(DIST, "assets", "site.css"), "utf8").includes(".cinematic-dock"), "cinematic dock styles missing from public build");
check(fs.readFileSync(path.join(DIST, "assets", "site.js"), "utf8").includes("data-cinematic-dock"), "cinematic dock script missing from public build");

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(DIST, file);
  check(html.includes("noindex,nofollow,noarchive"), `robots posture missing: ${rel}`);
  check(html.includes("This fan site is not affiliated"), `official disclaimer missing: ${rel}`);
  check(html.includes(CSS_ASSET), `versioned CSS missing: ${rel}`);
  check(html.includes(JS_ASSET), `versioned JS missing: ${rel}`);
  check(!/(href|src)=(['"])\/(?:pt-br|en|assets)\//.test(html), `root route leak: ${rel}`);
  check(!html.includes("https://drive.google.com/file/"), `internal Drive link leaked: ${rel}`);
  check(!html.includes("PT-BR | EN"), `plain-text language switcher leaked: ${rel}`);
  for (const match of html.matchAll(new RegExp(`${BASE}/assets/archive-reference/assets/([^'"?#]+)`, "g"))) {
    check(fs.existsSync(path.join(DIST, "assets", "archive-reference", "assets", match[1])), `missing image for ${rel}: ${match[1]}`);
  }
}

const homeHtml = fs.readFileSync(path.join(DIST, "pt-br", "index.html"), "utf8");
check((homeHtml.match(/data-room-open/g) || []).length === 27, "home does not expose all 27 dock rooms");
check(homeHtml.includes("class=\"cinematic-dock\""), "home cinematic dock missing");
check(homeHtml.includes("class=\"room-lightbox\""), "home lightbox missing");
check(homeHtml.includes("data-autoplay-ms=\"5800\""), "home production autoplay interval missing");
check(homeHtml.includes("data-dock-effect=\"zoom\""), "home zoom dock effect marker missing");
check(homeHtml.includes("data-dock-play"), "home autoplay control missing");
for (const forbidden of ["dock-intro", "dock-topline", "dock-instruction", "home-secondary", "info-dialog", "data-open-info", "Entre pela imagem.", "Uma apresentação em movimento", "relações e topologia", "método, fontes e direitos", "sequência editorial", "sobre o arquivo", "ARQUIVO INDEPENDENTE"]) {
  check(!homeHtml.includes(forbidden), `meta explanation leaked into V2 first surface: ${forbidden}`);
}
check(!homeHtml.includes("spatial-world"), "V1 map leaked into V2 home");
check(!homeHtml.includes("district-grid"), "legacy district grid leaked into V2 home");
check(!homeHtml.includes("district-island"), "legacy district island leaked into V2 home");
check(!homeHtml.includes("place-node"), "legacy place-node card leaked into V2 home");
check(!homeHtml.includes("public_reference_only"), "evidence metadata leaked into V2 first surface");
check(!homeHtml.includes("sourcePageUrl"), "source metadata leaked into V2 first surface");

const placeHtml = fs.readFileSync(path.join(DIST, "pt-br", "lugar", "lido", "index.html"), "utf8");
check(placeHtml.includes("class=\"place-arrival\""), "place arrival surface missing");
check(placeHtml.includes("data-archive-drawer"), "place archive drawer missing");
check(!placeHtml.includes("place-sidebar"), "place sidebar leaked into V1 first fold");
check(!placeHtml.includes("class=\"facts\""), "place fact grid leaked into V1 first fold");
check(placeHtml.includes("class=\"exit-paths\""), "place visual exits missing");

const topologyHtml = fs.readFileSync(path.join(DIST, "pt-br", "topologia", "index.html"), "utf8");
check(topologyHtml.includes("class=\"topology-graph\""), "topology SVG graph missing");
check(!topologyHtml.includes("edge-card"), "legacy edge-card list leaked into topology");
check(!topologyHtml.includes("topology-list"), "legacy topology list leaked into topology");

for (const file of filesUnder(DIST).filter(file => /\.(html|css|js|json|md|txt)$/i.test(file))) {
  check(!fs.readFileSync(file, "utf8").includes("drive.google.com/file/"), `private Drive URL leaked: ${path.relative(DIST, file)}`);
}

const places = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "data", "places.json"), "utf8"));
const edges = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "data", "edges.json"), "utf8"));
check(places.length === 27, `expected 27 places, found ${places.length}`);
check(edges.length === 27, `expected 27 edges, found ${edges.length}`);
check(places.every((place) => place.editorialMapPosition && place.visualCluster), "editorial map coordinates missing from normalized data");
check(places.every((place) => Number.isInteger(place.presentationOrder) && place.presentationOrder >= 1 && place.presentationOrder <= 27), "presentation order missing from normalized data");
check(new Set(places.map((place) => place.presentationOrder)).size === places.length, "presentation order contains duplicates");
check(!places.some(place => /Lanchonete|Mobiles/i.test(`${place.canonicalNamePtBr} ${place.canonicalNameEn}`)), "excluded place leaked into public corpus");
check(fs.readFileSync(path.join(DIST, "PUBLICATION_MANIFEST.md"), "utf8").includes("Publication decision"), "publication decision missing from manifest");

const report = {
  result: failures.length ? "failed" : "passed",
  checks,
  failures,
  basePath: BASE,
  htmlCount: htmlFiles.length,
  assetCount: assetFiles.length,
  placeCount: places.length,
  edgeCount: edges.length,
  browserRuntime: "not run by static QA"
};
fs.writeFileSync(path.join(PROJECT_ROOT, "qa", "public-qa-report.json"), JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(path.join(PROJECT_ROOT, "qa", "HABBO_PUBLIC_PROTOTYPE_QA_2026-08-23.md"), [
  "# Habbo Public Prototype V2 QA — 2026-08-23",
  "",
  `Result: **${report.result}**`,
  `Checks: **${checks}**`,
  `Public path: **${BASE}/**`,
  `HTML files: **${htmlFiles.length}**`,
  `Image assets: **${assetFiles.length}**`,
  `Places: **${places.length}**`,
  `Edges: **${edges.length}**`,
  "",
  failures.length ? "Failures:\n\n" + failures.map(item => `- ${item}`).join("\n") : "No static failures.",
  "",
  "Interactive Chromium/Playwright QA runs in `.github/workflows/habbo-visual-qa.yml` after publication."
].join("\n") + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
