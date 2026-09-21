import Link from "next/link"

import { HashInput } from "@/components/molecules/HashInput"
import { Shell } from "@/components/templates"
import { EXAMPLE_TX_HASH } from "@/lib/hash"

export default function Home() {
  return (
    <Shell>
      <div className="my-auto flex flex-col gap-12">
        <h1 className="text-4xl font-semibold tracking-tight text-pretty text-primary sm:text-6xl sm:leading-[1.1]">
          One hash in.
          <br />
          A narrative out.
        </h1>
        <HashInput />
        <Link
          href={`/tx/${EXAMPLE_TX_HASH}`}
          className="w-fit text-sm text-secondary transition-colors hover:text-primary"
        >
          The first Ethereum transaction →
        </Link>
      </div>
    </Shell>
  )
}
