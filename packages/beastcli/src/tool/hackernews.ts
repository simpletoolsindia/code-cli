import { Effect, Schema } from "effect"
import * as Tool from "./tool"

type HnItem = {
  id: number
  type?: string
  by?: string
  time?: number
  title?: string
  url?: string
  text?: string
  score?: number
  descendants?: number
  kids?: number[]
  deleted?: boolean
  dead?: boolean
}

const ListParameters = Schema.Struct({
  limit: Schema.optional(Schema.Number).annotate({
    description: "Number of stories to return. Defaults to 10, maximum 50.",
  }),
})

const CommentsParameters = Schema.Struct({
  story_id: Schema.Number.annotate({
    description: "Hacker News story ID to fetch comments for.",
  }),
  limit: Schema.optional(Schema.Number).annotate({
    description: "Number of top-level comments to return. Defaults to 20, maximum 50.",
  }),
})

function clampLimit(limit: number | undefined, fallback: number) {
  return Math.max(1, Math.min(Math.floor(limit ?? fallback), 50))
}

function hnUrl(path: string) {
  return `https://hacker-news.firebaseio.com/v0/${path}.json`
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": "BeastCLI/1.0" },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`Hacker News request failed: ${response.status}`)
  return response.json()
}

function isHnItem(value: unknown): value is HnItem {
  return typeof value === "object" && value !== null && typeof (value as { id?: unknown }).id === "number"
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number")
}

function stripHtml(text: string | undefined) {
  return (text ?? "")
    .replace(/<p>/g, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .trim()
}

function storySummary(item: HnItem) {
  return {
    id: item.id,
    title: item.title ?? "(untitled)",
    url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
    hn_url: `https://news.ycombinator.com/item?id=${item.id}`,
    score: item.score ?? 0,
    comments: item.descendants ?? 0,
    by: item.by ?? "unknown",
    time: item.time,
  }
}

function commentSummary(item: HnItem) {
  return {
    id: item.id,
    by: item.by ?? "unknown",
    text: stripHtml(item.text),
    url: `https://news.ycombinator.com/item?id=${item.id}`,
    time: item.time,
  }
}

async function fetchItem(id: number) {
  const item = await fetchJson(hnUrl(`item/${id}`))
  return isHnItem(item) && !item.deleted && !item.dead ? item : undefined
}

async function fetchStories(endpoint: "topstories" | "newstories" | "beststories", limit: number) {
  const ids = await fetchJson(hnUrl(endpoint))
  if (!isNumberArray(ids)) throw new Error("Hacker News returned an unexpected story list")
  return (await Promise.all(ids.slice(0, limit).map(fetchItem)))
    .filter((item): item is HnItem => item?.type === "story")
    .map(storySummary)
}

function storyTool(id: string, endpoint: "topstories" | "newstories" | "beststories", label: string) {
  return Tool.define(
    id,
    Effect.succeed({
      description: `${label} Hacker News stories with score, author, comment count, source URL, and HN discussion URL.`,
      parameters: ListParameters,
      execute: (params: Schema.Schema.Type<typeof ListParameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          const limit = clampLimit(params.limit, 10)
          yield* ctx.ask({
            permission: "webfetch",
            patterns: ["https://hacker-news.firebaseio.com/*"],
            always: ["*"],
            metadata: { endpoint, limit },
          })
          const stories = yield* Effect.promise(() => fetchStories(endpoint, limit))
          return {
            title: `${label} Hacker News stories`,
            metadata: { endpoint, limit, count: stories.length },
            output: JSON.stringify({ results: stories }, null, 2),
          }
        }).pipe(Effect.orDie),
    }),
  )
}

export const HackerNewsTopTool = storyTool("hackernews_top", "topstories", "Top")
export const HackerNewsNewTool = storyTool("hackernews_new", "newstories", "New")
export const HackerNewsBestTool = storyTool("hackernews_best", "beststories", "Best")

export const HackerNewsCommentsTool = Tool.define(
  "hackernews_get_comments",
  Effect.succeed({
    description: "Fetch a Hacker News story and its top-level comments by story ID.",
    parameters: CommentsParameters,
    execute: (params: Schema.Schema.Type<typeof CommentsParameters>, ctx: Tool.Context) =>
      Effect.gen(function* () {
        const limit = clampLimit(params.limit, 20)
        yield* ctx.ask({
          permission: "webfetch",
          patterns: [`https://hacker-news.firebaseio.com/v0/item/${params.story_id}.json`],
          always: ["*"],
          metadata: { storyID: params.story_id, limit },
        })

        const story = yield* Effect.promise(() => fetchItem(params.story_id))
        if (!story) throw new Error(`Hacker News story not found: ${params.story_id}`)

        const comments = yield* Effect.promise(() =>
          Promise.all((story.kids ?? []).slice(0, limit).map(fetchItem)).then((items) =>
            items.filter((item): item is HnItem => item?.type === "comment").map(commentSummary),
          ),
        )

        return {
          title: `Hacker News comments: ${story.title ?? params.story_id}`,
          metadata: { storyID: story.id, limit, count: comments.length },
          output: JSON.stringify({ story: storySummary(story), comments }, null, 2),
        }
      }).pipe(Effect.orDie),
  }),
)
