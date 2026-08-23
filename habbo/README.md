# Habbo Public Prototype V4

Static-first public prototype for Blog Nostalgia's independent Habbo BR public-space archive.

The V4 homepage presents 29 visible group entities and 36 flattened map items, with exact 4-second autoplay and grouped variants kept in one navigation sequence.

## Build

Run npm run build with Node 20+.

The generated portable site is in dist/. Serve it with any static HTTP server. Core exploration has no runtime network dependency.

## Route contract

- /pt-br/ and /en/ — Cinematic Dock presentation, lightbox inspection, and selected-room hash state.
- /pt-br/lugar/<slug>/ and /en/place/<slug>/ — generated C, door-to-door place pages.
- /pt-br/topologia/ and /en/topology/ — A, evidence layer.
- /pt-br/metodo/ and /en/method/ — provenance and rights method.
- /internal/calibration/ — internal visual review board.

## Rights

All 89 source and presentation assets remain public_reference_only. The build is noindex/nofollow/noarchive and carries the independent, non-affiliation disclaimer.

## Data

The source data lives in data/: normalized places, edges, editorial districts, and provenance. The original graph remains the governing research input.
