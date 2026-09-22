import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { fiatLine } from "./fiat"
import type { Quote } from "./story"

const oneEth: Quote = { amount: BigInt(10) ** BigInt(18), decimals: 18, token: "eth" }

describe("fiatLine", () => {
  it("prices ETH at the block timestamp", async () => {
    const urls: string[] = []
    const line = await withFetch({ coins: { "coingecko:ethereum": { price: 200 } } }, urls, () =>
      fiatLine(oneEth, BigInt(1620000000)),
    )
    assert.equal(line, "About $200.")
    assert.equal(
      urls[0],
      "https://coins.llama.fi/prices/historical/1620000000/coingecko:ethereum",
    )
  })

  it("omits the aside when the historical lookup is empty", async () => {
    const line = await withFetch({ coins: {} }, [], () => fiatLine(oneEth, BigInt(1438269988)))
    assert.equal(line, null)
  })

  it("uses the current price when the transaction is still pending", async () => {
    const urls: string[] = []
    const line = await withFetch({ coins: { "coingecko:ethereum": { price: 200 } } }, urls, () =>
      fiatLine(oneEth, null),
    )
    assert.equal(line, "About $200.")
    assert.equal(urls[0], "https://coins.llama.fi/prices/current/coingecko:ethereum")
  })
})

async function withFetch<T>(body: unknown, urls: string[], run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch
  globalThis.fetch = async (input) => {
    urls.push(String(input))
    return new Response(JSON.stringify(body))
  }
  try {
    return await run()
  } finally {
    globalThis.fetch = original
  }
}
