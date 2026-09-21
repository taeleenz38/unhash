const METHODS: Record<string, string> = {
  "0xa9059cbb": "transfer",
  "0x23b872dd": "transferFrom",
  "0x095ea7b3": "approve",
  "0xd0e30db0": "deposit",
  "0x2e1a7d4d": "withdraw",
  "0x7ff36ab5": "swap",
  "0x18cbafe5": "swap",
  "0x38ed1739": "swap",
  "0xfb3bdb41": "swap",
  "0x5c11d795": "swap",
  "0x414bf389": "swap",
  "0x04e45aaf": "swap",
  "0xb858183f": "swap",
  "0x04bcb0f7": "swap",
  "0x3593564c": "execute",
  "0x5ae401dc": "multicall",
  "0xac9650d8": "multicall",
}

export function methodName(input: `0x${string}`): string | null {
  if (input === "0x" || input.length < 10) return null
  return METHODS[input.slice(0, 10).toLowerCase()] ?? null
}
