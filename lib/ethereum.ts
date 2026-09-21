import { cache } from "react"
import {
  createPublicClient,
  http,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  type Address,
  type Hash,
  type PublicClient,
} from "viem"
import { mainnet } from "viem/chains"

import { parseHash } from "./hash"
import { writeStory, type Party, type Story } from "./story"

const timeout = 8_000

const RPC_URLS = [
  process.env.ETH_RPC_URL,
  "https://1rpc.io/eth",
  "https://eth.drpc.org",
  "https://cloudflare-eth.com",
  "https://ethereum.publicnode.com",
].filter((url, index, all): url is string => Boolean(url) && all.indexOf(url) === index)

const clients = RPC_URLS.map((url) =>
  createPublicClient({
    chain: mainnet,
    transport: http(url, { timeout }),
  }),
)

export type LoadResult =
  | { kind: "invalid" }
  | { kind: "missing" }
  | { kind: "unavailable" }
  | { kind: "pending"; story: Story }
  | { kind: "ready"; story: Story }

export const loadStory = cache(async (raw: string): Promise<LoadResult> => {
  const hash = parseHash(raw)
  if (!hash) return { kind: "invalid" }

  const found = await firstTransaction(hash as Hash)
  if (found === "unavailable") return { kind: "unavailable" }
  if (!found) return { kind: "missing" }

  const { tx, client } = found
  const receipt = await receiptOf(client, hash as Hash)
  const toAddress = tx.to ?? receipt?.contractAddress ?? null
  const [fromName, toName] = await Promise.all([
    ensName(client, tx.from),
    toAddress ? ensName(client, toAddress) : Promise.resolve(null),
  ])

  const story = writeStory({
    hash,
    from: party(tx.from, fromName),
    to: toAddress ? party(toAddress, toName) : null,
    valueWei: tx.value,
    input: tx.input,
    created: tx.to === null,
    blockNumber: tx.blockNumber,
    receiptStatus: receipt?.status ?? null,
  })

  return receipt ? { kind: "ready", story } : { kind: "pending", story }
})

// Public RPCs often return `result: null` for txs they do not store.
// viem fallback only rotates on transport errors, so we race the list ourselves.
async function firstTransaction(hash: Hash) {
  type Found = { tx: Awaited<ReturnType<PublicClient["getTransaction"]>>; client: PublicClient }

  return new Promise<Found | null | "unavailable">((resolve) => {
    let pending = clients.length
    let sawNull = false
    let sawError = false
    let done = false

    const finish = (value: Found | null | "unavailable") => {
      if (done) return
      done = true
      resolve(value)
    }

    for (const client of clients) {
      client
        .getTransaction({ hash })
        .then((tx) => finish({ tx, client }))
        .catch((error: unknown) => {
          if (error instanceof TransactionNotFoundError) sawNull = true
          else sawError = true
          pending -= 1
          if (pending === 0) finish(sawNull ? null : sawError ? "unavailable" : null)
        })
    }
  })
}

async function receiptOf(
  client: PublicClient,
  hash: Hash,
): Promise<Awaited<ReturnType<PublicClient["getTransactionReceipt"]>> | null> {
  try {
    return await client.getTransactionReceipt({ hash })
  } catch (error) {
    if (error instanceof TransactionReceiptNotFoundError) return null
    throw error
  }
}

function party(address: Address, name: string | null): Party {
  return { address, name }
}

async function ensName(
  client: PublicClient,
  address: Address,
): Promise<string | null> {
  try {
    return await client.getEnsName({ address })
  } catch {
    return null
  }
}
