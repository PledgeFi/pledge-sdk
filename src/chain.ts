import type { Chain } from "viem";

import mainnetDeployment from "./deployments/4663.json";
import testnetDeployment from "./deployments/46630.json";
import type { PledgeChainId, PledgeDeployment } from "./types";
import { ROBINHOOD_MAINNET_CHAIN_ID, ROBINHOOD_TESTNET_CHAIN_ID } from "./types";

const deployments: Record<PledgeChainId, PledgeDeployment> = {
  4663: mainnetDeployment as PledgeDeployment,
  46630: testnetDeployment as PledgeDeployment,
};

export function getDeployment(chainId: PledgeChainId = ROBINHOOD_TESTNET_CHAIN_ID): PledgeDeployment {
  return deployments[chainId];
}

export function isMainnetChain(chainId: number): chainId is typeof ROBINHOOD_MAINNET_CHAIN_ID {
  return chainId === ROBINHOOD_MAINNET_CHAIN_ID;
}

export function isTestnetChain(chainId: number): chainId is typeof ROBINHOOD_TESTNET_CHAIN_ID {
  return chainId === ROBINHOOD_TESTNET_CHAIN_ID;
}

export function getChainDefinition(chainId: PledgeChainId = ROBINHOOD_TESTNET_CHAIN_ID): Chain {
  const deployment = getDeployment(chainId);
  return {
    id: deployment.chainId,
    name: deployment.network,
    nativeCurrency: deployment.nativeCurrency ?? {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [deployment.rpcUrl] },
    },
    blockExplorers: {
      default: {
        name: "Robinhood Explorer",
        url: deployment.explorer,
      },
    },
    testnet: chainId === ROBINHOOD_TESTNET_CHAIN_ID,
  };
}

export function explorerAddressUrl(chainId: PledgeChainId, address: string): string {
  return `${getDeployment(chainId).explorer}/address/${address}`;
}

export function explorerTxUrl(chainId: PledgeChainId, hash: string): string {
  return `${getDeployment(chainId).explorer}/tx/${hash}`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

export {
  mainnetDeployment,
  testnetDeployment,
  deployments,
};

export { ROBINHOOD_MAINNET_CHAIN_ID, ROBINHOOD_TESTNET_CHAIN_ID } from "./types";
export type { PledgeDeployment, PledgeMarketEntry, PledgeChainId } from "./types";
