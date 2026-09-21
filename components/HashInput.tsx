"use client"

import { useActionState, type ReactNode } from "react"

import { readHash } from "@/app/actions"

import { Button } from "./Button"
import { Note } from "./Note"

export function HashInput({ children }: { children?: ReactNode }) {
  const [error, action, pending] = useActionState(readHash, null)

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      {children ? (
        <label htmlFor="hash" className="text-sm text-secondary">
          {children}
        </label>
      ) : null}
      <div className="flex items-center gap-4 border-b border-border transition-colors focus-within:border-primary">
        <input
          id="hash"
          name="hash"
          type="text"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          placeholder="0x…"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "hash-error" : undefined}
          className="min-w-0 flex-1 bg-transparent py-4 font-mono text-sm text-primary outline-none placeholder:text-secondary"
        />
        <Button type="submit" disabled={pending} className="shrink-0 text-accent hover:text-primary">
          {pending ? "Reading" : "Read"}
        </Button>
      </div>
      {error ? (
        <Note>
          <span id="hash-error">{error}</span>
        </Note>
      ) : null}
    </form>
  )
}
