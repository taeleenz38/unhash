"use client"

import { useActionState, useState, type ReactNode } from "react"

import { readHash } from "@/app/actions"
import { Button, Note, TextInput } from "@/components/atoms"
import { parseHash } from "@/lib/hash"

const invalidCopy = "That is not a transaction hash."

export function HashInput({ children }: { children?: ReactNode }) {
  const [error, action, pending] = useActionState(readHash, null)
  const [value, setValue] = useState("")

  const hash = parseHash(value)
  const message = hash || !value.trim() ? null : invalidHashMessage(value) ?? error

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
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? "hash-error" : undefined}
        />
        <Button
          type="submit"
          disabled={!hash || pending}
          className={`shrink-0 ${
            hash ? "text-primary hover:text-primary" : "text-secondary hover:text-secondary"
          }`}
        >
          {pending ? "Reading" : "Read"}
        </Button>
      </div>
      {message ? (
        <Note>
          <span id="hash-error">{message}</span>
        </Note>
      ) : null}
    </form>
  )
}

function invalidHashMessage(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed || parseHash(trimmed) || isHashDraft(trimmed)) return null
  return invalidCopy
}

function isHashDraft(value: string): boolean {
  return /^(0x)?[0-9a-f]*$/i.test(value) && value.replace(/^0x/i, "").length <= 64
}
