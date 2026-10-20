# Habbo V19 · Night Hotel (dark minimal)

**Beta preview**: /habbo/beta/ (PT), /habbo/beta/en/ (EN).

Rebuilt composition (not the V18 hero darkened): dark blue-petrol museum theatre, original period room imagery at center, restrained family collections, **raised classic orange Habbo controls** on the primary CTA, native Dock controls, catalog actions and manager rail. Tahoma/Verdana compact interface. No synthetic historical sprites and no external theme or font dependency.

The production /habbo/ index is untouched. The complete previous V18 Classic stays at /habbo/beta/classic.html and /habbo/beta/en/classic.html using the frozen Classic stylesheet.

## Data source and reproducibility

The build script `node habbo/beta/build-v19.mjs` derives PT/EN pages from the current approved production museum output, preserving native HTML blocks rather than copying old V18 layouts. Run `node habbo/beta/build-v19.mjs --check` to verify generated output is in sync.

Contracts: **29 grouped rooms / 36 scenes, 4000-ms autoplay; 148 rares/HC pieces, 101 global badges, one horizontal rail of 12 Staff**. Flecha HC, Mordomo and Prefeita preserve their historically sourced crops. Source links, original docs and independent fan-site disclaimer remain intact.

## QA

Serve repository root on 127.0.0.1:4173, install playwright@1.55.0 and Chromium, then run `node habbo/beta/qa-v19.mjs` plus `node habbo/beta/qa-classic.mjs`. CI tests PT/EN, 1440/1024/390/320px, browser errors, anchors, original dialogs, character rail, language switch, and no-JS readability. Screenshot artifacts are recorded.

The independent, non-official beta is intentionally `noindex,nofollow,noarchive`.
