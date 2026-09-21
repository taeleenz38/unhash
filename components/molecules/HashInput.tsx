"use client"

import { useActionState, type ReactNode } from "react"

import { readHash } from "@/app/actions"
import { Button, Note, TextInput } from "@/components/atoms"

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
        <TextInput
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
