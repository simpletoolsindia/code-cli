// Configuration System for Beast CLI

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

export interface BeastSessionConfig {
  provider?: string
  model?: string
  contextSize?: string  // '8K', '16K', '32K', '64K', '128K'
  contextMax?: number   // numeric tokens
}

// Full beast config
export interface BeastConfig extends BeastSessionConfig {
  // Permission
  defaultMode?: 'plan' | 'default' | 'acceptEdits' | 'auto' | 'bypass' | 'dontAsk'

  // Model settings
  temperature?: number
  maxTokens?: number

  // Tool settings
  maxToolResultChars?: number
  toolTimeout?: number

  // UI settings
  theme?: string

  // MCP settings
  mcpServers?: Record<string, {
    type: 'stdio' | 'http'
    command?: string
    url?: string
  }>
}

// ── Config file paths ──────────────────────────────────────────────────────

function getConfigDir(): string {
  return resolve(process.env.HOME ?? '~', '.beast-cli')
}

function getConfigPath(): string {
  return resolve(getConfigDir(), 'session.json')
}

// ── Session config (lightweight JSON for provider/model) ───────────────────

export interface SessionConfig {
  provider: string
  model: string
  contextSize: string
  contextMax: number
  savedAt: number  // timestamp
}

export function saveSession(config: SessionConfig): void {
  try {
    const dir = getConfigDir()
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.warn('Failed to save session config:', error)
  }
}

export function loadSession(): SessionConfig | null {
  try {
    const path = getConfigPath()
    if (!existsSync(path)) return null
    const data = JSON.parse(readFileSync(path, 'utf-8'))
    // Validate required fields
    if (!data.provider || !data.model || !data.contextSize || !data.contextMax) {
      return null
    }
    return data as SessionConfig
  } catch {
    return null
  }
}

export function clearSession(): void {
  try {
    const path = getConfigPath()
    if (existsSync(path)) {
      writeFileSync(path, JSON.stringify({ clearedAt: Date.now() }), 'utf-8')
    }
  } catch {}
}

// ── Legacy YAML config (for backward compat) ───────────────────────────────

function expandEnvVars(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (_, varName) => {
    return process.env[varName] ?? ''
  })
}

function parseConfig(content: string): Partial<BeastConfig> {
  const config: Record<string, unknown> = {}
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.trim().startsWith('#') || !line.trim()) continue
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match) {
      const key = match[1]
      let value: unknown = match[2].trim()
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      } else if (!isNaN(Number(value))) {
        value = Number(value)
      } else if (value === 'true') {
        value = true
      } else if (value === 'false') {
        value = false
      }
      if (typeof value === 'string') {
        value = expandEnvVars(value)
      }
      config[key] = value
    }
  }
  return config as Partial<BeastConfig>
}

export function saveConfig(updates: Partial<BeastConfig>, configPath?: string): void {
  const filePath = configPath ?? resolve(process.env.HOME ?? '~', '.beast-cli.yml')
  let existing: Partial<BeastConfig> = {}
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      existing = parseConfig(content)
    } catch {}
  }
  const merged = { ...existing, ...updates }
  const lines: string[] = ['# Beast CLI configuration', '']
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        lines.push(`${key}: "${value}"`)
      } else if (typeof value === 'object') {
        lines.push(`${key}: ${JSON.stringify(value)}`)
      } else {
        lines.push(`${key}: ${value}`)
      }
    }
  }
  try {
    const dir = dirname(filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8')
  } catch (error) {
    console.warn(`Failed to save config to ${filePath}:`, error)
  }
}

export function loadConfig(configPath?: string): BeastConfig {
  const paths = [
    configPath ?? '.beast-cli.yml',
    configPath ?? '.beast-cli.yaml',
    resolve(process.env.HOME ?? '~', '.beast-cli.yml'),
  ]
  for (const path of paths) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, 'utf-8')
        const parsed = parseConfig(content)
        return { ...defaultConfig, ...parsed }
      } catch (error) {
        console.warn(`Failed to load config from ${path}:`, error)
      }
    }
  }
  return defaultConfig
}

export const defaultConfig: BeastConfig = {
  defaultMode: 'default',
  temperature: 0.7,
  maxTokens: 16384,
  maxToolResultChars: 10_000,
  toolTimeout: 30_000,
  theme: 'dark',
  contextSize: '32K',
  contextMax: 32768,
}

// Context size helpers
export function parseContextSize(size: string): number {
  const num = parseInt(size.replace(/K|B$/i, ''))
  if (size.toUpperCase().endsWith('K')) return num * 1024
  if (size.toUpperCase().endsWith('B')) return num * 1024 * 1024 * 1024
  return num
}

export function formatContextSize(tokens: number): string {
  if (tokens >= 1024) {
    return Math.round(tokens / 1024) + 'K'
  }
  return String(tokens)
}

// ── Context window sizes ────────────────────────────────────────────────────
export const CONTEXT_SIZES = ['8K', '16K', '32K', '64K', '128K']

export default { loadConfig, saveConfig, loadSession, saveSession, clearSession, parseContextSize, formatContextSize }