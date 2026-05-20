export function computeDamage(attackerAttack, targetDefense) {
  return Math.max(1, Math.floor(attackerAttack - targetDefense));
}
