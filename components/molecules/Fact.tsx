import type { ReactNode } from "react"

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <dt className="text-xs uppercase tracking-[0.14em] text-secondary">{label}</dt>
      <dd className="truncate text-sm">{children}</dd>
    </div>
  )
}
