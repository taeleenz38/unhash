import { shortHex } from "@/lib/formatters"

import { Copy } from "./Copy"

export function Hash({ children, href }: { children: string; href: string }) {
  return (
    <Copy value={children}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={children}
        className="font-mono text-[0.8125rem] tracking-tight text-secondary transition-colors hover:text-accent"
      >
        {shortHex(children)}
      </a>
    </Copy>
  )
}
