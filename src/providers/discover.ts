// Provider model discovery and API key resolution

// ── Local model fetching ─────────────────────────────────────────────────────

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
  openai: 'gpt-4o',
  openrouter: 'openrouter/auto',
  deepseek: 'deepseek-chat',
  groq: 'llama-3.3-70b-versatile',
  mistral: 'mistral-large-latest',
  qwen: 'qwen-plus',
  gemini: 'gemini-1.5-pro',
  ollama: 'llama3.1:8b',
  lmstudio: 'llama3.1:8b',
  jan: 'llama3.1:8b',
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
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'o1',
    'o1-mini',
  ],
  openrouter: [
    'openrouter/auto',
    'anthropic/claude-3-opus',
    'openai/gpt-4o',
    'google/gemini-pro-1.5',
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
    default: return ''
  }
}
