#!/usr/bin/env bun
/**
 * Beast CLI - Demo Mode
 * Run: bun demo.ts
 *
 * This shows:
 * 1. Provider/Model Status
 * 2. Real AI responses
 * 3. TUI Design Preview
 */

import { createProvider } from './src/providers/index.ts'
import type { Provider } from './src/tui/index.ts'

// ASCII Art Header
const HEADER = `
╔══════════════════════════════════════════════════════════════════╗
║  🐉  ██████╗  ██████╗ ██████╗ ███████╗                         ║
║  🐉  ██╔══██╗██╔═══██╗██╔══██╗██╔════╝                         ║
║  🐉  ██████╔╝██║   ██║██║  ██║█████╗                           ║
║  🐉  ██╔══██╗██║   ██║██║  ██║██╔══╝                           ║
║  🐉  ██║  ██║╚██████╔╝██████╔╝███████╗                         ║
║  🐉  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝                         ║
║         AI CODING AGENT - 45+ PROVIDERS - LOCAL & CLOUD          ║
╚══════════════════════════════════════════════════════════════════╝
`

// Provider info
const PROVIDERS = [
  { id: 'ollama', name: 'Ollama', icon: '🦙', models: 13, status: '●', statusColor: 'green' },
  { id: 'lmstudio', name: 'LM Studio', icon: '🏋️', models: 4, status: '●', statusColor: 'green' },
  { id: 'anthropic', name: 'Claude', icon: '🧠', models: 5, status: '○', statusColor: 'red' },
  { id: 'openai', name: 'GPT', icon: '🤖', models: 4, status: '○', statusColor: 'red' },
  { id: 'openrouter', name: 'OpenRouter', icon: '🌐', models: '50+', status: '○', statusColor: 'red' },
]

// Color helpers
const colors: Record<string, string> = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
}

function color(text: string, c: string): string {
  return `${colors[c]}${text}${colors.reset}`
}

// Demo tasks
const DEMO_TASKS = [
  { task: 'Create a React hook for dark mode', provider: 'ollama', model: 'qwen2.5-coder:32b' },
  { task: 'Write a Python backup script', provider: 'lmstudio', model: 'deepseek-r1-distill-qwen-32b' },
  { task: 'Add JWT authentication', provider: 'ollama', model: 'llama3.1:8b' },
  { task: 'Debug slow API performance', provider: 'lmstudio', model: 'gemma-4-31b-nvfp4' },
]

// Draw TUI Preview
function drawTUI() {
  console.clear()
  console.log(color(HEADER, 'green'))

  // Provider Status
  console.log(color('┌─────────────────────────────────────────────────────────────────────────────┐', 'cyan'))
  console.log(color('│  🌐 PROVIDER STATUS                                          [Tab: Switch]  │', 'cyan'))
  console.log(color('├─────────────────────────────────────────────────────────────────────────────┤', 'cyan'))

  let providerLine = '│  '
  for (const p of PROVIDERS) {
    const status = color(p.status, p.statusColor)
    const name = color(` ${p.icon} ${p.name}`, p.id === 'ollama' ? 'green' : 'white')
    const models = color(` (${p.models})`, 'gray')
    providerLine += `${status}${name}${models}   `
  }
  console.log(providerLine.padEnd(83) + '│')
  console.log(color('└─────────────────────────────────────────────────────────────────────────────┘', 'cyan'))

  // Model & Mode
  console.log(color('┌─────────────────────────────────────────────────────────────────────────────┐', 'yellow'))
  console.log(`│  ${color('📦 Model:', 'yellow')} ${color('qwen2.5-coder:32b', 'cyan')}  ${color('[Enter: Switch]', 'dim')}                      │`)
  console.log(`│  ${color('⚡ Mode:', 'yellow')} ${color('✏️  WRITE', 'green')} ${color('[Ctrl+P: Cycle]', 'dim')}    ${color('🔢 Tokens:', 'yellow')} ${color('12,450', 'green')}  ${color('(25%)', 'dim')}     │`)
  console.log(color('└─────────────────────────────────────────────────────────────────────────────┘', 'yellow'))

  // Chat Area
  console.log(color('┌─────────────────────────────────────────────────────────────────────────────┐', 'white'))
  console.log(`│  ${color('👤 USER', 'green')} • 2:30 PM                                                       │`)
  console.log(`│  Create a React hook for dark mode toggle with system preference detection│`)
  console.log('')
  console.log(`│  ${color('🤖 ASSISTANT', 'cyan')} via ${color('ollama', 'yellow')}/${color('qwen2.5-coder:32b', 'cyan')} • 2:30 PM                      │`)
  console.log(`│  ${color("Here's a React hook for dark mode:", 'white')}                             │`)
  console.log('')
  console.log(color('│  ┌─────────────────────────────────────────────────────────────┐        │', 'gray'))
  console.log(color('│  │  import { useState, useEffect } from "react";            │        │', 'gray'))
  console.log(color('│  │                                                   │        │', 'gray'))
  console.log(color('│  │  export function useDarkMode() {                   │        │', 'gray'))
  console.log(color('│  │    const [dark, setDark] = useState(() => {      │        │', 'gray'))
  console.log(color('│  │      return window.matchMedia(                    │        │', 'gray'))
  console.log(color('│  │        "(prefers-color-scheme: dark)"            │        │', 'gray'))
  console.log(color('│  │      ).matches;                                   │        │', 'gray'))
  console.log(color('│  │    });                                             │        │', 'gray'))
  console.log(color('│  │    // ...                                        │        │', 'gray'))
  console.log(color('│  └─────────────────────────────────────────────────────┘        │', 'gray'))
  console.log(color('│  🔧 TOOL: WriteFile(src/hooks/useDarkMode.ts)                │', 'magenta'))
  console.log(color('└─────────────────────────────────────────────────────────────────────────────┘', 'white'))

  // Input
  console.log(color('┌─────────────────────────────────────────────────────────────────────────────┐', 'green'))
  console.log(`│  ${color('❯', 'green')} Type your message...                                       │`)
  console.log(color('└─────────────────────────────────────────────────────────────────────────────┘', 'green'))

  // Footer
  console.log(`${color('  Tab', 'cyan')}: Switch Provider  ${color('Ctrl+P', 'cyan')}: Cycle Mode  ${color('Ctrl+L', 'cyan')}: Clear  ${color('/help', 'cyan')}: Commands  ${color('/exit', 'cyan')}: Quit`)
}

// Run a demo task
async function runDemoTask(task: typeof DEMO_TASKS[0]) {
  console.log(color(`\n🚀 Running task: "${task.task}"`, 'yellow'))
  console.log(color(`   Using: ${task.provider}/${task.model}\n`, 'gray'))

  try {
    const provider = await createProvider({
      provider: task.provider as any,
      model: task.model,
      baseUrl: task.provider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234/v1',
    })

    console.log(color('   ✅ Provider connected', 'green'))

    const start = Date.now()
    const response = await provider.create({
      messages: [{
        role: 'user' as const,
        content: `${task.task}. Reply with a brief explanation and show a code example.`
      }],
      maxTokens: 200,
      temperature: 0.7,
    })

    const elapsed = Date.now() - start

    console.log(color(`   ✅ Response received in ${elapsed}ms`, 'green'))
    console.log(color('   ─────────────────────────────────────────────', 'dim'))
    console.log(`   ${response.content.slice(0, 500)}`)
    console.log(color('   ─────────────────────────────────────────────\n', 'dim'))

    if (response.usage) {
      console.log(color(`   📊 Tokens: ${response.usage.promptTokens} in, ${response.usage.completionTokens} out`, 'cyan'))
    }

    return true
  } catch (e: any) {
    console.log(color(`   ❌ Error: ${e.message}`, 'red'))
    return false
  }
}

// Main demo
async function main() {
  console.log(color(HEADER, 'green'))
  console.log(color('   AI Coding Agent with 45+ Providers\n', 'white'))
  console.log(color('   Features:', 'yellow'))
  console.log('   • Switch models instantly (Tab key)')
  console.log('   • Real AI responses from local/cloud')
  console.log('   • Multiple providers: Ollama, LM Studio, Claude, GPT')
  console.log('   • Multiple modes: Plan, Write, Auto, Review, Debug\n')

  // Draw TUI
  drawTUI()

  console.log(color('\n⏳ Starting demo tasks in 3 seconds... (Press Ctrl+C to skip)\n', 'yellow'))

  await new Promise(r => setTimeout(r, 3000))

  console.clear()
  console.log(color(HEADER, 'green'))
  console.log(color('   LIVE DEMO - Real AI Responses\n', 'yellow'))

  let success = 0
  let fail = 0

  for (let i = 0; i < DEMO_TASKS.length; i++) {
    console.log(color(`\n═══════════════════════════════════════════════════════════`, 'cyan'))
    console.log(color(`  TASK ${i + 1}/${DEMO_TASKS.length}`, 'bold'))
    console.log(color(`═══════════════════════════════════════════════════════════\n`, 'cyan'))

    const result = await runDemoTask(DEMO_TASKS[i])
    if (result) success++
    else fail++

    if (i < DEMO_TASKS.length - 1) {
      console.log(color('⏳ Next task in 3 seconds...\n', 'dim'))
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  // Summary
  console.clear()
  console.log(color(HEADER, 'green'))
  console.log(color('\n   📊 DEMO SUMMARY\n', 'yellow'))
  console.log(color(`   ✅ Successful: ${success}/${DEMO_TASKS.length}`, success === DEMO_TASKS.length ? 'green' : 'yellow'))
  console.log(color(`   ❌ Failed: ${fail}/${DEMO_TASKS.length}`, fail > 0 ? 'red' : 'green'))

  console.log(color('\n   🐉 Beast CLI Features Demo:\n', 'cyan'))
  console.log('   • ✅ Real-time provider switching')
  console.log('   • ✅ Model selection (Tab to cycle)')
  console.log('   • ✅ Mode switching (Ctrl+P)')
  console.log('   • ✅ Token tracking')
  console.log('   • ✅ Tool execution')
  console.log('   • ✅ Code highlighting')
  console.log('   • ✅ Multi-provider support')

  console.log(color('\n   📦 Available Providers:\n', 'yellow'))
  for (const p of PROVIDERS) {
    const status = color(p.status, p.statusColor)
    const name = color(` ${p.icon} ${p.name}`, 'white')
    const models = color(` - ${p.models} models`, 'gray')
    console.log(`   ${status}${name}${models}`)
  }

  console.log(color('\n   🚀 Run "bun run src/index.ts" to start Beast CLI\n', 'green'))
}

main().catch(console.error)
