import { BaseError, ContractFunctionRevertedError } from "viem";

const REVERT_HINTS: Record<string, string> = {
  "0x62e82dca":
    "Withdraw rejected: health factor would drop below 1.00. Repay USDG first, or withdraw a smaller amount.",
  HealthFactorTooLow:
    "Withdraw rejected: health factor would drop below 1.00. Repay USDG first, or withdraw a smaller amount.",
  "0xfb8f41b2": "USDG allowance too low. Approve USDG before repay.",
  "0xf1c0aa33": "Borrow rejected: no collateral in vault, or amount exceeds LTV.",
  "0xbb55fd27": "Vault is out of USDG liquidity. Try a smaller amount.",
  ZeroAmount: "Repay amount must be greater than zero.",
  MarketNotActive: "This market is not active.",
  ERC20InsufficientAllowance: "USDG allowance too low. Approve USDG, then repay.",
  ERC20InsufficientBalance: "Not enough USDG in wallet for this repay amount.",
};

function extractViemReason(error: unknown): string | null {
  if (error instanceof BaseError) {
    const revert = error.walk((err) => err instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      if (revert.data?.errorName) return revert.data.errorName;
      if (revert.shortMessage) return revert.shortMessage;
    }
    if (error.shortMessage) return error.shortMessage;
  }
  return null;
}

function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  const viemReason = extractViemReason(error);
  if (viemReason) parts.push(viemReason);

  let current: unknown = error;
  for (let depth = 0; depth < 8 && current; depth++) {
    if (current instanceof Error) {
      parts.push(current.message);
      current = "cause" in current ? current.cause : undefined;
    } else {
      parts.push(String(current));
      break;
    }
  }
  return parts.join(" ");
}

export function formatVaultError(error: unknown, context?: string): string {
  const message = collectErrorText(error);

  for (const [key, hint] of Object.entries(REVERT_HINTS)) {
    if (message.includes(key)) return hint;
  }

  if (message.includes("User rejected") || message.includes("user rejected")) {
    return "Transaction cancelled in wallet.";
  }

  if (message.includes("ExceedsMaxLtv") || message.includes("max LTV")) {
    return "Borrow exceeds this market's LTV limit.";
  }

  const cleaned = message
    .replace(/^Error: /, "")
    .replace(/ContractFunctionExecutionError: /, "")
    .replace(/ContractFunctionRevertedError: /, "")
    .trim();

  if (cleaned && cleaned.length > 12 && cleaned.length < 280) {
    return context ? `${context}: ${cleaned.split("\n")[0]}` : cleaned.split("\n")[0];
  }

  return context ? `${context}. Check wallet approvals and retry.` : "Transaction failed. Check wallet approvals and retry.";
}
