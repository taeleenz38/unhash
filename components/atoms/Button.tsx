import type { ComponentProps } from "react"

export function Button({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      className={`appearance-none bg-transparent text-sm transition-colors disabled:text-secondary ${className}`}
      {...props}
    />
  )
}
