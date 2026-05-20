# LAST SCRAP — PRD

## Original problem statement
Audit source repo (https://github.com/buzzfuzzbee333-svg/last-scrap) and rebuild the
Last Scrap game in this workspace (React + FastAPI + MongoDB). Then deliver a status
report with bugs. Visual overhaul comes AFTER mechanics are stable.

## Stack (this build)
- Frontend: React 19 (CRA + craco), react-router-dom v7, Zustand, Tailwind v3, Canvas 2D
- Backend: FastAPI (passthrough — game runs entirely client-side for v1)
- Persistence: localStorage (`lastscrap.meta.v1`)
- Assets: original PNGs copied from source repo (hero / brute / shambler / arena)

## File map (game-specific)
```
frontend/src/
  game/
    combat.js         damage formula
    resolver.js       run-end payout (cashout/overrun/death/surrender)
    persistence.js    localStorage load/save + download/import
    data/
      balance.js      all tuning constants (arena, player, gun, regen, gamble…)
      enemies.js      Shambler + Brute active, Runner defined but disabled
      waves.js        5 scripted waves + procedural after
      upgrades.js     10 upgrades w/ cost curves
  store/
    useMetaStore.js   secured scrap + upgrade levels (persisted)
    useRunStore.js    in-run state + tick() engine
  components/game/
    Arena.jsx         canvas + keyboard input + render loop
    HUD.jsx           wave, time, kills, HP/RIG/AMMO bars
    MobileControls.jsx joystick + fire button
    CashoutModal.jsx  Cash Out / Next Wave / Gamble
    SummaryScreen.jsx run-end banked / lost / total
    DebugPanel.jsx    backtick to toggle, dev shortcuts
  pages/
    Title.jsx, Play.jsx, Run.jsx, Upgrades.jsx
```

## What's implemented (May 19, 2026)
- Full v1 loop: Title → Loadout → Arena (waves + cashout) → Summary → Upgrades
- Combat: gun (semi-auto on tap, full-auto on hold), melee fallback when ammo dry
- Enemies: contact-damage AI, walk straight to rig, brush past player
- 60s wave timer, wave-clear scrap bonus, passive rig scrap trickle
- Gamble ×2/×3/×5 next-wave option with proportional penalty on fail
- HP + ammo regen with hit-pause, scaled by gamble multiplier
- Persistent secured scrap + upgrades via localStorage
- Save export/import (JSON)
- Debug panel (` key) for testing
- Mobile joystick + fire button

## Backlog (P0 - blockers identified in audit)
- See `/app/AUDIT_REPORT.md`

## Backlog (P1 - polish/UX after mechanics stable)
- Visual overhaul (UI, menus, sprites, arena art) — explicitly deferred by user
- Optional backend leaderboard / cloud save

## Test credentials
N/A — no auth in v1.
