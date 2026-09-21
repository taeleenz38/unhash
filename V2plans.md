# V2 plans

Pickup notes for tomorrow. V1 is Ethereum mainnet, one hash, one page. V2 is the same object, more true — not more pages.

If a change needs a second route of tables, it is not V2. It is a different product.

---

## Where V1 is (21 Sep)

Shipped shape:

- Home: hash input + four featured stories
- `/tx/[hash]`: headline, lead, detail, aside, four facts, Etherscan, back to `/`
- Stories we already write: ETH send, ERC-20 transfer, swap (first out / last in), approval, contract create, revert, pending
- Names from token list, `symbol` / `name`, ENS, Sourcify
- Fiat aside from current DefiLlama price (not the block’s price)
- OG image on the story URL

Done today, uncommitted unless you committed it:

- Tx page: “Look up another” removed; icon back to `/`
- Hashes (and named accounts) link out to Etherscan; copy glyph → check, not click-the-hex
- Meta **value** is native `tx.value` only (`0 ETH` on a 100 USDC transfer)
- Pointer cursor on links and buttons
- Read stays `text-secondary` (the grey, same as the placeholder) until `parseHash` succeeds, then `text-primary`. Junk under the input is rejected live; a partial `0x…` is not

Tokens, so we stop mixing them up:

| Token | What it is |
|---|---|
| `--secondary` / `text-secondary` | Grey. Labels, teasers, placeholder, idle Read |
| `--primary` / `text-primary` | Near-white. Headlines, ready Read |
| `--accent` / `text-accent` | Blue. Hover on hash links, selection |

---

## What V2 is

The page should survive a stranger pasting a weirder hash and still getting a sentence.

Order of leverage:

1. **Tell the truth on more Ethereum txs** — NFTs, mints, burns, wraps, messy router txs
2. **Make the writer testable** — so the next story type does not rot the ones we have
3. **Then widen the chain** — one more EVM L2, same page, header mark already exists

Do not start (3) while (1) still says “A call” for a punk sale.

---

## What V2 is not

- Address pages, token pages, search, history
- Wallets, signing, accounts
- A log viewer, internal-tx tree, or gas dashboard
- Solana (the design language can stay; the decoder is a different product)
- A second layout for desktop

---

## Tomorrow — start here

Highest value, smallest surface. Do these in order unless a hash you care about forces a jump.

### 1. Fixture the writer

`writeStory` is a long `if` / `else` with no tests. Add a small fixture file next to it: facts in, `{ headline, lead, toLabel, value }` out.

Cover at least:

- 100 USDC transfer → value `0 ETH`, headline is the token
- ETH send → value is the ETH
- Approval → value `0 ETH`
- Swap that sends ETH → value is `tx.value`, headline is the pair
- Revert / pending lead suffixes

This is the resume move. Recruiter opens `lib/story.ts`, sees it is not vibes.

### 2. ERC-721 / 1155 as a sentence

`decodeTransfers` only accepts ERC-20 (`topics.length === 3`). A punk or a 1155 mint falls through to “A call” / a selector.

Wanted:

- `CryptoPunk #1234 sent to a wallet`
- `1 Bored Ape sent to …` (name from the collection, not the token id as an amount)

Keep it one headline. Do not list traits.

### 3. Mint and burn

Transfer from / to `0x0` is not special-cased. It should read as minted or burned, not “sent to a wallet”.

### 4. Historical fiat

`lib/fiat.ts` prices *now*. Genesis “About $X” is a lie. DefiLlama (or similar) at `block.timestamp` for the quote token. If the lookup fails, omit the aside — same as today. Do not invent a number.

### 5. Known names that are not tokens

Uniswap router, WETH, bridges, and the like sometimes resolve via Sourcify / `name()`, sometimes not. A tiny curated map (address → label) next to the token list is enough. Do not scrape Etherscan labels.

WETH `deposit` / `withdraw` should say wrapped / unwrapped, not a generic method.

---

## After that

Once the writer is boringly correct on mainnet:

- **One more EVM chain.** `lib/chains.ts` already has `explorer` + logo. Base is the obvious second (same stories, cheaper to demo). Header already shows a chain mark — wire it to the story, do not add a chain picker page.
- **Messy swaps.** First-outgoing + last-incoming is wrong for some aggregators. Prefer the sender’s net position. Still one pair in the headline, not a hop list.
- **Outcome without chrome.** `story.outcome` exists and is barely shown. A quiet word in the lead is enough; do not add a status pill farm.
- **RPC.** Document `ETH_RPC_URL` in the README. Public fallbacks will rate-limit the live URL. One paid endpoint is an ops change, not a feature.
- **Featured set.** Replace or add one NFT story and one revert once those writers exist. Four is plenty; do not make a gallery.

---

## Later / maybe never

Only if the page still feels unfinished after the above:

- Share image / copy-link on the story (the URL already is the share)
- A one-line “how we read this” for method + token, still not a log dump
- ENS as a first-class party when the *to* is a name
- Internal ETH (value that moved but is not `tx.value`) — easy to turn into an explorer. Skip until a real hash needs it

Never: pagination, watchlists, “recently viewed”.

---

## Open questions

- Is V2 “better Ethereum” or “Ethereum + Base”? Better Ethereum first; add Base when the writer is fixture-backed.
- Do we show NFT images? Almost certainly no — it becomes a mint page.
- Do we keep “View on Etherscan” once the hash itself is the link? Probably yes; it is the escape hatch. Revisit if it feels like leftover chrome.

---

## Tomorrow morning

```bash
git status
```

Today’s UI work may still be uncommitted. Commit that before starting writer work so the story-engine diff stays readable.

Then pick a hash that currently fails (NFT or mint), write the fixture first, then the decoder. One story type per change.
