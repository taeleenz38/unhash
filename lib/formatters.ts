import { formatEther, formatUnits } from "viem"

const HEX_PREFIX = /^0x/i

export function shortHex(value: string): string {
  const hex = HEX_PREFIX.test(value) ? value.slice(2) : value
  if (hex.length <= 10) return `0x${hex}`
  return `0x${hex.slice(0, 6)}...${hex.slice(-4)}`
}

export function formatEth(wei: bigint): string {
  if (wei === BigInt(0)) return "0 ETH"
  if (wei < BigInt(1_000_000_000)) return `${wei.toLocaleString("en-US")} wei`
  return `${groupUnits(formatEther(wei))} ETH`
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  symbol: string,
): string {
  if (amount === BigInt(0)) return `0 ${symbol}`
  const raw = formatUnits(amount, decimals)
  const whole = raw.split(".")[0] ?? "0"
  const digits = whole.replace("-", "").length
  const maxFrac = digits >= 4 ? 2 : digits >= 1 ? 4 : 6
  return `${groupUnits(raw, maxFrac)} ${symbol}`
}

export function formatUsd(value: number): string {
  if (value < 0.5) return "Less than $1."
  if (value < 10) {
    return `About $${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}.`
  }
  return `About $${Math.round(value).toLocaleString("en-US")}.`
}

export function formatWhen(unixSeconds: bigint | number): string {
  const elapsed = Math.max(0, Math.round(Date.now() / 1000 - Number(unixSeconds)))
  if (elapsed < 45) return "just now"
  if (elapsed < 90) return "about a minute ago"
  if (elapsed < 45 * 60) return `about ${Math.round(elapsed / 60)} minutes ago`
  if (elapsed < 90 * 60) return "about an hour ago"
  if (elapsed < 22 * 60 * 60) return `about ${Math.round(elapsed / 3600)} hours ago`
  if (elapsed < 36 * 60 * 60) return "yesterday"
  if (elapsed < 26 * 24 * 60 * 60) {
    return `about ${Math.round(elapsed / 86400)} days ago`
  }
  return new Date(Number(unixSeconds) * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function humanizeContractName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/(\d)([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z]{2,})(\d+)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
}

function groupUnits(value: string, maxFrac = 6): string {
  const [whole, fraction = ""] = value.split(".")
  const trimmed = fraction.replace(/0+$/, "").slice(0, maxFrac)
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return trimmed ? `${grouped}.${trimmed}` : grouped
}
