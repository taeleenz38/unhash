# unhash

A public, read-only page: one transaction hash in, a narrative out.

Block explorers dump fields. Unhash tells the story — who sent what, to whom, and what changed — as a marketing-quality object a stranger can open on a phone. Not a dashboard. Not another protocol UI.

This is a portfolio side project. The constraint is the product: a single public surface, no accounts, no write path.

## Why

Etherscan and its clones are operator tools. They are good at hex, logs, and internal calls. They are bad at a sentence.

Unhash is the opposite bet. Given one hash, resolve it, then write the transaction the way you would explain it to someone sitting next to you. If that needs a second page of tables, the page failed.

Do not rebuild an explorer, a mint page, a DEX, or `puri.vercel.app`.

## Scope

**In**

- One input: a transaction hash
- One output: a readable narrative (what happened, who was involved, what moved)
- Public and shareable — a URL you can send
- Read-only against public chain data

**Out**

- Wallets, signing, or any write path
- Accounts, auth, or saved history
- Token trackers, address pages, or multi-tx search
- Protocol consoles, indexer dashboards, or “Linear but for chain”

V1 is Ethereum mainnet, one hash, one page. Widen only after that page is good.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
