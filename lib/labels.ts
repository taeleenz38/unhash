import type { Address } from "viem"

export const WETH_ADDRESS: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
export const CRYPTO_PUNKS: Address = "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"

// Routers, bridges, and contracts whose on-chain name is a proxy or a filename.
// Checked before Sourcify so the sentence stays a name a stranger knows.
const LABELS: Record<string, string> = {
  [WETH_ADDRESS.toLowerCase()]: "WETH",
  [CRYPTO_PUNKS.toLowerCase()]: "CryptoPunk",
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "Uniswap",
  "0xe592427a0aece92de3edee1f18e0157c05861564": "Uniswap",
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": "Uniswap",
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": "Uniswap",
  "0x66a9893cc07d91d95644aedd05d03f95e1dba8af": "Uniswap",
  "0x1111111254eeb25477b68fb85ed929f73a960582": "1inch",
  "0x111111125421ca6dc452d289314280a0f8842a65": "1inch",
  "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1": "Optimism Bridge",
  "0x3154cf16ccdb4c6d922629664174b904d80f2c35": "Base Bridge",
  "0x49048044d57e1c92a77f79988d21fa8faf74e97e": "Base Bridge",
  "0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a": "Arbitrum Bridge",
  "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae": "LiFi",
}

export function knownLabel(address: string): string | null {
  return LABELS[address.toLowerCase()] ?? null
}

export function isWeth(address: string): boolean {
  return address.toLowerCase() === WETH_ADDRESS.toLowerCase()
}
