# V5 — three collections, incremental static delivery

Decision date: 2026-10-18. Preserve the published V4 dock, room routes, 4-second autoplay, original JS and visual assets. Add a compact three-link collection selector; retain minimal discovery and deeper source records.

Rare objects use a large central specimen and horizontal family rails. Badges use grouped pixel-art murals. Native dialogs support arrows, Escape, outside click, focus return and direct #view-id links. Each object has stable bilingual routes; no external runtime API or new library. No market prices or speculative cross-collection relationships.

## Reproducible public build

`BASE_PATH=/habbo node habbo/build.mjs` produces `habbo/dist/`. The original V4 generator expects spatial graph, CSV and source assets that were never committed. V5 therefore explicitly supports a normalized-public-shell mode: checked-in V4 HTML/assets remain the approved frozen source; `v5/build-portable.mjs` adds the selector idempotently and calls `v5/build-collections.mjs` to regenerate every collection/object route from `data/v5-{rares,badges}.json`. If the original atlas inputs are supplied, the original V4 generation path remains available. No fabricated graph replaces missing private inputs.

Publish the content of dist into habbo (preserving source modules). The build never needs external image requests. Curated sprites are self-hosted, untouched GIFs; original bytes and checksums are archived separately. The old V4 styles/scripts retain their cache-safe names; new collection assets and home selector use V5-specific paths.

## Evidence and publication

Only `verified_pre2012` records with local functional images, bilingual names, source URLs, valid hotel status and conditional rights clearance pass the publication validator. BR/PT regional classification does not establish exact issue date. Earliest international table entry does not establish world debut. Portuguese rare names are editorial, not verified official BR labels.

The parent badge index's last-update/statistics wording is insufficient for strict item-level dates. 103 freeze-inferred badges remain probable and outside the canonical gallery. One undated rare variant remains excluded. No relation is invented merely to connect collections.
