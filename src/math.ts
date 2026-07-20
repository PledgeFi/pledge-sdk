import { formatUnits, parseUnits } from "viem";

export const TOKEN_DECIMALS = 18;
export const HF_WAD = 10n ** 18n;
export const BPS = 10_000n;
export const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n;
export const DUST_DEBT_WEI = parseUnits("0.0001", TOKEN_DECIMALS);

const MAX_UINT256 = 2n ** 256n - 1n;
const HF_DISPLAY_CAP = 1000n * HF_WAD;

export type HealthFactorView = {
  label: string;
  gaugePercent: number;
  hasDebt: boolean;
};

export function parseTokenAmount(input: string, decimals = TOKEN_DECIMALS): bigint | null {
  const trimmed = input.trim().replace(/,/g, "");
  if (!trimmed || Number.isNaN(Number(trimmed))) return null;
  try {
    return parseUnits(trimmed, decimals);
  } catch {
    return null;
  }
}

export function formatTokenAmount(value: bigint, maxFractionDigits = 4, decimals = TOKEN_DECIMALS): string {
  const num = Number(formatUnits(value, decimals));
  if (num === 0) return "0";
  if (num >= 1000) return Math.round(num).toLocaleString("en-US");
  if (num > 0 && num < 0.0001) {
    return num.toLocaleString("en-US", {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    });
  }
  return num.toLocaleString("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  });
}

export function formatExactTokenInput(value: bigint, maxFractionDigits = 12, decimals = TOKEN_DECIMALS): string {
  if (value === 0n) return "0";
  const raw = formatUnits(value, decimals);
  const [whole, fraction = ""] = raw.split(".");
  if (!fraction) return whole;
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

/** Mirror on-chain VaultMath.accrueInterest + stored debt. */
export function accrueDebtEstimate(
  debt: bigint,
  aprBps: number,
  lastAccrual: bigint,
  nowSec: bigint = BigInt(Math.floor(Date.now() / 1000)),
): bigint {
  if (debt === 0n) return 0n;
  const elapsed = nowSec > lastAccrual ? nowSec - lastAccrual : 0n;
  if (elapsed === 0n) return debt;
  const interest = (debt * BigInt(aprBps) * elapsed) / (SECONDS_PER_YEAR * BPS);
  return debt + interest;
}

export function formatUsdFromWei(value: bigint, decimals = 18): number {
  return Number(formatUnits(value, decimals));
}

export function parseHealthFactor(hfWad: bigint | undefined, debtRaw: bigint): HealthFactorView {
  if (debtRaw === 0n) {
    return { label: "∞", gaugePercent: 95, hasDebt: false };
  }

  if (!hfWad || hfWad === 0n) {
    return { label: "—", gaugePercent: 0, hasDebt: true };
  }

  if (hfWad >= MAX_UINT256 - 1n || hfWad >= HF_DISPLAY_CAP) {
    return { label: "∞", gaugePercent: 95, hasDebt: false };
  }

  const hf = Number(formatUnits(hfWad, TOKEN_DECIMALS));
  if (!Number.isFinite(hf) || hf > 999) {
    return { label: "∞", gaugePercent: 95, hasDebt: false };
  }

  return {
    label: hf.toFixed(2),
    gaugePercent: Math.min(95, Math.round((hf / 2.5) * 100)),
    hasDebt: true,
  };
}

export function collateralUsd(amount: bigint, priceUsd: bigint): number {
  if (amount === 0n || priceUsd === 0n) return 0;
  const value = (amount * priceUsd) / 10n ** 18n;
  return Number(formatUnits(value, TOKEN_DECIMALS));
}

export function originationFeeAmount(amount: bigint, feeBps: number): bigint {
  if (amount === 0n || feeBps === 0) return 0n;
  return (amount * BigInt(feeBps)) / BPS;
}

export function liquidationPriceUsd(
  collateralRaw: bigint,
  debtRaw: bigint,
  liqRatioBps: number,
  debtDecimals = 18,
): number | null {
  if (collateralRaw === 0n || debtRaw === 0n) return null;
  const minCollateralUsd = (debtRaw * BigInt(liqRatioBps)) / BPS;
  if (minCollateralUsd === 0n) return null;
  const priceRaw = (minCollateralUsd * 10n ** 18n) / collateralRaw;
  if (priceRaw === 0n) return null;
  return Number(formatUnits(priceRaw, debtDecimals));
}

export function healthFactorWad(
  collateralRaw: bigint,
  debtRaw: bigint,
  priceRaw: bigint,
  liqRatioBps: number,
): bigint {
  if (debtRaw === 0n) return MAX_UINT256;
  if (collateralRaw === 0n || priceRaw === 0n) return 0n;
  const collateralUsdWei = (collateralRaw * priceRaw) / 10n ** 18n;
  return (collateralUsdWei * HF_WAD * BPS) / (debtRaw * BigInt(liqRatioBps));
}

export function healthFactorLabelFromState(
  collateralRaw: bigint,
  debtRaw: bigint,
  priceRaw: bigint,
  liqRatioBps: number,
): string {
  return parseHealthFactor(healthFactorWad(collateralRaw, debtRaw, priceRaw, liqRatioBps), debtRaw).label;
}

export function ltvPercent(collateralUsdValue: number, debtUsdValue: number): number {
  if (collateralUsdValue <= 0 || debtUsdValue <= 0) return 0;
  return (debtUsdValue / collateralUsdValue) * 100;
}

export function bpsToPercent(bps: number): number {
  return bps / 100;
}

export function estimateBorrowableRaw(
  collateralRaw: bigint,
  debtRaw: bigint,
  priceRaw: bigint,
  maxLtvBps: number,
): bigint {
  if (collateralRaw === 0n || priceRaw === 0n) return 0n;
  const collateralUsdWei = (collateralRaw * priceRaw) / 10n ** 18n;
  const maxDebtAllowed = (collateralUsdWei * BigInt(maxLtvBps)) / BPS;
  if (debtRaw >= maxDebtAllowed) return 0n;
  return maxDebtAllowed - debtRaw;
}

export function maxWithdrawableCollateral(
  collateralRaw: bigint,
  debtRaw: bigint,
  priceUsd: bigint,
  liqRatioBps: number,
): bigint {
  if (collateralRaw === 0n) return 0n;
  if (debtRaw === 0n) return collateralRaw;
  if (priceUsd === 0n) return 0n;

  const minCollateralUsd = (debtRaw * BigInt(liqRatioBps)) / BPS;
  const collateralUsdWei = (collateralRaw * priceUsd) / 10n ** 18n;
  if (collateralUsdWei <= minCollateralUsd) return 0n;

  let withdrawableUsd = collateralUsdWei - minCollateralUsd;
  if (debtRaw > DUST_DEBT_WEI) {
    withdrawableUsd = (withdrawableUsd * 9999n) / BPS;
  }

  let withdrawableRaw = (withdrawableUsd * 10n ** 18n) / priceUsd;
  if (withdrawableRaw > collateralRaw) withdrawableRaw = collateralRaw;
  return withdrawableRaw;
}
