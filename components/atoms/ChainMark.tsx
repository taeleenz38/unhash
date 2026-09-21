import Image from "next/image"

import { chainLogoUrl, type Chain } from "@/lib/chains"

export function ChainMark({ chain }: { chain: Chain }) {
  return (
    <Image
      src={chainLogoUrl(chain.slug)}
      alt=""
      width={14}
      height={14}
      className="h-3.5 w-3.5 rounded-full"
    />
  )
}
