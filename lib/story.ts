import { formatEth, formatTokenAmount, formatWhen } from "./formatters"
import type { TxHash } from "./hash"
import type { Address } from "viem"

export type PartyKind = "wallet" | "contract"

export type Party = {
  address: `0x${string}`
  name: string | null
  kind: PartyKind
}

export type TokenAmount = {
  amount: bigint
  decimals: number
  symbol: string
  token: Address | "eth"
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

  let headline = "A transaction"
  let lead = "sent on Ethereum"
  let to = facts.to
  let toLabel: Story["toLabel"] = facts.created ? "contract" : "to"
  const value = formatEth(facts.valueWei)
  let quote: Quote | null =
    facts.valueWei > BigInt(0)
      ? { amount: facts.valueWei, decimals: 18, token: "eth" }
      : null

  if (outgoing.length >= 1 && incoming.length >= 1) {
    const sold = outgoing[0]
    const bought = incoming[incoming.length - 1]
    headline = `${token(sold.token)} → ${token(bought.token)}`
    lead = facts.to ? `swapped via ${describe(facts.to)}` : "swapped"
    toLabel = "via"
    quote = quoteOf(sold.token)
  } else if (facts.valueWei > BigInt(0) && incoming.length >= 1) {
    const bought = incoming[incoming.length - 1]
    headline = `${formatEth(facts.valueWei)} → ${token(bought.token)}`
    lead = facts.to ? `swapped via ${describe(facts.to)}` : "swapped"
    toLabel = "via"
  } else if (outgoing.length === 1) {
    const sent = outgoing[0]
    headline = token(sent.token)
    lead = `sent to ${describe(sent.to)}`
    to = sent.to
    quote = quoteOf(sent.token)
  } else if (facts.transfers.length === 1) {
    const moved = facts.transfers[0]
    headline = token(moved.token)
    lead = `sent to ${describe(moved.to)}`
    to = moved.to
    quote = quoteOf(moved.token)
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
  return formatTokenAmount(amount.amount, amount.decimals, amount.symbol)
}

function quoteOf(amount: TokenAmount): Quote {
  return { amount: amount.amount, decimals: amount.decimals, token: amount.token }
}
