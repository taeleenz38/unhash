"use client"

import { Button } from "@/components/Button"
import { Note } from "@/components/Note"
import { Shell } from "@/components/Shell"

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
