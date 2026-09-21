import { formatEth, formatTokenAmount, formatWhen, shortHex } from "./formatters"
import type { TxHash } from "./hash"

export type Party = {
  address: `0x${string}`
  name: string | null
}

export type TokenAmount = {
  amount: bigint
  decimals: number
  symbol: string
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

export type Story = {
  hash: TxHash
  lead: string
  detail: string
  from: Party
  to: Party | null
  toLabel: "to" | "contract" | "spender" | "via"
  value: string
  block: string | null
  outcome: "pending" | "succeeded" | "reverted"
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
  transfers: Transfer[]
  approval: Approval | null
}

export function writeStory(facts: TxFacts): Story {
  const from = label(facts.from)
  const pending = facts.receiptStatus === null
  const reverted = facts.receiptStatus === "reverted"
  const user = facts.from.address.toLowerCase()
  const outgoing = facts.transfers.filter((item) => item.from.address.toLowerCase() === user)
  const incoming = facts.transfers.filter((item) => item.to.address.toLowerCase() === user)

  let action: string
  let to = facts.to
  let toLabel: Story["toLabel"] = facts.created ? "contract" : "to"
  let value = facts.valueWei > BigInt(0) ? formatEth(facts.valueWei) : "—"

  if (outgoing.length >= 1 && incoming.length >= 1) {
    const sold = outgoing[0]
    const bought = incoming[0]
    action = `${from} swapped ${token(sold.token)} for ${token(bought.token)}`
    toLabel = "via"
    value = `${token(sold.token)} → ${token(bought.token)}`
  } else if (outgoing.length === 1) {
    const sent = outgoing[0]
    action = `${from} sent ${token(sent.token)} to ${label(sent.to)}`
    to = sent.to
    value = token(sent.token)
  } else if (facts.transfers.length === 1) {
    const moved = facts.transfers[0]
    action = `${label(moved.from)} sent ${token(moved.token)} to ${label(moved.to)}`
    to = moved.to
    value = token(moved.token)
  } else if (facts.approval) {
    const { spender, token: approved, unlimited } = facts.approval
    action = unlimited
      ? `${from} approved ${label(spender)} to spend ${approved.symbol}`
      : `${from} approved ${label(spender)} to spend ${token(approved)}`
    to = spender
    toLabel = "spender"
    value = unlimited ? `unlimited ${approved.symbol}` : token(approved)
  } else if (facts.created) {
    action = `${from} created a contract`
  } else if (facts.valueWei > BigInt(0) && facts.to) {
    action = `${from} sent ${formatEth(facts.valueWei)} to ${label(facts.to)}`
    value = formatEth(facts.valueWei)
  } else if (facts.to && facts.method) {
    action = `${from} called ${facts.method} on ${label(facts.to)}`
  } else if (facts.to) {
    action = `${from} called ${label(facts.to)}`
  } else {
    action = `${from} sent a transaction`
  }

  const lead = pending
    ? `${action}, and it is still waiting to land.`
    : reverted
      ? `${action}, and the transaction reverted.`
      : `${action}.`

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

  return {
    hash: facts.hash,
    lead,
    detail,
    from: facts.from,
    to,
    toLabel,
    value,
    block,
    outcome: pending ? "pending" : reverted ? "reverted" : "succeeded",
  }
}

function label(party: Party): string {
  return party.name ?? shortHex(party.address)
}

function token(amount: TokenAmount): string {
  return formatTokenAmount(amount.amount, amount.decimals, amount.symbol)
}
