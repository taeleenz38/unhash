import type { Story } from "@/lib/story"

import { Account, Hash } from "./Hash"
import { Amount } from "./Amount"
import { Narrative } from "./Narrative"

export function StoryView({ story }: { story: Story }) {
  return (
    <Narrative>
      <div className="flex flex-col gap-6">
        <Hash>{story.hash}</Hash>
        <Narrative.Lead>{story.lead}</Narrative.Lead>
        <Narrative.Body>{story.detail}</Narrative.Body>
      </div>
      <Narrative.Meta>
        <Narrative.Fact label="from">
          <Account address={story.from.address} name={story.from.name} />
        </Narrative.Fact>
        <Narrative.Fact label={story.toLabel}>
          {story.to ? (
            <Account address={story.to.address} name={story.to.name} />
          ) : (
            <span className="text-secondary">—</span>
          )}
        </Narrative.Fact>
        <Narrative.Fact label="value">
          <Amount>{story.value}</Amount>
        </Narrative.Fact>
        <Narrative.Fact label="block">
          {story.block ?? <span className="text-secondary">pending</span>}
        </Narrative.Fact>
      </Narrative.Meta>
    </Narrative>
  )
}
