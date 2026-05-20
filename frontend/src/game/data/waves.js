// [fix 1.9] Wave 1 spawns now overlap more so the player must actually engage
// instead of cleanly picking off arrivals one at a time. Wave 2-3 also tightened.
const SCRIPTED = [
  { spawns: { shambler: 6 }, spawnIntervalSec: 1.0 },
  { spawns: { shambler: 9 }, spawnIntervalSec: 0.95 },
  { spawns: { shambler: 10, brute: 1 }, spawnIntervalSec: 0.9 },
  { spawns: { shambler: 12, brute: 2 }, spawnIntervalSec: 0.85 },
  { spawns: { shambler: 14, brute: 3 }, spawnIntervalSec: 0.8 },
];

export function getWaveRule(wave) {
  if (wave <= SCRIPTED.length) return SCRIPTED[wave - 1];
  const over = wave - SCRIPTED.length;
  return {
    spawns: {
      shambler: 14 + over * 3,
      brute: 3 + Math.floor(over * 1.2),
    },
    spawnIntervalSec: Math.max(0.45, 0.8 - over * 0.05),
  };
}
