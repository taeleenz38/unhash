import type { Metadata } from "next"

import { Note } from "@/components/atoms"
import { HashInput } from "@/components/molecules/HashInput"
import { StoryView } from "@/components/organisms"
import { Shell } from "@/components/templates"
import { loadStory } from "@/lib/ethereum"
import { shortHex } from "@/lib/formatters"

type PageProps = {
  params: Promise<{ hash: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hash } = await params
  const result = await loadStory(hash)

  if (result.kind === "ready" || result.kind === "pending") {
    return { title: result.story.lead }
  }

  return { title: shortHex(hash) }
}

export default async function TransactionPage({ params }: PageProps) {
  const { hash } = await params
  const result = await loadStory(hash)

  return (
    <Shell>
      <div className="flex flex-col gap-16">
        {result.kind === "ready" || result.kind === "pending" ? (
          <StoryView story={result.story} />
        ) : (
          <Note>{copy[result.kind]}</Note>
        )}
        <HashInput>Look up another</HashInput>
      </div>
    </Shell>
  )
}

const copy = {
  invalid: "That is not a transaction hash.",
  missing: "Nothing on mainnet with that hash.",
  unavailable: "The chain did not answer. Try again in a moment.",
} as const
