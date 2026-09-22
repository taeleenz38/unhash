import type { Address } from "viem"

import { EXAMPLE_TX_HASH } from "./hash"
import { WETH_ADDRESS } from "./labels"
import type { Party, TokenAmount, Transfer, TxFacts } from "./story"

const ALICE: Address = "0x1111111111111111111111111111111111111111"
const BOB: Address = "0x2222222222222222222222222222222222222222"
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const UNISWAP: Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const PUNKS: Address = "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"
const APES: Address = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"
const VAULT: Address = "0x3333333333333333333333333333333333333333"
const DAI: Address = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const ZERO: Address = "0x0000000000000000000000000000000000000000"

const ETH = BigInt(10) ** BigInt(18)

export type StoryFixture = {
  name: string
  facts: TxFacts
  story: {
    headline: string
    lead: string
    toLabel: "to" | "contract" | "spender" | "via"
    value: string
  }
}

export const storyFixtures: StoryFixture[] = [
  {
    name: "100 USDC transfer",
    facts: facts({
      to: contract(USDC, "USDC"),
      method: "transfer",
      transfers: [erc20(wallet(ALICE), wallet(BOB), BigInt(100000000), 6, "USDC", USDC)],
    }),
    story: {
      headline: "100 USDC",
      lead: "sent to a wallet",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "ETH send",
    facts: facts({
      valueWei: ETH,
    }),
    story: {
      headline: "1 ETH",
      lead: "sent to a wallet",
      toLabel: "to",
      value: "1 ETH",
    },
  },
  {
    name: "approval",
    facts: facts({
      to: contract(USDC, "USDC"),
      method: "approve",
      approval: {
        spender: contract(UNISWAP, "Uniswap"),
        token: fungible(BigInt(100000000), 6, "USDC", USDC),
        unlimited: true,
      },
    }),
    story: {
      headline: "Unlimited USDC",
      lead: "approved for Uniswap",
      toLabel: "spender",
      value: "0 ETH",
    },
  },
  {
    name: "swap that sends ETH",
    facts: facts({
      to: contract(UNISWAP, "Uniswap"),
      valueWei: ETH,
      method: "swap",
      transfers: [erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), BigInt(2500000000), 6, "USDC", USDC)],
    }),
    story: {
      headline: "1 ETH → 2,500 USDC",
      lead: "swapped via Uniswap",
      toLabel: "via",
      value: "1 ETH",
    },
  },
  {
    name: "token swap that also sends ETH",
    facts: facts({
      to: contract(UNISWAP, "Uniswap"),
      valueWei: ETH,
      method: "swap",
      transfers: [
        erc20(wallet(ALICE), contract(UNISWAP, "Uniswap"), BigInt(100000000), 6, "USDC", USDC),
        erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), ETH, 18, "WETH", WETH_ADDRESS),
      ],
    }),
    story: {
      headline: "100 USDC → 1 WETH",
      lead: "swapped via Uniswap",
      toLabel: "via",
      value: "1 ETH",
    },
  },
  {
    name: "swap hop nets out",
    facts: facts({
      to: contract(UNISWAP, "Uniswap"),
      method: "swap",
      transfers: [
        erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), (ETH * BigInt(2)) / BigInt(5), 18, "WETH", WETH_ADDRESS),
        erc20(wallet(ALICE), contract(UNISWAP, "Uniswap"), (ETH * BigInt(2)) / BigInt(5), 18, "WETH", WETH_ADDRESS),
        erc20(wallet(ALICE), contract(UNISWAP, "Uniswap"), BigInt(1000000000), 6, "USDC", USDC),
        erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), ETH * BigInt(1500), 18, "DAI", DAI),
      ],
    }),
    story: {
      headline: "1,000 USDC → 1,500 DAI",
      lead: "swapped via Uniswap",
      toLabel: "via",
      value: "0 ETH",
    },
  },
  {
    name: "swap refund nets against the input",
    facts: facts({
      to: contract(UNISWAP, "Uniswap"),
      method: "swap",
      transfers: [
        erc20(wallet(ALICE), contract(UNISWAP, "Uniswap"), BigInt(100000000), 6, "USDC", USDC),
        erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), BigInt(1000000), 6, "USDC", USDC),
        erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), ETH / BigInt(20), 18, "WETH", WETH_ADDRESS),
      ],
    }),
    story: {
      headline: "99 USDC → 0.05 WETH",
      lead: "swapped via Uniswap",
      toLabel: "via",
      value: "0 ETH",
    },
  },
  {
    name: "split swap sums the same token",
    facts: facts({
      to: contract(UNISWAP, "Uniswap"),
      method: "swap",
      transfers: [
        erc20(wallet(ALICE), contract(UNISWAP, "Uniswap"), BigInt(100000000), 6, "USDC", USDC),
        erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), ETH / BigInt(5), 18, "WETH", WETH_ADDRESS),
        erc20(contract(UNISWAP, "Uniswap"), wallet(ALICE), (ETH * BigInt(3)) / BigInt(10), 18, "WETH", WETH_ADDRESS),
      ],
    }),
    story: {
      headline: "100 USDC → 0.5 WETH",
      lead: "swapped via Uniswap",
      toLabel: "via",
      value: "0 ETH",
    },
  },
  {
    name: "revert",
    facts: facts({
      valueWei: ETH,
      receiptStatus: "reverted",
    }),
    story: {
      headline: "1 ETH",
      lead: "sent to a wallet, and it reverted",
      toLabel: "to",
      value: "1 ETH",
    },
  },
  {
    name: "pending",
    facts: facts({
      valueWei: ETH,
      receiptStatus: null,
      blockNumber: null,
      timestamp: null,
    }),
    story: {
      headline: "1 ETH",
      lead: "sent to a wallet, still waiting to land",
      toLabel: "to",
      value: "1 ETH",
    },
  },
  {
    name: "ERC-721 transfer",
    facts: facts({
      to: contract(PUNKS, "CryptoPunk"),
      transfers: [nft(wallet(ALICE), wallet(BOB), "CryptoPunk", PUNKS, "erc721", BigInt(1234), BigInt(1))],
    }),
    story: {
      headline: "CryptoPunk #1234",
      lead: "sent to a wallet",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "ERC-1155 transfer",
    facts: facts({
      to: contract(APES, "Bored Ape"),
      transfers: [nft(wallet(ALICE), wallet(BOB), "Bored Ape", APES, "erc1155", BigInt(99999), BigInt(1))],
    }),
    story: {
      headline: "1 Bored Ape",
      lead: "sent to a wallet",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "mint to self",
    facts: facts({
      transfers: [erc20(wallet(ZERO), wallet(ALICE), BigInt(100000000), 6, "USDC", USDC)],
    }),
    story: {
      headline: "100 USDC",
      lead: "minted",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "mint to someone else",
    facts: facts({
      transfers: [erc20(wallet(ZERO), wallet(BOB), BigInt(100000000), 6, "USDC", USDC)],
    }),
    story: {
      headline: "100 USDC",
      lead: "minted to a wallet",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "burn",
    facts: facts({
      transfers: [erc20(wallet(ALICE), wallet(ZERO), BigInt(100000000), 6, "USDC", USDC)],
    }),
    story: {
      headline: "100 USDC",
      lead: "burned",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "WETH deposit",
    facts: facts({
      to: contract(WETH_ADDRESS, "WETH"),
      valueWei: ETH,
      method: "deposit",
      transfers: [erc20(wallet(ZERO), wallet(ALICE), ETH, 18, "WETH", WETH_ADDRESS)],
    }),
    story: {
      headline: "1 ETH",
      lead: "wrapped into WETH",
      toLabel: "to",
      value: "1 ETH",
    },
  },
  {
    name: "WETH withdraw",
    facts: facts({
      to: contract(WETH_ADDRESS, "WETH"),
      method: "withdraw",
      transfers: [erc20(wallet(ALICE), wallet(ZERO), ETH, 18, "WETH", WETH_ADDRESS)],
    }),
    story: {
      headline: "1 WETH",
      lead: "unwrapped into ETH",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "burn beside a token send",
    facts: facts({
      method: "transfer",
      transfers: [
        nft(wallet(ALICE), wallet(ZERO), "CryptoPunk", PUNKS, "erc721", BigInt(5), BigInt(1)),
        erc20(wallet(ALICE), wallet(BOB), ETH, 18, "VLN", VAULT),
      ],
    }),
    story: {
      headline: "CryptoPunk #5",
      lead: "burned",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "token send beside an NFT gift",
    facts: facts({
      method: "transfer",
      transfers: [
        erc20(wallet(ALICE), wallet(BOB), BigInt(100000000), 6, "USDC", USDC),
        nft(wallet(ALICE), wallet(BOB), "Bored Ape", APES, "erc721", BigInt(1), BigInt(1)),
      ],
    }),
    story: {
      headline: "100 USDC",
      lead: "sent to a wallet",
      toLabel: "to",
      value: "0 ETH",
    },
  },
  {
    name: "deposit that is not WETH",
    facts: facts({
      to: contract(VAULT, "A vault"),
      method: "deposit",
    }),
    story: {
      headline: "deposit",
      lead: "called A vault",
      toLabel: "to",
      value: "0 ETH",
    },
  },
]

function facts(overrides: Partial<TxFacts>): TxFacts {
  return {
    hash: EXAMPLE_TX_HASH,
    from: wallet(ALICE),
    to: wallet(BOB),
    valueWei: BigInt(0),
    created: false,
    blockNumber: BigInt(1),
    receiptStatus: "success",
    method: null,
    timestamp: BigInt(1),
    revert: null,
    fiat: null,
    transfers: [],
    approval: null,
    ...overrides,
  }
}

function wallet(address: Address, name: string | null = null): Party {
  return { address, name, kind: "wallet" }
}

function contract(address: Address, name: string | null): Party {
  return { address, name, kind: "contract" }
}

function fungible(amount: bigint, decimals: number, symbol: string, token: Address): TokenAmount {
  return { amount, decimals, symbol, token }
}

function erc20(
  from: Party,
  to: Party,
  amount: bigint,
  decimals: number,
  symbol: string,
  token: Address,
): Transfer {
  return { from, to, token: fungible(amount, decimals, symbol, token) }
}

function nft(
  from: Party,
  to: Party,
  symbol: string,
  token: Address,
  kind: "erc721" | "erc1155",
  tokenId: bigint,
  amount: bigint,
): Transfer {
  return {
    from,
    to,
    token: { amount, decimals: 0, symbol, token, kind, tokenId },
  }
}
