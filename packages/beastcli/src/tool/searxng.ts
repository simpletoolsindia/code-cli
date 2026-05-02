import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import * as Log from "@simpletoolsindia/core/util/log"
import { Config } from "@/config/config"

const log = Log.create({ service: "tool.searxng" })

async function searchSearxng(
  query: string,
  baseURL: string,
  numResults: number,
  timeout: number,
): Promise<{ title: string; url: string; content: string }[]> {
  const searchURL = `${baseURL.replace(/\/$/, "")}/search?q=${encodeURIComponent(query)}&format=json`
  const response = await fetch(searchURL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "BeastCLI/2.0",
    },
    signal: AbortSignal.timeout(timeout),
  })
  if (!response.ok) {
    throw new Error(`SearXNG returned ${response.status}: ${response.statusText}`)
  }
  const data: unknown = await response.json()

  if (!data || typeof data !== "object" || !("results" in data) || !Array.isArray(data.results)) {
    throw new Error("SearXNG returned unexpected JSON format")
  }

  const results = data.results
    .slice(0, numResults)
    .map((r: any) => ({
      title: String(r.title || "No title"),
      url: String(r.url || ""),
      content: String(r.content || r.abstract || r.summary || "").replace(/\s+/g, " ").trim(),
    }))
    .filter((r: any) => r.url && r.title)

  return results
}

async function searchDuckDuckGoFallback(query: string, numResults: number): Promise<{ title: string; url: string; content: string }[]> {
  const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}&kl=us-en`
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 BeastCLI/2.0",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`DuckDuckGo returned ${response.status}`)
  const html = await response.text()

  const linkMatches = Array.from(
    html.matchAll(/<a[^\u003e]*class="result-link"[^\u003e]*href="([^"]+)"[^\u003e]*>([^\u003c]*)<\/a>/gi),
  )
  const snippetMatches = Array.from(
    html.matchAll(/<td[^\u003e]*class="result-snippet"[^\u003e]*>([\s\S]*?)<\/td>/gi),
  )

  const results: { title: string; url: string; content: string }[] = []
  for (let i = 0; i < Math.min(linkMatches.length, numResults); i++) {
    const [, href, titleText] = linkMatches[i]
    const snippet = snippetMatches[i] ? snippetMatches[i][1].replace(/<[^\u003e]*>/g, " ").replace(/\s+/g, " ").trim() : ""
    results.push({
      title: titleText.trim(),
      url: href.startsWith("http") ? href : `https://lite.duckduckgo.com${href}`,
      content: snippet,
    })
  }
  return results
}

export const SearxngSearchArgs = Schema.Struct({
  query: Schema.String,
  numResults: Schema.Number,
})

export const SearxngSearchTool = Tool.define(
  "searxng_search",
  Effect.gen(function* () {
    const cfg = yield* Config.Service
    const config = yield* cfg.get()
    const baseURL = config.search_config?.searxng_url ?? ""
    const timeout = config.experimental?.search_timeout ?? 15_000

    return {
      description:
        "Search the web using a self-hosted SearXNG instance. Returns search results with titles, URLs, and snippets. " +
        (baseURL ? `Configured instance: ${baseURL}` : "Requires searxng_url to be configured via /searchweb command."),
      parameters: SearxngSearchArgs,
      execute: (params: Schema.Schema.Type<typeof SearxngSearchArgs>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          if (!baseURL) {
            return {
              title: `SearXNG search: ${params.query}`,
              output: "No SearXNG instance configured. Run /searchweb and select 'SearXNG' to set your instance URL.",
              metadata: {},
            }
          }

          yield* ctx.ask({
            permission: "websearch",
            patterns: [params.query],
            always: ["*"],
            metadata: { query: params.query, numResults: params.numResults },
          })

          let results: { title: string; url: string; content: string }[] = []
          let fallbackUsed = false
          const numResults = Math.min(params.numResults || 8, 15)

          try {
            results = yield* Effect.promise(() => searchSearxng(params.query, baseURL, numResults, timeout))
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            log.warn("searxng failed, falling back to DuckDuckGo", { error: msg, query: params.query })
            results = yield* Effect.promise(() => searchDuckDuckGoFallback(params.query, numResults))
            fallbackUsed = true
          }

          if (results.length === 0) {
            return {
              title: `SearXNG search: ${params.query}`,
              output: "No results found.",
              metadata: {},
            }
          }

          const header = fallbackUsed
            ? `SearXNG failed (${baseURL}). Results from DuckDuckGo fallback for "${params.query}":`
            : `Search results for "${params.query}":`

          const lines = [
            header,
            "",
            ...results.map(
              (r, i) => [`${i + 1}. ${r.title}`, `   URL: ${r.url}`, `   ${r.content.substring(0, 300)}${r.content.length > 300 ? "..." : ""}`, ""].join("\n"),
            ),
          ]

          return {
            title: `SearXNG search: ${params.query}`,
            output: lines.join("\n"),
            metadata: {},
          }
        }).pipe(Effect.orDie),
    }
  }),
)
