# Habbo V12 · Quiet Atlas

## Curatorial rule
Retain the original historic `family`, `familyPt`, `familyEn`, artwork, captions, URLs and historic uncertainty of every specimen. The archive menu is a presentation grouping, not a reclassification of historical evidence. Families with exactly one member are consolidated only when at least two singletons exist. Standalone rarity records retain their original labels.

## Measured result (2026-10-19)
- 69 classic rares across 23 original families.
- 14 singleton rare families grouped under **Peças avulsas / Standalone rarities**.
- 9 genuine multi-item rare families remain distinct; the presentation index has 10 family choices in total.
- 101 global classic badges retain all 7 original multi-item families. No fictitious badge singles group.
- No regional BR/PT-only badge families or artwork exposed.
- 170 original records and full-resolution sprites kept.

## Navigation and design
Show all families in a directly scannable responsive grid. Keep only one subdued overall item count per collection, omit tile counters, ordinal fractions, and redundant family totals. Keep native-art covers, a three-original-sprite mini-collage for the collective, chapter-aware top navigation, real family names in historical lightboxes, category-scoped lightbox browsing, responsive controls, no-JS fallback and legacy V11 anchor aliases.

## Integrity checks
`habbo/qa/v12-quiet-atlas.mjs` in Chromium: PT/EN/root desktop+mobile, 69+101, 14 consolidated, 10+7 group tiles, no overflow, assets, accessible direct links, standalone pages and historic provenance. `habbo/qa/v8-visual.mjs` and the V4 Dock tests protect existing behavior.

See https://github.com/luahelenammc/mooonbr.github.io/pull/32.
