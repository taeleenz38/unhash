import Link from "next/link"

export function Back() {
  return (
    <Link
      href="/"
      aria-label="Back"
      className="-ml-2 inline-flex size-10 items-center justify-center text-secondary transition-colors hover:text-primary"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          d="M15 9H4M8.5 4.5 4 9l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}
