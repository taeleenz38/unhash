import { parseAbi, type Address, type PublicClient } from "viem"

import { humanizeContractName } from "./formatters"
import { knownLabel } from "./labels"
import type { Party } from "./story"
import { listedToken } from "./token-list"

const nameAbi = parseAbi(["function name() view returns (string)"])

const GENERIC_PROXY = /proxy|upgradeability|initializable|eip1967/i

export async function resolveParty(
  client: PublicClient,
  address: Address,
): Promise<Party> {
  const known = knownLabel(address)
  if (known) return { address, name: known, kind: "contract" }

  const listed = await listedToken(address)
  if (listed) return { address, name: listed.symbol, kind: "contract" }

  const bytecode = await client.getBytecode({ address }).catch(() => undefined)
  if (!bytecode) {
    return { address, name: await ensName(client, address), kind: "wallet" }
  }

  const tokenName = await onChainSymbol(client, address)
  if (tokenName) return { address, name: tokenName, kind: "contract" }

  const ens = await ensName(client, address)
  if (ens) return { address, name: ens, kind: "contract" }

  const onChain = await onChainName(client, address)
  if (onChain) return { address, name: onChain, kind: "contract" }

  const verified = await sourcifyName(address)
  if (verified) return { address, name: verified, kind: "contract" }

  return { address, name: null, kind: "contract" }
}

async function onChainSymbol(
  client: PublicClient,
  address: Address,
): Promise<string | null> {
  try {
    const symbol = await client.readContract({
      address,
      abi: parseAbi(["function symbol() view returns (string)"]),
      functionName: "symbol",
    })
    return symbol || null
  } catch {
    return null
  }
}

async function onChainName(
  client: PublicClient,
  address: Address,
): Promise<string | null> {
  try {
    const name = await client.readContract({
      address,
      abi: nameAbi,
      functionName: "name",
    })
    if (!name || GENERIC_PROXY.test(name)) return null
    return name
  } catch {
    return null
  }
}

async function ensName(
  client: PublicClient,
  address: Address,
): Promise<string | null> {
  try {
    return await client.getEnsName({ address })
  } catch {
    return null
  }
}

async function sourcifyName(address: Address): Promise<string | null> {
  try {
    const response = await fetch(
      `https://sourcify.dev/server/v2/contract/1/${address}?fields=compilation.name,proxyResolution`,
      { signal: AbortSignal.timeout(4_000) },
    )
    if (!response.ok) return null
    const body: unknown = await response.json()
    const raw = pickVerifiedName(body)
    return raw ? humanizeContractName(raw) : null
  } catch {
    return null
  }
}

function pickVerifiedName(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const compilation = "compilation" in body ? body.compilation : null
  const proxy = "proxyResolution" in body ? body.proxyResolution : null
  const compiled =
    compilation && typeof compilation === "object" && "name" in compilation
      ? String(compilation.name)
      : null
  const implementation = firstImplementationName(proxy)
  const candidate =
    implementation && !GENERIC_PROXY.test(implementation)
      ? implementation
      : compiled && !GENERIC_PROXY.test(compiled)
        ? compiled
        : implementation ?? compiled
  return candidate || null
}

function firstImplementationName(proxy: unknown): string | null {
  if (!proxy || typeof proxy !== "object" || !("implementations" in proxy)) return null
  const implementations = proxy.implementations
  if (!Array.isArray(implementations) || implementations.length === 0) return null
  const first = implementations[0]
  if (!first || typeof first !== "object" || !("name" in first) || !first.name) return null
  return String(first.name)
}
