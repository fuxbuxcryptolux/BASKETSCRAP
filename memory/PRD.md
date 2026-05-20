# LAST SCRAP — PRD

## Original problem statement
Audit source repo (https://github.com/buzzfuzzbee333-svg/last-scrap) and rebuild the
Last Scrap game in this workspace (React + FastAPI + MongoDB). Visual overhaul AFTER
mechanics + bugs are stable.

## Stack
- Frontend: React 19 (CRA + craco), react-router-dom v7, Zustand, Tailwind v3, Canvas 2D
- Backend: FastAPI (idle in v1 — game is fully client-side)
- Persistence: localStorage (`lastscrap.meta.v1`) with sanitisation on read/import

## What's implemented (May 20, 2026)
- Full v1 loop: Title → Loadout → Arena (waves + cashout) → Summary → Upgrades
- Combat: gun (semi/auto with hold-to-auto), melee fallback when ammo dry
- Enemies: contact-damage AI walking to rig
- 60s wave timer, wave-clear bonus, passive rig scrap trickle
- Gamble ×2/×3/×5 with proportional penalty
- HP + ammo regen with hit-pause
- Persistent secured scrap + upgrades, with download/import save
- Debug panel (` key)
- Mobile joystick + fire button

## Bug-fix log

### May 20, 2026 — Wave-1 gameplay fixes
- 1.1 Round-timer ends wave in any phase
- 1.2 Independent enemy contact timers (rig vs player)
- 1.5 Facing snaps to aim while idle
- 1.6 Player ↔ rig collision
- 2.1 Save import + load validation (clamps scrap, filters upgrade IDs, caps levels)

## Backlog (P0 — gameplay)
- 1.3 Auto-aim god mode (design call: remove? penalty?)
- 1.4 Melee path dead code (design call: how should melee feel?)
- 1.7 Enemy separation steering
- 1.8 Bullet pierce
- 1.9 Wave-1 difficulty curve
- 2.2 Wave-1 economy
- 2.3 / 2.4 / 2.5 Multiplier stacking & regen tuning

## Backlog (P1 — UX)
- 3.1 Move surrender button off mobile fire-button area
- 3.2 Pause / Esc menu
- 3.4 Melee swap feedback
- 3.5 Cashout preview

## Backlog (P2 — code health)
- Split `useRunStore.tick()` into sub-functions
- Split `Arena.jsx` into render / loop / input hooks
- Fixed-timestep accumulator
- Deterministic RNG seed (enables daily challenge mode)

## Backlog (P3 — visual)
- Full UI/menu/sprite/arena overhaul (explicitly queued AFTER mechanics lock)

## Test credentials
N/A — no auth in v1.
