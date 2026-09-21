import type { ComponentProps } from "react"

export function TextInput({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`min-w-0 flex-1 bg-transparent py-4 font-mono text-sm text-primary outline-none placeholder:text-secondary ${className}`}
      {...props}
    />
  )
}
