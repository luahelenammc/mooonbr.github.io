# Habbo Public Prototype V3 — Cinematic Dock Architecture

The entry surface is a Cinematic Dock: one horizontally sequenced presentation of 34 classic Habbo BR public-space groups. The active image carries title, alias, and position; neighboring rooms gain scale through editorial distance and pointer-sensitive magnification.
Inspection is a lightbox, not an accidental route change. A place group can expose historic map variants without duplicating the dock entity; documentation is a deliberate CTA into a Place Page.
Topology and method stay secondary. They are evidence and trust layers, not the homepage composition.

The implementation uses a framework-neutral static generator with stable directory-index routes, local data, semantic HTML, plain CSS, and one progressive-enhancement script. The route contract remains ready for a later Next.js migration.

presentationOrder is explicit editorial data, independent from the research graph and its non-geographic topology display. The homepage carries no source URL, evidence status, or technical metadata.

Autoplay runs every 5.8 seconds with a mandatory pause control. Pointer focus shapes the dock continuously without freezing autoplay; focus, drag, wheel, hidden-document state, lightbox, and prefers-reduced-motion remain safe interaction states.