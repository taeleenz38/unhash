import type { ReactNode } from "react"

import { Fact } from "@/components/molecules"

function Root({ children }: { children: ReactNode }) {
  return <article className="flex flex-col gap-12">{children}</article>
}

function Headline({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-4xl font-semibold tracking-tight break-words text-pretty text-primary sm:text-6xl sm:leading-[1.1]">
      {children}
    </h1>
  )
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-xl leading-8 text-pretty text-primary sm:text-2xl">{children}</p>
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

export const Narrative = Object.assign(Root, { Headline, Lead, Body, Meta, Fact })
