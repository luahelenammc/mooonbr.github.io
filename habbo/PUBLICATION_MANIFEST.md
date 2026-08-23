# Habbo Public Prototype V2 — Publication Manifest

**Status:** public V2 Cinematic Dock portal · independent archive · noindex

**Review date:** 2026-08-23  
**Corpus version:** 27 canonical Habbo BR public spaces from the established archive scope  
**Publication decision:** A — cleared enough for prototype publication under a bounded, non-commercial reading of the current Habbo Fansite Policy. This is a policy-based operational decision, not legal advice or an irrevocable licence.

## What is published

- 27 canonical places with local reference images, PT-BR/EN pages, provenance and evidence states.
- 27 normalized places, 27 typed edges, and an explicit `presentationOrder` independent from the research graph.
- A Cinematic Dock with centered magnification, editorial sequence, 5.8-second autoplay, mandatory pause control, keyboard/wheel/drag/touch input, and reduced-motion behavior.
- A lightbox-first inspection layer; documentary Place Pages, archive drawers, visual exits, and the separate evidence graph remain one deliberate step deeper.
- Images retain their source metadata as `public_reference_only`; archival possession is not represented as ownership or permanent clearance.

## Why this gate passed

The current official policy says Habbo grants Fan Sites a revocable permission to create non-commercial sites based on Habbo IP, allows responsible use of publicly accessible Sulake images, requires a disclaimer on every page, and prohibits confusion with an official production or use of Habbo trade dress. The prototype follows those constraints as operational guardrails.

Implemented safeguards:

- no official Habbo Fan Site logo;
- independent Blog Nostalgia / Mooon identity;
- explicit non-affiliation disclaimer on every generated HTML page;
- `noindex,nofollow,noarchive` preview posture;
- no login, payment, commercial offer, hack, retro, scam or server-replacement link;
- per-place source page, direct-image provenance and rights state;
- removal/correction can be requested through the repository owner.

Official references consulted on 2026-08-23:

- https://help.habbo.com/hc/en-us/articles/360011512480-Habbo-Fansite-Policy
- https://help.habbo.com/hc/en-us/articles/360011512380-What-Are-Habbo-Fansites
- https://help.habbo.com/hc/en-us/articles/221645248-Infringements-Policy
- https://www.habbo.com/playing-habbo/terms-of-service

## Exclusions and open points

- **Lanchonete Vírgula:** excluded from the 27-place corpus because image/provenance evidence remained insufficient.
- **Mobiles Disco:** excluded because it is not a canonical Habbo BR public-space node in this scope.
- A rights complaint, policy change, or source-specific uncertainty overrides this provisional publication decision; the affected asset must be removed or replaced with a rights-pending placeholder.
- This remains a calibration prototype, not a final site or an official Habbo property.

## Presentation lineage: V1 → V2

The prior public V0 was retained as a negative calibration fossil: its districts, card grids, visible schema and place-page sidebar made the archive read like a wiki. V1 demoted that chrome and made the portal a threshold into places:

- the home is a floating spatial field with 27 reachable room images;
- editorial display coordinates are named and separated from historical topology;
- Place Pages are arrival-first, with one concise context line and no first-fold fact sidebar;
- provenance, temporal state, rights and technical detail move into an intentional archive layer;
- place-to-place movement uses visual exits with subtle evidence grammar;
- topology is a typed SVG graph, not an edge-card list;
- the language switcher follows the compact two-flag behavior of `luahelenammc/LUAHELENA/ia/` and preserves the logical route;
- Chromium/Playwright screenshots and interaction checks are required for presentation changes.

V2 addresses the remaining “improved Wikipedia” reading by removing the map from the doorway entirely. The homepage is now a three-level experience:

- discovery/emotion: one horizontal dock gallery, with central dominance and neighboring depth rather than 27 visible cards;
- inspection: a focused lightbox with the uncropped original image, localized title/alias, previous/next/close, and a detail CTA;
- documentation: the existing Place Page and research layers, reachable from the lightbox and returnable via `#slug`.

Autoplay is 5.8 seconds in production, with visible pause/resume, pause-on-hover/focus/drag/wheel/visibility/lightbox, selected-room language preservation, mobile swipe/snap, and reduced-motion fallback.

## Provenance

The public runtime uses `data/places.json`, `data/edges.json`, `data/districts.json` and `data/provenance.json`. The historical corpus and image research remain governed by the Habbo source document and the original-reference archive; the public pages expose source URLs without reproducing the private research package.

## Release record

- Repository: https://github.com/luahelenammc/mooonbr.github.io
- Public path: `/habbo/`
- Branch: `main`
- V1 feature branch: `feat/habbo-v1-spatial-redesign`
- V1 build lineage: `924e0c98150f21d17eae65d8aacae5ac48f37fde` → `727e162e165c8b37110362e95639fe8239f29168` → `340d6afc67dd11899b5e112910a660f15a3205cf` → `4b385bdb7d01ac31455eec3e9c2ba71c9e690624`.
- Feature merge commit: `b35b6e4544f84f726c327eb28bf813225aa61678` (PR #6).
- Chromium/Playwright run: [run 32622459546](https://github.com/luahelenammc/mooonbr.github.io/actions/runs/32622459546), passed; [screenshot artifact](https://github.com/luahelenammc/mooonbr.github.io/actions/runs/32622459546/artifacts/9488772322).
- V1 live verification (historical record): `/habbo/`, PT-BR, EN, Piscina, topologia and método all returned HTTP 200 with the V1 markers after merge.
- V2 feature branch: `feat/habbo-v2-cinematic-dock`.
- V2 final head: `ef8ca8f6f92363c818b198821834bcf49181c23e`.
- V2 pull request: [PR #8](https://github.com/luahelenammc/mooonbr.github.io/pull/8), merged on 2026-08-23.
- V2 merge commit: `70e7d56d12d6d8591b11126e02af307250932171`.
- V2 Chromium/Playwright gate: [run 32639537752](https://github.com/luahelenammc/mooonbr.github.io/actions/runs/32639537752), passed; [screenshot artifact](https://github.com/luahelenammc/mooonbr.github.io/actions/runs/32639537752/artifacts/9493237010).
- V2 local Chromium matrix: 15/15 scenarios passed; static QA: 920 checks passed.
- V2 post-merge live verification: `/habbo/`, `/habbo/pt-br/`, `/habbo/en/`, `/habbo/pt-br/lugar/lido/`, `/habbo/pt-br/topologia/` and `/habbo/pt-br/metodo/` returned HTTP 200; the live entry routes expose `cinematic-dock`, `room-lightbox`, `lightbox-lang-toggle`, and `data-autoplay-ms="5800"`.
- V2 asset hotfix: [PR #10](https://github.com/luahelenammc/mooonbr.github.io/pull/10), merged on 2026-08-23 as `e802940ba3670e58b58433b4076744684d914f21`.
- Hotfix diagnosis: the attached broken capture is the browser fallback when V2 HTML is served while `/habbo/assets/site.css` and `/habbo/assets/site.js` are unresolved or stale; markup and images arrive, but the default cascade stacks all rooms and leaves controls unstyled.
- Hotfix implementation: every generated HTML route now references CSS/JS with `?v=20260823-v2-hotfix`; static QA verifies the files and V2 markers; Chromium QA verifies that the loaded stylesheet exposes CSS rules.
- Hotfix Chromium gate: [run 32641630143](https://github.com/luahelenammc/mooonbr.github.io/actions/runs/32641630143), passed; [screenshot artifact](https://github.com/luahelenammc/mooonbr.github.io/actions/runs/32641630143/artifacts/9493764088).
- Hotfix local verification: 15/15 Chromium scenarios and 153 browser checks passed; static QA: 924 checks passed.
- Hotfix live verification: `mooon.com.br/habbo/pt-br/` redirects to `www.mooon.com.br`, and the final live HTML now references `site.css?v=20260823-v2-hotfix` and `site.js?v=20260823-v2-hotfix`; the versioned endpoints return CSS/JavaScript 200 responses with the expected V2 hashes.
- Release gate: complete; future changes remain subject to the same static and Chromium visual checks.
