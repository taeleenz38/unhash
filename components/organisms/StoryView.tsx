import { Amount, Hash } from "@/components/atoms"
import { Account } from "@/components/molecules"
import { explorerTxUrl } from "@/lib/chains"
import type { Story } from "@/lib/story"

import { Narrative } from "./Narrative"

export function StoryView({ story }: { story: Story }) {
  return (
    <Narrative>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Narrative.Headline>{story.headline}</Narrative.Headline>
          <Hash href={explorerTxUrl(story.hash)}>{story.hash}</Hash>
        </div>
        <Narrative.Lead>{story.lead}</Narrative.Lead>
        <Narrative.Body>{story.detail}</Narrative.Body>
        {story.aside ? <Narrative.Body>{story.aside}</Narrative.Body> : null}
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
      <a
        href={explorerTxUrl(story.hash)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit text-sm text-secondary transition-colors hover:text-accent"
      >
        View on Etherscan
      </a>
    </Narrative>
  )
}
