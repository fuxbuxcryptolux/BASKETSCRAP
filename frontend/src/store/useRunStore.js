import { create } from "zustand";
import { BALANCE } from "../game/data/balance";
import { ENEMIES } from "../game/data/enemies";
import { getWaveRule } from "../game/data/waves";
import { computeDamage } from "../game/combat";
import { resolveRunEnd } from "../game/resolver";

let enemyIdCounter = 1;
let bulletIdCounter = 1;

function makePlayer(upgrades) {
  const hpLvl = upgrades.maxHp ?? 0;
  const atkLvl = upgrades.attack ?? 0;
  const defLvl = upgrades.defense ?? 0;
  const spdLvl = upgrades.speed ?? 0;
  const ammoLvl = upgrades.startAmmo ?? 0;
  const wpnLvl = upgrades.weaponDamage ?? 0;
  const meleeLvl = upgrades.melee ?? 0;
  const regenLvl = upgrades.regenRate ?? 0;
  const maxHp = BALANCE.player.baseMaxHp + 15 * hpLvl;
  const maxAmmo = BALANCE.player.maxAmmo + 10 * ammoLvl;
  return {
    pos: { x: BALANCE.arena.width / 2, y: BALANCE.arena.height / 2 + 90 },
    hp: maxHp,
    maxHp,
    attack: BALANCE.player.baseAttack + 4 * atkLvl,
    defense: BALANCE.player.baseDefense + 2 * defLvl,
    speed: BALANCE.player.baseSpeed + 20 * spdLvl,
    velX: 0, velY: 0,                       // [playtest fix] inertia
    dashCooldown: 0,                        // [feature dash]
    dashTimer: 0,
    dashDirX: 0, dashDirY: 0,
    attackCooldown: 0,
    invulnTimer: 0,
    facing: 0,
    alive: true,
    ammo: maxAmmo,
    maxAmmo,
    fireCooldown: 0,
    holdTime: 0,
    weaponBonus: 3 * wpnLvl,
    meleeBonus: 5 * meleeLvl,
    meleeCooldown: 0,
    regenMult: 1 + 0.25 * regenLvl,
    hpRegenAcc: 0,
    ammoRegenAcc: 0,
    hitRecentTimer: 0,
    // [fix 1.4] explicit weapon mode + locked flag (locked when ammo == 0
    // mid-wave; unlocks on wave clear refill).
    weaponMode: "gun",
    weaponLocked: false,
  };
}

function makeRig(upgrades) {
  const lvl = upgrades.rigIntegrity ?? 0;
  const maxHp = BALANCE.rig.baseMaxIntegrity + 60 * lvl;
  return { pos: { x: BALANCE.arena.rigX, y: BALANCE.arena.rigY }, hp: maxHp, maxHp };
}

function buildSpawnQueue(wave) {
  const rule = getWaveRule(wave);
  const queue = [];
  Object.keys(rule.spawns).forEach((k) => {
    if (!ENEMIES[k].enabled) return;
    const n = rule.spawns[k] ?? 0;
    for (let i = 0; i < n; i++) queue.push(k);
  });
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return { queue, interval: rule.spawnIntervalSec };
}

function spawnEnemy(kind) {
  const def = ENEMIES[kind];
  const side = Math.floor(Math.random() * 4);
  const W = BALANCE.arena.width;
  const H = BALANCE.arena.height;
  let pos;
  if (side === 0) pos = { x: Math.random() * W, y: -20 };
  else if (side === 1) pos = { x: W + 20, y: Math.random() * H };
  else if (side === 2) pos = { x: Math.random() * W, y: H + 20 };
  else pos = { x: -20, y: Math.random() * H };
  return {
    id: enemyIdCounter++, kind, pos,
    hp: def.maxHp, maxHp: def.maxHp,
    attack: def.attack, defense: def.defense, speed: def.speed,
    radius: def.radius, aggroRadius: def.aggroRadius,
    contactInterval: def.contactDamageInterval,
    rigContactTimer: 0, playerContactTimer: 0,
    scrapReward: def.scrapReward, color: def.color,
    prevX: pos.x, facingSign: pos.x > BALANCE.arena.rigX ? -1 : 1,
  };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function nearestEnemy(enemies, p) {
  let best = null;
  let bd = Infinity;
  for (const e of enemies) {
    const d = dist(e.pos, p);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function fireBullet(p, mode, facing) {
  const cfg = BALANCE.gun[mode];
  return {
    id: bulletIdCounter++,
    pos: { x: p.pos.x + Math.cos(facing) * 18, y: p.pos.y + Math.sin(facing) * 18 },
    vel: { x: Math.cos(facing) * cfg.bulletSpeed, y: Math.sin(facing) * cfg.bulletSpeed },
    damage: cfg.damage,
    radius: cfg.bulletRadius,
    life: BALANCE.gun.bulletLifeSec,
    color: cfg.color,
  };
}

export const useRunStore = create((set, get) => ({
  phase: "idle",
  wave: 0,
  unsecured: 0,
  scrapMultiplier: 1,
  kills: 0,
  roundTimer: BALANCE.round.durationSec,
  gambleMult: 1,
  gamblePenalty: 0,
  player: makePlayer({}),
  rig: makeRig({}),
  enemies: [],
  bullets: [],
  spawnQueue: [],
  spawnTimer: 0,
  spawnInterval: 1,
  passiveTimer: 0,
  input: { moveX: 0, moveY: 0, firePressed: false, fireHeld: false, attack: false, swapPressed: false, dashPressed: false },
  endSummary: null,

  startRun: (upgrades) => {
    const scrapLvl = upgrades.scrapGain ?? 0;
    const { queue, interval } = buildSpawnQueue(1);
    set({
      phase: "spawning",
      wave: 1,
      unsecured: 0,
      scrapMultiplier: 1 + 0.15 * scrapLvl,
      kills: 0,
      roundTimer: BALANCE.round.durationSec,
      gambleMult: 1,
      gamblePenalty: 0,
      player: makePlayer(upgrades),
      rig: makeRig(upgrades),
      enemies: [],
      bullets: [],
      spawnQueue: queue,
      spawnTimer: 0,
      spawnInterval: interval,
      passiveTimer: 0,
      input: { moveX: 0, moveY: 0, firePressed: false, fireHeld: false, attack: false, swapPressed: false, dashPressed: false },
      endSummary: null,
    });
  },

  setInput: (i) => set({ input: { ...get().input, ...i } }),

  beginNextWave: (gambleMult = 1, gamblePenalty = 0) => {
    const nextWave = get().wave + 1;
    const { queue: baseQueue, interval } = buildSpawnQueue(nextWave);
    const queue = [];
    const repeats = Math.max(1, Math.round(gambleMult));
    for (let r = 0; r < repeats; r++) queue.push(...baseQueue);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    const scaledInterval = Math.max(0.25, interval / Math.max(1, gambleMult * 0.85));
    const P = { ...get().player };
    P.ammo = Math.min(P.maxAmmo, P.ammo + BALANCE.player.ammoRefillOnWave);
    // [fix 1.4] wave-clear unlocks weapon swap and resets to gun mode.
    if (P.ammo > 0) {
      P.weaponLocked = false;
      P.weaponMode = "gun";
    }
    set({
      phase: "spawning",
      wave: nextWave,
      spawnQueue: queue,
      spawnTimer: 0,
      spawnInterval: scaledInterval,
      roundTimer: BALANCE.round.durationSec,
      player: P,
      bullets: [],
      gambleMult,
      gamblePenalty,
    });
  },

  cashOut: (currentSecured) => {
    const s = get();
    const summary = resolveRunEnd("cashout", s.unsecured, currentSecured, s.wave);
    set({ phase: "ended", endSummary: summary });
    return summary;
  },
  surrender: (currentSecured) => {
    const s = get();
    const summary = resolveRunEnd("surrender", s.unsecured, currentSecured, s.wave);
    set({ phase: "ended", endSummary: summary });
    return summary;
  },
  forceEnd: (cause, currentSecured) => {
    const s = get();
    const summary = resolveRunEnd(cause, s.unsecured, currentSecured, s.wave);
    set({ phase: "ended", endSummary: summary });
    return summary;
  },

  markSummaryPersisted: (securedAfter) => {
    const sum = get().endSummary;
    if (!sum || sum.persisted) return;
    set({ endSummary: { ...sum, securedAfter, persisted: true } });
  },

  tick: (dt) => {
    const s = get();
    if (s.phase !== "spawning" && s.phase !== "fighting") return;

    const P = { ...s.player, pos: { ...s.player.pos } };
    const R = { ...s.rig };
    let enemies = s.enemies.map((e) => ({ ...e, pos: { ...e.pos } }));
    let bullets = s.bullets.map((b) => ({ ...b, pos: { ...b.pos }, vel: { ...b.vel } }));
    let unsecured = s.unsecured;
    let kills = s.kills;

    // ----- Player movement [playtest fix: velocity smoothing for natural feel] -----
    const ix = s.input.moveX;
    const iy = s.input.moveY;
    const mag = Math.hypot(ix, iy);

    // Cooldowns / timers tick down each frame.
    P.dashCooldown = Math.max(0, P.dashCooldown - dt);
    P.dashTimer = Math.max(0, P.dashTimer - dt);

    // [feature dash] trigger on edge if off cooldown.
    if (P.alive && s.input.dashPressed && P.dashCooldown <= 0 && P.dashTimer <= 0) {
      let dirX = 0, dirY = 0;
      if (mag > 0.001) {
        dirX = ix / mag; dirY = iy / mag;
      } else {
        dirX = Math.cos(P.facing); dirY = Math.sin(P.facing);
      }
      P.dashDirX = dirX;
      P.dashDirY = dirY;
      P.dashTimer = BALANCE.player.dashDuration;
      P.dashCooldown = BALANCE.player.dashCooldown;
      P.invulnTimer = Math.max(P.invulnTimer, BALANCE.player.dashInvuln);
      P.facing = Math.atan2(dirY, dirX);
    }

    let targetVx = 0;
    let targetVy = 0;
    if (P.dashTimer > 0) {
      // dash overrides input: full dash speed in dash direction
      targetVx = P.dashDirX * BALANCE.player.dashSpeed;
      targetVy = P.dashDirY * BALANCE.player.dashSpeed;
      P.velX = targetVx;
      P.velY = targetVy;
    } else {
      if (mag > 0.001 && P.alive) {
        const nx = ix / mag;
        const ny = iy / mag;
        targetVx = nx * P.speed;
        targetVy = ny * P.speed;
        P.facing = Math.atan2(ny, nx);
      }
      // Lerp current velocity toward target. accel=14 → ~0.15s ramp-up/coast-down.
      const accelStep = Math.min(1, BALANCE.player.accel * dt);
      P.velX += (targetVx - P.velX) * accelStep;
      P.velY += (targetVy - P.velY) * accelStep;
    }
    P.pos.x += P.velX * dt;
    P.pos.y += P.velY * dt;
    P.pos.x = Math.max(16, Math.min(BALANCE.arena.width - 16, P.pos.x));
    P.pos.y = Math.max(16, Math.min(BALANCE.arena.height - 16, P.pos.y));
    P.attackCooldown = Math.max(0, P.attackCooldown - dt);
    P.invulnTimer = Math.max(0, P.invulnTimer - dt);
    P.fireCooldown = Math.max(0, P.fireCooldown - dt);
    P.meleeCooldown = Math.max(0, P.meleeCooldown - dt);
    P.hitRecentTimer = Math.max(0, P.hitRecentTimer - dt);

    // ----- Rig collision (push player out of rig body) [fix 1.6] -----
    {
      const dx = P.pos.x - R.pos.x;
      const dy = P.pos.y - R.pos.y;
      const d = Math.hypot(dx, dy);
      const minDist = BALANCE.arena.rigRadius + BALANCE.player.radius;
      if (d < minDist) {
        if (d < 0.001) {
          P.pos.x = R.pos.x + minDist;
        } else {
          P.pos.x = R.pos.x + (dx / d) * minDist;
          P.pos.y = R.pos.y + (dy / d) * minDist;
        }
      }
    }

    // ----- Weapon mode [fix 1.4] -----
    if (P.alive && P.ammo <= 0 && P.weaponMode === "gun") {
      P.weaponMode = "melee";
      P.weaponLocked = true;
    }
    if (P.alive && s.input.swapPressed && !P.weaponLocked) {
      P.weaponMode = P.weaponMode === "gun" ? "melee" : "gun";
    }

    // ----- Aim [playtest fix: full-auto now also auto-aims when idle, but
    // with a small bullet spread so spray ≠ pixel-perfect god mode] -----
    // semi-auto tap: pixel-accurate auto-aim assist when idle (kept).
    // full-auto held-fire: auto-aims at nearest enemy when idle, manual otherwise,
    //                      with a small randomised cone added per bullet.
    let semiAim = P.facing;
    let autoAim = P.facing;
    if (mag <= 0.001) {
      const n = nearestEnemy(enemies, P.pos);
      if (n) {
        const target = Math.atan2(n.pos.y - P.pos.y, n.pos.x - P.pos.x);
        semiAim = target;
        autoAim = target;
        // Snap visual facing to target when idle so the muzzle line points
        // somewhere meaningful instead of a stale direction.
        P.facing = target;
      }
    }

    const doMelee = (aim) => {
      if (!P.alive || P.meleeCooldown > 0) return;
      const dmg = BALANCE.melee.baseDamage + P.meleeBonus;
      const range = BALANCE.melee.range;
      const halfArc = (BALANCE.melee.arcDeg * Math.PI) / 360;
      const kb = BALANCE.melee.knockback;
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        const dx = e.pos.x - P.pos.x;
        const dy = e.pos.y - P.pos.y;
        const d = Math.hypot(dx, dy);
        if (d > range + e.radius) continue;
        const ang = Math.atan2(dy, dx);
        const diff = Math.abs(((ang - aim + Math.PI) % (Math.PI * 2)) - Math.PI);
        if (diff <= halfArc) {
          e.hp -= computeDamage(dmg, e.defense);
          e.pos.x += Math.cos(ang) * kb;
          e.pos.y += Math.sin(ang) * kb;
        }
      }
      P.meleeCooldown = BALANCE.melee.cooldown;
      P.facing = aim;
    };

    // ----- Firing -----
    if (P.weaponMode === "melee") {
      const meleeAim = mag <= 0.001 ? semiAim : P.facing;
      if (P.alive && (s.input.firePressed || s.input.fireHeld) && P.meleeCooldown <= 0) {
        doMelee(meleeAim);
      }
      P.holdTime = 0;
    } else {
      // Gun mode
      if (P.alive && s.input.firePressed && P.fireCooldown <= 0 && P.ammo >= BALANCE.gun.semi.ammoCost) {
        const b = fireBullet(P, "semi", semiAim);
        b.damage += P.weaponBonus;
        bullets.push(b);
        P.ammo -= BALANCE.gun.semi.ammoCost;
        P.fireCooldown = BALANCE.gun.semi.cooldown;
        P.facing = semiAim;
      }
      if (s.input.fireHeld) {
        P.holdTime += dt;
        if (P.alive && P.holdTime >= BALANCE.gun.holdToAutoSec && P.fireCooldown <= 0 && P.ammo >= BALANCE.gun.auto.ammoCost) {
          // [playtest fix] full-auto bullet spread so spray-and-pray isn't perfect.
          const spread = (Math.random() - 0.5) * BALANCE.gun.auto.spreadRad;
          const b = fireBullet(P, "auto", autoAim + spread);
          b.damage += P.weaponBonus;
          bullets.push(b);
          P.ammo -= BALANCE.gun.auto.ammoCost;
          P.fireCooldown = BALANCE.gun.auto.cooldown;
        }
      } else {
        P.holdTime = 0;
      }
    }

    // ----- Bullet update + collisions -----
    const liveBullets = [];
    for (const b of bullets) {
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
      b.life -= dt;
      if (b.life <= 0 || b.pos.x < -20 || b.pos.x > BALANCE.arena.width + 20 || b.pos.y < -20 || b.pos.y > BALANCE.arena.height + 20) {
        continue;
      }
      let hit = false;
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        if (dist(e.pos, b.pos) <= e.radius + b.radius) {
          e.hp -= computeDamage(b.damage, e.defense);
          hit = true;
          break;
        }
      }
      if (!hit) liveBullets.push(b);
    }
    bullets = liveBullets;

    // ----- Enemy AI + contact damage [fix 1.2: independent timers per target] -----
    // First pass: compute desired velocity (seek rig + separation [fix 1.7]).
    const SEP_PAD = 4;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      // seek toward rig
      let vx = R.pos.x - e.pos.x;
      let vy = R.pos.y - e.pos.y;
      const mSeek = Math.hypot(vx, vy) || 1;
      vx /= mSeek; vy /= mSeek;
      // separation from other enemies
      let sx = 0, sy = 0;
      for (let j = 0; j < enemies.length; j++) {
        if (j === i) continue;
        const o = enemies[j];
        const dx = e.pos.x - o.pos.x;
        const dy = e.pos.y - o.pos.y;
        const d = Math.hypot(dx, dy);
        const minD = e.radius + o.radius + SEP_PAD;
        if (d > 0 && d < minD) {
          const push = (minD - d) / minD; // 0..1
          sx += (dx / d) * push;
          sy += (dy / d) * push;
        }
      }
      // blend (separation weighted higher when close)
      const sMag = Math.hypot(sx, sy);
      const SEP_WEIGHT = 1.4;
      let dx = vx + sx * SEP_WEIGHT;
      let dy = vy + sy * SEP_WEIGHT;
      const norm = Math.hypot(dx, dy) || 1;
      dx /= norm; dy /= norm;
      e.pos.x += dx * e.speed * dt;
      e.pos.y += dy * e.speed * dt;
      // [playtest fix] track horizontal movement so the sprite flips to FACE
      // the direction of travel (no more walking-backwards zombies).
      const frameDx = e.pos.x - e.prevX;
      if (frameDx > 0.5) e.facingSign = 1;
      else if (frameDx < -0.5) e.facingSign = -1;
      e.prevX = e.pos.x;
      e.rigContactTimer = Math.max(0, e.rigContactTimer - dt);
      e.playerContactTimer = Math.max(0, e.playerContactTimer - dt);

      const dRig = dist(e.pos, R.pos);
      if (dRig <= e.radius + BALANCE.arena.rigRadius && e.rigContactTimer <= 0) {
        R.hp -= computeDamage(e.attack, 0);
        e.rigContactTimer = e.contactInterval;
      }
      const dPl = dist(e.pos, P.pos);
      if (P.alive && dPl <= e.radius + BALANCE.player.radius && e.playerContactTimer <= 0 && P.invulnTimer <= 0) {
        P.hp -= computeDamage(e.attack, P.defense);
        P.invulnTimer = BALANCE.player.invulnAfterHit;
        P.hitRecentTimer = BALANCE.regen.delayAfterHitSec;
        e.playerContactTimer = e.contactInterval;
      }
      // soft enemy-enemy non-overlap (resolve any remaining overlap so they
      // visibly stand apart rather than stacking on the same pixel).
      for (let j = i + 1; j < enemies.length; j++) {
        const o = enemies[j];
        const ox = o.pos.x - e.pos.x;
        const oy = o.pos.y - e.pos.y;
        const od = Math.hypot(ox, oy);
        const minD = e.radius + o.radius;
        if (od > 0 && od < minD) {
          const overlap = (minD - od) / 2;
          const nx = ox / od;
          const ny = oy / od;
          e.pos.x -= nx * overlap;
          e.pos.y -= ny * overlap;
          o.pos.x += nx * overlap;
          o.pos.y += ny * overlap;
        }
      }
    }

    const rewardMult = s.scrapMultiplier * s.gambleMult;
    const survivors = [];
    for (const e of enemies) {
      if (e.hp <= 0) {
        unsecured += Math.round(e.scrapReward * rewardMult);
        kills += 1;
      } else {
        survivors.push(e);
      }
    }
    enemies = survivors;

    let spawnQueue = s.spawnQueue;
    let spawnTimer = s.spawnTimer - dt;
    if (s.phase === "spawning") {
      while (spawnTimer <= 0 && spawnQueue.length > 0) {
        enemies.push(spawnEnemy(spawnQueue[0]));
        spawnQueue = spawnQueue.slice(1);
        spawnTimer += s.spawnInterval;
      }
    }

    let passiveTimer = s.passiveTimer + dt;
    if (R.hp > 0) {
      const passiveRate = BALANCE.rig.passiveScrapPerSec(s.wave);
      while (passiveTimer >= 1) {
        unsecured += Math.round(passiveRate * rewardMult);
        passiveTimer -= 1;
      }
    }

    if (P.alive) {
      const diffDiv = Math.max(1, s.gambleMult);
      const hpRate = (BALANCE.regen.hpPerSec * P.regenMult) / diffDiv;
      const ammoRate = (BALANCE.regen.ammoPerSec * P.regenMult) / diffDiv;
      if (P.hp < P.maxHp && P.hitRecentTimer <= 0) {
        P.hpRegenAcc += hpRate * dt;
        if (P.hpRegenAcc >= 1) {
          const add = Math.floor(P.hpRegenAcc);
          P.hp = Math.min(P.maxHp, P.hp + add);
          P.hpRegenAcc -= add;
        }
      }
      // [fix 1.4b] ammo regen only ticks while ammo > 0 — no resurrection
      // from 0; once dry, you must clear the wave to refill (and unlock).
      if (P.ammo > 0 && P.ammo < P.maxAmmo) {
        P.ammoRegenAcc += ammoRate * dt;
        if (P.ammoRegenAcc >= 1) {
          const add = Math.floor(P.ammoRegenAcc);
          P.ammo = Math.min(P.maxAmmo, P.ammo + add);
          P.ammoRegenAcc -= add;
        }
      }
    }

    const roundTimer = Math.max(0, s.roundTimer - dt);

    if (P.alive && P.hp <= 0) {
      P.hp = 0; P.alive = false;
      const busted = s.gambleMult > 1;
      const effUnsecured = busted ? Math.round(unsecured * (1 - s.gamblePenalty)) : unsecured;
      const summary = resolveRunEnd("death", effUnsecured, 0, s.wave);
      set({
        player: P, rig: R, enemies, bullets, spawnQueue, spawnTimer,
        unsecured: effUnsecured, kills, passiveTimer, roundTimer,
        phase: "ended",
        endSummary: { ...summary, gambleBusted: busted, gambleMult: s.gambleMult },
      });
      return;
    }

    if (R.hp <= 0) {
      R.hp = 0;
      const busted = s.gambleMult > 1;
      const effUnsecured = busted ? Math.round(unsecured * (1 - s.gamblePenalty)) : unsecured;
      const summary = resolveRunEnd("overrun", effUnsecured, 0, s.wave);
      set({
        player: P, rig: R, enemies, bullets, spawnQueue, spawnTimer,
        unsecured: effUnsecured, kills, passiveTimer, roundTimer,
        phase: "ended",
        endSummary: { ...summary, gambleBusted: busted, gambleMult: s.gambleMult },
      });
      return;
    }

    let phase = s.phase;
    const timeout = roundTimer <= 0;
    // [fix 1.1] On timeout, abort any pending spawns and remove enemies still
    // off-arena so the wave actually ends instead of stalling in `spawning`.
    if (timeout) {
      spawnQueue = [];
    }
    const allCleared = enemies.length === 0 && spawnQueue.length === 0;
    if (phase === "spawning" && spawnQueue.length === 0) phase = "fighting";
    if ((phase === "spawning" || phase === "fighting") && (allCleared || timeout)) {
      const bonus = BALANCE.waveClearBonus(s.wave);
      unsecured += Math.round(bonus * rewardMult);
      phase = "cashout";
    }

    set({
      player: P, rig: R, enemies, bullets, spawnQueue, spawnTimer,
      unsecured, kills, passiveTimer, roundTimer, phase,
    });
  },

  debugAddUnsecured: (n) => set({ unsecured: get().unsecured + n }),
  debugDamagePlayer: (n) => { const P = { ...get().player }; P.hp = Math.max(0, P.hp - n); set({ player: P }); },
  debugDamageRig: (n) => { const R = { ...get().rig }; R.hp = Math.max(0, R.hp - n); set({ rig: R }); },
  debugKillEnemies: () => {
    const s = get();
    let unsecured = s.unsecured; let kills = s.kills;
    for (const e of s.enemies) { unsecured += Math.round(e.scrapReward * s.scrapMultiplier); kills += 1; }
    set({ enemies: [], unsecured, kills });
  },
  debugForceWaveClear: () => {
    const s = get();
    let unsecured = s.unsecured; let kills = s.kills;
    for (const e of s.enemies) { unsecured += Math.round(e.scrapReward * s.scrapMultiplier); kills += 1; }
    const bonus = BALANCE.waveClearBonus(s.wave);
    unsecured += Math.round(bonus * s.scrapMultiplier);
    set({ enemies: [], spawnQueue: [], unsecured, kills, phase: "cashout" });
  },
  debugSetWave: (w) => set({ wave: Math.max(1, w) }),
}));
