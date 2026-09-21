import { BaseError, type PublicClient, type Transaction } from "viem"

export async function revertReason(
  client: PublicClient,
  tx: Transaction,
): Promise<string | null> {
  if (!tx.to || tx.blockNumber === null) return null
  try {
    await client.call({
      account: tx.from,
      to: tx.to,
      data: tx.input,
      value: tx.value,
      blockNumber: tx.blockNumber,
    })
    return null
  } catch (error) {
    return humanizeRevert(error)
  }
}

function humanizeRevert(error: unknown): string | null {
  const raw = error instanceof BaseError ? error.shortMessage : null
  if (!raw) return null
  const reason = raw
    .replace(/^.*reverted with the following reason:\n?/i, "")
    .replace(/^.*reverted:\s*/i, "")
    .replace(/^execution reverted:?\s*/i, "")
    .replace(/\.$/, "")
    .trim()
  if (!reason || /execution reverted/i.test(reason) || reason.length > 120) return null
  return `Revert: ${reason}.`
}
