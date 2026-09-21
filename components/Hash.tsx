import { shorten } from "@/lib/hash"

export function Hash({ children }: { children: string }) {
  return (
    <span
      className="font-mono text-[0.8125rem] tracking-tight text-secondary"
      title={children}
    >
      {shorten(children)}
    </span>
  )
}

export function Account({
  address,
  name,
}: {
  address: string
  name: string | null
}) {
  if (name) return <span className="text-primary">{name}</span>
  return <Hash>{address}</Hash>
}
