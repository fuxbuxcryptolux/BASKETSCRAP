import { BALANCE } from "./data/balance";

export function resolveRunEnd(cause, unsecured, currentSecured, waveReached) {
  const split = BALANCE.cashoutSplits[cause];
  const banked = Math.floor(unsecured * split.bank);
  const lost = unsecured - banked;
  return {
    cause,
    unsecuredBefore: unsecured,
    banked,
    lost,
    securedAfter: currentSecured + banked,
    waveReached,
  };
}
