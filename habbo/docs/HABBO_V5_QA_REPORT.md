# Habbo V5 — QA record

First integration gate: https://github.com/luahelenammc/mooonbr.github.io/actions/runs/39175065497
Commit: f4e484274d347c77c6bb89a40e6d6434ce357977
Artifact: https://github.com/luahelenammc/mooonbr.github.io/actions/runs/39175065497/artifacts/12154265802

- Static route/corpus checks: 2,661 passed.
- Publication and bilingual generation tests: three passed.
- Existing V4 Chromium suite: 113 passed; place groups, map variants, dock, lightbox and mobile preserved.
- Stationary-pointer autoplay regression: passed, four-second interval retained.
- V5 Chromium suite: 80 passed; desktop1440×900/mobile390×844, real GIFs, modal arrows/touch controls/Escape/backdrop/focus, item-preserving language links, deep hashes, source pages and reduced motion.
- No observed JavaScript/console failures, broken collection images or horizontal overflow in those scenarios.
- Desktop/mobile WebM recordings and screenshots generated. Captures reviewed by integration root; no claim of real-device testing or exhaustive assistive-technology audit.

Browser: Chromium installed by Playwright1.55.0 in the GitHub runner. Local browser installation was unavailable; the gate ran in CI, not in a simulated DOM. The frozen V4 is independently rendered from git archive c051362. Final-head checks are enforced on PR22 before merge.
