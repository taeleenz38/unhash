export function NarrativeSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden>
      <div className="flex flex-col gap-3">
        <div className="h-10 w-5/6 animate-pulse rounded-md bg-border" />
        <div className="h-10 w-3/5 animate-pulse rounded-md bg-border" />
      </div>
      <div className="h-5 w-2/5 animate-pulse rounded-md bg-border" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-10 sm:grid-cols-4">
        <div className="h-10 rounded-md bg-border" />
        <div className="h-10 rounded-md bg-border" />
        <div className="h-10 rounded-md bg-border" />
        <div className="h-10 rounded-md bg-border" />
      </div>
    </div>
  )
}
