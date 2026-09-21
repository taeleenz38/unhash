import { shortHex } from "@/lib/formatters"

import { Copy } from "./Copy"

export function Hash({ children }: { children: string }) {
  return (
    <Copy value={children}>
      <span className="font-mono text-[0.8125rem] tracking-tight text-secondary">
        {shortHex(children)}
      </span>
    </Copy>
  )
}
