import { formatEther } from "viem"

import { shorten, type TxHash } from "./hash"

export type Party = {
  address: `0x${string}`
  name: string | null
}

export type Story = {
  hash: TxHash
  lead: string
  detail: string
  from: Party
  to: Party | null
  toLabel: "to" | "contract"
  value: string
  block: string | null
  outcome: "pending" | "succeeded" | "reverted"
}

export type TxFacts = {
  hash: TxHash
  from: Party
  to: Party | null
  valueWei: bigint
  input: `0x${string}`
  created: boolean
  blockNumber: bigint | null
  receiptStatus: "success" | "reverted" | null
}

export function writeStory(facts: TxFacts): Story {
  const value = formatValue(facts.valueWei)
  const from = label(facts.from)
  const to = facts.to ? label(facts.to) : null
  const created = facts.created
  const called = !created && facts.input !== "0x" && facts.to !== null
  const sent = facts.valueWei > BigInt(0)
  const pending = facts.receiptStatus === null
  const reverted = facts.receiptStatus === "reverted"

  const action = created
    ? `${from} created a contract`
    : sent && called && to
      ? `${from} sent ${value} to ${to} and called it`
      : sent && to
        ? `${from} sent ${value} to ${to}`
        : called && to
          ? `${from} called a contract at ${to}`
          : to
            ? `${from} sent a transaction to ${to}`
            : `${from} sent a transaction`

  const lead = pending
    ? `${action}, and it is still waiting to land.`
    : reverted
      ? `${action}, and the transaction reverted.`
      : `${action}.`

  const block = facts.blockNumber?.toLocaleString("en-US") ?? null
  const detail = pending
    ? "It has not been included in a block yet."
    : reverted
      ? `It reverted in block ${block}.`
      : `It landed in block ${block}.`

  return {
    hash: facts.hash,
    lead,
    detail,
    from: facts.from,
    to: facts.to,
    toLabel: created ? "contract" : "to",
    value,
    block,
    outcome: pending ? "pending" : reverted ? "reverted" : "succeeded",
  }
}

function label(party: Party): string {
  return party.name ?? shorten(party.address)
}

function formatValue(wei: bigint): string {
  if (wei === BigInt(0)) return "0 ETH"
  if (wei < BigInt(1_000_000_000)) return `${wei.toLocaleString("en-US")} wei`

  const [whole, fraction = ""] = formatEther(wei).split(".")
  const trimmed = fraction.replace(/0+$/, "").slice(0, 6)
  const amount = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return trimmed ? `${amount}.${trimmed} ETH` : `${amount} ETH`
}
