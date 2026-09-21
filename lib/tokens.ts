import {
  decodeEventLog,
  decodeFunctionData,
  erc20Abi,
  type Address,
  type Hex,
  type Log,
  type PublicClient,
} from "viem"

import { listedToken } from "./token-list"

const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
const UNLIMITED = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
)

export type TokenMeta = {
  symbol: string
  decimals: number
}

export type DecodedTransfer = {
  token: Address
  from: Address
  to: Address
  amount: bigint
}

export type DecodedApproval = {
  spender: Address
  amount: bigint
  unlimited: boolean
}

export function decodeTransfers(logs: Log[]): DecodedTransfer[] {
  const transfers: DecodedTransfer[] = []

  for (const log of logs) {
    if (log.topics[0] !== TRANSFER || log.topics.length !== 3) continue
    try {
      const decoded = decodeEventLog({
        abi: erc20Abi,
        data: log.data,
        topics: log.topics,
      })
      if (decoded.eventName !== "Transfer") continue
      transfers.push({
        token: log.address,
        from: decoded.args.from,
        to: decoded.args.to,
        amount: decoded.args.value,
      })
    } catch {
      continue
    }
  }

  return transfers
}

export function decodeApproval(input: Hex): DecodedApproval | null {
  try {
    const decoded = decodeFunctionData({ abi: erc20Abi, data: input })
    if (decoded.functionName !== "approve") return null
    const [spender, amount] = decoded.args
    return { spender, amount, unlimited: amount === UNLIMITED }
  } catch {
    return null
  }
}

export async function readToken(
  client: PublicClient,
  address: Address,
): Promise<TokenMeta | null> {
  const listed = await listedToken(address)
  if (listed) return listed

  try {
    const [symbol, decimals] = await Promise.all([
      client.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address, abi: erc20Abi, functionName: "decimals" }),
    ])
    return { symbol, decimals }
  } catch {
    return null
  }
}
