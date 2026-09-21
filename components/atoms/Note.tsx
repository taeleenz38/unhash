import type { ReactNode } from "react"

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-base leading-7 text-secondary text-pretty">{children}</p>
}
