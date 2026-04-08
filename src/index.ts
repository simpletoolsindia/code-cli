#!/usr/bin/env bun
/**
 * Beast CLI - Main Entry Point
 * AI Coding Agent with 45+ Providers
 */

import { BeastTUI } from './tui/index.ts'
import { createProvider, type ProviderConfig } from './providers/index.ts'
import { MCPHub, TCPTransport, connectExtraSkillsMCP, defaultMCPConfig } from './mcp/index.ts'

// Re-export main components
export { BeastTUI, createProvider, MCPHub, TCPTransport, connectExtraSkillsMCP, defaultMCPConfig }
export type { ProviderConfig }

// Version
const VERSION = '1.0.0'

// CLI Mode
type CLIMode = 'interactive' | 'chat' | 'demo' | 'test'

interface CLIOptions {
  mode?: CLIMode
  provider?: string
  model?: string
  baseUrl?: string
  apiKey?: string
  demo?: boolean
  test?: boolean
  help?: boolean
}

function printHelp() {
  console.log(`
🐉 Beast CLI v${VERSION} - AI Coding Agent for Power Users

USAGE:
  beast [options]

OPTIONS:
  --mode <mode>     Mode: interactive, chat, demo, test (default: interactive)
  --provider <name> LLM provider (ollama, lmstudio, anthropic, openai, etc.)
  --model <name>    Model name
  --base-url <url> Base URL for local providers
  --api-key <key>   API key for cloud providers
  --demo            Run interactive demo
  --test            Run integration tests
  --help            Show this help

EXAMPLES:
  beast --mode demo
  beast --provider ollama --model llama3.1:8b
  beast --provider anthropic --api-key sk-ant-...

PROVIDERS:
  Local:   ollama, lmstudio, jan
  Cloud:   anthropic, openai, deepseek, openrouter, groq, qwen, gemini, mistral
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
      case '--mode':
      case '-m':
        options.mode = args[++i] as CLIMode
        break
      case '--provider':
      case '-p':
        options.provider = args[++i]
        break
      case '--model':
        options.model = args[++i]
        break
      case '--base-url':
      case '-u':
        options.baseUrl = args[++i]
        break
      case '--api-key':
      case '-k':
        options.apiKey = args[++i]
        break
      case '--demo':
      case '-d':
        options.demo = true
        break
      case '--test':
      case '-t':
        options.test = true
        break
      default:
        if (arg.startsWith('--')) {
          console.warn(`Unknown option: ${arg}`)
        }
    }
  }

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  if (options.test) {
    console.log('Running integration tests...')
    console.log('Use: bun test-mcp-integration.ts  # MCP + Ollama + LM Studio tests')
    console.log('Use: bun test-providers.ts        # All provider tests')
    process.exit(0)
  }

  if (options.demo) {
    console.log('Starting demo mode...')
    console.log('Use: bun demo.ts                  # Demo with real AI responses')
    console.log('Use: bun demo-live.tsx             # Live TUI demo')
    process.exit(0)
  }

  // Start interactive mode (TUI)
  console.log(`
🐉 Beast CLI v${VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Local providers: Ollama, LM Studio, Jan.ai
  Cloud providers: Claude, GPT, DeepSeek, OpenRouter, Groq, Qwen, Gemini

  Quick start:
  • Run 'bun demo.ts' for interactive demo
  • Run 'bun test-mcp-integration.ts' to test integrations
  • Run 'bun test-providers.ts' to test all providers

  MCP Server: Connect to extra_skills_mcp_tools (64+ tools)
  docker compose -f ../extra_skills_mcp_tools/docker-compose.local.yml up -d

`)

  // For now, show available modules
  console.log('Available modules:')
  console.log('  • providers/  - LLM provider integrations')
  console.log('  • mcp/       - MCP server support (TCP, SSE, HTTP)')
  console.log('  • tui/       - Terminal UI components')
  console.log('')
}

// Run
main().catch(console.error)
