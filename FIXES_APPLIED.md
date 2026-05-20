# Last Scrap — Fixes Applied (running log)

## Round 1 — Wave-1 critical (May 20)
| # | Fix | File |
|---|---|---|
| 1.1 | Round-timer ends wave in any phase | `useRunStore.js` |
| 1.2 | Independent enemy contact timers (rig vs player) | `useRunStore.js` |
| 1.5 | Facing snaps to aim while idle | `useRunStore.js` |
| 1.6 | Player ↔ rig collision | `useRunStore.js` |
| 2.1 | Save import/load sanitisation | `persistence.js` |

## Round 2 — Tuning batch (May 20)
| # | Fix | What changed |
|---|---|---|
| 1.7 | Enemy separation | Seek-rig + separation steering, plus pairwise overlap resolution. Enemies visibly spread out instead of piling on one pixel. |
| 1.9 | Wave-1 teaches | 6 shamblers @ 1.0s interval (was 5 @ 1.3s). Wave 2-3 also tightened. |
| 2.2 | Wave-1 economy | Passive scrap now `0.4 + 0.4×wave` per second (was flat 2). Wave-clear bonus now `10 + 8×wave` (was `15 + 5×wave`). Wave-1 net drops ~165 → ~80; pushing to wave 3+ becomes meaningfully more profitable. |

## Round 3 — Auto-aim + Melee (May 20)
| # | Fix | What changed |
|---|---|---|
| 1.3c | Auto-aim limited to semi-tap | Semi-auto on tap still auto-targets nearest enemy when idle. Full-auto on hold uses **manual facing only** — held-fire spray now requires aiming with WASD direction. Closes the "stand still and hold = clear waves" exploit. |
| 1.4b | Ammo regen no resurrection | Ammo regen only ticks while `ammo > 0`. Once you hit 0 mid-wave, you cannot regen out — must clear the wave (or the +30 ammo refill) to get gun back. |
| 1.4c | Melee buffed + deliberate weapon swap | New `weaponMode` state. **Q key** (or new mobile SWAP button) toggles GUN ↔ MELEE. Melee damage 18 → 28, range 56 → 64, plus **knockback 32px** on hit. When ammo hits 0 mid-wave, weapon auto-locks to MELEE until wave clear. HUD shows current mode with colour + `MELEE (no ammo)` label when locked. |

## Smoke-tested (combined Round 2 + 3)
- Q swap toggles GUN ↔ MELEE in HUD ✅
- Full-auto held-fire now sprays in last-move direction (visible in screenshot) ✅
- Auto-bot on wave 1 lost the rig instead of free-winning — difficulty up, exploit closed ✅
- Lint clean across `useRunStore.js`, `Arena.jsx`, `HUD.jsx`, `MobileControls.jsx` ✅
- No console errors ✅

## Remaining in audit
- 1.8 Bullet pierce (design call: pierce on semi or never?)
- 2.3 Multiplier stacking (scrap-gain × gamble compound — design call)
- 2.4 Gamble penalty math review
- 2.5 Regen value (HP regen is still very strong — might want toning)
- 3.1 Surrender button placement
- 3.2 Pause / Esc menu
- 3.4 Melee swap visual feedback (audio/flash)
- 3.5 Cashout preview text
- A — code-health refactor (`tick()` + `Arena.jsx`) — queued post-balance lock
