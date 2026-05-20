# Last Scrap — Fixes Applied (running log)

## Rounds 1-5 — gameplay + mechanics (see prior entries)

## Round 6 — Visual: rig + title reskin (May 20)

You pushed back on me holding the assets — I pivoted. Done this turn:

### Rig graphic
- `new/rig_new.jpeg` → background-removed PNG saved as `assets/game/rig.png`
- Removed white background via 2-pass flood fill (from corners + from torus center) so the inner ring is transparent and the arena floor shows through
- Wired into `Arena.jsx` with a circular clip to catch any residual edge pixels
- Health tint preserved: dims to orange below 50% rig HP, red below 25%

### Title page
- Old centered-on-stone-950 layout replaced
- New layered rust gradient (warm brown radial + dark vignette) with procedural rust speckles and bullet-hole accents — all CSS, no image needed
- Big orange `LAST SCRAP` title in `Black Ops One`/Impact stack with deep shadow + glow
- New `START` button styled to match your UI template: amber→orange→burnt gradient, beveled bottom-shadow that depresses on click
- `BUY UPGRADES` secondary button in dark stone with stone bevel
- Bottom-of-screen controls hint
- The actual `ui_bg.png` template was NOT used as a tile — that PNG bakes the entire mockup UI (the Health bar, Buy buttons, etc. are part of the image, not a texture). Tiling it printed multiple ghost UIs on screen. The template now lives at `/app/frontend/src/assets/game/ui_bg.png` as a **design reference** for when we do the HUD/menu redesign.

### NOT done yet
- HUD (the in-game top bar) — still old style
- Loadout / Upgrades / Cashout / Summary pages — still old style
- Hero sprite — still the old one you called "scrap"
- Enemy sprites — still old
- Arena floor — still old

## What the rig looks like now
A rusty industrial ring with gauges, plates, and cable bundles, rotating health-tinted shadows under stress. Inner hole shows the arena floor through it.

## Lint clean ✅
## Smoke-tested ✅
