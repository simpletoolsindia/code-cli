import { describe, expect, test } from "bun:test"
import { shouldApplyAgentModel } from "../../../src/cli/cmd/tui/context/local"

describe("local model selection", () => {
  test("applies configured agent model on first agent load", () => {
    expect(shouldApplyAgentModel({ nextAgentName: "build" })).toBe(true)
  })

  test("does not reapply configured agent model during provider sync refreshes", () => {
    expect(shouldApplyAgentModel({ previousAgentName: "build", nextAgentName: "build" })).toBe(false)
  })

  test("applies configured agent model when switching agents", () => {
    expect(shouldApplyAgentModel({ previousAgentName: "build", nextAgentName: "review" })).toBe(true)
  })
})
