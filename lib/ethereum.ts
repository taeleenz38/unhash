import { cache } from "react"
import {
  createPublicClient,
  fallback,
  http,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  type Address,
  type Hash,
} from "viem"
import { mainnet } from "viem/chains"

import { parseHash } from "./hash"
import { writeStory, type Party, type Story } from "./story"

const timeout = 12_000
const client = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http(process.env.ETH_RPC_URL ?? "https://cloudflare-eth.com", { timeout }),
    http("https://ethereum.publicnode.com", { timeout }),
  ]),
})

export type LoadResult =
  | { kind: "invalid" }
  | { kind: "missing" }
  | { kind: "unavailable" }
  | { kind: "pending"; story: Story }
  | { kind: "ready"; story: Story }

export const loadStory = cache(async (raw: string): Promise<LoadResult> => {
  const hash = parseHash(raw)
  if (!hash) return { kind: "invalid" }

  try {
    const tx = await client.getTransaction({ hash: hash as Hash })

    let receipt: Awaited<ReturnType<typeof client.getTransactionReceipt>> | null =
      null
    try {
      receipt = await client.getTransactionReceipt({ hash: hash as Hash })
    } catch (error) {
      if (!(error instanceof TransactionReceiptNotFoundError)) throw error
    }

    const toAddress = tx.to ?? receipt?.contractAddress ?? null
    const [fromName, toName] = await Promise.all([
      ensName(tx.from),
      toAddress ? ensName(toAddress) : Promise.resolve(null),
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
  } catch (error) {
    if (error instanceof TransactionNotFoundError) return { kind: "missing" }
    return { kind: "unavailable" }
  }
})

function party(address: Address, name: string | null): Party {
  return { address, name }
}

async function ensName(address: Address): Promise<string | null> {
  try {
    return await client.getEnsName({ address })
  } catch {
    return null
  }
}
