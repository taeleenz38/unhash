import Link from "next/link"

import { featuredStories } from "@/lib/featured"

export function FeaturedStories() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-[0.14em] text-secondary">Stories</h2>
      <ul className="flex flex-col gap-5">
        {featuredStories.map((story) => (
          <li key={story.hash}>
            <Link
              href={`/tx/${story.hash}`}
              className="group flex flex-col gap-1"
            >
              <span className="text-sm text-primary transition-colors group-hover:text-accent">
                {story.title}
              </span>
              <span className="text-sm text-secondary">{story.tease}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
