import type { ComponentProps } from "react"

export function Button({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      className={`text-sm text-primary transition-colors hover:text-accent disabled:text-secondary ${className}`}
      {...props}
    />
  )
}
