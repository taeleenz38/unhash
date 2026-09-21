import { Hash } from "@/components/atoms"
import { Copy } from "@/components/atoms/Copy"
import { explorerAddressUrl } from "@/lib/chains"

export function Account({
  address,
  name,
}: {
  address: string
  name: string | null
}) {
  if (!name) return <Hash href={explorerAddressUrl(address)}>{address}</Hash>
  return (
    <Copy value={address}>
      <a
        href={explorerAddressUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
        title={address}
        className="text-primary transition-colors hover:text-accent"
      >
        {name}
      </a>
    </Copy>
  )
}
