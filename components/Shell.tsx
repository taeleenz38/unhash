import type { ReactNode } from "react"

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-16 pb-24 sm:px-8 sm:pt-24">
      {children}
    </main>
  )
}
