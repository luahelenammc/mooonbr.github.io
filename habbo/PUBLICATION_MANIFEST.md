# Habbo Public Prototype V1 — Publication Manifest

**Status:** public V1 spatial portal · independent archive · noindex

**Review date:** 2026-08-23  
**Corpus version:** 27 canonical Habbo BR public spaces from the established archive scope  
**Publication decision:** A — cleared enough for prototype publication under a bounded, non-commercial reading of the current Habbo Fansite Policy. This is a policy-based operational decision, not legal advice or an irrevocable licence.

## What is published

- 27 canonical places with local reference images, PT-BR/EN pages, provenance and evidence states.
- 27 normalized places, 27 typed edges, and a V1 spatial field whose coordinates are explicitly editorial display coordinates, not historical geography.
- A separate evidence graph, progressive archive layers, visual room exits, and the B+C+A navigation model.
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

## V1 presentation correction

The prior public V0 was retained as a negative calibration fossil: its districts, card grids, visible schema and place-page sidebar made the archive read like a wiki. V1 demotes that chrome and makes the portal a threshold into places:

- the home is a floating spatial field with 27 reachable room images;
- editorial display coordinates are named and separated from historical topology;
- Place Pages are arrival-first, with one concise context line and no first-fold fact sidebar;
- provenance, temporal state, rights and technical detail move into an intentional archive layer;
- place-to-place movement uses visual exits with subtle evidence grammar;
- topology is a typed SVG graph, not an edge-card list;
- the language switcher follows the compact two-flag behavior of `luahelenammc/LUAHELENA/ia/` and preserves the logical route;
- Chromium/Playwright screenshots and interaction checks are required for presentation changes.

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
- Live verification: `/habbo/`, PT-BR, EN, Piscina, topologia and método all returned HTTP 200 with the V1 markers after merge.
- Release gate: complete; future changes remain subject to the same static and Chromium visual checks.
