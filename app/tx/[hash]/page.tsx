import type { Metadata } from "next"

import { HashInput } from "@/components/HashInput"
import { Note } from "@/components/Note"
import { Shell } from "@/components/Shell"
import { StoryView } from "@/components/StoryView"
import { loadStory } from "@/lib/ethereum"
import { shorten } from "@/lib/hash"

type PageProps = {
  params: Promise<{ hash: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hash } = await params
  const result = await loadStory(hash)

  if (result.kind === "ready" || result.kind === "pending") {
    return { title: result.story.lead }
  }

  return { title: shorten(hash) }
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
