import { parseAbi } from "viem";

export const erc20Abi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function mint(address to, uint256 amount)",
  "function symbol() view returns (string)",
]);

export const mockErc20FaucetAbi = parseAbi([
  "function mint(address to, uint256 amount)",
  "function lastMintAt(address account) view returns (uint256)",
  "function COOLDOWN_DURATION() view returns (uint256)",
  "function cooldownRemaining(address account) view returns (uint256)",
]);

export const vaultManagerAbi = parseAbi([
  "function deposit(address collateral, uint256 amount)",
  "function withdraw(address collateral, uint256 amount)",
  "function borrow(address collateral, uint256 amount)",
  "function repay(address collateral, uint256 amount)",
  "function positions(address collateral, address user) view returns (uint256 collateral, uint256 debt, uint256 lastAccrual)",
  "function getHealthFactor(address user, address collateral) view returns (uint256)",
  "function getBorrowable(address user, address collateral) view returns (uint256)",
  "function getMarketCount() view returns (uint256)",
  "function marketList(uint256 index) view returns (address)",
  "function markets(address collateral) view returns (address collateral, address oracle, uint16 maxLtvBps, uint16 liqRatioBps, uint16 liqBonusBps, uint16 stabilityFeeAprBps, uint16 originationFeeBps, bool active)",
  "error HealthFactorTooLow()",
  "error ZeroAmount()",
  "error ExceedsMaxLtv()",
  "error InsufficientLiquidity()",
  "error MarketNotActive()",
  "error MarketUnknown()",
  "event Deposited(address indexed user, address indexed collateral, uint256 amount)",
  "event Withdrawn(address indexed user, address indexed collateral, uint256 amount)",
  "event Borrowed(address indexed user, address indexed collateral, uint256 amount, uint256 fee)",
  "event Repaid(address indexed user, address indexed collateral, uint256 amount)",
]);

export const chainlinkAggregatorAbi = parseAbi([
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() view returns (uint8)",
  "function description() view returns (string)",
]);

export const pledgeOracleAbi = parseAbi([
  "function getPrice(address asset) view returns (uint256)",
  "function prices(address asset) view returns (uint256)",
  "function updatedAt(address asset) view returns (uint256)",
  "function isStale(address asset) view returns (bool)",
  "function maxStaleness() view returns (uint256)",
]);

export const pledgeChainlinkOracleAbi = parseAbi([
  "function getPrice(address asset) view returns (uint256)",
  "function feeds(address asset) view returns (address)",
  "function isStale(address asset) view returns (bool)",
  "function maxStaleness() view returns (uint256)",
]);

/** @deprecated use pledgeOracleAbi or pledgeChainlinkOracleAbi */
export const oracleAbi = pledgeOracleAbi;

export const stabilityPoolAbi = parseAbi([
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function balanceOf(address user) view returns (uint256)",
  "function totalDeposits() view returns (uint256)",
]);

export const pledgeStakingAbi = parseAbi([
  "function poolCount() view returns (uint256)",
  "function pools(uint256 poolId) view returns (address stakeToken, address rewardToken, uint256 rewardRatePerSecond, uint256 totalStaked, uint256 accRewardPerShare, uint256 lastUpdateTime, uint256 lockDuration, bool active)",
  "function users(uint256 poolId, address account) view returns (uint256 amount, uint256 rewardDebt, uint256 lockedUntil)",
  "function pendingReward(uint256 poolId, address account) view returns (uint256)",
  "function nextEpochEnds() view returns (uint256)",
  "function stake(uint256 poolId, uint256 amount)",
  "function unstake(uint256 poolId, uint256 amount)",
  "function claim(uint256 poolId)",
]);

export const pledgeTestnetBridgeAbi = parseAbi([
  "function completeBridge(uint256 sourceChainId, string tokenSymbol, uint256 amount, uint256 nonce, uint256 deadline, bytes signature)",
  "function computeDigest(address user, uint256 sourceChainId, string tokenSymbol, uint256 amount, uint256 nonce, uint256 deadline) view returns (bytes32)",
  "function nonces(address user) view returns (uint256)",
  "function cooldownRemaining(address user, uint256 sourceChainId, string tokenSymbol) view returns (uint256)",
  "function getRoute(uint256 sourceChainId, string tokenSymbol) view returns (address token, uint256 minAmount, uint256 maxAmount, bool enabled)",
  "function liquidity(address token) view returns (uint256)",
  "function COOLDOWN() view returns (uint256)",
  "event SourceAttested(address indexed user, uint256 indexed sourceChainId, bytes32 indexed tokenKey, uint256 amount, uint256 nonce, uint256 deadline)",
  "event Bridged(address indexed user, uint256 indexed sourceChainId, bytes32 indexed tokenKey, address token, uint256 amount)",
]);
