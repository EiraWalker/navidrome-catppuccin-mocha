# Verification — 1.0.0

Target: upstream Navidrome `v0.64.2` at `101145742f4762164202cb4858c9126258bdc463`.
Custom executable identifies itself as `0.64.2+mocha.1 (10114574-mocha1)`.

Executed locally on Windows on 2026-10-24:

| Check | Result |
| --- | --- |
| Theme palette/structure/contrast tests | 8 passed, 0 failed |
| Upstream theme and theme-reducer Vitest tests | 87 passed, 0 failed |
| Material-UI 4 runtime theme normalization | Passed, no invalid-state/override warnings |
| Vite production UI and PWA service-worker build | Passed |
| Native Go build, `netgo,sqlite_fts5` | Passed |
| Executable with only Windows system directories on PATH | Version command passed, no extra compiler DLL path required |
| Independent localhost preview | Started with its own empty database, music and cache directories |
| Bundled server translation inventory | Same 36 languages as the original server; Simplified Chinese endpoint returned 200 |
| Real browser, 1440 × 1000 | Base body, Mantle card, Mauve primary button; no horizontal overflow |
| Real browser, 393 × 852 | Same measured colors; no horizontal overflow |
| Selected player's stylesheet | Present in the running page |

The measured card colors are `rgb(24, 24, 37)` / `rgb(205, 214, 244)`; primary button colors are `rgb(203, 166, 247)` / `rgb(17, 17, 27)`.

Screenshots are from the isolated first-run setup screen. No production credentials, account identifiers or music metadata were used or published. This is browser-viewport testing, not a claim of physical-phone testing. The player CSS is registered and tested, but real music playback/transcoding was not exercised with the empty library. Color-pair assertions are not a certification of the entire upstream UI.

GitHub Actions separately runs the dependency-free theme tests and checks deterministic palette generation. It does not claim to build or certify every platform.
