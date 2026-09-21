import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-8">
      <Link href="/" className="text-sm font-medium tracking-tight text-primary">
        unhash
      </Link>
      <p className="text-xs text-secondary">ethereum</p>
    </header>
  )
}
