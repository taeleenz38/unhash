import Link from "next/link"

import { ChainMark } from "@/components/atoms"
import { defaultChain } from "@/lib/chains"

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-8">
      <Link href="/" className="text-sm font-medium tracking-tight text-primary">
        unhash
      </Link>
      <p className="flex items-center gap-1.5 text-xs text-primary">
        <ChainMark chain={defaultChain} />
        {defaultChain.name}
      </p>
    </header>
  )
}
