import { Hash } from "@/components/atoms"
import { Copy } from "@/components/atoms/Copy"

export function Account({
  address,
  name,
}: {
  address: string
  name: string | null
}) {
  if (!name) return <Hash>{address}</Hash>
  return (
    <Copy value={address}>
      <span className="text-primary">{name}</span>
    </Copy>
  )
}
