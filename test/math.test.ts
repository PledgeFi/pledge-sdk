import { describe, expect, it } from "vitest";

import {
  HF_WAD,
  accrueDebtEstimate,
  estimateBorrowableRaw,
  healthFactorWad,
  liquidationPriceUsd,
  maxWithdrawableCollateral,
  originationFeeAmount,
} from "../src/math";

describe("vault math parity", () => {
  const collateral = 10n * 10n ** 18n;
  const price = 500n * 10n ** 18n;
  const debt = 3000n * 10n ** 18n;
  const maxLtvBps = 6000;
  const liqRatioBps = 16600;

  it("matches PledgeVaultManager test HF boundary", () => {
    const hf = healthFactorWad(collateral, debt, price, liqRatioBps);
    expect(hf).toBeGreaterThan(HF_WAD);
  });

  it("estimateBorrowableRaw at max LTV for fresh deposit", () => {
    const borrowable = estimateBorrowableRaw(collateral, 0n, price, maxLtvBps);
    expect(borrowable).toBe(3000n * 10n ** 18n);
  });

  it("origination fee at 50 bps", () => {
    expect(originationFeeAmount(2000n * 10n ** 18n, 50)).toBe(10n * 10n ** 18n);
  });

  it("liquidation price decreases as debt rises", () => {
    const liqLow = liquidationPriceUsd(collateral, 1000n * 10n ** 18n, liqRatioBps);
    const liqHigh = liquidationPriceUsd(collateral, 4000n * 10n ** 18n, liqRatioBps);
    expect(liqLow).not.toBeNull();
    expect(liqHigh).not.toBeNull();
    expect(liqHigh!).toBeGreaterThan(liqLow!);
  });

  it("maxWithdrawableCollateral zero when underwater", () => {
    const underwaterPrice = 200n * 10n ** 18n;
    expect(maxWithdrawableCollateral(collateral, debt, underwaterPrice, liqRatioBps)).toBe(0n);
  });

  it("accrueDebtEstimate increases with elapsed time", () => {
    const now = 1_700_000_000n;
    const base = accrueDebtEstimate(debt, 120, now, now);
    const later = accrueDebtEstimate(debt, 120, now, now + 86400n);
    expect(later).toBeGreaterThan(base);
  });
});
