import { describe, expect, it } from "vitest";

import {
  ROBINHOOD_TESTNET_CHAIN_ID,
  createProtocolConfig,
  getDeployment,
  healthFactorWad,
  isProtocolDeployed,
  parseHealthFactor,
} from "../src";

describe("deployments", () => {
  it("loads testnet addresses", () => {
    const d = getDeployment(ROBINHOOD_TESTNET_CHAIN_ID);
    expect(d.chainId).toBe(46630);
    expect(d.contracts.PledgeVaultManager).toMatch(/^0x/);
    expect(Object.keys(d.markets).length).toBeGreaterThan(5);
  });

  it("detects deployed testnet vault", () => {
    expect(isProtocolDeployed(ROBINHOOD_TESTNET_CHAIN_ID)).toBe(true);
  });
});

describe("protocol config", () => {
  it("matches deployment metadata", () => {
    const cfg = createProtocolConfig(ROBINHOOD_TESTNET_CHAIN_ID);
    expect(cfg.name).toBe("Pledge Finance");
    expect(cfg.features.faucet).toBe(true);
    expect(cfg.usdgDecimals).toBe(18);
  });
});

describe("vault math", () => {
  it("computes HF above 1 at safe LTV", () => {
    const collateral = 10n * 10n ** 18n;
    const debt = 3000n * 10n ** 18n;
    const price = 500n * 10n ** 18n;
    const hf = healthFactorWad(collateral, debt, price, 16600);
    expect(hf).toBeGreaterThan(10n ** 18n);
    expect(parseHealthFactor(hf, debt).hasDebt).toBe(true);
  });

  it("returns infinity label when debt is zero", () => {
    expect(parseHealthFactor(0n, 0n).label).toBe("∞");
  });
});
