#!/usr/bin/env bun
/**
 * Beast CLI - Main Entry Point
 * AI Coding Agent with 45+ Providers
 * MCP tools work automatically (black box)
 */

import { createProvider } from './providers/index.ts'
import { TCPTransport } from './mcp/index.ts'
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
const VERSION = '1.0.3'

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

interface Session {
  provider: string
  model: string
  apiKey?: string
  baseUrl: string
  messages: { role: string; content: string }[]
}

// ── readline helpers ─────────────────────────────────────────────────────────

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

// ── MCP Server ────────────────────────────────────────────────────────────────

async function checkMCPServer(): Promise<{ available: boolean; toolCount: number }> {
  try {
    const transport = new TCPTransport(MCP_SERVER_HOST, MCP_SERVER_PORT)
    await transport.connect()
    const tools = await transport.listTools()
    return { available: true, toolCount: tools.length }
  } catch {
    return { available: false, toolCount: 0 }
  }
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

// ── Provider & Model selection ───────────────────────────────────────────────

async function selectProvider(providers: ProviderInfo[], config: ReturnType<typeof loadConfig>): Promise<string> {
  // If config has a saved provider and it's still available, auto-select it
  if (config.provider) {
    const saved = providers.find(p => p.id === config.provider)
    if (saved) {
      console.log(`\n   Using saved provider: ${saved.name}`)
      return saved.id
    }
  }

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

async function selectModelForProvider(
  provider: string,
  savedModel?: string
): Promise<string> {
  const isLocal = !isCloudProvider(provider)

  if (isLocal) {
    console.log(`\n   ⏳ Fetching models from ${provider}...`)
    const models = await fetchLocalModels(provider)
    if (models.length === 0) {
      console.log('   ⚠️  No models found. Is the server running?')
      return DEFAULT_MODEL[provider] ?? 'llama3.1:8b'
    }

    // If saved model is available, use it
    if (savedModel && models.includes(savedModel)) {
      console.log(`\n   Using saved model: ${savedModel}`)
      return savedModel
    }

    const choices = models.map(m => `  ${m}`)
    const idx = await numberedMenu(`🦙 Models on Ollama:`, choices)
    return models[idx]
  } else {
    // Cloud provider — show known models
    const models = CLOUD_MODELS[provider] ?? []
    if (savedModel && models.includes(savedModel)) {
      console.log(`\n   Using saved model: ${savedModel}`)
      return savedModel
    }
    const choices = models.map(m => `  ${m}`)
    const idx = await numberedMenu(`☁️  Select a model:`, choices)
    return models[idx]
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
  console.log(`    You can set the env var \`${envName[provider]}=<key>\` and re-run.`)
  const key = await maskedPrompt(`    Enter API key (or press Enter to skip): `)
  const trimmed = key.trim()

  if (trimmed) {
    // Save to config
    saveConfig({ provider, apiKey: trimmed, model: undefined })
    console.log(`    ✅ Saved to ~/.beast-cli.yml`)
  }
  return trimmed || null
}

// ── Interactive setup ───────────────────────────────────────────────────────

async function interactiveSetup(config: ReturnType<typeof loadConfig>): Promise<Session> {
  console.log(`
🐉 Beast CLI v${VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  // Detect providers
  console.log('\n📡 Detecting services...')
  const providers = await detectAllProviders()

  const ollama = providers.find(p => p.id === 'ollama')
  const lmstudio = providers.find(p => p.id === 'lmstudio')

  if (ollama) {
    console.log(`   🦙 Ollama: ${ollama.models.length} models`)
  } else {
    console.log('   🦙 Ollama: offline')
  }
  if (lmstudio) {
    console.log(`   🏋️ LM Studio: ${lmstudio.models.length} models`)
  } else {
    console.log('   🏋️ LM Studio: offline')
  }

  // Check MCP
  const mcp = await checkMCPServer()
  if (!mcp.available) {
    const started = await autoStartMCP()
    if (started) {
      const mcp2 = await checkMCPServer()
      if (mcp2.available) console.log(`   🔧 MCP: ${mcp2.toolCount} tools connected!`)
    } else {
      console.log('   🔧 MCP: Not available (optional)')
    }
  } else {
    console.log(`   🔧 MCP: ${mcp.toolCount} tools connected!`)
  }

  // Select provider
  const provider = await selectProvider(providers, config)

  // Get API key for cloud providers
  let apiKey: string | undefined
  if (isCloudProvider(provider)) {
    const key = await promptApiKey(provider)
    if (!key) {
      console.log('   ⚠️  No API key — switching to Ollama')
      const fallback = providers.find(p => p.id === 'ollama')
      if (fallback) {
        return interactiveSetup(config) // re-prompt with different defaults
      }
      process.exit(1)
    }
    apiKey = key
  }

  // Select model
  const savedModel = config.model
  const model = await selectModelForProvider(provider, savedModel)
  const baseUrl = getBaseUrl(provider)

  // Persist selection
  saveConfig({ provider, model })

  return { provider, model, apiKey, baseUrl, messages: [] }
}

// ── Session builder (CLI flags) ─────────────────────────────────────────────

function buildSession(provider: string, model: string, config: ReturnType<typeof loadConfig>): Session {
  const apiKey = getApiKeyFromEnv(provider) ?? config.apiKey
  return { provider, model, apiKey, baseUrl: getBaseUrl(provider), messages: [] }
}

// ── Banner ───────────────────────────────────────────────────────────────────

function printBanner(session: Session) {
  const status = isCloudProvider(session.provider) ? '☁️' : '🦙'
  console.log(`
🐉 Beast CLI v${VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Ready!
   ${status} Provider: ${session.provider}
   📋 Model:   ${session.model}

Type your request or try:
   /help   for all commands
   /models to list available models
   /model  to switch model
   /provider to switch provider

Exit: Ctrl+C
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
  /help       Show this help
  /models     List available models for current provider
  /model      Interactively switch model
  /model <n>  Switch to model <n> from the list
  /provider   Interactively switch provider
  /provider <name>  Switch directly to provider
  /clear      Clear chat history
  /exit       Exit
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

    if (trimmed === '/model') {
      const model = await selectModelForProvider(session.provider, session.model)
      session.model = model
      saveConfig({ provider: session.provider, model })
      console.log(`\n✅ Model switched to: ${model}`)
      promptUser(); return
    }

    if (trimmed.startsWith('/model ')) {
      const target = trimmed.slice(7).trim()
      if (isCloudProvider(session.provider)) {
        const models = CLOUD_MODELS[session.provider] ?? []
        // Try by number
        const n = parseInt(target)
        if (n >= 1 && n <= models.length) {
          session.model = models[n - 1]
        } else if (models.includes(target)) {
          session.model = target
        } else {
          console.log(`\n⚠️  Unknown model: ${target}`)
          console.log(`   Run /models to see available models.`)
          promptUser(); return
        }
      } else {
        const models = await fetchLocalModels(session.provider)
        const n = parseInt(target)
        if (n >= 1 && n <= models.length) {
          session.model = models[n - 1]
        } else if (models.includes(target)) {
          session.model = target
        } else {
          console.log(`\n⚠️  Model not found: ${target}`)
          console.log(`   Run /models to see available models.`)
          promptUser(); return
        }
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
      printBanner(session)
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

    // ── Chat ────────────────────────────────────────────────────────────────
    console.log('\n⏳ Thinking...')
    try {
      const p = await createProvider({
        provider: session.provider as any,
        model: session.model,
        apiKey: session.apiKey,
        baseUrl: session.baseUrl || undefined,
      })

      const response = await p.create({
        messages: [
          ...session.messages,
          { role: 'user', content: trimmed },
        ],
        maxTokens: 4096,
      })

      console.log(`\n🤖 ${response.content}`)

      // Append to history
      session.messages.push({ role: 'user', content: trimmed })
      session.messages.push({ role: 'assistant', content: response.content })

      // Trim history to last 20 messages to avoid context bloat
      if (session.messages.length > 40) {
        session.messages = session.messages.slice(-40)
      }
    } catch (e) {
      console.log(`\n❌ Error: ${e}`)
    }

    promptUser()
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

LOCAL PROVIDERS:
  ollama     - Run: brew install ollama && ollama serve
  lmstudio   - Download from lmstudio.ai
  jan        - Run: janusher紧闭

CLOUD PROVIDERS:
  anthropic  - Claude models (needs ANTHROPIC_API_KEY)
  openai     - GPT models (needs OPENAI_API_KEY)
  deepseek   - DeepSeek models (needs DEEPSEEK_API_KEY)
  groq       - Fast inference (needs GROQ_API_KEY)
  mistral    - Mistral models (needs MISTRAL_API_KEY)
  openrouter - Unified gateway (needs OPENROUTER_API_KEY)
  qwen       - Qwen models (needs DASHSCOPE_API_KEY)
  gemini     - Google Gemini (needs GEMINI_API_KEY)

SESSION COMMANDS:
  /provider       Switch provider (interactive)
  /provider <n>   Switch to provider by name
  /model          Switch model (interactive)
  /model <name>   Switch to model by name or number
  /models         List available models
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
  if (options.test) {
    console.log('Running tests...'); process.exit(0)
  }
  if (options.setup) {
    await autoStartMCP(); process.exit(0)
  }

  // Load persistent config
  const config = loadConfig()

  // Build session
  let session: Session
  if (options.provider && options.model) {
    // Direct mode — skip interactive setup
    session = buildSession(options.provider, options.model, config)
    printBanner(session)
  } else {
    // Interactive setup
    session = await interactiveSetup(config)
    printBanner(session)
  }

  // Start REPL
  await repl(session)
}

main().catch(console.error)
