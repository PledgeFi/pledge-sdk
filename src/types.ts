export type PledgeMarketEntry =
  | {
      name: string;
      status: "pending";
    }
  | {
      name: string;
      collateral: string;
      maxLtvBps: number;
      liqRatioBps: number;
      status: "live";
      oracle?: string;
      chainlinkFeed?: string;
    };

export type PledgeDeployment = {
  protocol: string;
  version: string;
  chainId: number;
  network: string;
  rpcUrl: string;
  explorer: string;
  usdgDecimals: number;
  features: {
    faucet: boolean;
    mockTokens: boolean;
    staking?: boolean;
    bridge?: boolean;
  };
  nativeCurrency: { name: string; symbol: string; decimals: number };
  deployedAt?: string;
  contracts: Record<string, `0x${string}` | string>;
  markets: Record<string, PledgeMarketEntry>;
  chainlink?: { type: string; note?: string };
};

export type PledgeChainId = 4663 | 46630;

export const ROBINHOOD_MAINNET_CHAIN_ID = 4663 as const;
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630 as const;

export type PledgeContractKey = keyof PledgeDeployment["contracts"];
