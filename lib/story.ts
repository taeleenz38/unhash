import { formatUnits, type Address } from "viem"

import { formatEth, formatTokenAmount, formatWhen } from "./formatters"
import type { TxHash } from "./hash"
import { isWeth } from "./labels"

const ZERO = "0x0000000000000000000000000000000000000000"

export type PartyKind = "wallet" | "contract"

export type Party = {
  address: `0x${string}`
  name: string | null
  kind: PartyKind
}

export type AssetKind = "erc20" | "erc721" | "erc1155"

export type TokenAmount = {
  amount: bigint
  decimals: number
  symbol: string
  token: Address | "eth"
  kind?: AssetKind
  tokenId?: bigint | null
}

export type Transfer = {
  from: Party
  to: Party
  token: TokenAmount
}

export type Approval = {
  spender: Party
  token: TokenAmount
  unlimited: boolean
}

export type Quote = {
  amount: bigint
  decimals: number
  token: Address | "eth"
}

export type Story = {
  hash: TxHash
  headline: string
  lead: string
  detail: string
  aside: string | null
  from: Party
  to: Party | null
  toLabel: "to" | "contract" | "spender" | "via"
  value: string
  block: string | null
  outcome: "pending" | "succeeded" | "reverted"
  quote: Quote | null
}

export type TxFacts = {
  hash: TxHash
  from: Party
  to: Party | null
  valueWei: bigint
  created: boolean
  blockNumber: bigint | null
  receiptStatus: "success" | "reverted" | null
  method: string | null
  timestamp: bigint | null
  revert: string | null
  fiat: string | null
  transfers: Transfer[]
  approval: Approval | null
}

export function writeStory(facts: TxFacts): Story {
  const pending = facts.receiptStatus === null
  const reverted = facts.receiptStatus === "reverted"
  const user = facts.from.address.toLowerCase()
  const outgoing = facts.transfers.filter((item) => item.from.address.toLowerCase() === user)
  const incoming = facts.transfers.filter((item) => item.to.address.toLowerCase() === user)
  const sent =
    (outgoing.length >= 1 && incoming.length === 0 ? pickMovement(outgoing) : null) ??
    (outgoing.length === 0 ? pickMovement(facts.transfers) : null)
  const pair = netPosition(user, facts.transfers, facts.valueWei)

  let headline = "A transaction"
  let lead = "sent on Ethereum"
  let to = facts.to
  let toLabel: Story["toLabel"] = facts.created ? "contract" : "to"
  const value = formatEth(facts.valueWei)
  let quote: Quote | null =
    facts.valueWei > BigInt(0)
      ? { amount: facts.valueWei, decimals: 18, token: "eth" }
      : null

  if (facts.to && isWeth(facts.to.address) && facts.method === "deposit") {
    headline = formatEth(facts.valueWei)
    lead = "wrapped into WETH"
  } else if (facts.to && isWeth(facts.to.address) && facts.method === "withdraw") {
    const burned = facts.transfers.find((item) => isZero(item.to.address))
    headline = burned ? token(burned.token) : "WETH"
    lead = "unwrapped into ETH"
    quote = burned ? quoteOf(burned.token) : null
  } else if (pair) {
    headline = `${token(pair.sold)} → ${token(pair.bought)}`
    lead = facts.to ? `swapped via ${describe(facts.to)}` : "swapped"
    toLabel = "via"
    quote = quoteOf(pair.sold) ?? quoteOf(pair.bought)
  } else if (sent) {
    const transfer = sent[0]
    headline = movementHeadline(sent)
    lead = moved(transfer, user)
    to = transfer.to
    quote = sent.length === 1 ? quoteOf(transfer.token) : null
  } else if (facts.approval) {
    const { spender, token: approved, unlimited } = facts.approval
    headline = unlimited ? `Unlimited ${approved.symbol}` : token(approved)
    lead = `approved for ${describe(spender)}`
    to = spender
    toLabel = "spender"
    quote = unlimited ? null : quoteOf(approved)
  } else if (facts.created) {
    headline = "New contract"
    lead = "created by this wallet"
  } else if (facts.valueWei > BigInt(0) && facts.to) {
    headline = formatEth(facts.valueWei)
    lead = `sent to ${describe(facts.to)}`
  } else if (facts.to && facts.method) {
    headline = facts.method
    lead = `called ${describe(facts.to)}`
  } else if (facts.to) {
    headline = "A call"
    lead = `called ${describe(facts.to)}`
  }

  if (pending) lead = `${lead}, still waiting to land`
  if (reverted) lead = `${lead}, and it reverted`

  const block = facts.blockNumber?.toLocaleString("en-US") ?? null
  const when = facts.timestamp ? formatWhen(facts.timestamp) : null
  const detail = pending
    ? "It has not been included in a block yet."
    : reverted
      ? when
        ? `It reverted ${when}, in block ${block}.`
        : `It reverted in block ${block}.`
      : when
        ? `It landed ${when}, in block ${block}.`
        : `It landed in block ${block}.`

  const aside = [facts.fiat, facts.revert].filter(Boolean).join(" ") || null

  return {
    hash: facts.hash,
    headline,
    lead,
    detail,
    aside,
    from: facts.from,
    to,
    toLabel,
    value,
    block,
    outcome: pending ? "pending" : reverted ? "reverted" : "succeeded",
    quote,
  }
}

export function describe(party: Party): string {
  if (party.name) return party.name
  return party.kind === "contract" ? "a contract" : "a wallet"
}

function token(amount: TokenAmount): string {
  if (amount.token === "eth") return formatEth(amount.amount)
  if (amount.kind === "erc721" && amount.tokenId != null) {
    return `${amount.symbol} #${amount.tokenId}`
  }
  if (amount.kind === "erc1155") return labeledCount(amount.amount, amount.symbol)
  return formatTokenAmount(amount.amount, amount.decimals, amount.symbol)
}

function movementHeadline(transfers: Transfer[]): string {
  const first = transfers[0].token
  if (first.kind === "erc721" && transfers.length > 1) {
    return labeledCount(BigInt(transfers.length), first.symbol)
  }
  if (first.kind === "erc1155" && transfers.length > 1) {
    const amount = transfers.reduce((sum, item) => sum + item.token.amount, BigInt(0))
    return labeledCount(amount, first.symbol)
  }
  return token(first)
}

function labeledCount(amount: bigint, name: string): string {
  const label = amount === BigInt(1) ? name : name.endsWith("s") ? name : `${name}s`
  return formatTokenAmount(amount, 0, label)
}

function moved(transfer: Transfer, user: string): string {
  if (isZero(transfer.from.address)) {
    if (transfer.to.address.toLowerCase() === user) return "minted"
    return `minted to ${describe(transfer.to)}`
  }
  if (isZero(transfer.to.address)) return "burned"
  return `sent to ${describe(transfer.to)}`
}

// A mint or burn stays the sentence when the same transaction also moves a token.
function pickMovement(transfers: Transfer[]): Transfer[] | null {
  const unified = sameMovement(transfers)
  if (unified) return unified

  const nfts = transfers.filter((item) => isNft(item.token))
  const mintedOrBurned = nfts.filter(
    (item) => isZero(item.from.address) || isZero(item.to.address),
  )
  const issued = sameMovement(mintedOrBurned)
  if (issued) return issued

  const fungible = transfers.filter((item) => !isNft(item.token))
  if (fungible.length === 1) return fungible
  return null
}

function isNft(token: TokenAmount): boolean {
  return token.kind === "erc721" || token.kind === "erc1155"
}

function sameMovement(transfers: Transfer[]): Transfer[] | null {
  if (transfers.length === 0) return null
  const first = transfers[0]
  const kind = first.token.kind ?? "erc20"
  const token = String(first.token.token).toLowerCase()
  const from = first.from.address.toLowerCase()
  const to = first.to.address.toLowerCase()
  const same = transfers.every(
    (item) =>
      (item.token.kind ?? "erc20") === kind &&
      String(item.token.token).toLowerCase() === token &&
      item.from.address.toLowerCase() === from &&
      item.to.address.toLowerCase() === to,
  )
  if (!same) return null
  if (kind === "erc20" && transfers.length !== 1) return null
  return transfers
}

function netPosition(
  user: string,
  transfers: Transfer[],
  valueWei: bigint,
): { sold: TokenAmount; bought: TokenAmount } | null {
  const flows = new Map<string, { out: bigint; inn: bigint; token: TokenAmount }>()

  for (const transfer of transfers) {
    const fromUser = transfer.from.address.toLowerCase() === user
    const toUser = transfer.to.address.toLowerCase() === user
    if (!fromUser && !toUser) continue
    const key = flowKey(transfer.token)
    const flow = flows.get(key) ?? { out: BigInt(0), inn: BigInt(0), token: transfer.token }
    if (fromUser) flow.out += transfer.token.amount
    if (toUser) flow.inn += transfer.token.amount
    flows.set(key, flow)
  }

  const sold: TokenAmount[] = []
  const bought: TokenAmount[] = []
  for (const flow of flows.values()) {
    if (flow.out === flow.inn) continue
    const amount = flow.out > flow.inn ? flow.out - flow.inn : flow.inn - flow.out
    const leg = { ...flow.token, amount }
    if (flow.out > flow.inn) sold.push(leg)
    else bought.push(leg)
  }
  if (valueWei > BigInt(0)) {
    sold.push({ amount: valueWei, decimals: 18, symbol: "ETH", token: "eth" })
  }

  const out = primary(sold)
  const inn = primary(bought)
  if (!out || !inn) return null
  return { sold: out, bought: inn }
}

function flowKey(amount: TokenAmount): string {
  const token = amount.token === "eth" ? "eth" : amount.token.toLowerCase()
  if (amount.kind === "erc721" || amount.kind === "erc1155") return `${token}:${amount.tokenId ?? ""}`
  return token
}

function primary(legs: TokenAmount[]): TokenAmount | null {
  let best: TokenAmount | null = null
  for (const leg of legs) {
    if (!best || magnitude(leg) > magnitude(best)) best = leg
  }
  return best
}

function magnitude(amount: TokenAmount): number {
  const units = Number(formatUnits(amount.amount, amount.decimals))
  return Number.isFinite(units) ? units : 0
}

function quoteOf(amount: TokenAmount): Quote | null {
  if (amount.kind === "erc721" || amount.kind === "erc1155") return null
  return { amount: amount.amount, decimals: amount.decimals, token: amount.token }
}

function isZero(address: string): boolean {
  return address.toLowerCase() === ZERO
}
