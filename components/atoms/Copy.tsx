"use client"

import { useState, type ReactNode } from "react"

export function Copy({ value, children }: { value: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title={copied ? "Copied" : value}
      aria-label={copied ? "Copied" : `Copy ${value}`}
      className="inline-flex max-w-full items-baseline gap-2 text-left transition-colors hover:text-primary"
    >
      <span className="truncate">{children}</span>
      {copied ? <span className="text-xs text-secondary">copied</span> : null}
    </button>
  )
}
