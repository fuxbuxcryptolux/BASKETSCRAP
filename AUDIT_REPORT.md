# LAST SCRAP — Audit & Status Report

**Build status:** ✅ Ported to this workspace. Title → Loadout → Run → Cashout → Summary → Upgrades loop verified end-to-end (screenshots taken).
**Tech stack here:** React 19 (CRA + craco) + react-router + Zustand + Canvas 2D. FastAPI/MongoDB are running but the v1 game is fully client-side (per your "core gameplay only" choice).

---

## 1. Critical gameplay bugs / logic flaws

### 1.1 Round timer only fires wave-end in `fighting` phase — exploitable stall
File: `store/useRunStore.js`, tick().
```
if (phase === "fighting" && (allCleared || timeout)) { ... cashout }
```
The 60s timer keeps decrementing during the `spawning` phase, but the wave only ends when it reaches 0 *while in fighting phase*. At late waves the spawn interval is short so this is minor, but it means the timer display can hit `0:00` and the wave keeps going until the queue empties. Either:
- gate the timer on `fighting` only, or
- allow `spawning` to also wave-end on timeout (clearing remaining spawn queue).

### 1.2 Enemy contact timer is shared between rig hits and player hits
```
if (dRig <= ... && e.contactTimer <= 0) { R.hp -= ...; e.contactTimer = e.contactInterval; }
... // same loop iteration
if (dPl <= ... && e.contactTimer <= 0 ...) { P.hp -= ...; e.contactTimer = ... }
```
An enemy currently grinding the rig **cannot damage the player on the same tick** because the timer was just reset by the rig hit. So if you hug a rig-attacker, you're free. Combined with invuln-after-hit on the player, melee bullies (Brutes) feel unfair-in-your-favor. Fix: separate timers per target, or evaluate player contact first.

### 1.3 Auto-aim while standing still is a one-button god mode
When `mag <= 0.001`, the gun auto-locks onto `nearestEnemy`. Combined with HP+ammo regen, the optimal play is **stand next to the rig, hold fire**. There's no incentive to move. Suggested mitigations: remove auto-aim and require manual facing (mouse aim or last move direction only), or reduce damage when auto-aiming, or give enemies wider/asymmetric paths so a single point can't cover them.

### 1.4 Melee path is effectively dead code
With ammo regen always on and `holdToAuto` cadence at 0.09s, you never run out long enough to need melee. The "Pipe Wrench" upgrade is wasted scrap. Either:
- make ammo regen require pickups/wave-end only, or
- give melee a real role (higher dmg, knockback, infinite ammo trade-off).

### 1.5 Visual facing vs aim direction desync
`P.facing` is overwritten every movement frame from move direction. While standing still, `aim` is computed from nearest enemy, but the on-screen muzzle indicator + sprite rotation still point the *previous* movement direction until the first shot fires. Snap `P.facing = aim` every frame when idle (not just on fire).

### 1.6 Player can clip behind/through the rig
Player has arena bounds but no collision with the rig circle. You can stand *on top of* the rig and be invulnerable to anything that's not melee-touching the rig already (due to bug 1.2). Add rig collision.

### 1.7 Enemies have no separation
Brutes and shamblers stack on the exact same point at the rig (look at the screenshot — they pile up). Visually a blob, mechanically a single point that's easy to one-shot with auto-fire. Add minimum-distance steering.

### 1.8 Bullets stop at first hit; brutes are bullet-sponges
Brute HP 90, defense 4 → semi-auto does 24 dmg per shot → 4 shots/brute. Acceptable, but bullets can't pierce a shambler line in front of a brute. Optional design: small pierce for semi-auto, none for auto.

### 1.9 Wave 1 is trivial → can be skipped without spending a single bullet
5 shamblers, 70 px/s speed, arena 720 px — most don't reach the rig before passive scrap + auto-aim ends the wave. Wave 1 should *teach* (your plan says so), so let at least one shambler reach the player or rig.

---

## 2. Economy / progression exploits

### 2.1 Save-file edit gives infinite scrap
`importSave()` accepts any number for `securedScrap` and any object for upgrades. A user can edit `lastscrap-save.json` and set `securedScrap: 999999999` or set every upgrade to its max level. There is **no validation** of upgrade IDs, levels, or caps.
Fix: clamp upgrades to known IDs and `0…maxLevel`, and (if you care about cheat-resistance) sign with a checksum.

### 2.2 Cashout on wave 1 is dominant strategy
With current numbers: wave 1 kills (~5 × 5 = 25) + passive (~60s × 2 = 120) + bonus (20) = ~165 unsecured. Cash Out → 165 banked. Cheapest upgrade is 30. So you get ~5 upgrades after a *risk-free* wave 1 cleared mostly by auto-aim. The "greed" tension is missing because there's no real reason to push beyond wave 1.
Fix: lower passive trickle, or scale wave-clear bonus higher per wave, or reduce wave 1 trickle window.

### 2.3 Scrap Gain upgrade and Gamble multiplier stack multiplicatively
`rewardMult = scrapMultiplier * gambleMult` and BOTH are applied to wave clear bonus AND passive trickle AND kills. With 6× scrap upgrade (1 + 6×0.15 = 1.9) + ×5 gamble = 9.5× multiplier. Pumping passive scrap for a minute at gamble ×5 with full Salvage Protocols = ~1140 scrap with low effort if you can survive once. Possibly intended, but flag for tuning.

### 2.4 Gamble penalty applies *after* the run already accrued multiplied scrap
On gamble ×5 with 85% penalty, you keep 15% of an already 5× multiplied pile, so net = 0.75× (still net positive vs base). Math may be intentional, but worth checking against your design.

### 2.5 Regen makes HP/Ammo upgrades much less impactful than they look
Field Medic + base regen at 1.5 HP/s × 1+0.25×8 = 4.5 HP/s. Over a 60s wave you regenerate 270 HP — more than your base max. Once you survive the first hit, you're back to full almost instantly between brushes.

---

## 3. UX / control issues

### 3.1 Surrender button overlaps mobile fire button location
Both sit at the bottom-right of the arena container. On mobile you can mis-tap Surrender while trying to fire. Move surrender to HUD or top-right.

### 3.2 No pause / Esc menu
The plan said "Esc opens pause/surrender" but it isn't wired. Game keeps running if you tab away (clamped dt mitigates it but the loop still runs).

### 3.3 Mobile joystick `firePressed` not single-shot
Touch fire sets `firePressed: true, fireHeld: true` on `touchstart`. Holding fire on mobile only sends the edge once on touchstart, the `firePressed` is cleared by Arena loop, then `fireHeld` keeps auto-fire going. Works in practice, but the first semi-auto shot fires before auto kicks in regardless of hold duration. Desktop has the same behavior — fine.

### 3.4 No reload feedback on melee-fallback transition
HUD label changes AMMO → MELEE at 0 ammo, but the player has no audio/visual signal that they just switched weapons.

### 3.5 Cashout modal shows banked scrap as `secured` (pre-bank), which is correct, but no preview of what you'd bank if you cashed out RIGHT NOW with current cashout split (100%). Minor: explicit "Bank +N now" would clarify the choice.

---

## 4. Code-quality / architecture findings

- `resolver.js` `resolveRunEnd(cause, unsecured, currentSecured, waveReached)` — when called from inside `tick()` for death/overrun, `currentSecured` is hard-coded to `0`, so `securedAfter` is wrong on the first set; `markSummaryPersisted()` later patches it. Works, but the API is misleading. Cleaner: don't compute `securedAfter` until banking.
- `useRunStore` is a 500-line god object. `tick()` is one big function mixing movement, firing, AI, collisions, regen, spawning, and phase transitions. Will become hard to balance without splitting into smaller sub-tick functions (movement, combat, ai, spawn, economy, phase).
- No deterministic seed for RNG. Replays / debug repro is impossible. Optional but useful for tuning.
- No fixed timestep — `tick(dt)` uses raw dt clamped to 50ms. Long frames will simulate big steps; collisions can be skipped. Switch to accumulator-based fixed dt of e.g. 1/60.
- `IMG` constants are loaded at module import time, before React mounts. Fine for CRA but means HMR-reloads keep the old cache. Not a bug per se.
- TypeScript types from the source were dropped during the JS port — no functional change, but future contributors will miss the autocomplete.
- Original source still imports the `Runner` enemy def even though `enabled: false`. Dead code but harmless.

---

## 5. Things that look like bugs but are actually fine
- Enemies always target the rig (never the player) — explicitly designed that way ("enemies brush past toward the rig").
- Wave clear triggers when `enemies.length === 0 && spawnQueue.length === 0` — correct.
- `markSummaryPersisted` gating the Summary screen — prevents the run-end UI from showing pre-bank totals; intentional.

---

## 6. Suggested fix-order (when you say go)

**Wave 1 — gameplay integrity (P0)**
1. Separate enemy contact timers for rig vs player (1.2)
2. Add rig collision for player (1.6)
3. Fix `phase=spawning` timeout handling (1.1)
4. Fix facing/aim desync (1.5)

**Wave 2 — exploit & balance (P0/P1)**
5. Validate save imports (2.1)
6. Rebalance regen + auto-aim (1.3, 1.4, 2.5) — your call on direction
7. Wave 1 difficulty pass (1.9) + economy tuning (2.2)
8. Enemy separation steering (1.7)

**Wave 3 — UX**
9. Pause/Esc menu (3.2)
10. Move surrender button (3.1)
11. Visual feedback for melee swap (3.4)

**Wave 4 — code health (do whenever)**
12. Split `tick()` into sub-functions
13. Fixed timestep accumulator
14. Optional: deterministic RNG seed for tuning

---

## 7. What I did NOT change
Per your instructions, I did **not** touch any visuals, gameplay balance numbers, or fix any of the bugs above. The port is intentionally a faithful 1:1 of the source repo's behavior so you can verify the audit findings against the original.

Ready when you are — tell me which items to start on, in what order, or hand me your own priority list.
