"use client"

import { Button, Note } from "@/components/atoms"
import { Shell } from "@/components/templates"

export default function Error({ retry }: { retry: () => void }) {
  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <Note>Something broke while reading this hash.</Note>
        <Button type="button" onClick={retry} className="w-fit text-accent hover:text-primary">
          Try again
        </Button>
      </div>
    </Shell>
  )
}
