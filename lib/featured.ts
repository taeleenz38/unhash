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
    hash: "0xfa1166def2f9bca78b3b5533db0a5d8f403f36a7a284cd1d6c67cd5be185703f",
    title: "ETH onto Uniswap",
    tease: "a swap, with a name",
  },
  {
    hash: "0xde43fd8b71fb924a7b4236c9668b8bff6644b59c421e991a8eb84df991ba3cc1",
    title: "An approval",
    tease: "allowance, not a send",
  },
] as const
