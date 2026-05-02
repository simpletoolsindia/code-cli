import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import * as McpExa from "./mcp-exa"
import { Config } from "@/config/config"
import * as Log from "@simpletoolsindia/core/util/log"
import { HttpClient } from "effect/unstable/http"

const log = Log.create({ service: "tool.websearch" })

export const Parameters = Schema.Struct({
  query: Schema.String.annotate({ description: "Websearch query" }),
  numResults: Schema.optional(Schema.Number).annotate({
    description: "Number of search results to return (default: 8)",
  }),
  livecrawl: Schema.optional(Schema.Literals(["fallback", "preferred"])).annotate({
    description:
      "Live crawl mode - 'fallback': use live crawling as backup if cached content unavailable, 'preferred': prioritize live crawling (default: 'fallback')",
  }),
  type: Schema.optional(Schema.Literals(["auto", "fast", "deep"])).annotate({
    description: "Search type - 'auto': balanced search (default), 'fast': quick results, 'deep': comprehensive search",
  }),
  contextMaxCharacters: Schema.optional(Schema.Number).annotate({
    description: "Maximum characters for context string optimized for LLMs (default: 10000)",
  }),
})

// DuckDuckGo fallback — zero-config, always available
async function searchDuckDuckGo(query: string, numResults: number): Promise<string> {
  const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}&kl=us-en`
  try {
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

    const results: { title: string; url: string; snippet: string }[] = []
    for (let i = 0; i < Math.min(linkMatches.length, numResults); i++) {
      const [, href, titleText] = linkMatches[i]
      const snippet = snippetMatches[i] ? snippetMatches[i][1].replace(/<[^\u003e]*>/g, " ").replace(/\s+/g, " ").trim() : ""
      results.push({
        title: titleText.trim(),
        url: href.startsWith("http") ? href : `https://lite.duckduckgo.com${href}`,
        snippet,
      })
    }

    if (results.length === 0) return "No results found from DuckDuckGo."
    return [
      `Search results for "${query}":`,
      "",
      ...results.map((r, i) => [`${i + 1}. ${r.title}`, `   URL: ${r.url}`, `   ${r.snippet}`, ""].join("\n")),
    ].join("\n")
  } catch (error) {
    return `DuckDuckGo search failed: ${error instanceof Error ? error.message : String(error)}`
  }
}

async function searchSearxng(
  query: string,
  baseURL: string,
  numResults: number,
  timeout: number,
): Promise<string> {
  const searchURL = `${baseURL.replace(/\/$/, "")}/search?q=${encodeURIComponent(query)}&format=json`
  const response = await fetch(searchURL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "BeastCLI/2.0",
    },
    signal: AbortSignal.timeout(timeout),
  })
  if (!response.ok) throw new Error(`SearXNG returned ${response.status}: ${response.statusText}`)

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

  if (results.length === 0) return "No results found from SearXNG."
  return [
    `Search results for "${query}":`,
    "",
    ...results.map(
      (r: any, i: number) =>
        [`${i + 1}. ${r.title}`, `   URL: ${r.url}`, `   ${r.content.substring(0, 300)}${r.content.length > 300 ? "..." : ""}`, ""].join("\n"),
    ),
  ].join("\n")
}

export const WebSearchTool = Tool.define(
  "websearch",
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient
    const cfg = yield* Config.Service

    return {
      description:
        "Search the web. Uses the configured search engine (DuckDuckGo, Exa AI, or SearXNG) with automatic DuckDuckGo fallback.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const config = yield* cfg.get()
          // Cast to access new config fields that are in the backend schema but may not yet be in the SDK types
          const runtimeConfig = config as any
          const engine = runtimeConfig.search_engine ?? "exa"
          const numResults = Math.min(params.numResults || 8, 15)
          let output: string
          let usedEngine = engine
          let fallback = false

          switch (engine) {
            case "ddg": {
              output = yield* Effect.promise(() => searchDuckDuckGo(params.query, numResults))
              break
            }
            case "searxng": {
              const searxngURL = runtimeConfig.search_config?.searxng_url ?? ""
              if (!searxngURL) {
                output = yield* Effect.promise(() => searchDuckDuckGo(params.query, numResults))
                usedEngine = "ddg"
                fallback = true
              } else {
                const timeout = config.experimental?.search_timeout ?? 15_000
                try {
                  output = yield* Effect.promise(() => searchSearxng(params.query, searxngURL, numResults, timeout))
                } catch (error) {
                  const msg = error instanceof Error ? error.message : String(error)
                  log.warn("searxng failed, falling back to ddg", { error: msg, query: params.query })
                  output = yield* Effect.promise(() => searchDuckDuckGo(params.query, numResults))
                  usedEngine = "ddg"
                  fallback = true
                }
              }
              break
            }
            case "exa":
            default: {
              try {
                const result = yield* McpExa.call(
                  http,
                  "web_search_exa",
                  McpExa.SearchArgs,
                  {
                    query: params.query,
                    type: params.type || "auto",
                    numResults: numResults,
                    livecrawl: params.livecrawl || "fallback",
                    contextMaxCharacters: params.contextMaxCharacters,
                  },
                  "25 seconds",
                )
                output = result ?? "No search results found from Exa."
              } catch (error) {
                const msg = error instanceof Error ? error.message : String(error)
                log.warn("exa search failed, falling back to ddg", { error: msg, query: params.query })
                output = yield* Effect.promise(() => searchDuckDuckGo(params.query, numResults))
                usedEngine = "ddg"
                fallback = true
              }
              break
            }
          }

          if (fallback) {
            output = `⚠ ${engine} search failed. Results from DuckDuckGo fallback:\n\n${output}`
          }

          return {
            output,
            title: `Web search (${usedEngine}${fallback ? " fallback" : ""}): ${params.query}`,
            metadata: { engine: usedEngine },
          }
        }).pipe(Effect.orDie),
    }
  }),
)
