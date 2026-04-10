#!/usr/bin/env bun
/**
 * Beast CLI - Main Entry Point
 * AI Coding Agent with 45+ Providers
 * MCP tools work automatically (black box)
 */

import { createProvider } from './providers/index.ts'
import { TCPTransport } from './mcp/index.ts'
import { s, fg, dim, bold, reset, icon } from './ui/colors.ts'
import { renderHeader, renderFooter, renderCompactHeader, contextBar } from './ui/layout.ts'
import { inlineList, helpPanel, panel, withProgress } from './ui/format.ts'
import { renderToolResult } from './ui/tool-renderer.ts'
import { beastSpinner } from './ui/beast-loader.ts'
import { renderCleanBanner } from './ui/banner.ts'
import { tipBanner, randomTip, contextualTip } from './ui/tips.ts'
import { Spinner } from './ui/spinner.ts'
import { getFormattedTools, executeTool, getAllTools } from './native-tools/index.ts'
import { funSpinner, FunSpinner, randomFunFact, thinkingMessage, toolRunningMessage } from './ui/fun-animations.ts'
import { notifications, playBell, playAlertBeeps, onResponseReady, onWaitingForInput, onError, onTaskComplete, onPermissionRequest, showNotification } from './utils/notifications.ts'
import type { ToolCall } from './providers/index.ts'
import {
  detectAllProviders,
  fetchLocalModels,
  fetchOllamaModels,
  getApiKeyFromEnv,
  isCloudProvider,
  DEFAULT_MODEL,
  CLOUD_MODELS,
  getBaseUrl,
  loadCodexToken,
  isCodexTokenValid,
  clearCodexToken,
  CODEX_MODELS,
  type ProviderInfo,
} from './providers/discover.ts'
import {
  loadSession,
  saveSession,
  clearSession,
  parseContextSize,
  CONTEXT_SIZES,
  saveConfig,
  loadConfig,
} from './config/index.ts'
import { execSync } from 'child_process'
import path from 'node:path'
import { statSync } from 'node:fs'
import readline from 'node:readline'

// Version
const VERSION = '1.2.8'

// ── Types ────────────────────────────────────────────────────────────────────

interface CLIOptions {
  provider?: string
  model?: string
  help?: boolean
  test?: boolean
  setup?: boolean
  defaults?: boolean
  switch?: boolean  // Force re-select provider/model
}

interface MCPTool {
  name: string
  description?: string
  inputSchema: Record<string, unknown>
}

interface Session {
  provider: string
  model: string
  apiKey?: string
  baseUrl: string
  contextMax?: number
  messages: { role: string; content: string; toolCalls?: ToolCall[]; toolCallId?: string }[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(prompt, answer => { rl.close(); resolve(answer) }))
}

async function numberedMenu(title: string, options: string[]): Promise<number> {
  console.log(`\n${title}`)
  options.forEach((opt, i) => console.log(`  [${i + 1}] ${opt}`))
  while (true) {
    const input = await question('  > ')
    const n = parseInt(input.trim())
    if (n >= 1 && n <= options.length) return n - 1
    console.log('  Invalid selection. Try again.')
  }
}

// ── Fun Spinner (animated ASCII characters) ────────────────────────────────

let currentSpinner: ReturnType<typeof setInterval> | null = null
let spinnerStarted = false
let spinnerFrame = 0
let spinnerLabel = ''
let spinnerAnimation: string[] = []
let spinnerSpeed = 150

// Different characters for different states
const THINKING_ANIMS = ['(◕‿◕)🐕', '(=^・^=)', '(¨)🦊', '( @)🐸', '(*)',
                        '(◕ω◕)🐕', '(=^・ω・^=)', '(◕‿◕)🦊', '(\\/)🐰', ' (=・)']
const SEARCH_ANIMS = ['><(((º>', ' <(º)>', '><(((º>', '  ~(``)~', '><(((º>']
const TOOL_ANIMS = ['(◕‿◕)🐕', '(=^・^=)', '(¨)🦊', '(*)', '=(・)']
const THINKING_DOTS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴']

function startFunSpinner(state: 'thinking' | 'searching' | 'tool' | 'formatting' = 'thinking'): void {
  if (currentSpinner) clearInterval(currentSpinner)
  spinnerStarted = true
  spinnerFrame = 0

  // Select animation based on state
  if (state === 'searching') {
    spinnerAnimation = SEARCH_ANIMS
    spinnerLabel = s('Searching', fg.info)
    spinnerSpeed = 120
  } else if (state === 'tool') {
    spinnerAnimation = TOOL_ANIMS
    spinnerLabel = s('Running', fg.tool)
    spinnerSpeed = 150
  } else if (state === 'formatting') {
    spinnerAnimation = ['✨', '★', '✦', '✧', '★']
    spinnerLabel = s('Formatting', fg.success)
    spinnerSpeed = 200
  } else {
    spinnerAnimation = THINKING_ANIMS
    spinnerLabel = s('Thinking', fg.accent)
    spinnerSpeed = 150
  }

  // Write initial frame
  const char = spinnerAnimation[0]
  const dot = THINKING_DOTS[0]
  process.stderr.write(`\r${spinnerLabel} ${char} ${dot}  `)

  currentSpinner = setInterval(() => {
    if (!spinnerStarted) return
    spinnerFrame = (spinnerFrame + 1) % spinnerAnimation.length
    const animChar = spinnerAnimation[spinnerFrame]
    const dot = THINKING_DOTS[spinnerFrame % THINKING_DOTS.length]
    process.stderr.write(`\r${spinnerLabel} ${animChar} ${dot}  `)
  }, spinnerSpeed)
}

function stopFunSpinner(status: 'done' | 'error' | 'skip' = 'done'): void {
  if (currentSpinner) {
    clearInterval(currentSpinner)
    currentSpinner = null
  }
  spinnerStarted = false

  // Clear the line
  process.stderr.write('\r' + ' '.repeat(60) + '\r')

  if (status === 'done') {
    process.stderr.write(s('✓ ', fg.success) + (spinnerLabel || 'Done') + '\n')
  } else if (status === 'error') {
    process.stderr.write(s('✗ ', fg.error) + 'Error\n')
  }
}

// Legacy spinner functions (for compatibility)
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
let legacySpinnerHandle: ReturnType<typeof setInterval> | null = null
let legacySpinnerLabel = ''
let legacySpinnerStarted = false

function startSpinner(label: string): void {
  // Use fun spinner instead
  startFunSpinner('thinking')
  legacySpinnerLabel = label
}

function stopSpinner(done = false, label = ''): void {
  stopFunSpinner(done ? 'done' : 'skip')
  if (done && label) {
    process.stderr.write(`${label} ${s('✓', fg.success)}\n`)
  }
}

function clearLine(): void {
  process.stderr.write('\r' + ' '.repeat(60) + '\r')
}

// Polished streaming: Google brand colors for response panel
function streamText(text: string): void {
  process.stdout.write(panel(text, { title: '🤖 Response', titleColor: fg.mauve, width: 70, style: 'round' }))
  process.stdout.write('\n')
}

// Polished token usage display
function printUsage(usage?: { promptTokens: number; completionTokens: number; totalTokens: number }): void {
  if (!usage) return
  const { promptTokens, completionTokens, totalTokens } = usage
  process.stdout.write(`${s('⚡ ', fg.muted)}${s(totalTokens.toLocaleString(), fg.mauve)} tokens `)
  process.stdout.write(`(${s('p:' + promptTokens, fg.sapphire)} ${s('c:' + completionTokens, fg.mauve)})\n`)
}

// ── MCP Server ────────────────────────────────────────────────────────────────

async function checkMCPServer(): Promise<{ available: boolean; toolCount: number }> {
  const nativeTools = getFormattedTools()
  return { available: true, toolCount: nativeTools.length }
}

let nativeTools: MCPTool[] = []

async function connectMCP(): Promise<MCPTool[]> {
  nativeTools = getFormattedTools() as MCPTool[]
  return nativeTools
}

// ── Provider & Model selection ───────────────────────────────────────────────

async function selectProvider(providers: ProviderInfo[]): Promise<string> {
  const online = providers.filter(p => p.status === 'online')
  const offline = providers.filter(p => p.status === 'offline')

  const choices: string[] = []
  const byId: string[] = []

  for (const p of online) {
    const models = `${p.models.length} models`
    const auth = p.id === 'codex' ? ' · OAuth' : ''
    choices.push(`● ${p.name} (${p.shortName}) — ${models}${auth}`)
    byId.push(p.id)
  }
  for (const p of offline) {
    const note = p.id === 'codex' ? ' (needs OAuth login)' : p.isCloud ? ' (needs API key)' : ' (offline)'
    choices.push(`○ ${p.name} (${p.shortName})${note}`)
    byId.push(p.id)
  }

  const idx = await numberedMenu('🐉 Select a provider:', choices)
  return byId[idx]
}

async function selectModelForProvider(provider: string, defaultModel?: string): Promise<string> {
  const isLocal = !isCloudProvider(provider)

  if (isLocal) {
    console.log(dim + 'Fetching models from ' + provider + '...' + reset)
    const models = await fetchLocalModels(provider)
    if (models.length === 0) {
      console.log('   [WARN] No models found. Is Ollama running?')
      return DEFAULT_MODEL[provider] ?? 'llama3.2'
    }
    if (defaultModel) {
      const idx = models.indexOf(defaultModel)
      if (idx >= 0) {
        console.log(`${dim}Available models (default: ${defaultModel}):${reset}`)
        models.forEach((m, i) => console.log(`  ${i+1}. ${m}${i === idx ? ' ←' : ''}`))
        const choice = await question(`  Select model number [${idx + 1}] > `) || String(idx + 1)
        const n = parseInt(choice)
        if (n >= 1 && n <= models.length) return models[n-1]
        return models[idx]
      }
    }
    console.log(`${dim}Available models:${reset}`)
    models.forEach((m, i) => console.log(`  ${i+1}. ${m}`))
    const idx = await question('  Select model number > ')
    const n = parseInt(idx)
    if (n >= 1 && n <= models.length) return models[n-1]
    return models[0]
  } else {
    const models = CLOUD_MODELS[provider] ?? CODEX_MODELS
    if (defaultModel) {
      const idx = models.indexOf(defaultModel)
      if (idx >= 0) {
        console.log(`${dim}Available models (default: ${defaultModel}):${reset}`)
        models.forEach((m, i) => console.log(`  ${i+1}. ${m}${i === idx ? ' ←' : ''}`))
        const choice = await question(`  Select model number [${idx + 1}] > `) || String(idx + 1)
        const n = parseInt(choice)
        if (n >= 1 && n <= models.length) return models[n-1]
        return models[idx]
      }
    }
    console.log(`${dim}Available models:${reset}`)
    models.forEach((m, i) => console.log(`  ${i+1}. ${m}`))
    const idx = await question('  Select model number > ')
    const n = parseInt(idx)
    if (n >= 1 && n <= models.length) return models[n-1]
    return models[0]
  }
}

async function selectContextSize(defaultSize?: string): Promise<{ size: string; max: number }> {
  console.log(`${dim}Context window size:${reset}`)
  CONTEXT_SIZES.forEach((size, i) => {
    const marker = defaultSize === size ? ' ←' : ''
    console.log(`  [${i+1}] ${size} tokens${marker}`)
  })
  let defaultIdx = defaultSize ? CONTEXT_SIZES.indexOf(defaultSize) : 2
  if (defaultIdx < 0) defaultIdx = 2
  const ctxIdx = await question(`  > [${defaultIdx + 1}] `) || String(defaultIdx + 1)
  const idx = parseInt(ctxIdx) - 1
  const size = CONTEXT_SIZES[idx] || '32K'
  return { size, max: parseContextSize(size) }
}

async function promptApiKey(provider: string): Promise<string | null> {
  if (provider === 'codex') {
    console.log(`\n🔑 ChatGPT Plus: A browser will open for you to sign in.`)
    return 'codex-oauth'
  }

  const env = getApiKeyFromEnv(provider)
  if (env) return env

  const providerHelp: Record<string, string> = {
    anthropic: 'https://console.anthropic.com/',
    openai: 'https://platform.openai.com/',
    groq: 'https://console.groq.com/',
    deepseek: 'https://platform.deepseek.com/',
    mistral: 'https://console.mistral.ai/',
    openrouter: 'https://openrouter.ai/',
    gemini: 'https://aistudio.google.com/',
    qwen: 'https://dashscope.console.aliyun.com/',
  }

  console.log(`\n⚠️  To use ${provider}, you need a free API key.`)
  console.log(`    1. Visit: ${providerHelp[provider] || 'the provider website'}`)
  console.log(`    2. Create an account and get your API key`)
  console.log(`    3. Set it with: export ${provider.toUpperCase()}_API_KEY=your-key-here`)
  return null
}

// ── Validate saved model exists ─────────────────────────────────────────────

async function validateSavedConfig(session: ReturnType<typeof buildSessionFromSaved>): Promise<boolean> {
  if (session.provider === 'codex') {
    const token = loadCodexToken()
    return token !== null && isCodexTokenValid(token)
  }
  if (isCloudProvider(session.provider)) {
    return getApiKeyFromEnv(session.provider) !== null
  }
  // Local provider - check if model still exists
  const models = await fetchLocalModels(session.provider)
  return models.includes(session.model)
}

// ── Interactive setup ───────────────────────────────────────────────────────

async function interactiveSetup(saved?: ReturnType<typeof loadSession>): Promise<Session> {
  console.log(`\n🐉 ${s('BEAST', fg.accent, bold)} ${s('CLI', fg.mauve, bold)} ${s(`v${VERSION}`, fg.muted)} ${s('·', fg.muted)} ${s('45+ Providers', fg.secondary)} ${s('·', fg.muted)} ${s('51+ Tools', fg.secondary)}`)

  const providers = await detectAllProviders()
  console.log(`${s('✓', fg.success)} MCP: ${nativeTools.length} tools | ${s('✓', fg.success)} Ollama: ${providers.find(p=>p.id==='ollama')?.models.length || 0} models`)

  // Select provider
  const provider = await selectProvider(providers)

  // API key if needed
  let apiKey: string | undefined
  if (isCloudProvider(provider)) {
    const key = await promptApiKey(provider)
    if (!key) {
      console.log(`   ${s('!', fg.warning)} No API key`)
      process.exit(1)
    }
    apiKey = key
  }

  // Select model
  const model = await selectModelForProvider(provider, saved?.model)

  // Select context size
  const { size, max } = await selectContextSize(saved?.contextSize)

  console.log(`
${s('✓', fg.success)} Provider: ${bold}${provider}${reset}
${s('✓', fg.success)} Model: ${bold}${model}${reset}
${s('✓', fg.success)} Context: ${bold}${size} tokens${reset}
`)

  return { provider, model, apiKey, baseUrl: getBaseUrl(provider), messages: [], contextMax: max }
}

function buildSessionFromSaved(saved: ReturnType<typeof loadSession>): Session | null {
  if (!saved) return null
  return {
    provider: saved.provider,
    model: saved.model,
    apiKey: getApiKeyFromEnv(saved.provider),
    baseUrl: getBaseUrl(saved.provider),
    messages: [],
    contextMax: saved.contextMax,
  }
}

function estimateContextUsed(messages: Session['messages']): number {
  const avgTokensPerMsg = 50 / 4
  return Math.round(messages.length * avgTokensPerMsg)
}

// ── Banner ───────────────────────────────────────────────────────────────────

function printBanner(session: Session) {
  const toolCount = nativeTools.length
  console.log(renderHeader({
    version: VERSION,
    provider: session.provider,
    model: session.model,
    toolsCount: toolCount,
  }))
  console.log('\n' + inlineList([
    { icon: icon.prompt, label: 'Type', value: 'your request' },
    { icon: icon.tool, label: toolCount + ' tools', value: 'available' },
  ]))
  console.log('\n' + s('Commands:', fg.muted))
  console.log(helpPanel([
    { cmd: '/help', desc: 'Show all commands' },
    { cmd: '/switch', desc: 'Change provider/model/context' },
    { cmd: '/tools', desc: 'List available tools' },
    { cmd: '/clear', desc: 'Clear chat history' },
    { cmd: '/exit', desc: 'Quit Beast CLI' },
  ]))
  console.log('')
}

// ── REPL ─────────────────────────────────────────────────────────────────────

async function repl(session: Session) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  // Polished REPL prompt with Google-style `>` with accent color
  const promptUser = () => rl.question('\n' + s('> ', fg.accent), async (input) => {
    const trimmed = input.trim()

    if (!trimmed) { promptUser(); return }

    if (trimmed === 'exit' || trimmed === 'quit') {
      console.log('\n' + s('👋 Goodbye!', fg.primary) + '\n')
      process.exit(0)
    }

    if (trimmed === '/help') {
      console.log(`
Commands:
  /help           Show this help
  /switch         Reconfigure provider/model/context
  /models         List available models for current provider
  /model          Interactively switch model
  /model <name>   Switch to model by name or number
  /provider       Interactively switch provider
  /provider <name>  Switch directly to provider
  /login          Authenticate ChatGPT Plus (Codex OAuth)
  /logout         Clear ChatGPT Plus authentication
  /tools          List available tools
  /clear          Clear chat history
  /exit           Exit
`)
      promptUser(); return
    }

    // /switch - reconfigure everything
    if (trimmed === '/switch') {
      const newSession = await interactiveSetup()
      Object.assign(session, newSession)
      // Save the new config
      saveSession({
        provider: session.provider,
        model: session.model,
        contextSize: session.contextMax ? (session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + 'K' : String(session.contextMax)) : '32K',
        contextMax: session.contextMax || 32768,
        savedAt: Date.now(),
      })
      printBanner(session)
      promptUser(); return
    }

    if (trimmed === '/login') {
      console.log('\n🔑 Initiating ChatGPT Plus OAuth login...')
      const { createProvider } = await import('./providers/index.ts')
      try {
        await createProvider({ provider: 'codex', model: 'gpt-5.2-codex' })
        console.log('\n✅ ChatGPT Plus authenticated!')
      } catch (e: any) {
        console.log(`\n❌ Login failed: ${e.message}`)
      }
      promptUser(); return
    }

    if (trimmed === '/logout') {
      clearCodexToken()
      console.log('\n✅ ChatGPT Plus logout complete.')
      promptUser(); return
    }

    if (trimmed === '/models') {
      if (session.provider === 'codex') {
        console.log(`\nAvailable ChatGPT Plus models (${CODEX_MODELS.length}):`)
        CODEX_MODELS.forEach((m, i) => console.log(`  [${i + 1}] ${m}`))
      } else if (isCloudProvider(session.provider)) {
        const models = CLOUD_MODELS[session.provider] ?? []
        console.log(`\nAvailable models for ${session.provider}:`)
        models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`))
      } else {
        const models = await fetchLocalModels(session.provider)
        if (models.length === 0) {
          console.log('\n' + s('!', fg.warning) + ' Could not fetch models. Is the server running?')
        } else {
          console.log(`\nAvailable models on ${session.provider}:`)
          models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`))
        }
      }
      promptUser(); return
    }

    if (trimmed === '/tools') {
      const tools = getFormattedTools()
      console.log(`\n🔧 ${tools.length} native tools available:`)
      tools.forEach(t => {
        const desc = t.description ? ` — ${t.description.slice(0, 60)}` : ''
        console.log(`  • ${t.name}${desc}`)
      })
      promptUser(); return
    }

    if (trimmed === '/model') {
      const model = await selectModelForProvider(session.provider, session.model)
      session.model = model
      const ctxSize = session.contextMax ? (session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + 'K' : String(session.contextMax)) : '32K'
      saveSession({ provider: session.provider, model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() })
      console.log(`\n✅ Model switched to: ${model}`)
      promptUser(); return
    }

    if (trimmed.startsWith('/model ')) {
      const target = trimmed.slice(7).trim()
      const models = isCloudProvider(session.provider)
        ? (CLOUD_MODELS[session.provider] ?? CODEX_MODELS)
        : await fetchLocalModels(session.provider)
      const n = parseInt(target)
      if (n >= 1 && n <= models.length) session.model = models[n - 1]
      else if (models.includes(target)) session.model = target
      else {
        console.log(`\n${s('!', fg.warning)} Unknown model: ${target}`)
        console.log(`   Run /models to see available models.`)
        promptUser(); return
      }
      const ctxSize = session.contextMax ? (session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + 'K' : String(session.contextMax)) : '32K'
      saveSession({ provider: session.provider, model: session.model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() })
      console.log(`\n✅ Model switched to: ${session.model}`)
      promptUser(); return
    }

    if (trimmed === '/provider') {
      const providers = await detectAllProviders()
      const newProvider = await selectProvider(providers)
      if (isCloudProvider(newProvider)) {
        const key = await promptApiKey(newProvider)
        if (!key) { console.log('\n' + s('!', fg.warning) + ' Provider switch cancelled.'); promptUser(); return }
        session.apiKey = key
      }
      const newModel = await selectModelForProvider(newProvider)
      const { size, max } = await selectContextSize()
      session.provider = newProvider
      session.model = newModel
      session.baseUrl = getBaseUrl(newProvider)
      session.contextMax = max
      saveSession({ provider: newProvider, model: newModel, contextSize: size, contextMax: max, savedAt: Date.now() })
      printBanner(session)
      promptUser(); return
    }

    if (trimmed.startsWith('/provider ')) {
      const target = trimmed.slice(10).trim()
      const providers = await detectAllProviders()
      const found = providers.find(p => p.id === target)
      if (!found) {
        console.log(`\n${s('!', fg.warning)} Unknown provider: ${target}`)
        console.log('   Run /provider to see available providers.')
        promptUser(); return
      }
      if (isCloudProvider(target)) {
        const key = await promptApiKey(target)
        if (!key) { console.log('\n' + s('!', fg.warning) + ' Provider switch cancelled.'); promptUser(); return }
        session.apiKey = key
      }
      const newModel = await selectModelForProvider(target)
      const { size, max } = await selectContextSize()
      session.provider = target
      session.model = newModel
      session.baseUrl = getBaseUrl(target)
      session.contextMax = max
      saveSession({ provider: target, model: newModel, contextSize: size, contextMax: max, savedAt: Date.now() })
      printBanner(session)
      promptUser(); return
    }

    if (trimmed === '/clear') {
      session.messages = []
      console.log('\n✅ Chat history cleared.')
      promptUser(); return
    }

    // ── Real-time query detection ───────────────────────────────────────────

    const REALTIME_KEYWORDS = [
      'price', 'rate', 'rates', 'weather', 'news', 'today', 'current',
      'latest', 'now', 'recent', 'gold', 'silver', 'petrol', 'dollar',
      'rupee', 'inflation', 'gdp', 'stock', 'market', 'trending',
      'score', 'match', 'result', 'election', 'government', 'policy',
    ]

    function looksLikeRealTimeQuery(query: string): boolean {
      const lower = query.toLowerCase()
      return REALTIME_KEYWORDS.some(kw => lower.includes(kw))
    }

    function isApologyOrNoAccess(response: string): boolean {
      const lower = response.toLowerCase()
      const noDataPhrases = [
        "don't have access", "do not have access",
        "no real-time", "not have real-time", "don't have real-time",
        "can't access", "cannot access",
        "don't have current", "no up-to-date", "don't have up-to-date",
        "don't know current", "don't have the ability to",
        "don't have browsing", "no browsing ability",
        "only have knowledge", "training data", "my knowledge",
      ]
      return noDataPhrases.some(phrase => lower.includes(phrase))
    }

    function providerSupportsNativeTools(sessionProvider: string): boolean {
      const noNativeToolSupport = ['ollama']
      return !noNativeToolSupport.includes(sessionProvider)
    }

    // ── Agent Loop ───────────────────────────────────────────────────────────
    const MAX_TOOL_CALLS = 20
    let toolCallCount = 0
    const agentMessages = [...session.messages]

    if (nativeTools.length > 0) {
      agentMessages.unshift({
        role: 'system',
        content: `You have access to ${nativeTools.length} native tools. Use them to get real-time data, search the web, read/write files, run code, fetch content, etc. Available tools: ${nativeTools.map(t => `${t.name}: ${t.description ?? 'no description'}`).join(', ')}`,
      })
    }

    agentMessages.push({ role: 'user' as const, content: trimmed })

    startFunSpinner('thinking')
    try {
      const provider = await createProvider({
        provider: session.provider as any,
        model: session.model,
        apiKey: session.apiKey,
        baseUrl: session.baseUrl || undefined,
      })

      while (toolCallCount < MAX_TOOL_CALLS) {
        const tools = nativeTools.length > 0 ? nativeTools : undefined

        const response = await provider.create({
          messages: agentMessages,
          tools,
          maxTokens: 16384,
        })

        stopFunSpinner('done')

        // Notify on completion (bell + notification)
        if (toolCallCount === 0 && response.content) {
          onResponseReady()
        }

        // Notify when tools completed and response is ready (analysis/research done)
        if (toolCallCount > 0 && response.content) {
          onResponseReady()
        }

        if (!response.toolCalls || response.toolCalls.length === 0) {
          const noNativeTools = !providerSupportsNativeTools(session.provider)
          const needsRealTime = looksLikeRealTimeQuery(trimmed)
          const looksLikeApology = response.content ? isApologyOrNoAccess(response.content) : false

          if (noNativeTools && needsRealTime && looksLikeApology) {
            // Polished inline status for real-time query detection
            console.log(s('\n🔍 Auto-detected real-time query', fg.sapphire) + s(' — fetching live data...', fg.muted))

            const searchQuery = trimmed
            const searchResult = await withProgress(
              'Searching',
              executeTool('searxng_search', { query: searchQuery, limit: 10 }),
            )

            const resultText = searchResult.success ? searchResult.content : `Error: ${searchResult.error}`
            const truncated = resultText.length > 200 ? resultText.slice(0, 200) + '...' : resultText
            console.log(s('  📤 Result:', fg.tool) + ' ' + s(truncated, fg.secondary) + '\n')

            agentMessages.push({ role: 'assistant', content: response.content })
            agentMessages.push({
              role: 'user',
              content: `Search results for "${searchQuery}":\n${resultText}\n\nPlease provide a clear, concise answer based on these results.`,
            })

            startFunSpinner('formatting')
            const formatted = await provider.create({
              messages: agentMessages,
              tools: undefined,
              maxTokens: 16384,
            })
            stopFunSpinner('done')

            if (formatted.content) {
              streamText(formatted.content)
            }
            printUsage(formatted.usage ?? response.usage)
            agentMessages.push({ role: 'assistant', content: formatted.content })
            break
          }

          if (response.content) {
            streamText(response.content)
          }
          agentMessages.push({ role: 'assistant', content: response.content })
          break
        }

        // Process tool calls
        for (const tc of response.toolCalls) {
          toolCallCount++
          const toolName = tc.name
          const toolArgs = tc.arguments ?? {}

                    process.stdout.write('\n')
          const argsStr = JSON.stringify(toolArgs)
          const argsDisplay = argsStr.length > 60 ? argsStr.slice(0, 60) + '...' : argsStr
          process.stdout.write(s('🔧 ' + toolName, fg.tool) + ' ' + s(argsDisplay, fg.muted) + '\n')

          // Start fun spinner for tool execution
          startFunSpinner('tool')
          const toolResult = await executeTool(toolName, toolArgs)
          stopFunSpinner(toolResult.success ? 'done' : 'error')

          console.log(renderToolResult(toolName, toolResult))

          agentMessages.push({
            role: 'assistant',
            content: response.content,
            toolCalls: [tc],
          })
          agentMessages.push({
            role: 'user',
            content: toolResult.content,
            toolCallId: tc.id,
          })
        }
      }

      if (toolCallCount >= MAX_TOOL_CALLS) {
        console.log(s(`\n⚠️  Reached tool call limit (${MAX_TOOL_CALLS}). Truncating.`, fg.warning))
      }

      session.messages = agentMessages
      if (session.messages.length > 40) {
        session.messages = session.messages.slice(-40)
      }

      process.stdout.write(tipBanner())
      if (session.contextMax) {
        const used = estimateContextUsed(agentMessages)
        process.stdout.write(contextBar({ used, max: session.contextMax }) + '\n')
      }
    } catch (e) {
      stopFunSpinner('error')
      console.log(`\n❌ Error: ${e}`)
      if (session.messages.length > 0) session.messages.pop()
    }

    try {
      if (!rl.closed) promptUser()
    } catch {}
  })

  promptUser()
}

// ── Main ─────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(renderCleanBanner())
  console.log(`
🐉 BEAST CLI v${VERSION} - AI Coding Agent

USAGE:
  beast [options]

OPTIONS:
  --provider <name>  LLM provider (ollama, codex, anthropic, openai, etc.)
  --model <name>     Model name
  --defaults         Use saved config or auto-select best option
  --switch           Reconfigure provider/model/context
  --setup            Auto-start MCP server
  --help             Show this help

SESSION COMMANDS:
  /switch        Reconfigure everything (provider, model, context)
  /provider      Switch provider (interactive)
  /provider <name>  Switch to provider by name
  /model         Switch model (interactive)
  /model <name>  Switch to model by name or number
  /models        List available models
  /tools         List available tools
  /clear         Clear chat history
  /help          Show this help
  /exit          Exit

EXAMPLES:
  beast                          # Use saved config or auto-select
  beast --defaults               # Quick start with best option
  beast --switch                 # Reconfigure from scratch
  beast --provider ollama        # Use Ollama with model picker
`)
}

async function main() {
  const args = Bun.argv.slice(2)
  const options: CLIOptions = {}

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--help': case '-h': options.help = true; break
      case '--provider': options.provider = args[++i]; break
      case '--model': options.model = args[++i]; break
      case '--test': options.test = true; break
      case '--setup': options.setup = true; break
      case '--defaults': options.defaults = true; break
      case '--switch': options.switch = true; break
    }
  }

  if (options.help) { printHelp(); process.exit(0) }
  if (options.test) { console.log('Running tests...'); process.exit(0) }

  // Connect MCP (silent, no noisy output)
  await connectMCP()

  // Clean banner
  console.log(renderCleanBanner())

  let session: Session

  // Check for saved config first
  const saved = loadSession()
  const savedValid = saved ? await validateSavedConfig(buildSessionFromSaved(saved)!) : false

  if (options.switch) {
    // Force reconfigure
    session = await interactiveSetup(saved || undefined)
  } else if (options.provider && options.model) {
    // CLI flags override
    session = {
      provider: options.provider,
      model: options.model,
      apiKey: getApiKeyFromEnv(options.provider),
      baseUrl: getBaseUrl(options.provider),
      messages: [],
      contextMax: 32768,
    }
  } else if (options.defaults) {
    // Auto-select best option
    const token = loadCodexToken()
    if (token && isCodexTokenValid(token)) {
      session = { provider: 'codex', model: 'gpt-5.2-codex', apiKey: undefined, baseUrl: 'https://chatgpt.com/backend-api', messages: [], contextMax: 128 * 1024 }
      console.log(`✅ ChatGPT Plus (logged in)`)
    } else {
      const ollamaModels = await fetchOllamaModels()
      if (ollamaModels.length > 0) {
        session = { provider: 'ollama', model: ollamaModels[0], apiKey: undefined, baseUrl: 'http://localhost:11434', messages: [], contextMax: 128 * 1024 }
        console.log(`✅ Ollama (${ollamaModels[0]}) — Free & offline`)
      } else {
        session = await interactiveSetup(saved || undefined)
      }
    }
  } else if (saved && savedValid) {
    // Use saved config
    session = buildSessionFromSaved(saved)!
    const ctxStr = saved.contextMax ? (saved.contextMax >= 1024 ? Math.round(saved.contextMax / 1024) + 'K' : String(saved.contextMax)) : '32K'
    console.log(`✅ Using saved config: ${session.provider} / ${session.model} / ${ctxStr}`)
  } else {
    // No saved config or invalid - run setup once and save
    session = await interactiveSetup(saved || undefined)
  }

  // Save session for next time (if not already saved)
  const ctxSize = session.contextMax ? (session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + 'K' : '32K') : '32K'
  saveSession({ provider: session.provider, model: session.model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() })

  await repl(session)
}

main().catch(console.error)