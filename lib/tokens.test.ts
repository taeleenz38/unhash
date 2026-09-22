import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  encodeAbiParameters,
  encodeEventTopics,
  erc1155Abi,
  erc20Abi,
  erc721Abi,
  parseAbi,
  parseAbiParameters,
  zeroAddress,
  type Address,
  type Hex,
  type Log,
} from "viem"

import { CRYPTO_PUNKS } from "./labels"
import { decodeTransfers } from "./tokens"

const ALICE: Address = "0x1111111111111111111111111111111111111111"
const BOB: Address = "0x2222222222222222222222222222222222222222"
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const APES: Address = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"

const punkAbi = parseAbi([
  "event Assign(address indexed to, uint256 punkIndex)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)",
])

describe("decodeTransfers", () => {
  it("reads an ERC-20 value", () => {
    const [moved] = decodeTransfers([
      log(
        USDC,
        encodeEventTopics({
          abi: erc20Abi,
          eventName: "Transfer",
          args: { from: ALICE, to: BOB },
        }),
        word(BigInt(100_000_000)),
      ),
    ])
    assert.equal(moved.kind, "erc20")
    assert.equal(moved.amount, BigInt(100_000_000))
    assert.equal(moved.tokenId, null)
  })

  it("reads an ERC-721 id, not an amount", () => {
    const [moved] = decodeTransfers([
      log(
        APES,
        encodeEventTopics({
          abi: erc721Abi,
          eventName: "Transfer",
          args: { from: ALICE, to: BOB, tokenId: BigInt(1234) },
        }),
        "0x",
      ),
    ])
    assert.equal(moved.kind, "erc721")
    assert.equal(moved.tokenId, BigInt(1234))
    assert.equal(moved.amount, BigInt(1))
  })

  it("reads an ERC-1155 value, not the id", () => {
    const [moved] = decodeTransfers([
      log(
        APES,
        encodeEventTopics({
          abi: erc1155Abi,
          eventName: "TransferSingle",
          args: { operator: ALICE, from: ALICE, to: BOB },
        }),
        encodeAbiParameters(parseAbiParameters("uint256, uint256"), [BigInt(99999), BigInt(1)]),
      ),
    ])
    assert.equal(moved.kind, "erc1155")
    assert.equal(moved.amount, BigInt(1))
    assert.equal(moved.tokenId, BigInt(99999))
  })

  it("reads an ERC-1155 batch as separate values", () => {
    const moved = decodeTransfers([
      log(
        APES,
        encodeEventTopics({
          abi: erc1155Abi,
          eventName: "TransferBatch",
          args: { operator: ALICE, from: ALICE, to: BOB },
        }),
        encodeAbiParameters(parseAbiParameters("uint256[], uint256[]"), [
          [BigInt(7), BigInt(8)],
          [BigInt(2), BigInt(3)],
        ]),
      ),
    ])
    assert.equal(moved.length, 2)
    assert.equal(moved[0].kind, "erc1155")
    assert.equal(moved[0].tokenId, BigInt(7))
    assert.equal(moved[0].amount, BigInt(2))
    assert.equal(moved[1].tokenId, BigInt(8))
    assert.equal(moved[1].amount, BigInt(3))
  })

  it("reads the CryptoPunk id from PunkTransfer, not the balance log", () => {
    const moved = decodeTransfers([
      log(
        CRYPTO_PUNKS,
        encodeEventTopics({
          abi: punkAbi,
          eventName: "Transfer",
          args: { from: ALICE, to: BOB },
        }),
        word(BigInt(1)),
      ),
      log(
        CRYPTO_PUNKS,
        encodeEventTopics({
          abi: punkAbi,
          eventName: "PunkTransfer",
          args: { from: ALICE, to: BOB },
        }),
        word(BigInt(2647)),
      ),
    ])
    assert.equal(moved.length, 1)
    assert.equal(moved[0].kind, "erc721")
    assert.equal(moved[0].tokenId, BigInt(2647))
    assert.equal(moved[0].amount, BigInt(1))
  })

  it("reads a CryptoPunk assign as a mint", () => {
    const [moved] = decodeTransfers([
      log(
        CRYPTO_PUNKS,
        encodeEventTopics({
          abi: punkAbi,
          eventName: "Assign",
          args: { to: ALICE },
        }),
        word(BigInt(1234)),
      ),
    ])
    assert.equal(moved.from, zeroAddress)
    assert.equal(moved.tokenId, BigInt(1234))
    assert.equal(moved.kind, "erc721")
  })
})

function word(value: bigint): Hex {
  return encodeAbiParameters(parseAbiParameters("uint256"), [value])
}

function log(address: Address, topics: readonly (Hex | Hex[] | null)[], data: Hex): Log {
  return {
    address,
    data,
    topics: topics.filter((topic): topic is Hex => typeof topic === "string"),
  } as Log
}
