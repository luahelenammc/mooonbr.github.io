# Habbo V18 · Classic Web Beta

**Preview routes**: `/habbo/beta/` (PT) and `/habbo/beta/en/` (EN).

This is a static, noindex design laboratory, forked from the approved V17.2a built output. The museum's public index, source data, research records, historic images, javascript and production CSS are unchanged.

## Art direction

An original interpretation of the 2006–2009 Habbo website: blue-and-gold tab navigation, a cream arrival panel, window-chrome around Hotel View, a catalog/inventory vocabulary for Rares and Badges, and a Staff display inside a classic blue frame. Art assets are archived source images and not AI-generated.

## Invariants

- Places Dock: 29 groups, 36 scenes, 4000-ms autoplay and existing room variants.
- Rares: 148 original entries; badges: 101 original entries; staff: 12 original profiles.
- Correct historical Flecha HC, Mordomo and Prefeita assets retained.
- PT and EN routes in beta; native selection, links, viewer dialogs and rails.
- CSS is scoped to the `habbo-v18-beta` body class; no production CSS or JS is changed.
- No tracking, no third-party scripts, no new reconstructed sprites; `noindex` inherited.
- Known constraint: beta HTML pages are frozen from V17.2a. Refresh them intentionally and reapply theme, then rerun QA when source data changes.

## Validation

Run `node habbo/beta/qa-v18.mjs` after installing `playwright` and Chromium, while serving the repository root on `http://127.0.0.1:4173`. The beta workflow executes this check at 1440, 1024, 390 and 320 px.

## Release rule

Beta publication is allowed once QA passes; no design propagation into `/habbo/` or `/habbo/pt-br/` without Moon's review and approval. Existing official fan-site disclaimer is retained verbatim.


## Frozen V18 Classic · 20 October 2026

- PT: \`/habbo/beta/classic.html\`
- EN: \`/habbo/beta/en/classic.html\`
- Archived style: \`/habbo/beta/v18-classic-archive.css\`

The two archived pages retain the approved V18 document structure, presentation and original historic source references. Their internal logo and PT/EN language links point to the **archived Classic** URLs, so a later redesign of \`/habbo/beta/index.html\` cannot silently move the visitor out of the saved edition. The approved stylesheet has been copied unchanged to a frozen archive filename. Production \`/habbo/\`, \`/habbo/pt-br/\` and \`/habbo/en/\` are unchanged.

**V19 Dark Minimal proposal:** \`habbo/beta/PROPOSAL_V19_NIGHT_HOTEL.md\`. It is only a proposal; current beta index remains V18 pending a separate implementation decision.
