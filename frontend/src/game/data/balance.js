// Central tuning. Edit numbers here.
export const BALANCE = {
  arena: { width: 720, height: 720, rigRadius: 44, rigX: 360, rigY: 360 },
  player: {
    baseMaxHp: 100,
    baseAttack: 20,
    baseDefense: 2,
    baseSpeed: 240, // px/sec
    attackRange: 70,
    attackArcDeg: 110,
    attackCooldown: 0.35, // sec
    radius: 16,
    invulnAfterHit: 0.25,
    maxAmmo: 60,
    ammoRefillOnWave: 30,
  },
  regen: {
    hpPerSec: 1.5,
    ammoPerSec: 2.0,
    delayAfterHitSec: 2.0,
  },
  melee: {
    baseDamage: 18,
    range: 56,
    cooldown: 0.45,
    arcDeg: 130,
  },
  gun: {
    semi: {
      damage: 28,
      cooldown: 0.32,
      ammoCost: 1,
      bulletSpeed: 900,
      bulletRadius: 4,
      color: "#ffd84a",
    },
    auto: {
      damage: 12,
      cooldown: 0.09,
      ammoCost: 1,
      bulletSpeed: 780,
      bulletRadius: 3,
      color: "#ff8a3a",
    },
    holdToAutoSec: 0.18,
    bulletLifeSec: 0.9,
  },
  round: {
    durationSec: 60,
  },
  rig: {
    baseMaxIntegrity: 300,
    passiveScrapPerSec: 2,
    contactTickInterval: 0.6,
  },
  cashoutSplits: {
    cashout: { bank: 1.0, lose: 0.0 },
    overrun: { bank: 0.5, lose: 0.5 },
    death: { bank: 0.0, lose: 1.0 },
    surrender: { bank: 0.4, lose: 0.6 },
  },
  waveClearBonus: (wave) => 15 + wave * 5,
  gamble: {
    options: [
      { mult: 2, penalty: 0.5, label: "2x" },
      { mult: 3, penalty: 0.7, label: "3x" },
      { mult: 5, penalty: 0.85, label: "5x" },
    ],
  },
};
