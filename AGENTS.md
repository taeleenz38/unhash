<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# unhash

Portfolio side project. Recruiters will open the live URL *and* the source. Both have to be good.

One hash in, a narrative out. A public, read-only page. Marketing-quality object, not a dashboard. Do not build another protocol UI.

## Product

- V1 is Ethereum mainnet, one transaction hash, one page. A shareable URL.
- Read-only. No wallets, signing, accounts, saved history, or write path.
- Not an explorer, token tracker, mint page, DEX, or operator console. If it needs a second page of tables, the page failed.
- A stranger on a phone should get it in 30 seconds.

## Code quality

This repo is a showcase. Prefer the change a careful engineer would merge.

- TypeScript strict. No `any`. Narrow at the boundary, keep the rest typed.
- Simple and readable. No extra abstractions, wrappers, or “flexibility” for a single call site.
- Follow existing file structure and conventions. Change as little as possible.
- Production-ready: handle empty, invalid, and failed hash lookups as first-class UI, not `console.error`.
- Name things for the reader. Avoid cleverness.
- Colocate helpers next to the only caller. Do not invent a util/framework layer for one use.
- Do not duplicate JSX, className stacks, or parse/fetch logic. Pages assemble; shared UI is small composable components (`children` / slots, not boolean prop bags). A second copy is a bug.
- Atomic design: `components/{atoms,molecules,organisms,templates}`. New UI goes in the lowest layer that fits. Import from the layer barrel, except `"use client"` files (import by path). A layer only imports from layers below it.

```ts
// ❌
function getData(id: any) {
  try { return fetchTx(id) } catch (e) {}
}

// ✅
async function getTransaction(hash: `0x${string}`): Promise<Transaction> {
  return fetchTransaction(hash)
}
```

## Design

Dark-only. Vercel / Next.js / Solana language: black canvas, high contrast, quiet chrome, one sharp accent.

Tokens in `app/globals.css`. Use the Tailwind classes, never raw hex in components:

| Token | Class |
|---|---|
| `--background` | `bg-background` |
| `--primary` | `text-primary` |
| `--secondary` | `text-secondary` |
| `--accent` | `text-accent` / `bg-accent` |
| `--border` | `border-border` |

- Marketing object, not a dashboard: generous type, real hierarchy, almost no chrome.
- Mobile is the default viewport. Desktop can be richer, not different.
- Verify in the browser before calling UI work done. Exercise the flow (paste hash, empty, error), not just a screenshot. Check every route that shares the state you touched.

## Stack

- Next.js 16 App Router, React 19, Tailwind v4. Read `node_modules/next/dist/docs/` before writing Next code.
- Tailwind tokens live in `@theme inline` in `app/globals.css`. There is no `tailwind.config`.
- Keep the Next.js agent-rules block above this section. `next dev` re-adds it if missing.
