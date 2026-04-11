// Multi-Provider Support - Factory pattern for 40+ providers
// Based on Cline's provider factory

export interface LLMConfig {
  provider: string
  model: string
  apiKey?: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  name?: string
  toolCalls?: ToolCall[]
  toolCallId?: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  content: string
  isError?: boolean
}

export interface LLMRequest {
  messages: LLMMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
  tools?: LLMTool[]
  stream?: boolean
  signal?: AbortSignal
}

export interface LLMResponse {
  content: string
  model: string
  toolCalls?: ToolCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: 'stop' | 'length' | 'content_filter'
}

export interface LLMTool {
  name: string
  description?: string
  inputSchema: Record<string, unknown>
}

export interface LLMProvider {
  name: string
  models: string[]
  apiFormat: 'anthropic' | 'openai' | 'ollama' | 'openrouter' | 'custom'
  create(request: LLMRequest): Promise<LLMResponse>
  createStream?(request: LLMRequest): AsyncGenerator<LLMResponse>
}

// Provider Registry
const providers = new Map<string, () => Promise<LLMProvider>>()

export function registerProvider(name: string, factory: () => Promise<LLMProvider>): void {
  providers.set(name, factory)
}

export async function getProvider(name: string): Promise<LLMProvider | null> {
  const factory = providers.get(name)
  if (!factory) return null
  return factory()
}

export async function createProvider(config: LLMConfig): Promise<LLMProvider> {
  switch (config.provider) {
    case 'anthropic':
      return createAnthropicProvider(config)
    case 'openai':
      return createOpenAIProvider(config)
    case 'codex':
      return createCodexProvider(config)
    case 'openrouter':
      return createOpenRouterProvider(config)
    case 'ollama':
      return createOllamaProvider(config)
    case 'gemini':
      return createGeminiProvider(config)
    case 'groq':
      return createGroqProvider(config)
    case 'deepseek':
      return createDeepSeekProvider(config)
    case 'mistral':
      return createMistralProvider(config)
    case 'lmstudio':
      return createLMStudioProvider(config)
    case 'jan':
      return createJanProvider(config)
    case 'qwen':
      return createQwenProvider(config)
    case 'mlx':
      return createMLXProvider(config)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}

// Anthropic Provider
async function createAnthropicProvider(config: LLMConfig): Promise<LLMProvider> {
  const mod = await import('@anthropic-ai/sdk')
  const Anthropic = mod.Anthropic ?? mod.default?.Anthropic ?? mod.default

  return {
    name: 'anthropic',
    models: [
      'claude-opus-4-5',
      'claude-sonnet-4-20250514',
      'claude-haiku-4-20250514',
      'claude-3-5-sonnet-latest',
      'claude-3-5-haiku-latest',
    ],
    apiFormat: 'anthropic',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new Anthropic({ apiKey: config.apiKey })

      const systemMessage = request.messages.find(m => m.role === 'system')
      const otherMessages = request.messages.filter(m => m.role !== 'system')

      // Build Anthropic message format — handle tool_calls and tool_results
      const anthropicMessages = otherMessages.map(m => {
        if (m.toolCalls) {
          // Assistant message with tool calls
          return {
            role: 'assistant' as const,
            content: m.toolCalls.map(tc => ({
              type: 'tool_use' as const,
              id: tc.id,
              name: tc.name,
              input: tc.arguments,
            })),
          }
        } else if (m.toolCallId) {
          // Tool result message
          return {
            role: 'user' as const,
            content: [{
              type: 'tool_result' as const,
              tool_use_id: m.toolCallId,
              content: m.content,
            }],
          }
        } else {
          return {
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }
        }
      })

      const response = await client.messages.create({
        model: request.model ?? config.model ?? 'claude-sonnet-4-20250514',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: anthropicMessages,
        tools: request.tools?.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema,
        })),
      })

      // Extract text + tool_use blocks from content
      let content = ''
      const toolCalls: ToolCall[] = []
      for (const block of response.content) {
        if (block.type === 'text') {
          content += block.text
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            arguments: block.input as Record<string, unknown>,
          })
        }
      }

      return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
      }
    },
  }
}

// OpenAI Provider (also used by: groq, deepseek, mistral, lmstudio, jan, qwen, openrouter)
async function createOpenAIProvider(config: LLMConfig): Promise<LLMProvider> {
  const OpenAI = await import('openai')

  return {
    name: config.provider,
    models: [
      'gpt-5.4', 'gpt-5.4-pro', 'gpt-5.4-mini', 'gpt-5.4-nano',
      'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5.2', 'gpt-5.2-pro', 'gpt-5-pro',
      'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
      'o3-pro', 'o3', 'o4-mini', 'o3-deep-research', 'o4-mini-deep-research', 'o1-pro', 'o1', 'o3-mini',
      'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo',
      'gpt-5-codex', 'gpt-5.3-codex', 'gpt-5.2-codex', 'gpt-5.1-codex', 'gpt-5.1-codex-max', 'gpt-5.1-codex-mini',
    ],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new OpenAI.OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl })

      // Build messages with tool support
      const messages = request.messages.map(m => {
        if (m.toolCalls) {
          return {
            role: 'assistant' as const,
            content: m.content || null,
            tool_calls: m.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          }
        } else if (m.toolCallId) {
          return {
            role: 'tool' as const,
            tool_call_id: m.toolCallId,
            content: m.content,
          }
        } else {
          return {
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
            name: m.name,
          }
        }
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map(t => ({
          type: 'function' as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
          },
        })),
      })

      const choice = response.choices[0]
      const msg = choice.message

      // Extract tool_calls from response
      const toolCalls: ToolCall[] = []
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args: Record<string, unknown> = {}
            try { args = JSON.parse(tc.function.arguments) } catch {}
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: args,
            })
          }
        }
      }

      return {
        content: msg.content ?? '',
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length' | 'content_filter',
      }
    },
  }
}

// ChatGPT Plus/Pro Provider (Codex OAuth)
async function createCodexProvider(config: LLMConfig): Promise<LLMProvider> {
  // Dynamic imports to avoid bundling issues
  const { createHash, randomBytes } = await import('crypto')
  const http = await import('node:http')
  const { URL } = await import('node:url')

  // ── PKCE helpers ───────────────────────────────────────────────────────────

  function base64url(buf: Buffer): string {
    return buf.toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const verifier = base64url(randomBytes(32))
    const hash = createHash('sha256').update(verifier).digest()
    const challenge = base64url(hash)
    return { verifier, challenge }
  }

  function generateState(): string {
    return base64url(randomBytes(16))
  }

  // ── OAuth token management ─────────────────────────────────────────────────

  const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'
  const AUTH_URL = 'https://auth.openai.com/oauth/authorize'
  const TOKEN_URL = 'https://auth.openai.com/oauth/token'
  const REDIRECT_URI = 'http://localhost:1455/auth/callback'
  const SCOPE = 'openid profile email offline_access'
  const API_BASE = 'https://chatgpt.com/backend-api/codex'

  function getTokenPath(): string {
    const home = process.env.HOME || process.env.USERPROFILE || '~'
    return `${home}/.beast-cli/codex-auth.json`
  }

  function loadToken(): { accessToken: string; refreshToken: string; expiresAt: number; accountId?: string } | null {
    try {
      const { readFileSync, existsSync } = require('node:fs')
      const path = getTokenPath()
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'))
      }
    } catch { /* ignore */ }
    return null
  }

  function saveToken(token: { accessToken: string; refreshToken: string; expiresAt: number; accountId?: string }): void {
    try {
      const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('node:fs')
      const path = getTokenPath()
      const dir = require('node:path').dirname(path)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(path, JSON.stringify(token, null, 2), { mode: 0o600 })
    } catch (e) {
      console.error('Failed to save Codex token:', e)
    }
  }

  function isTokenValid(token: { accessToken: string; expiresAt: number }): boolean {
    return !!(token.accessToken && Date.now() < token.expiresAt - 5 * 60 * 1000)
  }

  function decodeJWT(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.')
      if (parts.length < 2) return null
      return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
    } catch { return null }
  }

  async function refreshToken(token: { refreshToken: string; accountId?: string }): Promise<typeof token | null> {
    try {
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
          client_id: CODEX_CLIENT_ID,
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

  // ── OAuth callback server ─────────────────────────────────────────────────

  async function waitForCallback(pkce: { verifier: string }, state: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url || '/', REDIRECT_URI)
        if (url.pathname === '/auth/callback') {
          const code = url.searchParams.get('code')
          const returnedState = url.searchParams.get('state')
          const error = url.searchParams.get('error')

          res.writeHead(200, { 'Content-Type': 'text/html' })
          if (error) {
            res.end('<html><body><h1>Auth Error</h1><p>You can close this window.</p></body></html>')
            server.close()
            reject(new Error('OAuth error: ' + error))
            return
          }
          if (code && returnedState === state) {
            res.end('<html><body><h1>Authenticated!</h1><p>You can close this window.</p></body></html>')
            server.close()
            resolve(code)
          } else {
            res.end('<html><body><h1>Invalid state</h1><p>You can close this window.</p></body></html>')
            server.close()
            reject(new Error('Invalid OAuth state'))
          }
        }
      })

      server.listen(1455, () => {
        console.log('   🌐 Opening browser for ChatGPT OAuth...')
      })

      setTimeout(() => {
        server.close()
        reject(new Error('OAuth timeout'))
      }, 300_000) // 5 min timeout
    })
  }

  // ── Exchange code for token ───────────────────────────────────────────────

  async function exchangeCode(code: string, verifier: string): Promise<typeof token extends () => infer R ? R : never> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CODEX_CLIENT_ID,
        code,
        code_verifier: verifier,
        redirect_uri: REDIRECT_URI,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Token exchange failed: ${err}`)
    }
    const data = await res.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      accountId: undefined,
    }
  }

  // ── Get valid token (refresh if needed) ──────────────────────────────────

  async function getValidToken(): Promise<{ accessToken: string; refreshToken: string; expiresAt: number; accountId?: string }> {
    let token = loadToken()

    if (!token || !isTokenValid(token)) {
      // Need to re-authenticate
      const { verifier, challenge } = await generatePKCE()
      const state = generateState()

      const authUrl = new URL(AUTH_URL)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('client_id', CODEX_CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
      authUrl.searchParams.set('scope', SCOPE)
      authUrl.searchParams.set('code_challenge', challenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')
      authUrl.searchParams.set('state', state)

      console.log('   🌐 Opening browser for ChatGPT Plus/Pro login...')
      console.log('   📋 Auth URL:', authUrl.toString())

      // Try to auto-open browser
      const { execSync } = require('child_process')
      try {
        const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
        execSync(`${opener} "${authUrl.toString()}"`, { stdio: 'ignore' })
      } catch { /* ignore if open fails */ }

      const code = await waitForCallback({ verifier }, state)
      token = await exchangeCode(code, verifier)

      // Extract account ID
      const payload = decodeJWT(token.accessToken)
      if (payload && typeof payload === 'object') {
        const auth = payload['https://api.openai.com/auth'] as Record<string, unknown> | undefined
        if (auth?.chatgpt_account_id) {
          token.accountId = auth.chatgpt_account_id as string
        }
      }

      saveToken(token)
      console.log('   ✅ ChatGPT OAuth authenticated!')
    } else if (token.expiresAt - Date.now() < 10 * 60 * 1000) {
      // Refresh if expiring soon
      const refreshed = await refreshToken(token)
      if (refreshed) {
        token = refreshed
        saveToken(token)
      }
    }

    return token!
  }

  // ── Codex API calls ───────────────────────────────────────────────────────

  return {
    name: 'codex',
    models: [
      'gpt-5.2-codex', 'gpt-5.2-codex-low', 'gpt-5.2-codex-medium', 'gpt-5.2-codex-high', 'gpt-5.2-codex-xhigh',
      'gpt-5.2', 'gpt-5.2-low', 'gpt-5.2-medium', 'gpt-5.2-high', 'gpt-5.2-xhigh',
      'gpt-5.1-codex-max', 'gpt-5.1-codex', 'gpt-5.1-codex-mini',
      'gpt-5.1', 'gpt-5.1-low', 'gpt-5.1-medium', 'gpt-5.1-high', 'gpt-5.1-xhigh',
      'codex', 'gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o3', 'o4-mini',
    ],
    apiFormat: 'custom',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const token = await getValidToken()

      const systemMessage = request.messages.find(m => m.role === 'system')
      const otherMessages = request.messages.filter(m => m.role !== 'system')

      // Build conversation text from messages
      const conversationParts: string[] = []
      for (const m of otherMessages) {
        if (m.role === 'user') {
          conversationParts.push(`User: ${m.content}`)
        } else if (m.role === 'assistant') {
          if (m.toolCalls) {
            for (const tc of m.toolCalls) {
              conversationParts.push(`Assistant calls tool ${tc.name}(${JSON.stringify(tc.arguments)})`)
            }
          }
          if (m.content) {
            conversationParts.push(`Assistant: ${m.content}`)
          }
        } else if (m.toolCallId) {
          // Tool result
          conversationParts.push(`Tool result: ${m.content}`)
        }
      }
      const conversationText = conversationParts.join('\n')

      // Build request body for Codex API
      const body: Record<string, unknown> = {
        model: request.model || 'gpt-5.2-codex',
        instructions: systemMessage?.content || 'You are a helpful coding assistant.',
        input: [{ role: 'user', content: conversationText || 'Hello' }],
        store: false,
        stream: true,
      }

      // Add tools for real-time data access (gold rate, weather, etc.)
      if (request.tools && request.tools.length > 0) {
        // Filter tools that have required name field
        const validTools = request.tools.filter(t => t.name && t.inputSchema)
        console.log('📡 Sending tools:', validTools.map(t => t.name).join(', '))
        body.tools = validTools.map(t => ({
          type: 'function' as const,
          function: { name: t.name, description: t.description || '', parameters: t.inputSchema },
        }))
      }

      // Add temperature if provided
      if (request.temperature !== undefined) {
        body.temperature = request.temperature
      }

      // Call ChatGPT API
      const response = await fetch(`${API_BASE}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
          'OpenAI-Beta': 'responses=experimental',
          'chatgpt-account-id': token.accountId || '',
        },
        body: JSON.stringify(body),
        signal: request.signal ?? AbortSignal.timeout(120_000),
      })

      if (response.status === 401) {
        saveToken({ accessToken: '', refreshToken: '', expiresAt: 0 })
        return this.create(request)
      }

      if (!response.ok || !response.body) {
        const err = await response.text()
        throw new Error(`ChatGPT API error ${response.status}: ${err.slice(0, 200)}`)
      }

      // Handle SSE streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let content = ''
      let done = false

      try {
        while (!done) {
          const { done: readerDone, value } = await reader.read()
          done = readerDone
          if (value) {
            buffer += decoder.decode(value, { stream: !done })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const event = JSON.parse(data)
                  // Collect text deltas from various possible formats
                  const text = event.output_text?.text || event.text?.text || event.content_text || event.delta || ''
                  if (text) content += text
                } catch { /* ignore parse errors */ }
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      return {
        content,
        model: request.model || 'gpt-5.2-codex',
        usage: undefined,
        finishReason: 'stop',
      }
    },

    async *createStream(request: LLMRequest): AsyncGenerator<LLMResponse> {
      const token = await getValidToken()

      const systemMessage = request.messages.find(m => m.role === 'system')
      const otherMessages = request.messages.filter(m => m.role !== 'system')

      // Build conversation text
      const conversationParts: string[] = []
      for (const m of otherMessages) {
        if (m.role === 'user') {
          conversationParts.push(`User: ${m.content}`)
        } else if (m.role === 'assistant') {
          if (m.toolCalls) {
            for (const tc of m.toolCalls) {
              conversationParts.push(`Assistant calls tool ${tc.name}(${JSON.stringify(tc.arguments)})`)
            }
          }
          if (m.content) {
            conversationParts.push(`Assistant: ${m.content}`)
          }
        } else if (m.toolCallId) {
          conversationParts.push(`Tool result: ${m.content}`)
        }
      }
      const conversationText = conversationParts.join('\n')

      const body: Record<string, unknown> = {
        model: request.model || 'gpt-5.2-codex',
        instructions: systemMessage?.content || 'You are a helpful coding assistant.',
        input: [{ role: 'user', content: conversationText || 'Hello' }],
        stream: true,
      }

      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools.map(t => ({
          type: 'function' as const,
          function: { name: t.name, description: t.description, parameters: t.inputSchema },
        }))
      }

      if (request.temperature !== undefined) {
        body.temperature = request.temperature
      }

      const response = await fetch(`${API_BASE}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
          'OpenAI-Beta': 'responses=experimental',
          'chatgpt-account-id': token.accountId || '',
        },
        body: JSON.stringify(body),
        signal: request.signal ?? AbortSignal.timeout(120_000),
      })

      if (!response.ok || !response.body) {
        const err = await response.text()
        throw new Error(`ChatGPT API error ${response.status}: ${err.slice(0, 200)}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break

              try {
                const event = JSON.parse(data)
                if (event.output_text?.text) {
                  yield { content: event.output_text.text, model: event.model || request.model }
                }
              } catch { /* ignore parse errors */ }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  }
}

// OpenRouter Provider
async function createOpenRouterProvider(config: LLMConfig): Promise<LLMProvider> {
  const OpenAI = await import('openai')

  return {
    name: 'openrouter',
    models: [
      'qwen/qwen3-32b',
      'qwen/qwen3-14b',
      'qwen/qwen3-8b',
      'qwen/qwq-32b',
      'openrouter/auto',
      'meta-llama/llama-3.1-8b-instruct',
      'google/gemini-2.0-flash-exp',
      'deepseek/deepseek-chat',
    ],
    apiFormat: 'openrouter',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new OpenAI.OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl ?? 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://beast-cli.dev',
          'X-Title': 'Beast CLI',
        },
      })

      const messages = request.messages.map(m => {
        if (m.toolCalls) {
          return {
            role: 'assistant' as const,
            content: m.content || null,
            tool_calls: m.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          }
        } else if (m.toolCallId) {
          return {
            role: 'tool' as const,
            tool_call_id: m.toolCallId,
            content: m.content,
          }
        } else {
          return {
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
            name: m.name,
          }
        }
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map(t => ({
          type: 'function' as const,
          function: { name: t.name, description: t.description, parameters: t.inputSchema },
        })),
      })

      const choice = response.choices[0]
      const msg = choice.message
      const toolCalls: ToolCall[] = []
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args: Record<string, unknown> = {}
            try { args = JSON.parse(tc.function.arguments) } catch {}
            toolCalls.push({ id: tc.id, name: tc.function.name, arguments: args })
          }
        }
      }

      return {
        content: msg.content ?? '',
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// Ollama Provider
async function createOllamaProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'ollama',
    models: [],
    apiFormat: 'ollama',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const baseUrl = config.baseUrl ?? 'http://localhost:11434'

      // Build messages with tool support
      const ollamaMessages: Record<string, unknown>[] = []
      for (const m of request.messages) {
        if (m.toolCalls) {
          // Assistant message with tool calls - content can be null when tool calling
          // IMPORTANT: arguments must be an OBJECT, not a string
          const toolCalls = m.toolCalls.map((tc) => {
            let argsObj: Record<string, unknown>
            if (typeof tc.arguments === 'string') {
              try { argsObj = JSON.parse(tc.arguments) } catch { argsObj = {} }
            } else {
              argsObj = tc.arguments ?? {}
            }
            return {
              function: {
                name: tc.name,
                arguments: argsObj,
              },
            }
          })
          ollamaMessages.push({ role: 'assistant', content: m.content || null, tool_calls: toolCalls })
        } else if (m.toolCallId) {
          // Tool result message
          ollamaMessages.push({ role: 'tool', tool_call_id: m.toolCallId, content: m.content })
        } else {
          ollamaMessages.push({ role: m.role, content: m.content })
        }
      }

      const body: Record<string, unknown> = {
        model: request.model ?? config.model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: request.temperature ?? config.temperature ?? 0.7,
          num_predict: request.maxTokens ?? config.maxTokens ?? 16384,
        },
      }

      // Add tools if provided
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools.map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
          },
        }))
      }

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: request.signal ?? AbortSignal.timeout(120_000),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Ollama error ${response.status}: ${error.slice(0, 150)}`)
      }

      let data: Record<string, unknown>
      try {
        data = await response.json()
      } catch {
        const raw = await response.text()
        throw new Error(`Ollama returned invalid JSON. Model may be producing malformed output. Raw: ${raw.slice(0, 200)}`)
      }

      // Extract tool_calls — robust
      const toolCalls: ToolCall[] = []
      try {
        if (data.message?.tool_calls) {
          for (const tc of data.message.tool_calls as any[]) {
            let args: Record<string, unknown> = {}
            const rawArgs = tc.function?.arguments
            if (typeof rawArgs === 'string') {
              try { args = JSON.parse(rawArgs) } catch {}
            } else if (rawArgs && typeof rawArgs === 'object') {
              args = rawArgs as Record<string, unknown>
            }
            toolCalls.push({
              id: tc.id ?? `ollama_${Date.now()}`,
              name: tc.function?.name ?? 'unknown',
              arguments: args,
            })
          }
        }
      } catch { /* fall through */ }

      return {
        content: data.message?.content ?? '',
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: data.model ?? config.model,
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
        finishReason: data.done ? 'stop' : 'length',
      }
    },
  }
}

// Gemini Provider
async function createGeminiProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    apiFormat: 'custom',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY
      const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${request.model ?? config.model}:generateContent?key=${apiKey}`

      const systemMessage = request.messages.find(m => m.role === 'system')
      const otherMessages = request.messages.filter(m => m.role !== 'system')

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: otherMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
          generationConfig: {
            maxOutputTokens: request.maxTokens ?? config.maxTokens ?? 16384,
            temperature: request.temperature ?? config.temperature ?? 0.7,
          },
        }),
      })

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      return {
        content,
        model: request.model ?? config.model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
        },
        finishReason: data.candidates?.[0]?.finishReason === 'STOP' ? 'stop' : 'length',
      }
    },
  }
}

// Groq Provider
async function createGroqProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'groq',
    models: ['mixtral-8x7b-32768', 'llama3-8b-8192', 'llama3-70b-8192', 'gemma-7b-it'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// DeepSeek Provider
async function createDeepSeekProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'deepseek',
    models: ['deepseek-chat', 'deepseek-coder'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.deepseek.com/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// Mistral Provider
async function createMistralProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'mistral',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.mistral.ai/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// LM Studio Provider (OpenAI-compatible)
async function createLMStudioProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'lmstudio',
    models: [], // Dynamic - LM Studio exposes available models
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: 'lm-studio', // LM Studio doesn't need real API key
        baseURL: config.baseUrl ?? 'http://localhost:1234/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? 'local-model',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },

    async *createStream(request: LLMRequest): AsyncGenerator<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: 'lm-studio',
        baseURL: config.baseUrl ?? 'http://localhost:1234/v1',
      })

      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? 'local-model',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      })

      for await (const chunk of stream) {
        const choice = chunk.choices[0]
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model,
          }
        }
      }
    },
  }
}

// Jan.ai Provider (OpenAI-compatible)
async function createJanProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'jan',
    models: [], // Dynamic
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: 'jan-key', // Jan doesn't need real API key
        baseURL: config.baseUrl ?? 'http://localhost:1337/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? 'local-model',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },

    async *createStream(request: LLMRequest): AsyncGenerator<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: 'jan-key',
        baseURL: config.baseUrl ?? 'http://localhost:1337/v1',
      })

      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? 'local-model',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      })

      for await (const chunk of stream) {
        const choice = chunk.choices[0]
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model,
          }
        }
      }
    },
  }
}

// Qwen Provider (via DashScope or OpenAI-compatible)
async function createQwenProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'qwen',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const apiKey = config.apiKey ?? process.env.DASHSCOPE_API_KEY
      const client = new (await import('openai')).OpenAI({
        apiKey,
        baseURL: config.baseUrl ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? 'qwen-plus',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// MLX Provider (Apple Silicon via mlx-lm server - OpenAI-compatible)
async function createMLXProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'mlx',
    models: [], // Dynamic - mlx-lm server exposes available models
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: 'mlx', // mlx-lm doesn't need real API key
        baseURL: config.baseUrl ?? 'http://localhost:8080/v1',
      })

      // Build messages with tool support (same as LM Studio / Jan)
      const messages = request.messages.map(m => {
        if (m.toolCalls) {
          return {
            role: 'assistant' as const,
            content: m.content || null,
            tool_calls: m.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          }
        } else if (m.toolCallId) {
          return {
            role: 'tool' as const,
            tool_call_id: m.toolCallId,
            content: m.content,
          }
        } else {
          return {
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
            name: m.name,
          }
        }
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? 'local-model',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map(t => ({
          type: 'function' as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
          },
        })),
      })

      const choice = response.choices[0]
      const msg = choice.message

      // Extract tool_calls from response
      const toolCalls: ToolCall[] = []
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args: Record<string, unknown> = {}
            try { args = JSON.parse(tc.function.arguments) } catch {}
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: args,
            })
          }
        }
      }

      return {
        content: msg.content ?? '',
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length' | 'content_filter',
      }
    },

    async *createStream(request: LLMRequest): AsyncGenerator<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: 'mlx',
        baseURL: config.baseUrl ?? 'http://localhost:8080/v1',
      })

      // Build messages (same as above)
      const messages = request.messages.map(m => {
        if (m.toolCalls) {
          return {
            role: 'assistant' as const,
            content: m.content || null,
            tool_calls: m.toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          }
        } else if (m.toolCallId) {
          return {
            role: 'tool' as const,
            tool_call_id: m.toolCallId,
            content: m.content,
          }
        } else {
          return {
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
            name: m.name,
          }
        }
      })

      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? 'local-model',
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map(t => ({
          type: 'function' as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
          },
        })),
        stream: true,
      })

      for await (const chunk of stream) {
        const choice = chunk.choices[0]
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model,
          }
        }
      }
    },
  }
}

// Detect model family for prompt variants
export function detectModelFamily(model: string): 'generic' | 'next_gen' | 'xs' {
  const lower = model.toLowerCase()

  if (
    lower.includes('claude-3') ||
    lower.includes('gpt-5') ||
    lower.includes('gemini-1.5') ||
    lower.includes('llama-3.1')
  ) {
    return 'next_gen'
  }

  if (
    lower.includes('gemma') ||
    lower.includes('phi-3') ||
    lower.includes('llama3-8b') ||
    lower.includes('codellama')
  ) {
    return 'xs'
  }

  return 'generic'
}

// Token estimation (rough)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Cost calculation (per 1M tokens)
export function calculateCost(provider: string, model: string, usage: { promptTokens: number; completionTokens: number }): number {
  const rates: Record<string, Record<string, { input: number; output: number }>> = {
    anthropic: {
      'claude-opus-4-5': { input: 15, output: 75 },
      'claude-sonnet-4-20250514': { input: 3, output: 15 },
      'claude-haiku-4-20250514': { input: 0.8, output: 4 },
      'claude-3-5-sonnet-latest': { input: 3, output: 15 },
    },
    openai: {
      // GPT-5 series
      'gpt-5.4': { input: 1.25, output: 10 },
      'gpt-5.4-pro': { input: 15, output: 120 },
      'gpt-5.4-mini': { input: 0.25, output: 2 },
      'gpt-5.4-nano': { input: 0.05, output: 0.4 },
      'gpt-5': { input: 1.25, output: 10 },
      'gpt-5-mini': { input: 0.25, output: 2 },
      'gpt-5-nano': { input: 0.05, output: 0.4 },
      'gpt-5.2': { input: 1.25, output: 10 },
      'gpt-5.2-pro': { input: 15, output: 120 },
      'gpt-5-pro': { input: 15, output: 120 },
      // GPT-4.1 series
      'gpt-4.1': { input: 2, output: 8 },
      'gpt-4.1-mini': { input: 0.4, output: 1.6 },
      'gpt-4.1-nano': { input: 0.1, output: 1.4 },
      // o-series (reasoning)
      'o3-pro': { input: 60, output: 400 },
      'o3': { input: 15, output: 60 },
      'o4-mini': { input: 3, output: 12 },
      'o1-pro': { input: 60, output: 400 },
      'o1': { input: 15, output: 60 },
      'o3-mini': { input: 3, output: 12 },
      // Legacy
      'gpt-4o': { input: 5, output: 15 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gpt-4-turbo': { input: 10, output: 30 },
      'gpt-4': { input: 30, output: 60 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      // Codex
      'gpt-5-codex': { input: 3, output: 15 },
      'gpt-5.1-codex': { input: 3, output: 15 },
    },
    openrouter: {
      default: { input: 0.5, output: 1.5 },
    },
  }

  const modelRates = rates[provider]?.[model] ?? rates[provider]?.['default'] ?? { input: 1, output: 2 }

  const inputCost = (usage.promptTokens / 1_000_000) * modelRates.input
  const outputCost = (usage.completionTokens / 1_000_000) * modelRates.output

  return inputCost + outputCost
}

export default {
  createProvider,
  registerProvider,
  getProvider,
  detectModelFamily,
  estimateTokens,
  calculateCost,
}
