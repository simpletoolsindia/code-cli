#!/usr/bin/env bun
/**
 * Beast CLI - Main Entry Point
 * AI Coding Agent with 45+ Providers
 * MCP tools work automatically (black box)
 */

import { createProvider } from './providers/index.ts'
import { TCPTransport } from './mcp/index.ts'
import { getFormattedTools, executeTool, getAllTools } from './native-tools/index.ts'
import type { ToolCall } from './providers/index.ts'
import {
  detectAllProviders,
  fetchLocalModels,
  getApiKeyFromEnv,
  isCloudProvider,
  DEFAULT_MODEL,
  CLOUD_MODELS,
  getBaseUrl,
  type ProviderInfo,
} from './providers/discover.ts'
import { loadConfig, saveConfig } from './config/index.ts'
import { execSync } from 'child_process'
import path from 'node:path'
import { statSync } from 'node:fs'
import readline from 'node:readline'

// Version
const VERSION = '1.2.4'

// Color codes
const dim = '\x1b[2m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'
const green = '\x1b[32m'
const cyan = '\x1b[36m'
const yellow = '\x1b[33m'
const red = '\x1b[31m'

// MCP Server URL
const MCP_SERVER_HOST = process.env.MCP_HOST || 'localhost'
const MCP_SERVER_PORT = parseInt(process.env.MCP_PORT || '7710')

// ── Types ────────────────────────────────────────────────────────────────────

interface CLIOptions {
  provider?: string
  model?: string
  help?: boolean
  test?: boolean
  setup?: boolean
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

async function maskedPrompt(promptText: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(promptText, answer => { rl.close(); resolve(answer) })
  })
}

// Animated spinner
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
let spinnerHandle: ReturnType<typeof setInterval> | null = null

function startSpinner(label: string): void {
  let frame = 0
  process.stdout.write(`\r${label} ${SPINNER_FRAMES[frame]}`)
  spinnerHandle = setInterval(() => {
    frame = (frame + 1) % SPINNER_FRAMES.length
    process.stdout.write(`\r${label} ${SPINNER_FRAMES[frame]}  `)
  }, 80)
}

function stopSpinner(done = false, label = ''): void {
  if (spinnerHandle) {
    clearInterval(spinnerHandle)
    spinnerHandle = null
  }
  if (done) {
    process.stdout.write(`\r${label} ✅\n`)
  } else {
    process.stdout.write('\r' + ' '.repeat(50) + '\r')
  }
}

// Streaming write — writes text char by char with cursor
function streamText(text: string): void {
  process.stdout.write('\n🤖 ')
  for (const ch of text) {
    process.stdout.write(ch)
  }
  process.stdout.write('\n')
}

// Print token usage in a compact line
function printUsage(usage?: { promptTokens: number; completionTokens: number; totalTokens: number }): void {
  if (!usage) return
  const { promptTokens, completionTokens, totalTokens } = usage
  process.stdout.write(`\n   📊 Tokens: prompt=${promptTokens} | completion=${completionTokens} | total=${totalTokens}\n`)
}

// ── MCP Server ────────────────────────────────────────────────────────────────

async function checkMCPServer(): Promise<{ available: boolean; toolCount: number; tools: MCPTool[] }> {
  // Always return native tools available (no MCP needed)
  const nativeTools = getFormattedTools()
  return { available: true, toolCount: nativeTools.length, tools: nativeTools as MCPTool[] }
}

async function startColima(): Promise<boolean> {
  console.log('   🐋 Checking Docker runtime...')
  try {
    execSync('docker info', { stdio: 'pipe' })
    console.log('   ✅ Docker is running')
    return true
  } catch {
    console.log('   🔄 Docker not running, trying to start Colima...')
  }
  try {
    execSync('colima --version', { stdio: 'pipe' })
  } catch {
    console.log('   ⚠️  Colima not found. Install: brew install colima')
    return false
  }
  try {
    execSync('colima list', { stdio: 'pipe' })
    const status = execSync('colima list 2>/dev/null', { encoding: 'utf8' })
    if (status.includes('Running')) { console.log('   ✅ Colima is already running'); return true }
  } catch {}
  try {
    console.log('   🚀 Starting Colima (this may take a minute)...')
    execSync('colima start --arch aarch64 --cpu 4 --memory 4 --disk 50', { stdio: 'pipe', timeout: 180000 })
    console.log('   ✅ Colima started successfully!')
    return true
  } catch (e: any) {
    console.log(`   ⚠️  Failed to start Colima: ${e.message}`)
    return false
  }
}

function findComposeFile(): string | null {
  let dir = process.cwd()
  const root = '/'
  while (dir !== root) {
    const composePath = path.join(dir, 'extra_skills_mcp_tools', 'docker-compose.local.yml')
    try { if (statSync(composePath).isFile()) return composePath } catch {}
    dir = path.dirname(dir)
  }
  const fallbacks = ['/Users/sridhar/code/extra_skills_mcp_tools/docker-compose.local.yml']
  for (const p of fallbacks) { try { if (statSync(p).isFile()) return p } catch {} }
  return null
}

async function autoStartMCP(): Promise<boolean> {
  console.log('   🔧 MCP: Not found, checking Docker...')
  const dockerReady = await startColima()
  if (!dockerReady) { console.log('   ⚠️  Docker unavailable. MCP tools will be limited.'); return false }
  const composePath = findComposeFile()
  if (!composePath) {
    console.log('   ⚠️  MCP server not found.')
    console.log('   💡 Clone: git clone https://github.com/simpletoolsindia/extra_skills_mcp_tools')
    return false
  }
  try {
    const status = execSync('docker inspect -f "{{.State.Status}}" mcp-server 2>/dev/null', { encoding: 'utf8' }).trim()
    if (status === 'running' || status === 'healthy') { console.log('   ✅ MCP server already running'); return true }
  } catch {}
  try {
    execSync(`docker compose -f "${composePath}" up -d 2>/dev/null`, { stdio: 'pipe', timeout: 120000 })
    console.log('   ✅ MCP server container started!')
    await new Promise(r => setTimeout(r, 3000))
    return true
  } catch (e: any) {
    console.log(`   ⚠️  Could not start MCP from ${composePath}: ${e.message}`)
  }
  return false
}

// ── MCP Tool Calling ──────────────────────────────────────────────────────────

let nativeTools: MCPTool[] = []

async function connectMCP(): Promise<MCPTool[]> {
  // Always use native tools — no TCP connection needed
  nativeTools = getFormattedTools() as MCPTool[]
  return nativeTools
}

async function callMCPTool(name: string, args: Record<string, unknown>): Promise<string> {
  // Use native tool execution instead of MCP TCP
  const result = await executeTool(name, args)
  if (result.success) {
    return result.content
  }
  return `Error: ${result.error}`
}

function formatMCPTools(): { name: string; description?: string; inputSchema: Record<string, unknown> }[] {
  return nativeTools.length > 0 ? nativeTools as MCPTool[] : getFormattedTools() as MCPTool[]
}

// ── Provider & Model selection ───────────────────────────────────────────────

async function selectProvider(providers: ProviderInfo[]): Promise<string> {
  const online = providers.filter(p => p.status === 'online')
  const offline = providers.filter(p => p.status === 'offline')

  const choices: string[] = []
  const byId: string[] = []

  for (const p of online) {
    const models = p.isCloud ? `${CLOUD_MODELS[p.id]?.length ?? 0} models` : `${p.models.length} models`
    choices.push(`● ${p.name} (${p.shortName}) — ${models}`)
    byId.push(p.id)
  }
  for (const p of offline) {
    const note = p.isCloud ? ' (needs API key)' : ' (offline)'
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
    // Pre-select if defaultModel matches
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
    const models = CLOUD_MODELS[provider] ?? []
    // Pre-select if defaultModel matches
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

async function promptApiKey(provider: string): Promise<string | null> {
  const env = getApiKeyFromEnv(provider)
  if (env) return env

  const envName: Record<string, string> = {
    anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY', groq: 'GROQ_API_KEY',
    mistral: 'MISTRAL_API_KEY', openrouter: 'OPENROUTER_API_KEY',
    qwen: 'DASHSCOPE_API_KEY', gemini: 'GEMINI_API_KEY',
  }

  console.log(`\n⚠️  ${provider} requires an API key.`)
  console.log(`    Set env var: export ${envName[provider]}=<your-key>`)
  const key = await maskedPrompt(`    Enter API key (or press Enter to skip): `)
  const trimmed = key.trim()

  if (trimmed) {
    saveConfig({ provider, apiKey: trimmed, model: undefined })
    console.log(`    ✅ Saved to ~/.beast-cli.yml`)
  }
  return trimmed || null
}

// ── Interactive setup ───────────────────────────────────────────────────────

async function interactiveSetup(): Promise<Session> {
  const reset = '\x1b[0m'
  const bold = '\x1b[1m'
  const dim = '\x1b[2m'
  const green = '\x1b[32m'
  const cyan = '\x1b[36m'
  const yellow = '\x1b[33m'

  console.log(`
${bold}${green}   ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗${reset}
${bold}${green}   ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝${reset}
${bold}${green}   ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  ${reset}
${bold}${green}   ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  ${reset}
${bold}${green}   ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗${reset}
${bold}${green}   ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝${reset}
${reset}
${bold}   v${VERSION}${reset} · ${dim}45+ Providers${reset} · ${dim}39 Tools${reset} · ${dim}Local AI Ready${reset}

`)

  console.log(`${dim}📡 Detecting services...${reset}`)
  const providers = await detectAllProviders()

  // Connect MCP
  const mcp = await checkMCPServer()
  nativeTools = mcp.tools
  console.log(`${green}✓${reset} MCP: ${mcp.toolCount} tools | ${green}✓${reset} Ollama: ${providers.find(p=>p.id==='ollama')?.models.length || 0} models`)

  console.log('')
  const provider = await selectProvider(providers)

  let apiKey: string | undefined
  if (isCloudProvider(provider)) {
    const key = await promptApiKey(provider)
    if (!key) {
      console.log(`   ${yellow}⚠${reset} No API key`)
      process.exit(1)
    }
    apiKey = key
  }

  console.log('')
  const model = await selectModelForProvider(provider)
  const baseUrl = getBaseUrl(provider)

  // Ask context size
  console.log('')
  const contextSizes = ['8K', '16K', '32K', '64K', '128K']
  console.log(`${dim}Context window size:${reset}`)
  contextSizes.forEach((size, i) => console.log(`  ${dim}[${i+1}]${reset} ${size} tokens`))
  const ctxIdx = await question('  > ') || '3'
  const contextSize = contextSizes[parseInt(ctxIdx)-1] || '32K'

  console.log(`
${green}✓${reset} Provider: ${bold}${provider}${reset}
${green}✓${reset} Model: ${bold}${model}${reset}
${green}✓${reset} Context: ${bold}${contextSize} tokens${reset}
`)

  return { provider, model, apiKey, baseUrl, messages: [] }
}

// ── Session builder (CLI flags) ─────────────────────────────────────────────

function buildSession(provider: string, model: string): Session {
  const apiKey = getApiKeyFromEnv(provider)
  return { provider, model, apiKey, baseUrl: getBaseUrl(provider), messages: [] }
}

// ── Banner ───────────────────────────────────────────────────────────────────

function printBanner(session: Session) {
  const isCloud = isCloudProvider(session.provider)
  const icon = isCloud ? '☁️' : '🦙'
  const providerColor = isCloud ? '\x1b[36m' : '\x1b[32m' // cyan for cloud, green for local
  const reset = '\x1b[0m'
  const bold = '\x1b[1m'
  const dim = '\x1b[2m'

  const toolCount = nativeTools.length

  console.log(`
${bold}${providerColor}
   ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗${reset}
   ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝${reset}
${bold}${providerColor}
   ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  ${reset}
   ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  ${reset}
${bold}${providerColor}
   ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗${reset}
   ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝${reset}
${reset}
${bold}  Version ${VERSION}${reset} · ${dim}45+ Providers${reset} · ${dim}39 Tools${reset} · ${dim}Local AI Ready${reset}

${bold}╔══════════════════════════════════════════════════════════════════╗${reset}
${bold}║${reset}  ${icon} Provider   ${dim}:${reset} ${providerColor}${session.provider.toUpperCase()}${reset}
${bold}║${reset}  📋 Model     ${dim}:${reset} ${bold}${providerColor}${session.model}${reset}
${bold}║${reset}  🔧 Tools     ${dim}:${reset} ${bold}39${reset} native tools ready
${bold}║${reset}  💬 Context   ${dim}:${reset} ${bold}32K${reset} tokens max context
${bold}╚══════════════════════════════════════════════════════════════════╝${reset}

${dim}Commands:${reset}
  ${bold}/help${reset}       Show all commands     ${bold}/tools${reset}     List available tools
  ${bold}/model${reset}     Switch model          ${bold}/provider${reset}  Switch provider
  ${bold}/clear${reset}     Clear chat           ${bold}/exit${reset}       Quit

${bold}Ready!${reset} Type your request or try ${bold}/help${reset} for commands.
`)
}

// ── REPL ─────────────────────────────────────────────────────────────────────

async function repl(session: Session) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  const promptUser = () => rl.question('\n❯ ', async (input) => {
    const trimmed = input.trim()

    // ── Commands ──────────────────────────────────────────────────────────────
    if (!trimmed) { promptUser(); return }

    if (trimmed === 'exit' || trimmed === 'quit') {
      console.log('\n👋 Goodbye!\n')
      process.exit(0)
    }

    if (trimmed === '/help') {
      console.log(`
Commands:
  /help         Show this help
  /models       List available models for current provider
  /model        Interactively switch model
  /model <name> Switch to model by name or number
  /provider     Interactively switch provider
  /provider <name>  Switch directly to provider
  /tools        List available MCP tools
  /clear        Clear chat history
  /exit         Exit
`)
      promptUser(); return
    }

    if (trimmed === '/models') {
      if (isCloudProvider(session.provider)) {
        const models = CLOUD_MODELS[session.provider] ?? []
        console.log(`\nAvailable models for ${session.provider}:`)
        models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`))
      } else {
        const models = await fetchLocalModels(session.provider)
        if (models.length === 0) {
          console.log('\n⚠️  Could not fetch models. Is the server running?')
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
      saveConfig({ provider: session.provider, model })
      console.log(`\n✅ Model switched to: ${model}`)
      promptUser(); return
    }

    if (trimmed.startsWith('/model ')) {
      const target = trimmed.slice(7).trim()
      const models = isCloudProvider(session.provider)
        ? CLOUD_MODELS[session.provider] ?? []
        : await fetchLocalModels(session.provider)
      const n = parseInt(target)
      if (n >= 1 && n <= models.length) session.model = models[n - 1]
      else if (models.includes(target)) session.model = target
      else {
        console.log(`\n⚠️  Unknown model: ${target}`)
        console.log(`   Run /models to see available models.`)
        promptUser(); return
      }
      saveConfig({ provider: session.provider, model: session.model })
      console.log(`\n✅ Model switched to: ${session.model}`)
      promptUser(); return
    }

    if (trimmed === '/provider') {
      const config = loadConfig()
      const providers = await detectAllProviders()
      const newProvider = await selectProvider(providers, config)
      if (isCloudProvider(newProvider)) {
        const key = await promptApiKey(newProvider)
        if (!key) { console.log('\n⚠️  Provider switch cancelled.'); promptUser(); return }
        session.apiKey = key
      }
      const newModel = await selectModelForProvider(newProvider)
      session.provider = newProvider
      session.model = newModel
      session.baseUrl = getBaseUrl(newProvider)
      saveConfig({ provider: newProvider, model: newModel })
      console.log(`\n✓ Provider: ${newProvider} | Model: ${newModel}`)
      promptUser(); return
    }

    if (trimmed.startsWith('/provider ')) {
      const target = trimmed.slice(10).trim()
      const providers = await detectAllProviders()
      const found = providers.find(p => p.id === target)
      if (!found) {
        console.log(`\n⚠️  Unknown provider: ${target}`)
        console.log('   Run /provider to see available providers.')
        promptUser(); return
      }
      if (isCloudProvider(target)) {
        const key = await promptApiKey(target)
        if (!key) { console.log('\n⚠️  Provider switch cancelled.'); promptUser(); return }
        session.apiKey = key
      }
      const newModel = await selectModelForProvider(target)
      session.provider = target
      session.model = newModel
      session.baseUrl = getBaseUrl(target)
      saveConfig({ provider: target, model: newModel })
      printBanner(session)
      promptUser(); return
    }

    if (trimmed === '/clear') {
      session.messages = []
      console.log('\n✅ Chat history cleared.')
      promptUser(); return
    }

    // ── Real-time query detection ───────────────────────────────────────────

// Keywords that signal a query needs live web data
const REALTIME_KEYWORDS = [
  'price', 'rate', 'rates', 'weather', 'news', 'today', 'current',
  'latest', 'now', 'recent', 'gold', 'silver', 'petrol', 'dollar',
  'rupee', 'inflation', 'gdp', 'stock', 'market', 'trending',
  'score', 'match', 'result', 'election', 'government', 'policy',
]

// Check if a query looks like it needs real-time data
function looksLikeRealTimeQuery(query: string): boolean {
  const lower = query.toLowerCase()
  return REALTIME_KEYWORDS.some(kw => lower.includes(kw))
}

// Check if a response from a non-tool-calling model is an "I don't know" apology
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
    "截止", "我的知识", "我没有实时",
  ]
  return noDataPhrases.some(phrase => lower.includes(phrase))
}

// Detect providers that natively support tool calling (vs. local Ollama-style)
function providerSupportsNativeTools(sessionProvider: string): boolean {
  // ollama, lmstudio, jan are local providers where models may not support tool calling
  // For cloud providers and others, assume native tool calling works
  const noNativeToolSupport = ['ollama']
  return !noNativeToolSupport.includes(sessionProvider)
}

// ── Agent Loop ───────────────────────────────────────────────────────────
    const MAX_TOOL_CALLS = 20 // safety limit
    let toolCallCount = 0
    const agentMessages = [...session.messages]

    // Add system message if tools are available
    if (nativeTools.length > 0) {
      agentMessages.unshift({
        role: 'system',
        content: `You have access to ${nativeTools.length} native tools. Use them to get real-time data, search the web, read/write files, run code, fetch content, etc. Available tools: ${nativeTools.map(t => `${t.name}: ${t.description ?? 'no description'}`).join(', ')}`,
      })
    }

    agentMessages.push({ role: 'user' as const, content: trimmed })

    startSpinner('⏳ Thinking')
    try {
      const provider = await createProvider({
        provider: session.provider as any,
        model: session.model,
        apiKey: session.apiKey,
        baseUrl: session.baseUrl || undefined,
      })

      // Agent loop: keep calling LLM until no more tool calls
      while (toolCallCount < MAX_TOOL_CALLS) {
        const tools = nativeTools.length > 0 ? formatMCPTools() : undefined

        const response = await provider.create({
          messages: agentMessages,
          tools,
          maxTokens: 16384,
        })

        // Print thinking complete + usage on first response
        if (toolCallCount === 0) {
          stopSpinner(true, '⏳ Thinking')
          printUsage(response.usage)
        }

        // If no tool calls, check for auto-fallback (local models that don't support tools)
        if (!response.toolCalls || response.toolCalls.length === 0) {
          const noNativeTools = !providerSupportsNativeTools(session.provider)
          const needsRealTime = looksLikeRealTimeQuery(trimmed)
          const looksLikeApology = response.content ? isApologyOrNoAccess(response.content) : false

          // Auto-fallback: local model + real-time query + "I don't know" → call searxng_search
          if (noNativeTools && needsRealTime && looksLikeApology) {
            stopSpinner(false)
            console.log('🔍 Auto-detected real-time query. Fetching live data...')

            const searchQuery = trimmed
            const searchResult = await executeTool('searxng_search', { query: searchQuery, limit: 10 })

            const resultText = searchResult.success ? searchResult.content : `Error: ${searchResult.error}`
            console.log(`   📤 Result: ${resultText.slice(0, 300)}${resultText.length > 300 ? '...' : ''}`)

            // Feed search results back to LLM for formatting
            agentMessages.push({ role: 'assistant', content: response.content })
            agentMessages.push({
              role: 'user',
              content: `Search results for "${searchQuery}":\n${resultText}\n\nPlease provide a clear, concise answer based on these results.`,
            })

            // Second LLM call to format the results
            startSpinner('⏳ Formatting')
            const formatted = await provider.create({
              messages: agentMessages,
              tools: undefined,
              maxTokens: 16384,
            })
            stopSpinner(true, '⏳ Formatting')

            if (formatted.content) {
              streamText(formatted.content)
            }
            printUsage(formatted.usage ?? response.usage)
            agentMessages.push({ role: 'assistant', content: formatted.content })
            break
          }

          // Normal case: no tool calls, just print and done
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

          stopSpinner(false)
          process.stdout.write(`\n🔧 Calling tool: ${toolName}(${JSON.stringify(toolArgs).slice(0, 80)})...\n`)
          startSpinner('⏳ Tool')

          const toolResult = await executeTool(toolName, toolArgs)
          const result = toolResult.success ? toolResult.content : `Error: ${toolResult.error}`

          stopSpinner(true, '⏳ Tool')
          console.log(`   📤 Result: ${result.slice(0, 200)}${result.length > 200 ? '...' : ''}`)

          // Add assistant tool call message
          agentMessages.push({
            role: 'assistant',
            content: response.content,
            toolCalls: [tc],
          })
          // Add tool result message
          agentMessages.push({
            role: 'user',
            content: result,
            toolCallId: tc.id,
          })
        }

        // Continue loop for next LLM turn
      }

      if (toolCallCount >= MAX_TOOL_CALLS) {
        console.log(`\n⚠️  Reached tool call limit (${MAX_TOOL_CALLS}). Truncating.`)
      }

      // Update session history
      session.messages = agentMessages
      if (session.messages.length > 40) {
        session.messages = session.messages.slice(-40)
      }
    } catch (e) {
      stopSpinner(false)
      console.log(`\n❌ Error: ${e}`)
      // Remove failed user message from history (guard against empty)
      if (session.messages.length > 0) session.messages.pop()
    }

    // Safe promptUser restart — check readline is still open
    try {
      if (!rl.closed) promptUser()
    } catch {
      // readline closed, exit gracefully
    }
  })

  promptUser()
}

// ── Main ─────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
🐉 Beast CLI v${VERSION} - AI Coding Agent

USAGE:
  beast [options]

OPTIONS:
  --provider <name>  LLM provider (ollama, lmstudio, anthropic, openai, deepseek, etc.)
  --model <name>     Model name
  --setup            Auto-start MCP server
  --help             Show this help

SESSION COMMANDS:
  /provider       Switch provider (interactive)
  /provider <name>  Switch to provider by name
  /model          Switch model (interactive)
  /model <name>   Switch to model by name or number
  /models         List available models
  /tools          List available MCP tools
  /clear          Clear chat history
  /help           Show this help
  /exit           Exit

EXAMPLES:
  beast                          # Interactive setup
  beast --provider ollama         # Use Ollama with model picker
  beast --provider openai --model gpt-4o  # Use OpenAI directly
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
    }
  }

  if (options.help) { printHelp(); process.exit(0) }
  if (options.test) { console.log('Running tests...'); process.exit(0) }
  if (options.setup) { await autoStartMCP(); process.exit(0) }

  // Connect MCP
  startSpinner('🔧 Connecting MCP')
  await connectMCP()
  stopSpinner(nativeTools.length > 0, '🔧 MCP')

  let session: Session
  if (options.provider && options.model) {
    session = buildSession(options.provider, options.model)
  } else {
    session = await interactiveSetup()
  }

  await repl(session)
}

main().catch(console.error)
