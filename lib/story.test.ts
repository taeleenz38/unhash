import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { storyFixtures } from "./story.fixtures"
import { writeStory } from "./story"

describe("writeStory", () => {
  for (const fixture of storyFixtures) {
    it(fixture.name, () => {
      const story = writeStory(fixture.facts)
      assert.equal(story.headline, fixture.story.headline)
      assert.equal(story.lead, fixture.story.lead)
      assert.equal(story.toLabel, fixture.story.toLabel)
      assert.equal(story.value, fixture.story.value)
    })
  }
})
