// Provider model discovery and API key resolution

// ── Local model fetching ─────────────────────────────────────────────────────

// Codex OAuth constants (ChatGPT Plus/Pro subscription)
export const CODEX_OAUTH = {
  CLIENT_ID: 'app_EMoamEEZ73f0CkXaXp7hrann',
  AUTHORIZE_URL: 'https://auth.openai.com/oauth/authorize',
  TOKEN_URL: 'https://auth.openai.com/oauth/token',
  REDIRECT_URI: 'http://localhost:1455/auth/callback',
  SCOPE: 'openid profile email offline_access',
  API_BASE_URL: 'https://chatgpt.com/backend-api',
  TOKEN_FILE: '.beast-cli/codex-auth.json',
} as const

export async function fetchOllamaModels(baseUrl = 'http://localhost:11434'): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) })
    if (!res.ok) return []
    const data = await res.json()
    return (data.models ?? []).map((m: { name?: string }) => m.name ?? '').filter(Boolean)
  } catch {
    return []
  }
}

export async function fetchLMStudioModels(baseUrl = 'http://localhost:1234'): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(2000) })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data ?? []).map((m: { id?: string }) => m.id ?? '').filter(Boolean)
  } catch {
    return []
  }
}

export async function fetchJanModels(baseUrl = 'http://localhost:1337'): Promise<string[]> {
  return fetchLMStudioModels(baseUrl)
}

export async function fetchLocalModels(provider: string): Promise<string[]> {
  switch (provider) {
    case 'ollama': return fetchOllamaModels()
    case 'lmstudio': return fetchLMStudioModels()
    case 'jan': return fetchJanModels()
    default: return []
  }
}

// ── API key resolution ────────────────────────────────────────────────────────

export const API_KEY_ENVS: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  codex: 'CODEX_API_KEY',      // ChatGPT Plus/Pro OAuth (placeholder, auth is separate)
  deepseek: 'DEEPSEEK_API_KEY',
  groq: 'GROQ_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  qwen: 'DASHSCOPE_API_KEY',
  gemini: 'GEMINI_API_KEY',
}

export function getApiKeyFromEnv(provider: string): string | null {
  const envVar = API_KEY_ENVS[provider]
  if (!envVar) return null
  return process.env[envVar] ?? null
}

export function isCloudProvider(provider: string): boolean {
  return provider in API_KEY_ENVS
}

// ── Default models ───────────────────────────────────────────────────────────

export const DEFAULT_MODEL: Record<string, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-5.4',
  openrouter: 'qwen/qwen3.6-plus',
  deepseek: 'deepseek-chat',
  groq: 'llama-3.3-70b-versatile',
  mistral: 'mistral-large-latest',
  qwen: 'qwen-plus',
  gemini: 'gemini-1.5-pro',
  ollama: 'llama3.2:latest',
  lmstudio: 'llama3.2:latest',
  jan: 'llama3.2:latest',
}

// ── Cloud provider model lists (for /models command) ─────────────────────────

export const CLOUD_MODELS: Record<string, string[]> = {
  anthropic: [
    'claude-opus-4-5',
    'claude-sonnet-4-20250514',
    'claude-haiku-4-20250514',
    'claude-3-5-sonnet-latest',
  ],
  openai: [
    // GPT-5 series (Frontier)
    'gpt-5.4',
    'gpt-5.4-pro',
    'gpt-5.4-mini',
    'gpt-5.4-nano',
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-5.2',
    'gpt-5.2-pro',
    'gpt-5-pro',
    // GPT-4.1 series
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    // o-series (Reasoning) - ChatGPT Plus/Pro models
    'o3-pro',
    'o3',
    'o4-mini',
    'o3-deep-research',
    'o4-mini-deep-research',
    'o1-pro',
    'o1',
    'o3-mini',
    // GPT-4o series
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    // Codex (Coding)
    'gpt-5-codex',
    'gpt-5.3-codex',
    'gpt-5.2-codex',
    'gpt-5.1-codex',
    'gpt-5.1-codex-max',
    'gpt-5.1-codex-mini',
  ],
  openrouter: [
    // Qwen free tier models (via OpenRouter)
    'qwen/qwen3.6-plus',
    'qwen/qwen3-32b',
    'qwen/qwen3-14b',
    'qwen/qwen3-8b',
    'qwen/qwq-32b',
    // Auto-select
    'openrouter/auto',
    // Other popular free models
    'meta-llama/llama-3.1-8b-instruct',
    'anthropic/claude-3-haiku',
    'google/gemini-2.0-flash-exp',
    'deepseek/deepseek-chat',
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-coder',
    'deepseek-reasoner',
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
    'llama-3.1-8b-instant',
  ],
  mistral: [
    'mistral-large-latest',
    'mistral-small-latest',
    'codestral-latest',
    'mistral-nemo',
  ],
  qwen: [
    'qwen-plus',
    'qwen-max',
    'qwen2.5-coder-32b',
    'qwq-32b',
  ],
  gemini: [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
  ],
}

// ── Provider display info ─────────────────────────────────────────────────────

export interface ProviderInfo {
  id: string
  name: string
  shortName: string
  status: 'online' | 'offline'
  models: string[]
  isCloud: boolean
}

export async function detectAllProviders(): Promise<ProviderInfo[]> {
  const results: ProviderInfo[] = []

  // Local providers
  const [ollamaModels, lmModels, janModels] = await Promise.all([
    fetchOllamaModels(),
    fetchLMStudioModels(),
    fetchJanModels(),
  ])

  if (ollamaModels.length > 0) {
    results.push({
      id: 'ollama',
      name: 'Ollama',
      shortName: 'OLL',
      status: 'online',
      models: ollamaModels,
      isCloud: false,
    })
  }

  if (lmModels.length > 0) {
    results.push({
      id: 'lmstudio',
      name: 'LM Studio',
      shortName: 'LMS',
      status: 'online',
      models: lmModels,
      isCloud: false,
    })
  }

  if (janModels.length > 0) {
    results.push({
      id: 'jan',
      name: 'Jan',
      shortName: 'JAN',
      status: 'online',
      models: janModels,
      isCloud: false,
    })
  }

  // Cloud providers (always listed, keyed status)
  const cloudProviders: ProviderInfo[] = [
    { id: 'anthropic', name: 'Claude', shortName: 'CLA', status: 'offline', models: CLOUD_MODELS['anthropic'], isCloud: true },
    { id: 'openai', name: 'GPT / OpenAI', shortName: 'GPT', status: 'offline', models: CLOUD_MODELS['openai'], isCloud: true },
    { id: 'codex', name: 'ChatGPT Plus', shortName: 'CHT', status: 'offline', models: CODEX_MODELS, isCloud: true },
    { id: 'openrouter', name: 'OpenRouter', shortName: 'ORR', status: 'offline', models: CLOUD_MODELS['openrouter'], isCloud: true },
    { id: 'deepseek', name: 'DeepSeek', shortName: 'DSK', status: 'offline', models: CLOUD_MODELS['deepseek'], isCloud: true },
    { id: 'groq', name: 'Groq', shortName: 'GRQ', status: 'offline', models: CLOUD_MODELS['groq'], isCloud: true },
    { id: 'mistral', name: 'Mistral', shortName: 'MIS', status: 'offline', models: CLOUD_MODELS['mistral'], isCloud: true },
    { id: 'qwen', name: 'Qwen', shortName: 'QWN', status: 'offline', models: CLOUD_MODELS['qwen'], isCloud: true },
    { id: 'gemini', name: 'Gemini', shortName: 'GEM', status: 'offline', models: CLOUD_MODELS['gemini'], isCloud: true },
  ]

  // Mark cloud providers as online if they have an API key
  for (const p of cloudProviders) {
    if (getApiKeyFromEnv(p.id)) {
      p.status = 'online'
    } else if (p.id === 'codex') {
      // Codex uses OAuth token file instead of API key
      const token = loadCodexToken()
      if (token && isCodexTokenValid(token)) {
        p.status = 'online'
      }
    }
    results.push(p)
  }

  return results
}

export function getBaseUrl(provider: string): string {
  switch (provider) {
    case 'ollama': return 'http://localhost:11434'
    case 'lmstudio': return 'http://localhost:1234/v1'
    case 'jan': return 'http://localhost:1337/v1'
    case 'codex': return CODEX_OAUTH.API_BASE_URL
    default: return ''
  }
}

// ── Codex OAuth (ChatGPT Plus/Pro subscription) ─────────────────────────────

export interface CodexToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
  accountId?: string
}

// Get token file path
function getCodexTokenPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || '~'
  return `${home}/.beast-cli/codex-auth.json`
}

// Load saved Codex OAuth token
export function loadCodexToken(): CodexToken | null {
  try {
    const path = getCodexTokenPath()
    const fs = require('node:fs')
    if (fs.existsSync(path)) {
      const data = JSON.parse(fs.readFileSync(path, 'utf-8'))
      return data as CodexToken
    }
  } catch { /* ignore */ }
  return null
}

// Save Codex OAuth token
export function saveCodexToken(token: CodexToken): void {
  try {
    const path = getCodexTokenPath()
    const fs = require('node:fs')
    const dir = require('node:path').dirname(path)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(path, JSON.stringify(token, null, 2), { mode: 0o600 })
  } catch (e) {
    console.error('Failed to save Codex token:', e)
  }
}

// Clear Codex OAuth token (logout)
export function clearCodexToken(): void {
  try {
    const path = getCodexTokenPath()
    const fs = require('node:fs')
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }
  } catch { /* ignore */ }
}

// Check if Codex token is valid and not expired
export function isCodexTokenValid(token: CodexToken): boolean {
  if (!token.accessToken) return false
  // Refresh 5 minutes before expiry
  return Date.now() < token.expiresAt - 5 * 60 * 1000
}

// Refresh Codex access token
export async function refreshCodexToken(token: CodexToken): Promise<CodexToken | null> {
  try {
    const res = await fetch(CODEX_OAUTH.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        client_id: CODEX_OAUTH.CLIENT_ID,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || token.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      accountId: token.accountId,
    }
  } catch { return null }
}

// Decode JWT to get account ID
export function decodeCodexJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
    return payload
  } catch { return null }
}

// Get account ID from token
export function getCodexAccountId(token: CodexToken): string | undefined {
  const payload = decodeCodexJWT(token.accessToken)
  if (payload && typeof payload === 'object') {
    const auth = payload['https://api.openai.com/auth'] as Record<string, unknown> | undefined
    return auth?.chatgpt_account_id as string | undefined
  }
  return undefined
}

// Codex OAuth models (from ChatGPT Plus/Pro subscription)
export const CODEX_MODELS = [
  // GPT-5.2 Codex (latest with reasoning variants)
  'gpt-5.2-codex',
  'gpt-5.2-codex-low',
  'gpt-5.2-codex-medium',
  'gpt-5.2-codex-high',
  'gpt-5.2-codex-xhigh',
  // GPT-5.2 standard
  'gpt-5.2',
  'gpt-5.2-low',
  'gpt-5.2-medium',
  'gpt-5.2-high',
  'gpt-5.2-xhigh',
  // GPT-5.1 Codex
  'gpt-5.1-codex-max',
  'gpt-5.1-codex',
  'gpt-5.1-codex-mini',
  // GPT-5.1 standard
  'gpt-5.1',
  'gpt-5.1-low',
  'gpt-5.1-medium',
  'gpt-5.1-high',
  'gpt-5.1-xhigh',
  // Legacy Codex
  'codex',
  'gpt-4o',
  'gpt-4o-mini',
  'o3-mini',
  'o3',
  'o4-mini',
]
