# pledge-sdk

TypeScript SDK for integrating with Pledge Finance on Robinhood Chain.

## Install

```bash
npm install @pledge-finance/sdk viem
```

## Usage

```ts
import {
  ROBINHOOD_TESTNET_CHAIN_ID,
  createProtocolConfig,
  getChainDefinition,
  getContractAddress,
  vaultManagerAbi,
  healthFactorWad,
} from "@pledge-finance/sdk";
import { createPublicClient, http } from "viem";

const chainId = ROBINHOOD_TESTNET_CHAIN_ID;
const config = createProtocolConfig(chainId);
const chain = getChainDefinition(chainId);
const client = createPublicClient({ chain, transport: http(config.rpcUrl) });

const vault = getContractAddress(chainId, "PledgeVaultManager");

const hf = await client.readContract({
  address: vault,
  abi: vaultManagerAbi,
  functionName: "getHealthFactor",
  args: [userAddress, collateralAddress],
});
```

## Exports

| Module | Contents |
|---|---|
| `chain` | Deployments, chain definitions, explorer helpers |
| `protocol` | Contract addresses, market helpers, feature flags |
| `abis` | viem `parseAbi` fragments for all protocol contracts |
| `math` | Off-chain VaultMath mirrors (HF, LTV, borrowable, withdrawable) |
| `errors` | `formatVaultError` for wallet revert messages |

Deployment JSON lives in `src/deployments/` (`4663.json`, `46630.json`).

## Development

```bash
npm install
npm test
npm run build
```

## Versioning

SDK `1.0.x` tracks protocol/oracle release `1.0.0`. Bump SDK patch when deployment addresses change; bump minor when ABIs or market schema change.

## Related repos

- [`pledge-protocol`](https://github.com/pledge-finance/pledge-protocol) — vault contracts
- [`pledge-oracle`](https://github.com/pledge-finance/pledge-oracle) — price feeds
