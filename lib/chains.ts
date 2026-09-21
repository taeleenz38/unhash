export type Chain = {
  id: number
  slug: string
  name: string
}

// Logos come from Trust Wallet's assets repo:
// https://github.com/trustwallet/assets/tree/master/blockchains/<slug>/info/logo.png
// Add a chain here when we support it. The slug must match that folder name.
export const chains = {
  ethereum: { id: 1, slug: "ethereum", name: "ethereum" },
} as const satisfies Record<string, Chain>

export type ChainSlug = keyof typeof chains

export const defaultChain: Chain = chains.ethereum

const TRUST_WALLET =
  "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains"

export function chainLogoUrl(slug: string): string {
  return `${TRUST_WALLET}/${slug}/info/logo.png`
}
