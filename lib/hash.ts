const HEX64 = /^[0-9a-fA-F]{64}$/

export const EXAMPLE_TX_HASH =
  "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060" as const

export type TxHash = `0x${string}`

export function parseHash(value: unknown): TxHash | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  const embedded = trimmed.match(/0x[0-9a-fA-F]{64}/)
  if (embedded) return embedded[0].toLowerCase() as TxHash
  if (HEX64.test(trimmed)) return `0x${trimmed.toLowerCase()}`
  return null
}
