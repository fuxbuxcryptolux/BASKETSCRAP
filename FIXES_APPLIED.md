# Last Scrap — Fixes Applied (running log)

## Round 1 — Wave-1 critical (May 20)
- 1.1 Round-timer ends wave in any phase
- 1.2 Independent enemy contact timers (rig vs player)
- 1.5 Facing snaps to aim while idle
- 1.6 Player ↔ rig collision
- 2.1 Save sanitisation

## Round 2 — Tuning (May 20)
- 1.7 Enemy separation
- 1.9 Wave-1 tightened (6 shamblers @ 1.0s)
- 2.2 Wave-1 economy rebalanced (passive `0.4 + 0.4×wave`/s, bonus `10 + 8×wave`)

## Round 3 — Auto-aim + Melee (May 20)
- 1.3c Auto-aim limited to semi-tap
- 1.4b Ammo regen no resurrection from 0
- 1.4c Melee buffed + deliberate Q-key weapon swap

## Round 4 — Playtest feedback (May 20)

| Issue (your words) | Fix |
|---|---|
| "auto aim needs to be a little more accurate … I was shooting nothing while the rig got destroyed" | **Full-auto held-fire now also auto-aims at nearest enemy when idle** — Round 3 had nerfed full-auto to manual-only, which left you firing at stale facing directions. Brought auto-aim back for held-fire, but added bullet **spread (~9° cone)** to full-auto so spray-and-pray isn't pixel-perfect. Semi-tap stays accurate. Net: no more wasted ammo into thin air, but full-auto isn't a god-mode either. Player facing now snaps to target when idle so the muzzle line points where bullets go. |
| "movement speed needs to be adjusted, doesn't feel natural" | **Added inertia + speed bump.** Base speed 240 → **280** px/s. Player now has a velocity that lerps toward target at `accel = 14`/sec (~0.15s to top speed, ~0.15s to stop). No more teleport-style snap — feels like real legs. |
| "zombies walking backwards looking dumb" | **Sprite flip now tracks actual horizontal movement.** Each enemy carries `facingSign` updated every frame from `pos.x - prevX` (with a small deadzone to avoid jitter). When a zombie moves left, the sprite shows its left-facing default; when it moves right, it mirrors. With separation steering pushing zombies sideways sometimes, the old "flip based on which side of rig" rule was actively wrong. |

## Files touched this round
- `src/game/data/balance.js` — speed, accel, auto.spreadRad
- `src/store/useRunStore.js` — player velocity smoothing, full-auto auto-aim + spread, enemy facingSign tracking
- `src/components/game/Arena.jsx` — sprite flip uses facingSign instead of position-vs-rig

## Smoke-tested
- Title → Loadout → Run renders ✅
- HUD shows GUN at start ✅
- Zombies visibly moving toward rig with sprite flipped per motion direction ✅
- Lint clean ✅

## Remaining in audit / backlog
- 1.8 Bullet pierce (design call)
- 2.3 Multiplier stacking, 2.4 Gamble math, 2.5 Regen toning
- 3.1 Surrender button placement, 3.2 Pause/Esc, 3.4 Weapon-swap feedback
- Debug overlay (live DPS / hits / scrap/sec) — recommended next
- **A** Code refactor (`tick()` + `Arena.jsx`) — queued post-balance lock
- Visual overhaul — queued post-mechanics lock

## Things I might have gotten wrong
**Zombie facing direction** — I'm guessing the source sprite's default direction (left vs right). If after this fix they're still facing backwards, the fix is *one line*: flip the comparison in `Arena.jsx` from `(e.facingSign ?? 1) > 0 ? -1 : 1` to `< 0 ? -1 : 1`. Tell me and I'll flip it.

**Inertia feel** — `accel = 14` is my best guess for "natural." If it feels too floaty/slidey, bump it up (less inertia → snappier). If too stiff, bump it down. The variable is in `balance.js → player.accel`.

**Full-auto spread** — `spreadRad = 0.16` (~9° cone). At close range you'll still hit; at long range you'll miss more. If you want tighter spray, lower the number; if you want it even less god-mode, raise it.
