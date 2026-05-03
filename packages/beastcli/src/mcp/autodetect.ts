import fs from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { Global } from "@simpletoolsindia/core/global"
import * as Log from "@simpletoolsindia/core/util/log"

const log = Log.create({ service: "mcp-autodetect" })

// Popular MCP servers that can be auto-discovered by package name
const KNOWN_MCP_PACKAGES: Record<string, { name: string; command: string[]; description: string }> = {
  "@upstash/context7-mcp": {
    name: "context7",
    command: ["npx", "-y", "@upstash/context7-mcp"],
    description: "Up-to-date documentation injection",
  },
  "@modelcontextprotocol/server-filesystem": {
    name: "filesystem",
    command: ["npx", "-y", "@modelcontextprotocol/server-filesystem"],
    description: "File system access",
  },
  "@modelcontextprotocol/server-fetch": {
    name: "fetch",
    command: ["npx", "-y", "@modelcontextprotocol/server-fetch"],
    description: "Web fetch capabilities",
  },
  "@modelcontextprotocol/server-git": {
    name: "git",
    command: ["npx", "-y", "@modelcontextprotocol/server-git"],
    description: "Git repository operations",
  },
  "@modelcontextprotocol/server-github": {
    name: "github",
    command: ["npx", "-y", "@modelcontextprotocol/server-github"],
    description: "GitHub API access",
  },
  "@modelcontextprotocol/server-playwright": {
    name: "playwright",
    command: ["npx", "-y", "@modelcontextprotocol/server-playwright"],
    description: "Browser automation",
  },
  "@modelcontextprotocol/server-slack": {
    name: "slack",
    command: ["npx", "-y", "@modelcontextprotocol/server-slack"],
    description: "Slack integration",
  },
  "@modelcontextprotocol/server-postgres": {
    name: "postgres",
    command: ["npx", "-y", "@modelcontextprotocol/server-postgres"],
    description: "PostgreSQL database access",
  },
  "@modelcontextprotocol/server-puppeteer": {
    name: "puppeteer",
    command: ["npx", "-y", "@modelcontextprotocol/server-puppeteer"],
    description: "Headless browser automation",
  },
  "@modelcontextprotocol/server-brave-search": {
    name: "brave-search",
    command: ["npx", "-y", "@modelcontextprotocol/server-brave-search"],
    description: "Brave web search",
  },
  "sequential-thinking": {
    name: "sequential-thinking",
    command: ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"],
    description: "Sequential reasoning chain",
  },
  "@benborla29/mcp-server-mysql": {
    name: "mysql",
    command: ["npx", "-y", "@benborla29/mcp-server-mysql"],
    description: "MySQL database access",
  },
}

// External MCP config locations to scan
const EXTERNAL_CONFIG_PATHS = [
  // Claude Desktop
  {
    name: "Claude Desktop",
    paths: [
      path.join(Global.Path.home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      path.join(Global.Path.home, ".claude", "settings.json"),
    ],
    parser: "claude",
  },
  // Cursor
  {
    name: "Cursor",
    paths: [
      path.join(Global.Path.home, ".cursor", "mcp.json"),
    ],
    parser: "cursor",
  },
  // Windsurf
  {
    name: "Windsurf",
    paths: [
      path.join(Global.Path.home, ".codeium", "windsurf", "mcp_config.json"),
    ],
    parser: "cursor",
  },
  // Cline
  {
    name: "Cline",
    paths: [
      path.join(Global.Path.home, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json"),
    ],
    parser: "cline",
  },
]

export interface DiscoveredMCP {
  source: string
  name: string
  config: { type: "local"; command: string[] } | { type: "remote"; url: string }
  description?: string
}

export interface DiscoveryResult {
  fromExternalConfig: DiscoveredMCP[]
  fromPackages: DiscoveredMCP[]
}

// Parse Claude Desktop config format
function parseClaudeConfig(data: any, sourceName: string): DiscoveredMCP[] {
  const results: DiscoveredMCP[] = []
  const mcpServers = data.mcpServers ?? data.mcp_servers ?? {}

  for (const [name, cfg] of Object.entries(mcpServers)) {
    const entry = cfg as any
    if (entry.command && Array.isArray(entry.command)) {
      results.push({
        source: sourceName,
        name,
        config: { type: "local", command: entry.command },
        description: entry.description,
      })
    } else if (entry.url) {
      results.push({
        source: sourceName,
        name,
        config: { type: "remote", url: entry.url },
        description: entry.description,
      })
    }
  }

  return results
}

// Parse Cursor/Windsurf config format
function parseCursorConfig(data: any, sourceName: string): DiscoveredMCP[] {
  const results: DiscoveredMCP[] = []
  const mcpServers = data.mcpServers ?? {}

  for (const [name, cfg] of Object.entries(mcpServers)) {
    const entry = cfg as any
    if (entry.command) {
      const cmd = typeof entry.command === "string" ? entry.command.split(" ") : entry.command
      results.push({
        source: sourceName,
        name,
        config: { type: "local", command: cmd },
        description: entry.description || entry.args?.join(" "),
      })
    } else if (entry.url) {
      results.push({
        source: sourceName,
        name,
        config: { type: "remote", url: entry.url },
        description: entry.description,
      })
    }
  }

  return results
}

// Parse Cline config format
function parseClineConfig(data: any, sourceName: string): DiscoveredMCP[] {
  const results: DiscoveredMCP[] = []

  for (const [name, cfg] of Object.entries(data)) {
    const entry = cfg as any
    if (entry.command) {
      const cmd = typeof entry.command === "string" ? entry.command.split(" ") : entry.command
      results.push({
        source: sourceName,
        name,
        config: { type: "local", command: cmd },
        description: entry.args?.join(" "),
      })
    } else if (entry.url) {
      results.push({
        source: sourceName,
        name,
        config: { type: "remote", url: entry.url },
      })
    }
  }

  return results
}

// Scan external MCP config files
async function scanExternalConfigs(): Promise<DiscoveredMCP[]> {
  const results: DiscoveredMCP[] = []

  for (const config of EXTERNAL_CONFIG_PATHS) {
    for (const filePath of config.paths) {
      if (!existsSync(filePath)) continue

      try {
        const content = await fs.readFile(filePath, "utf-8")
        const data = JSON.parse(content)

        let parsed: DiscoveredMCP[]
        switch (config.parser) {
          case "claude":
            parsed = parseClaudeConfig(data, config.name)
            break
          case "cursor":
            parsed = parseCursorConfig(data, config.name)
            break
          case "cline":
            parsed = parseClineConfig(data, config.name)
            break
          default:
            parsed = []
        }

        results.push(...parsed)
      } catch (err) {
        log.debug("failed to parse external MCP config", { path: filePath, error: err instanceof Error ? err.message : String(err) })
      }
    }
  }

  return results
}

// Scan project node_modules for known MCP packages
async function scanNodeModules(projectDir: string): Promise<DiscoveredMCP[]> {
  const results: DiscoveredMCP[] = []
  const nodeModulesPath = path.join(projectDir, "node_modules")

  if (!existsSync(nodeModulesPath)) return results

  try {
    const entries = await fs.readdir(nodeModulesPath)

    for (const entry of entries) {
      // Check scoped packages like @upstash/context7-mcp
      if (entry.startsWith("@")) {
        const scopedEntries = await fs.readdir(path.join(nodeModulesPath, entry)).catch(() => [])
        for (const scopedEntry of scopedEntries) {
          const fullPkg = `${entry}/${scopedEntry}`
          if (fullPkg in KNOWN_MCP_PACKAGES) {
            const info = KNOWN_MCP_PACKAGES[fullPkg]
            results.push({
              source: "node_modules",
              name: info.name,
              config: { type: "local", command: [...info.command] },
              description: info.description,
            })
          }
        }
      }
      // Check regular packages like sequential-thinking
      else if (entry in KNOWN_MCP_PACKAGES) {
        const info = KNOWN_MCP_PACKAGES[entry]
        results.push({
          source: "node_modules",
          name: info.name,
          config: { type: "local", command: [...info.command] },
          description: info.description,
        })
      }
    }
  } catch (err) {
    log.debug("failed to scan node_modules", { error: err instanceof Error ? err.message : String(err) })
  }

  return results
}

// Main discovery function
export async function discoverMcpServers(projectDir: string): Promise<DiscoveryResult> {
  log.info("discovering MCP servers", { projectDir })

  const [fromExternalConfig, fromPackages] = await Promise.all([
    scanExternalConfigs(),
    scanNodeModules(projectDir),
  ])

  // Deduplicate by name + source
  const seen = new Set<string>()
  const uniqueExternal = fromExternalConfig.filter((m) => {
    const key = `${m.source}:${m.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const uniquePackages = fromPackages.filter((m) => {
    const key = `${m.source}:${m.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { fromExternalConfig: uniqueExternal, fromPackages: uniquePackages }
}
