#!/usr/bin/env bun
/**
 * Beast CLI - Main Entry Point
 * AI Coding Agent with 45+ Providers
 * MCP tools work automatically (black box)
 */

import { createProvider } from './providers/index.ts'
import { TCPTransport } from './mcp/index.ts'
import { execSync } from 'child_process'

// Version
const VERSION = '1.0.2'

// MCP Server URL
const MCP_SERVER_HOST = process.env.MCP_HOST || 'localhost'
const MCP_SERVER_PORT = parseInt(process.env.MCP_PORT || '7710')

interface CLIOptions {
  provider?: string
  model?: string
  help?: boolean
  test?: boolean
  setup?: boolean
}

// Check if MCP server is running
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

// Start Colima if Docker isn't running
async function startColima(): Promise<boolean> {
  console.log('   🐋 Checking Docker runtime...')

  // Check if Docker daemon is running
  try {
    execSync('docker info', { stdio: 'pipe' })
    console.log('   ✅ Docker is running')
    return true
  } catch {
    // Docker not running, try to start Colima
    console.log('   🔄 Docker not running, trying to start Colima...')
  }

  // Check if Colima is installed
  try {
    execSync('colima --version', { stdio: 'pipe' })
  } catch {
    console.log('   ⚠️  Colima not found.')
    console.log('   💡 Install Colima: brew install colima')
    return false
  }

  // Check if Colima is already running
  try {
    execSync('colima list', { stdio: 'pipe' })
    const status = execSync('colima list 2>/dev/null', { encoding: 'utf8' })
    if (status.includes('Running')) {
      console.log('   ✅ Colima is already running')
      return true
    }
  } catch {}

  // Start Colima
  try {
    console.log('   🚀 Starting Colima (this may take a minute)...')
    execSync('colima start --arch aarch64 --cpu 4 --memory 4 --disk 50', {
      stdio: 'pipe',
      timeout: 180000,
    })
    console.log('   ✅ Colima started successfully!')
    return true
  } catch (e: any) {
    console.log(`   ⚠️  Failed to start Colima: ${e.message}`)
    return false
  }
}

// Auto-start MCP server using Docker
async function autoStartMCP(): Promise<boolean> {
  console.log('   🔧 MCP: Not found, checking Docker...')

  // Check/start Docker/Colima
  const dockerReady = await startColima()
  if (!dockerReady) {
    console.log('   ⚠️  Docker unavailable. MCP tools will be limited.')
    return false
  }

  // Try to start MCP server
  const mcpPaths = [
    '../extra_skills_mcp_tools/docker-compose.local.yml',
    'extra_skills_mcp_tools/docker-compose.local.yml',
    '/Users/sridhar/code/extra_skills_mcp_tools/docker-compose.local.yml',
  ]

  for (const composePath of mcpPaths) {
    try {
      execSync(`docker compose -f ${composePath} up -d`, { stdio: 'pipe', timeout: 120000 })
      console.log('   ✅ MCP server container started!')
      // Wait for server to be ready
      console.log('   ⏳ Waiting for MCP server...')
      await new Promise(r => setTimeout(r, 3000))
      return true
    } catch (e: any) {
      console.log(`   ⚠️  Could not start MCP from ${composePath}: ${e.message}`)
    }
  }

  console.log('   ⚠️  MCP server not found.')
  console.log('   💡 Clone and run:')
  console.log('      git clone https://github.com/simpletoolsindia/extra_skills_mcp_tools')
  console.log('      cd extra_skills_mcp_tools && docker compose up -d')
  return false
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
  --setup             Install MCP server (optional)
  --help              Show this help

QUICK START:
  beast                              # Auto-detect everything
  beast --provider ollama            # Use Ollama

PROVIDERS:
  Local:   ollama, lmstudio, jan
  Cloud:   anthropic, openai, deepseek, openrouter, groq

MCP TOOLS:
  MCP server auto-starts if Docker is available.
  For manual setup: docker compose -f extra_skills_mcp_tools/docker-compose.local.yml up -d
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

  if (options.setup) {
    console.log('Setting up MCP server...')
    await autoStartMCP()
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

  // Check MCP server (auto-start if possible)
  const mcp = await checkMCPServer()
  if (!mcp.available) {
    // Try to auto-start MCP server
    const started = await autoStartMCP()
    if (started) {
      // Re-check
      const mcp2 = await checkMCPServer()
      if (mcp2.available) {
        console.log(`   🔧 MCP: ${mcp2.toolCount} tools connected!`)
      }
    } else {
      console.log('   🔧 MCP: Not available (optional)')
    }
  } else {
    console.log(`   🔧 MCP: ${mcp.toolCount} tools connected!`)
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
