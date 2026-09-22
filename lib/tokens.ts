import {
  decodeEventLog,
  decodeFunctionData,
  erc1155Abi,
  erc20Abi,
  erc721Abi,
  keccak256,
  parseAbi,
  toBytes,
  type Address,
  type Hex,
  type Log,
  type PublicClient,
} from "viem"

import { humanizeContractName } from "./formatters"
import { CRYPTO_PUNKS, knownLabel } from "./labels"
import { listedToken } from "./token-list"

const ZERO = "0x0000000000000000000000000000000000000000" as Address

const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
const TRANSFER_SINGLE = keccak256(
  toBytes("TransferSingle(address,address,address,uint256,uint256)"),
)
const TRANSFER_BATCH = keccak256(
  toBytes("TransferBatch(address,address,address,uint256[],uint256[])"),
)
const UNLIMITED = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
)

// CryptoPunks emits Transfer(from, to, 1) for the balance change and
// PunkTransfer for the actual punk. The uint256 on Transfer is not the id.
const punksAbi = parseAbi([
  "event Assign(address indexed to, uint256 punkIndex)",
  "event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)",
  "event PunkBought(uint256 indexed punkIndex, uint256 value, address indexed fromAddress, address indexed toAddress)",
])

const collectionAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
])

export type TokenMeta = {
  symbol: string
  decimals: number
}

export type DecodedTransfer = {
  token: Address
  from: Address
  to: Address
  amount: bigint
  kind: "erc20" | "erc721" | "erc1155"
  tokenId: bigint | null
}

export type DecodedApproval = {
  spender: Address
  amount: bigint
  unlimited: boolean
}

export function decodeTransfers(logs: Log[]): DecodedTransfer[] {
  const transfers: DecodedTransfer[] = []
  const punks = new Set<string>()

  for (const log of logs) {
    const topic = log.topics[0]
    if (!topic || !log.address) continue

    if (isPunks(log.address)) {
      const punk = decodePunk(log)
      if (!punk) continue
      const key = `${punk.from}:${punk.to}:${punk.tokenId}`
      if (punks.has(key)) continue
      punks.add(key)
      transfers.push(punk)
      continue
    }

    if (topic === TRANSFER && log.topics.length === 3) {
      const moved = decodeErc20(log)
      if (moved) transfers.push(moved)
      continue
    }

    if (topic === TRANSFER && log.topics.length === 4) {
      const moved = decodeErc721(log)
      if (moved) transfers.push(moved)
      continue
    }

    if (topic === TRANSFER_SINGLE || topic === TRANSFER_BATCH) {
      transfers.push(...decodeErc1155(log))
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

export async function readCollection(
  client: PublicClient,
  address: Address,
): Promise<string | null> {
  const known = knownLabel(address)
  if (known) return known

  const listed = await listedToken(address)
  if (listed) return listed.symbol

  const name = await readString(client, address, "name")
  if (name) return humanizeContractName(name)
  return readString(client, address, "symbol")
}

function decodeErc20(log: Log): DecodedTransfer | null {
  try {
    const decoded = decodeEventLog({
      abi: erc20Abi,
      data: log.data,
      topics: log.topics,
    })
    if (decoded.eventName !== "Transfer") return null
    return {
      token: log.address,
      from: decoded.args.from,
      to: decoded.args.to,
      amount: decoded.args.value,
      kind: "erc20",
      tokenId: null,
    }
  } catch {
    return null
  }
}

function decodeErc721(log: Log): DecodedTransfer | null {
  try {
    const decoded = decodeEventLog({
      abi: erc721Abi,
      data: log.data,
      topics: log.topics,
    })
    if (decoded.eventName !== "Transfer") return null
    return {
      token: log.address,
      from: decoded.args.from,
      to: decoded.args.to,
      amount: BigInt(1),
      kind: "erc721",
      tokenId: decoded.args.tokenId,
    }
  } catch {
    return null
  }
}

function decodeErc1155(log: Log): DecodedTransfer[] {
  try {
    const decoded = decodeEventLog({
      abi: erc1155Abi,
      data: log.data,
      topics: log.topics,
    })
    if (decoded.eventName === "TransferSingle") {
      return [
        nft1155(log.address, decoded.args.from, decoded.args.to, decoded.args.id, decoded.args.value),
      ]
    }
    if (decoded.eventName === "TransferBatch") {
      const count = Math.min(decoded.args.ids.length, decoded.args.values.length)
      const moved: DecodedTransfer[] = []
      for (let index = 0; index < count; index += 1) {
        moved.push(
          nft1155(
            log.address,
            decoded.args.from,
            decoded.args.to,
            decoded.args.ids[index],
            decoded.args.values[index],
          ),
        )
      }
      return moved
    }
    return []
  } catch {
    return []
  }
}

function nft1155(
  token: Address,
  from: Address,
  to: Address,
  id: bigint,
  value: bigint,
): DecodedTransfer {
  return {
    token,
    from,
    to,
    amount: value,
    kind: "erc1155",
    tokenId: id,
  }
}

function decodePunk(log: Log): DecodedTransfer | null {
  try {
    const decoded = decodeEventLog({
      abi: punksAbi,
      data: log.data,
      topics: log.topics,
    })
    if (decoded.eventName === "Assign") {
      return punk(log.address, ZERO, decoded.args.to, decoded.args.punkIndex)
    }
    if (decoded.eventName === "PunkTransfer") {
      return punk(log.address, decoded.args.from, decoded.args.to, decoded.args.punkIndex)
    }
    if (decoded.eventName === "PunkBought") {
      return punk(
        log.address,
        decoded.args.fromAddress,
        decoded.args.toAddress,
        decoded.args.punkIndex,
      )
    }
    return null
  } catch {
    return null
  }
}

function punk(token: Address, from: Address, to: Address, id: bigint): DecodedTransfer {
  return { token, from, to, amount: BigInt(1), kind: "erc721", tokenId: id }
}

function isPunks(address: Address): boolean {
  return address.toLowerCase() === CRYPTO_PUNKS.toLowerCase()
}

async function readString(
  client: PublicClient,
  address: Address,
  functionName: "name" | "symbol",
): Promise<string | null> {
  try {
    const value = await client.readContract({
      address,
      abi: collectionAbi,
      functionName,
    })
    return value || null
  } catch {
    return null
  }
}
