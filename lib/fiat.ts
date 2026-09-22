import { formatUnits, type Address } from "viem"

import { formatUsd } from "./formatters"
import type { Quote } from "./story"

const ETH_KEY = "coingecko:ethereum"

export async function fiatLine(quote: Quote | null, at: bigint | null = null): Promise<string | null> {
  if (!quote || quote.amount === BigInt(0)) return null
  const price = await usdPrice(quote.token, at)
  if (price === null) return null
  const units = Number(formatUnits(quote.amount, quote.decimals))
  if (!Number.isFinite(units)) return null
  return formatUsd(units * price)
}

async function usdPrice(token: Address | "eth", at: bigint | null): Promise<number | null> {
  const key = token === "eth" ? ETH_KEY : `ethereum:${token.toLowerCase()}`
  const path = at === null ? `current/${key}` : `historical/${at}/${key}`
  try {
    const response = await fetch(`https://coins.llama.fi/prices/${path}`, {
      signal: AbortSignal.timeout(4_000),
    })
    if (!response.ok) return null
    return readPrice(await response.json())
  } catch {
    return null
  }
}

function readPrice(body: unknown): number | null {
  if (!body || typeof body !== "object" || !("coins" in body)) return null
  const coins = body.coins
  if (!coins || typeof coins !== "object") return null
  const coin = Object.values(coins)[0]
  if (!coin || typeof coin !== "object" || !("price" in coin)) return null
  const price = Number(coin.price)
  return Number.isFinite(price) && price > 0 ? price : null
}
