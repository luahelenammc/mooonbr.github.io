# Habbo V5 — baseline preflight

Captured 2026-10-18 before the V5 rebuild. Repository HEAD: `c051362a406af4ebc685ff1e3c0254cabe90618c`. Generated V4 public files were still unchanged when sampled; other V5 source work may already be in progress. Counts below describe the V4 baseline, not a post-V5 assertion.

| Measure | Observed count |
|---|---:|
| normalized places | 34 |
| visible groups | 29 |
| presentation map items | 36 |
| graph edges | 27 |
| editorial districts | 6 |
| provenance records | 37 |
| archived source/presentation files | 89 |
| generated PT routes | 37 |
| generated EN routes | 37 |

`pt-br/index.html` contains 29 `data-dock-slide` and 36 `data-room-open` attributes. Both source documentation and generated public bundles identify V4. Active HTML references `/habbo/assets/site-20260823-v4-group-columns.css?v=20260823-v4-group-columns` and corresponding `.js`. Documentation calls the experience Cinematic Dock; do not mistake older V2/V3 QA artifacts for current baseline verification.

Frozen HTML/data samples and their SHA256 values are in `qa/v5-baseline/snapshot/` and `qa/v5-baseline/source-snapshot.json`. PT home SHA256 is `94e6d050316fd23dbd0495e92b833ce2db131124e02a40773047f5ed1abc3523`; EN home SHA256 is `02bf0b1a630b0e55374a5bd7b50de99022528a0cecfb903d25517664ea694cc1`.

## Verification boundary

A local static server was started at `http://127.0.0.1:4174/habbo/`. Desktop1440×900/mobile390×844 capture script was prepared, but bundled Playwright has no installed Chromium binary. Installing Chromium1234 failed at the network approval/download stage; a latest npx attempt instead received invalid zero-size browser archives, and a subsequent headless installation encountered a directory-lock error. No new rendered baseline capture is claimed here. Existing QA images were not changed.

A direct HTTP check of `https://mooonbr.github.io/habbo/pt-br/` returned404 on 2026-10-18. This checks that exact GitHub Pages hostname, not the project's custom canonical domain; it does not establish public-site downtime. Re-run visual baselines when a browser executable is available and compare against the frozen V4 files rather than rebuilt V5 source.

Canonical custom domain verified separately: `https://www.mooon.com.br/habbo/pt-br/` returned HTTP200, 29 groups and 36 maps; live HTML SHA256 `94e6d050316fd23dbd0495e92b833ce2db131124e02a40773047f5ed1abc3523`. Live references the same V4 group-columns bundles. Raw response and report are preserved in `qa/v5-baseline/live-pt-br.html` and `live-http-report.json`. This is HTTP/markup evidence, not browser visual QA.
