import { getDeployment } from "./chain";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "./types";
import type { PledgeChainId, PledgeContractKey, PledgeDeployment, PledgeMarketEntry } from "./types";

export function createProtocolConfig(chainId: PledgeChainId = ROBINHOOD_TESTNET_CHAIN_ID) {
  const deployment = getDeployment(chainId);
  const isMainnet = chainId === 4663;

  return {
    name: deployment.protocol,
    version: deployment.version,
    chainId: deployment.chainId,
    network: deployment.network,
    rpcUrl: deployment.rpcUrl,
    explorer: deployment.explorer,
    isMainnet,
    features: deployment.features ?? { faucet: !isMainnet, mockTokens: !isMainnet },
    usdgDecimals: deployment.usdgDecimals,
    contracts: deployment.contracts,
    markets: deployment.markets,
  } as const;
}

export type ProtocolConfig = ReturnType<typeof createProtocolConfig>;

export function getContractAddress(
  chainId: PledgeChainId,
  key: PledgeContractKey,
): `0x${string}` {
  return getDeployment(chainId).contracts[key] as `0x${string}`;
}

export function getLiveMarkets(deployment: PledgeDeployment): [string, PledgeMarketEntry][] {
  return Object.entries(deployment.markets).filter(
    ([, market]) => market.status === "live" && "collateral" in market,
  );
}

export function isProtocolDeployed(chainId: PledgeChainId): boolean {
  const addr = getContractAddress(chainId, "PledgeVaultManager");
  return addr !== "0x0000000000000000000000000000000000000000";
}

export function bridgeEnabled(chainId: PledgeChainId): boolean {
  const deployment = getDeployment(chainId);
  const bridge = deployment.contracts.PledgeTestnetBridge as `0x${string}` | undefined;
  return Boolean(deployment.features?.bridge && bridge && bridge !== "0x0000000000000000000000000000000000000000");
}

export function stakingEnabled(chainId: PledgeChainId): boolean {
  const deployment = getDeployment(chainId);
  const staking = deployment.contracts.PledgeStaking as `0x${string}` | undefined;
  return Boolean(deployment.features?.staking && staking && staking !== "0x0000000000000000000000000000000000000000");
}
