import { Effect, Schema } from "effect"
import * as Tool from "./tool"

type OEmbed = {
  title?: string
  author_name?: string
  author_url?: string
  thumbnail_url?: string
  provider_name?: string
  provider_url?: string
}

type TranscriptSegment = {
  text?: string
  start?: number
  duration?: number
}

const TranscriptParameters = Schema.Struct({
  url: Schema.String.annotate({
    description: "YouTube video URL or 11-character video ID.",
  }),
})

const VideoInfoParameters = Schema.Struct({
  video_id: Schema.optional(Schema.String).annotate({
    description: "YouTube 11-character video ID.",
  }),
  url: Schema.optional(Schema.String).annotate({
    description: "YouTube video URL. Used when video_id is not provided.",
  }),
})

const SearchParameters = Schema.Struct({
  query: Schema.String.annotate({
    description: "Search query for YouTube videos.",
  }),
  limit: Schema.optional(Schema.Number).annotate({
    description: "Number of videos to return. Defaults to 10, maximum 25.",
  }),
})

const SummarizeParameters = Schema.Struct({
  transcript: Schema.String.annotate({
    description: "Transcript text to summarize.",
  }),
  max_words: Schema.optional(Schema.Number).annotate({
    description: "Maximum summary length in words. Defaults to 500.",
  }),
})

function clampLimit(limit: number | undefined, fallback: number, max: number) {
  return Math.max(1, Math.min(Math.floor(limit ?? fallback), max))
}

function extractVideoId(input: string | undefined) {
  if (!input) return undefined
  return (
    input.match(/(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ??
    input.match(/^([a-zA-Z0-9_-]{11})$/)?.[1]
  )
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "BeastCLI/1.0" },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`YouTube request failed: ${response.status}`)
  return response.text()
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": "BeastCLI/1.0" },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`YouTube request failed: ${response.status}`)
  return response.json()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isOEmbed(value: unknown): value is OEmbed {
  return isRecord(value)
}

function textFromTranscriptJson(value: unknown) {
  if (!Array.isArray(value)) return undefined
  return value
    .filter((item): item is TranscriptSegment => isRecord(item) && typeof item.text === "string")
    .map((item) => item.text?.replace(/\s+/g, " ").trim())
    .filter((text): text is string => Boolean(text))
    .join("\n")
}

function textFromTranscriptXml(value: string) {
  return Array.from(value.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g))
    .map((match) =>
      match[1]
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .join("\n")
}

function textFromTranscriptResponse(value: string) {
  if (!value.trim().startsWith("[")) return textFromTranscriptXml(value) || value
  try {
    return textFromTranscriptJson(JSON.parse(value))
  } catch {
    return undefined
  }
}

async function fetchTranscript(videoId: string) {
  const results = await Promise.allSettled([
    fetchText(`https://youtubetranscript.com/?video=${videoId}`),
    fetchText(`https://video.google.com/timedtext?lang=en&v=${videoId}`),
  ])
  const transcript = results
    .filter((item): item is PromiseFulfilledResult<string> => item.status === "fulfilled")
    .map((item) => textFromTranscriptResponse(item.value))
    .find((item) => item && item.length > 50 && !item.includes("<html") && !item.includes("<!DOCTYPE"))

  if (transcript) return transcript

  throw new Error("No English transcript was found for this video")
}

async function fetchVideoInfo(videoId: string) {
  const data = await fetchJson(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
  )
  if (!isOEmbed(data)) throw new Error("YouTube returned unexpected video metadata")
  return {
    video_id: videoId,
    title: typeof data.title === "string" ? data.title : undefined,
    author_name: typeof data.author_name === "string" ? data.author_name : undefined,
    author_url: typeof data.author_url === "string" ? data.author_url : undefined,
    thumbnail_url: typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined,
    video_url: `https://www.youtube.com/watch?v=${videoId}`,
    provider_name: typeof data.provider_name === "string" ? data.provider_name : "YouTube",
    provider_url: typeof data.provider_url === "string" ? data.provider_url : "https://www.youtube.com/",
  }
}

function uniqueVideos(html: string, limit: number) {
  return Array.from(
    html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"[\s\S]{0,1200}?"title":\{"runs":\[\{"text":"([^"]+)"/g),
  )
    .map((match) => ({
      video_id: match[1],
      title: match[2].replace(/\\"/g, '"'),
      url: `https://www.youtube.com/watch?v=${match[1]}`,
    }))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.video_id === item.video_id) === index)
    .slice(0, limit)
}

function summarizeTranscript(transcript: string, maxWords: number) {
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return transcript.trim()

  const sentences = transcript
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).length > 6)

  const selected = sentences.slice(0, Math.max(1, Math.ceil(sentences.length * 0.3))).join(" ")
  const summaryWords = (selected || transcript).split(/\s+/).filter(Boolean).slice(0, maxWords)
  return `${summaryWords.join(" ")}${summaryWords.length >= maxWords ? "..." : ""}`
}

export const YouTubeTranscriptTool = Tool.define(
  "youtube_transcript",
  Effect.succeed({
    description: "Get the transcript text for a YouTube video URL or video ID.",
    parameters: TranscriptParameters,
    execute: (params: Schema.Schema.Type<typeof TranscriptParameters>, ctx: Tool.Context) =>
      Effect.gen(function* () {
        const videoId = extractVideoId(params.url)
        if (!videoId) throw new Error("Invalid YouTube URL or video ID")

        yield* ctx.ask({
          permission: "webfetch",
          patterns: [`https://www.youtube.com/watch?v=${videoId}`],
          always: ["*"],
          metadata: { videoID: videoId },
        })

        const transcript = yield* Effect.promise(() => fetchTranscript(videoId))
        return {
          title: `YouTube transcript: ${videoId}`,
          metadata: { videoID: videoId },
          output: transcript,
        }
      }).pipe(Effect.orDie),
  }),
)

export const YouTubeVideoInfoTool = Tool.define(
  "youtube_video_info",
  Effect.succeed({
    description: "Get basic YouTube video metadata without requiring a YouTube API key.",
    parameters: VideoInfoParameters,
    execute: (params: Schema.Schema.Type<typeof VideoInfoParameters>, ctx: Tool.Context) =>
      Effect.gen(function* () {
        const videoId = params.video_id ?? extractVideoId(params.url)
        if (!videoId) throw new Error("Provide a YouTube video_id or url")

        yield* ctx.ask({
          permission: "webfetch",
          patterns: [`https://www.youtube.com/watch?v=${videoId}`],
          always: ["*"],
          metadata: { videoID: videoId },
        })

        const info = yield* Effect.promise(() => fetchVideoInfo(videoId))
        return {
          title: `YouTube video: ${info.title ?? videoId}`,
          metadata: { videoID: videoId },
          output: JSON.stringify(info, null, 2),
        }
      }).pipe(Effect.orDie),
  }),
)

export const YouTubeSearchTool = Tool.define(
  "youtube_search",
  Effect.succeed({
    description: "Search YouTube videos and return video IDs, titles, and watch URLs.",
    parameters: SearchParameters,
    execute: (params: Schema.Schema.Type<typeof SearchParameters>, ctx: Tool.Context) =>
      Effect.gen(function* () {
        const limit = clampLimit(params.limit, 10, 25)
        yield* ctx.ask({
          permission: "webfetch",
          patterns: ["https://www.youtube.com/results*"],
          always: ["*"],
          metadata: { query: params.query, limit },
        })

        const html = yield* Effect.promise(() =>
          fetchText(`https://www.youtube.com/results?search_query=${encodeURIComponent(params.query)}`),
        )
        const videos = uniqueVideos(html, limit)
        return {
          title: `YouTube search: ${params.query}`,
          metadata: { query: params.query, limit, count: videos.length },
          output: JSON.stringify({ results: videos }, null, 2),
        }
      }).pipe(Effect.orDie),
  }),
)

export const YouTubeSummarizeTool = Tool.define(
  "youtube_summarize",
  Effect.succeed({
    description: "Create a short extractive summary from YouTube transcript text.",
    parameters: SummarizeParameters,
    execute: (params: Schema.Schema.Type<typeof SummarizeParameters>) =>
      Effect.succeed({
        title: "YouTube transcript summary",
        metadata: { maxWords: clampLimit(params.max_words, 500, 2_000) },
        output: summarizeTranscript(params.transcript, clampLimit(params.max_words, 500, 2_000)),
      }),
  }),
)
