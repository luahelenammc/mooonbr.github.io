import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = process.env.HABBO_QA_DIST ? path.resolve(process.env.HABBO_QA_DIST) : (fs.existsSync(path.join(PROJECT_ROOT, "dist", "pt-br")) ? path.join(PROJECT_ROOT, "dist") : PROJECT_ROOT);
const BASE = "/habbo";
const ASSET_VERSION = String(process.env.ASSET_VERSION || "20260823-v4-group-columns").replace(/[^a-zA-Z0-9._~-]/g, "");
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

const read = (file) => fs.readFileSync(file, "utf8");
const places = JSON.parse(read(path.join(PROJECT_ROOT, "data", "places.json")));
const groups = JSON.parse(read(path.join(PROJECT_ROOT, "data", "groups.json")));
const items = JSON.parse(read(path.join(PROJECT_ROOT, "data", "presentation-items.json")));
const v4 = JSON.parse(read(path.join(PROJECT_ROOT, "data", "v4-content-ledger.json")));
const htmlFiles = filesUnder(DIST, ".html");
const assetDir = path.join(DIST, "assets", "archive-reference", "assets");
const assetFiles = filesUnder(assetDir);
const expectedRoutes = [
  "index.html", "pt-br/index.html", "en/index.html", "pt-br/topologia/index.html", "en/topology/index.html",
  "pt-br/metodo/index.html", "en/method/index.html", "internal/calibration/index.html"
];
const renderedAssetNames = new Set();

for (const route of expectedRoutes) check(fs.existsSync(path.join(DIST, route)), `missing route: ${route}`);
for (const locale of ["pt-br", "en"]) {
  const prefix = locale === "pt-br" ? "pt-br/lugar" : "en/place";
  for (const place of places) check(fs.existsSync(path.join(DIST, prefix, place.slug, "index.html")), `missing place route: ${prefix}/${place.slug}`);
}

check(fs.existsSync(path.join(DIST, "PUBLICATION_MANIFEST.md")), "publication manifest missing");
check(fs.existsSync(path.join(DIST, "assets", "flag-br.svg")), "Brazil flag missing");
check(fs.existsSync(path.join(DIST, "assets", "flag-us.svg")), "US flag missing");
check(fs.existsSync(path.join(DIST, "assets", `site-${ASSET_VERSION}.css`)), "V4 versioned CSS missing");
check(fs.existsSync(path.join(DIST, "assets", `site-${ASSET_VERSION}.js`)), "V4 versioned JS missing");
check(read(path.join(DIST, "assets", `site-${ASSET_VERSION}.css`)).includes(".dock-group-column"), "group column styles missing");
check(read(path.join(DIST, "assets", `site-${ASSET_VERSION}.js`)).includes("activeItemIndex"), "flattened item cursor missing");

for (const file of htmlFiles) {
  const html = read(file);
  const rel = path.relative(DIST, file);
  check(html.includes("noindex,nofollow,noarchive"), `robots posture missing: ${rel}`);
  check(html.includes("This fan site is not affiliated"), `disclaimer missing: ${rel}`);
  check(html.includes(`${BASE}/assets/site-${ASSET_VERSION}.css`), `versioned CSS missing: ${rel}`);
  check(html.includes(`${BASE}/assets/site-${ASSET_VERSION}.js`), `versioned JS missing: ${rel}`);
  check(!/(href|src)=(['"])\/(?:pt-br|en|assets)\//.test(html), `root route leak: ${rel}`);
  check(!html.includes("https://drive.google.com/file/"), `private Drive URL leaked: ${rel}`);
  for (const match of html.matchAll(new RegExp(`${BASE}/assets/archive-reference/assets/([^'"?#&]+)`, "g"))) {
    renderedAssetNames.add(match[1]);
    check(fs.existsSync(path.join(assetDir, match[1])), `missing image for ${rel}: ${match[1]}`);
  }
}

const homeHtml = read(path.join(DIST, "pt-br", "index.html"));
const first16 = [
  "rooftop_rumble", "cinema", "club_mammoth", "club_orient", "lobbies", "infobus_park", "lido", "ice_cafe",
  "hallways", "cafe_gold", "library", "welcome_lounge", "chromide_club", "club_massiva", "theatredrome", "beauty_salon"
];
const groupIds = groups.map((group) => group.groupId);
check(homeHtml.includes('data-autoplay-ms="4000"'), "production autoplay interval is not exactly 4 seconds");
check((homeHtml.match(/data-dock-slide/g) || []).length === groups.length, `home group slide count mismatch: ${groups.length}`);
check((homeHtml.match(/data-room-open/g) || []).length === items.length, `home flattened item count mismatch: ${items.length}`);
check((homeHtml.match(/data-room-item-id/g) || []).length === items.length, "every visible map must expose an item id");
check(homeHtml.includes('data-item-total="36"'), "home item total marker missing");
check(homeHtml.includes("class=\"dock-group-column\""), "visible group columns missing");
check(homeHtml.includes("Clube Merexica"), "Merexica alias resolution is not visible in the generated group data");
check(JSON.stringify(groupIds.slice(0, 16)) === JSON.stringify(first16), `front-loaded V4 order mismatch: ${groupIds.slice(0, 16).join(",")}`);
check(!homeHtml.includes("rooftop_cafe_variant_02"), "promotional Rooftop Cafe variant leaked into homepage");
check(!homeHtml.includes("club_massiva__variant_02__brpt__undated__presentation.png"), "promotional Club Massiva derivative leaked into homepage");
check(!homeHtml.includes("zen_garden"), "demoted Zen Garden leaked into homepage");
check(!homeHtml.includes("spatial-world"), "legacy V1 map leaked into homepage");
check(!homeHtml.includes("public_reference_only"), "evidence metadata leaked into homepage");

for (const required of v4.presentationChecks.requiredGroups) check(groups.some((group) => group.groupId === required && group.variants.length >= v4.presentationChecks.requiredVisibleStackMin), `required visible group missing: ${required}`);
check(groups.find((group) => group.groupId === "lobbies")?.variants.length === 4, "Saguões must expose four aligned maps");
check(groups.find((group) => group.groupId === "lido")?.variants.length === 2, "Piscina must expose two maps");
check(groups.find((group) => group.groupId === "rooftop_complex")?.variants.length === 2, "Cobertura must expose Cobertura and Café Cobertura");
check(groups.find((group) => group.groupId === "club_massiva")?.variants.length === 2, "Clube Massiva must expose two maps");
check(items.find((item) => item.id === "lido_variant_02")?.labelPt === "Piscina — mapa 02", "Piscina map 02 label missing");
check(places.find((place) => place.id === "zen_garden")?.visibility === "demoted_hidden", "Zen Garden classification missing");
check(v4.classifications.some((item) => item.id === "the_den" && item.status === "secondary_place"), "The Den classification missing");
check(v4.classifications.some((item) => item.id === "chromide_club" && item.status === "resolved_alias"), "Merexica resolution record missing");
const excludedActiveAssets = [
  "habbo_public_space__rooftop_cafe__variant_02__brpt__undated.png",
  "habbo_public_space__rooftop_cafe__variant_02__brpt__undated__presentation.png",
  "habbo_public_space__club_massiva__variant_02__brpt__undated.png",
  "habbo_public_space__club_massiva__variant_02__brpt__undated__presentation.png",
  "habbo_public_space__net_cafe__brpt__undated__presentation.png",
  "habbo_public_space__battle_ball_lounge__brpt__undated.gif",
  "habbo_public_space__battle_ball_lounge__brpt__undated__presentation.png",
  "habbo_public_space__theatredrome__brpt__undated.png",
  "habbo_public_space__theatredrome__brpt__undated__presentation.png"
];
check(!excludedActiveAssets.some((name) => renderedAssetNames.has(name)), "excluded promotional/corrupt assets are still referenced by rendered HTML");
check(assetFiles.some((file) => file.endsWith("battle_ball_lounge__v4__brpt__undated__presentation.png")), "Battle Ball V4 asset missing");
check(assetFiles.some((file) => file.endsWith("theatredrome__v4__brpt__undated__presentation.png")), "Teatro V4 asset missing");
check(assetFiles.some((file) => file.endsWith("net_cafe__brpt__undated__v4__presentation.png")), "Net Café V4 asset missing");

const report = {
  result: failures.length ? "failed" : "passed",
  checks,
  failures,
  basePath: BASE,
  dist: path.relative(PROJECT_ROOT, DIST),
  htmlCount: htmlFiles.length,
  assetCount: assetFiles.length,
  placeCount: places.length,
  groupCount: groups.length,
  flattenedItemCount: items.length
};
fs.writeFileSync(path.join(PROJECT_ROOT, "qa", "public-qa-report.json"), JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(path.join(PROJECT_ROOT, "qa", "HABBO_V4_PUBLIC_QA_2026-08-23.md"), [
  "# Habbo V4 static QA — 2026-08-23", "", `Result: **${report.result}**`, `Checks: **${checks}**`,
  `HTML: **${htmlFiles.length}**`, `Groups: **${groups.length}**`, `Flattened items: **${items.length}**`, `Assets: **${assetFiles.length}**`, "",
  failures.length ? "Failures:\n\n" + failures.map((item) => `- ${item}`).join("\n") : "All static V4 checks passed."
].join("\n") + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
