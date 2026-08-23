# Habbo Public Prototype V4 — Cinematic Dock Architecture

The entry surface is a Cinematic Dock: one horizontally sequenced presentation of 29 classic Habbo BR public-space groups containing 36 flattened map items. Each group renders its maps as a visible vertical column; the active image carries title, variant label, and position while neighboring groups gain scale through editorial distance and pointer-sensitive magnification.
Inspection is a lightbox, not an accidental route change. The same flattened item cursor drives arrows, keyboard, wheel, drag, touch, autoplay, and lightbox previous/next; a group remains stable while its active map changes.
Topology and method stay secondary. They are evidence and trust layers, not the homepage composition.

The implementation uses a framework-neutral static generator with stable directory-index routes, local data, semantic HTML, plain CSS, and one progressive-enhancement script. The route contract remains ready for a later Next.js migration.

presentationOrder is explicit editorial data, independent from the research graph and its non-geographic topology display. The homepage carries no source URL, evidence status, or technical metadata.

Autoplay runs every 4 seconds with a mandatory pause control. Pointer focus shapes the dock continuously without freezing autoplay; focus, drag, wheel, hidden-document state, lightbox, and prefers-reduced-motion remain safe interaction states.