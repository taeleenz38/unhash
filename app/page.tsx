import { FeaturedStories } from "@/components/molecules"
import { HashInput } from "@/components/molecules/HashInput"
import { Shell } from "@/components/templates"

export default function Home() {
  return (
    <Shell>
      <div className="my-auto flex flex-col gap-16">
        <div className="flex flex-col gap-12">
          <h1 className="text-4xl font-semibold tracking-tight text-pretty text-primary sm:text-6xl sm:leading-[1.1]">
            One hash in.
            <br />
            A narrative out.
          </h1>
          <HashInput />
        </div>
        <FeaturedStories />
      </div>
    </Shell>
  )
}
