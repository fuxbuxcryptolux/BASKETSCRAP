# Last Scrap — Fixes Applied (Wave 1 from /app/AUDIT_REPORT.md §6)

## B — Gameplay fixes (this turn)

| # | Fix | File | What changed |
|---|---|---|---|
| 1.1 | Round-timer ends wave in any phase | `store/useRunStore.js` | On `roundTimer <= 0`, spawn queue is dropped and either `spawning` or `fighting` can transition straight to `cashout`. No more visible `0:00` while wave keeps going. |
| 1.2 | Independent enemy contact timers | `store/useRunStore.js` | Enemy now carries `rigContactTimer` and `playerContactTimer` separately. Hugging a rig-attacker is no longer free — its player-hit cooldown is its own. |
| 1.5 | Facing snaps to aim while idle | `store/useRunStore.js` | When the player isn't moving, `P.facing = aim` is set every frame, so the muzzle indicator and sprite point at the auto-aim target before the first shot. |
| 1.6 | Player ↔ rig collision | `store/useRunStore.js` | After movement, the player is pushed radially out of the rig if overlapping. No more standing on top of the rig. |
| 2.1 | Save-import validation | `game/persistence.js` | New `sanitizeMeta()` clamps `securedScrap` to a non-negative integer and filters upgrades to known IDs within their `maxLevel`. Applied to both `loadMeta` and `importSave`. Empty catches now log via `console.error`. |

## What I held back

**A (code-quality refactor)** — splitting `tick()` and `Arena.jsx`. Refactoring while we're still iterating on balance numbers is the fastest way to introduce subtle bugs (off-by-one in extracted state passing, missed regressions). Better order: finish gameplay tuning, lock the mechanics, *then* refactor against a stable target. Happy to do it whenever you say go.

## Smoke-tested

- Title → Loadout → Run still works end-to-end (screenshot captured).
- Lint clean on `useRunStore.js` and `persistence.js`.
- HUD reports `Wave 1 / spawning`, enemies spawn, no console errors.

## Not yet fixed (still in audit backlog)

- **1.3** Auto-aim god mode
- **1.4** Melee path dead code  
- **1.7** No enemy separation
- **1.8** Bullet pierce
- **1.9** Wave-1 difficulty curve
- **2.2** Wave-1 economy
- **2.3 / 2.4 / 2.5** Multiplier stacking, regen value
- **3.x** UX (pause menu, surrender button placement, melee swap feedback)

Tell me which of these to take next, or hand me a different priority list. The gameplay-changing ones (1.3, 1.4, 1.9, 2.2) want your design input before I touch numbers.
