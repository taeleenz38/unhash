import { Hash } from "@/components/atoms"

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
