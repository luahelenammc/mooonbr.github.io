# Habbo V15 · Classic Habbo Club furniture
**Date:** 2026-10-19

## Scope
V15 preserves **33 source-original Habbo Club furniture render GIFs** in one independently navigable rare-museum family called **Mobis HC clássicos** (EN: **Classic HC Furniture**). The family spans **24 illustrations of classic monthly membership gifts**, including retired historical **HC Plasto**, plus **nine purpose-built Club Shop furniture items**. The HC archive is *not* presented as evidence that every item was a limited-edition catalogue rare, nor as evidence of release on the Brazilian hotel. It is a thematically coherent historical subcollection under the museum's broader Rare Furniture chapter.

The distinguished historical source is https://habborator.org/furniture/hc.html. Cross-check sources include https://habboxwiki.com/HC and https://habbo.fandom.com/wiki/Habbo_Club. Chart notes: in January 2007 a new HC gift range was introduced, HC Plasto left the later monthly sequence, and dedicated Club Shop furniture appeared in 2008. The source's original full-size `hc/*.gif` and `hc/shop/*.gif` images are preserved, **not** small inventory sprites from `display/furniture_small/`.

## Curatorial nomenclature correction
The 10 V7 `mono_*.gif` renders display under **Monolitos** (no accent), with item names `Monolito rosa` etc.; documented historical source names such as `Pink Spaceship Door` are retained as metadata inside their individual records. The independent 10 V7 `laser_*.gif` render family displays as **Portas laser**, per the final user preference. English naming remains Monoliths and Laser Gates. Stable `monoliths`/`laser-gates` URL IDs do not change.

## Canonical inventory
- **148** sourced historical specimens in the broader rares/HC chapter (115 existing rare specimens + 33 HC).
- **15** visible furniture families in PT-BR and EN, retaining the 14 old singleton rarities together in **Peças avulsas**.
- **101** international classic badges unchanged.
- **249** visible specimens in each entrypoint (`habbo/`, `habbo/pt-br/`, `habbo/en/`).
- **81** original saved sprites, each verified for GIF/PNG signature, pixel dimensions and SHA-256 hash in `habbo/v13/native-ledger.json` (the existing ledger remains canonical).
- **158** localized historical detail pages for the 79 separately sourced rarities + HC additions, plus all old record pages; HC membership-month numbers appear where documented.

## Important implementation files
- `habbo/v13/source-manifest.json`: source URL, path, HC gift/shop subseries, monthly month or special retired variant flag, and corrected nomenclature.
- `habbo/v13/acquire-native.mjs --check`: offline integrity and frame checks for all 81 preserved native assets.
- `habbo/v8/build-unified.mjs`: presentation generator and canonical old aliases.
- `habbo/v13/render-details.mjs`: localized history records with origin links and membership vs catalogue clarification.
- `habbo/qa/v15-classic-hc.mjs`: desktop/mobile/tiny Chromium checks; `habbo/qa/v14-laser-monolith-nav.mjs` and V13/V12/V8 preserve previous gates.
- `.github/workflows/habbo-v15-release.yml`: complete verified build, screenshot evidence and commit of generated Pages source to feature branch.

### Publishing
Merge verified PR #35 to `main` only after full CI, native sprites, browser screenshots, mobile checks and original Dock regressions have passed. Source committed to Pages is not by itself confirmation of live CDN refresh. Do not introduce image-generation surrogates, GIF CSS counterfeits, or invented evidence of Brazilian release.
