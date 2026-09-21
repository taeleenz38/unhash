"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export function Copy({ value, children }: { value: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <span className="inline-flex max-w-full items-center gap-0.5">
      <span className="min-w-0 truncate">{children}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : `Copy ${value}`}
        aria-live="polite"
        className={`inline-flex size-6 shrink-0 items-center justify-center transition-colors ${
          copied ? "text-accent" : "text-secondary hover:text-primary"
        }`}
      >
        <span className="relative size-3.5">
          <CopyGlyph shown={!copied} />
          <CheckGlyph shown={copied} />
        </span>
      </button>
    </span>
  )
}

function CopyGlyph({ shown }: { shown: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className={`absolute inset-0 transition-all duration-200 ease-out ${
        shown ? "scale-100 opacity-100" : "scale-50 opacity-0"
      }`}
    >
      <rect
        x="5"
        y="1.75"
        width="7.25"
        height="7.25"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M3.05 4.35H2.9A1.15 1.15 0 0 0 1.75 5.5v5.6c0 .64.51 1.15 1.15 1.15h5.6c.64 0 1.15-.51 1.15-1.15v-.15"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  )
}

function CheckGlyph({ shown }: { shown: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className={`absolute inset-0 transition-all duration-200 ease-out ${
        shown ? "scale-100 opacity-100" : "scale-50 opacity-0"
      }`}
    >
      <path
        d="M2.4 7.15 5.45 10.1 11.6 3.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
