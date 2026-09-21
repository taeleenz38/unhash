export type ListedToken = {
  symbol: string
  decimals: number
}

const LIST_URL = "https://tokens.uniswap.org"

let cached: Promise<Map<string, ListedToken>> | null = null

export async function listedToken(address: string): Promise<ListedToken | null> {
  const list = await tokenList()
  return list.get(address.toLowerCase()) ?? null
}

function tokenList(): Promise<Map<string, ListedToken>> {
  if (!cached) cached = loadTokenList()
  return cached
}

async function loadTokenList(): Promise<Map<string, ListedToken>> {
  const list = new Map<string, ListedToken>()
  try {
    const response = await fetch(LIST_URL, { signal: AbortSignal.timeout(8_000) })
    if (!response.ok) return list
    const body: unknown = await response.json()
    if (!isTokenList(body)) return list
    for (const token of body.tokens) {
      if (token.chainId !== 1) continue
      list.set(token.address.toLowerCase(), {
        symbol: token.symbol,
        decimals: token.decimals,
      })
    }
  } catch {
    cached = null
  }
  return list
}

type TokenList = {
  tokens: { chainId: number; address: string; symbol: string; decimals: number }[]
}

function isTokenList(value: unknown): value is TokenList {
  if (!value || typeof value !== "object" || !("tokens" in value)) return false
  return Array.isArray(value.tokens)
}
