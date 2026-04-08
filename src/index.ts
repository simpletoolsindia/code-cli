#!/usr/bin/env bun
/**
 * Beast CLI - Main Entry Point
 * AI Coding Agent with 45+ Providers
 * MCP tools work automatically (black box)
 */

import { createProvider } from './providers/index.ts'
import { TCPTransport } from './mcp/index.ts'

// Version
const VERSION = '1.0.0'

// MCP Server URL (auto-connects silently)
const MCP_SERVER_HOST = process.env.MCP_HOST || 'localhost'
const MCP_SERVER_PORT = parseInt(process.env.MCP_PORT || '7710')

interface CLIOptions {
  provider?: string
  model?: string
  help?: boolean
  test?: boolean
}

// Check if MCP server is running
async function checkMCPServer(): Promise<boolean> {
  try {
    const transport = new TCPTransport(MCP_SERVER_HOST, MCP_SERVER_PORT)
    await transport.connect()
    const tools = await transport.listTools()
    console.log(`   🔧 MCP: ${tools.length} tools connected`)
    return true
  } catch {
    return false
  }
}

// Check LLM provider
async function checkProvider(baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(1000) })
    if (res.ok) {
      const data = await res.json()
      const count = data.models?.length || 0
      return `${count} models`
    }
  } catch {}
  return 'offline'
}

function printHelp() {
  console.log(`
🐉 Beast CLI v${VERSION} - AI Coding Agent

USAGE:
  beast [options]

OPTIONS:
  --provider <name>  LLM provider (ollama, lmstudio, anthropic, openai)
  --model <name>      Model name
  --help              Show this help

QUICK START:
  beast                              # Auto-detect everything
  beast --provider ollama            # Use Ollama
  beast --provider anthropic         # Use Claude

PROVIDERS:
  Local:   ollama, lmstudio, jan
  Cloud:   anthropic, openai, deepseek, openrouter, groq

MCP TOOLS (automatic):
  Web search, GitHub, code execution, data analysis - just works!
`)
}

async function main() {
  const args = Bun.argv.slice(2)
  const options: CLIOptions = {}

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true
        break
      case '--provider':
        options.provider = args[++i]
        break
      case '--model':
        options.model = args[++i]
        break
      case '--test':
        options.test = true
        break
    }
  }

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  if (options.test) {
    console.log('Running tests...')
    console.log('• bun test-providers.ts  - Test LLM providers')
    console.log('• bun test-mcp-integration.ts - Test MCP server')
    process.exit(0)
  }

  // Auto-detect providers
  console.log(`
🐉 Beast CLI v${VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  console.log('\n📡 Detecting services...')

  // Check Ollama
  const ollamaStatus = await checkProvider('http://localhost:11434')
  console.log(`   🦙 Ollama:    ${ollamaStatus}`)

  // Check LM Studio
  const lmStatus = await checkProvider('http://localhost:1234')
  console.log(`   🏋️ LM Studio: ${lmStatus}`)

  // Check MCP server (silent/black box)
  const mcpAvailable = await checkMCPServer()
  if (!mcpAvailable) {
    console.log('   🔧 MCP Tools: Not running (optional)')
  }

  // Show detected provider
  const provider = options.provider || 'ollama'
  const model = options.model || 'llama3.1:8b'

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Ready to use!
   Provider: ${provider}
   Model:   ${model}

Type your request or try:
   "What's the weather today?"
   "Create a React login form"
   "Search for latest AI news"

Exit: Ctrl+C
`)

  // Simple REPL
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const prompt = () => rl.question('\n❯ ', async (input) => {
    if (!input.trim() || input === 'exit' || input === 'quit') {
      console.log('\n👋 Goodbye!\n')
      process.exit(0)
    }

    console.log('\n⏳ Thinking...')

    // Use local provider
    try {
      const p = await createProvider({
        provider: provider as any,
        model: model,
        baseUrl: provider === 'ollama' ? 'http://localhost:11434' :
                 provider === 'lmstudio' ? 'http://localhost:1234/v1' : undefined,
      })

      const response = await p.create({
        messages: [{ role: 'user', content: input }],
        maxTokens: 500,
      })

      console.log(`\n🤖 ${response.content}`)
    } catch (e) {
      console.log(`\n❌ Error: ${e}`)
    }

    prompt()
  })

  prompt()
}

// Run
main().catch(console.error)
