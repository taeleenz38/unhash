import { cache } from "react"
import {
  createPublicClient,
  http,
  TransactionNotFoundError,
  type Address,
  type Hash,
  type PublicClient,
} from "viem"
import { mainnet } from "viem/chains"

import { fiatLine } from "./fiat"
import { parseHash } from "./hash"
import { resolveParty } from "./names"
import { revertReason } from "./revert"
import { methodName } from "./selectors"
import { writeStory, type Party, type Story, type TokenAmount, type Transfer } from "./story"
import { decodeApproval, decodeTransfers, readCollection, readToken } from "./tokens"

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
  const receipt = await receiptOf(hash as Hash)
  const toAddress = tx.to ?? receipt?.contractAddress ?? null
  const rawTransfers = receipt ? decodeTransfers(receipt.logs) : []
  const approval = tx.to ? decodeApproval(tx.input) : null

  const names = namer(client)
  const tokens = memoLoad((address) => readToken(client, address))
  const collections = memoLoad((address) => readCollection(client, address))

  const interesting: Address[] = [tx.from]
  if (toAddress) interesting.push(toAddress)
  for (const item of rawTransfers) {
    interesting.push(item.from, item.to)
  }
  if (approval) interesting.push(approval.spender)

  const [block] = await Promise.all([
    tx.blockNumber ? blockOf(tx.blockNumber) : Promise.resolve(null),
    Promise.all(interesting.map((address) => names.load(address))),
  ])

  const transfers: Transfer[] = []
  for (const item of rawTransfers) {
    if (item.kind === "erc20") {
      const meta = await tokens(item.token)
      if (!meta) continue
      transfers.push({
        from: names.get(item.from),
        to: names.get(item.to),
        token: amount(item.amount, meta, item.token),
      })
      continue
    }

    transfers.push({
      from: names.get(item.from),
      to: names.get(item.to),
      token: {
        amount: item.amount,
        decimals: 0,
        symbol: (await collections(item.token)) ?? "NFT",
        token: item.token,
        kind: item.kind,
        tokenId: item.tokenId,
      },
    })
  }

  const facts = {
    hash,
    from: names.get(tx.from),
    to: toAddress ? names.get(toAddress) : null,
    valueWei: tx.value,
    created: tx.to === null,
    blockNumber: tx.blockNumber,
    receiptStatus: receipt?.status ?? null,
    method: methodName(tx.input),
    timestamp: block?.timestamp ?? null,
    revert: receipt?.status === "reverted" ? await revertReason(client, tx) : null,
    fiat: null as string | null,
    transfers,
    approval:
      approval && tx.to
        ? {
            spender: names.get(approval.spender),
            token: amount(
              approval.amount,
              (await tokens(tx.to)) ?? { symbol: "tokens", decimals: 18 },
              tx.to,
            ),
            unlimited: approval.unlimited,
          }
        : null,
  }

  const draft = writeStory(facts)
  const story = writeStory({ ...facts, fiat: await fiatLine(draft.quote, facts.timestamp) })

  return receipt ? { kind: "ready", story } : { kind: "pending", story }
})

function amount(
  value: bigint,
  meta: { symbol: string; decimals: number },
  token: TokenAmount["token"],
): TokenAmount {
  return { amount: value, decimals: meta.decimals, symbol: meta.symbol, token }
}

function namer(client: PublicClient) {
  const memo = new Map<string, Party>()
  const pending = new Map<string, Promise<Party>>()

  async function load(address: Address): Promise<Party> {
    const id = address.toLowerCase()
    const hit = memo.get(id)
    if (hit) return hit
    const inflight = pending.get(id)
    if (inflight) return inflight

    const work = resolveParty(client, address).then((party) => {
      memo.set(id, party)
      pending.delete(id)
      return party
    })
    pending.set(id, work)
    return work
  }

  return {
    load,
    get(address: Address): Party {
      return memo.get(address.toLowerCase()) ?? { address, name: null, kind: "wallet" }
    },
  }
}

function memoLoad<T>(load: (address: Address) => Promise<T>) {
  const memo = new Map<string, Promise<T>>()
  return (address: Address) => {
    const id = address.toLowerCase()
    const hit = memo.get(id)
    if (hit) return hit
    const work = load(address)
    memo.set(id, work)
    return work
  }
}

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

async function receiptOf(hash: Hash) {
  return firstHit((client) => client.getTransactionReceipt({ hash }))
}

async function blockOf(blockNumber: bigint) {
  return firstHit((client) => client.getBlock({ blockNumber }))
}

function firstHit<T>(work: (client: PublicClient) => Promise<T>): Promise<T | null> {
  return new Promise((resolve) => {
    let left = clients.length
    let done = false
    const finish = (value: T | null) => {
      if (done) return
      done = true
      resolve(value)
    }
    for (const client of clients) {
      work(client)
        .then((value) => finish(value))
        .catch(() => {
          left -= 1
          if (left === 0) finish(null)
        })
    }
  })
}
