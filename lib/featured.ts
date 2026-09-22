import { EXAMPLE_TX_HASH } from "./hash"

export const featuredStories = [
  {
    hash: EXAMPLE_TX_HASH,
    title: "The first Ethereum transaction",
    tease: "31,337 wei, genesis",
  },
  {
    hash: "0xe193541f4392f99cd0eed76ae95e462d2b97335fc6d7d5a8ea62c8ad4d5fb1f1",
    title: "100 USDC, to a wallet",
    tease: "a plain transfer, in English",
  },
  {
    hash: "0xcff8696cbd4b69ebd79a78ee7649ce7acef6b8cdfd16e6e2857870ea3cb4a12b",
    title: "CryptoPunk #2647",
    tease: "an NFT, as a sentence",
  },
  {
    hash: "0x95bae0dfb81e1acd8792302d25d36428d2ea7ae16345dc8ecbd7badd2198be20",
    title: "1.027398 ETH, and it reverted",
    tease: "sent to LiFi",
  },
] as const
