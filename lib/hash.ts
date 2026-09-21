const HASH = /^0x[0-9a-fA-F]{64}$/
const HEX64 = /^[0-9a-fA-F]{64}$/

export const EXAMPLE_TX_HASH =
  "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060" as const

export type TxHash = `0x${string}`

export function parseHash(value: unknown): TxHash | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (HASH.test(trimmed)) return trimmed.toLowerCase() as TxHash
  if (HEX64.test(trimmed)) return `0x${trimmed.toLowerCase()}`
  return null
}

export function shorten(value: string, left = 6, right = 4): string {
  if (value.length <= left + right + 1) return value
  return `${value.slice(0, left)}…${value.slice(-right)}`
}
