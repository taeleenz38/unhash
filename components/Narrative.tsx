import type { ReactNode } from "react"

function Root({ children }: { children: ReactNode }) {
  return <article className="flex flex-col gap-12">{children}</article>
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-3xl font-semibold tracking-tight text-pretty text-primary sm:text-5xl sm:leading-[1.15]">
      {children}
    </h1>
  )
}

function Body({ children }: { children: ReactNode }) {
  return <p className="text-lg leading-8 text-secondary text-pretty">{children}</p>
}

function Meta({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-10 sm:grid-cols-4">
      {children}
    </dl>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <dt className="text-xs uppercase tracking-[0.14em] text-secondary">{label}</dt>
      <dd className="truncate text-sm">{children}</dd>
    </div>
  )
}

export const Narrative = Object.assign(Root, { Lead, Body, Meta, Fact })
