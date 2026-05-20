# Last Scrap — Fixes Applied (running log)

## Round 1-3 (May 20) — see prior entries
Wave-1 critical fixes, tuning batch, auto-aim + melee swap

## Round 4 — Playtest feedback (May 20)
Full-auto auto-aim w/ spread, movement inertia + speed 240→280, zombie sprite-flip via motion direction

## Round 5 — Speed nerf + Dash (May 20)

**Movement speed:** 280 → **200** per playtest feedback. Still has the inertia smoothing from Round 4.

**Dash mechanic:**
- Keyboard: **Shift** or **E**
- Mobile: new **DASH** button (sky-blue) above FIRE
- Behavior: ~0.15s burst at **760 px/s** in input direction (or facing direction if standing still)
- **0.22s of invulnerability** during the dash window — actual escape tool, not just a re-position
- **0.9s cooldown**, surfaced in HUD as `DASH` (ready) → `DASH 0.6s` (cooling)
- Visual: cyan glow + shadow on the hero sprite during the dash frames

All numbers are in `balance.js → player.{dashSpeed, dashDuration, dashCooldown, dashInvuln}` if you want to nudge them after playtesting.

**Assets received & saved (not yet wired in):**
- `/app/frontend/src/assets/game/new/rig_new.jpeg` — your new ring-shaped rig graphic
- `/app/frontend/src/assets/game/new/ui_template.png` — UI/HUD style template for the future visual pass

I held off on swapping these in per your original instruction to defer all visual work until mechanics lock. **Tell me if you want the rig graphic swapped in now** — it's a 1-line render change that doesn't touch any gameplay.

## Smoke-tested
- DASH HUD badge cycles ready → 0.6s → ready ✅
- Player visibly bursts forward when Shift is pressed mid-movement ✅
- Lint clean across all touched files ✅

## Tuning knobs (`balance.js`)
| Knob | Current | Effect |
|---|---|---|
| `player.baseSpeed` | 200 | normal move speed |
| `player.accel` | 14 | inertia ramp (higher = snappier) |
| `player.dashSpeed` | 760 | dash burst velocity |
| `player.dashDuration` | 0.15 | how long the burst lasts |
| `player.dashCooldown` | 0.9 | sec between dashes |
| `player.dashInvuln` | 0.22 | i-frames per dash |
| `gun.auto.spreadRad` | 0.16 | full-auto cone width |
| `melee.knockback` | 32 | px enemies get pushed |

## Audit backlog still pending
- 1.8 Bullet pierce (design call)
- 2.3 / 2.4 / 2.5 Multiplier + regen tuning
- 3.1 Surrender btn placement, 3.2 Pause menu, 3.4 Weapon-swap feedback
- Debug overlay (live stats) — still on offer
- **A** Code refactor — queued post-balance lock
- Visual overhaul — queued post-mechanics lock (assets now in place when we get there)
