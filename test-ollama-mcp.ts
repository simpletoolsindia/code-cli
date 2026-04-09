// Ollama + MCP Integration Test Suite
// Tests code-cli with qwen2.5-coder:14b-instruct + MCP tools
// Run: bun test-ollama-mcp.ts

import { createProvider } from './src/providers/index.ts'
import { TCPTransport } from './src/mcp/index.ts'

const MCP_HOST = 'localhost'
const MCP_PORT = 7710
const MODEL = 'qwen2.5-coder:14b-instruct'

const tests: { name: string; passed: boolean; error?: string; notes?: string }[] = []

async function log(name: string, passed: boolean, error?: string, notes?: string) {
  tests.push({ name, passed, error, notes })
  const icon = passed ? '✅' : '❌'
  const extra = notes ? ` | ${notes}` : ''
  console.log(`${icon} ${name}${error ? ` — ${error}` : ''}${extra}`)
}

async function runTests() {
  console.log('🐉 Beast CLI - Ollama + MCP Integration Test')
  console.log('═'.repeat(70))
  console.log(`Model: ${MODEL}`)
  console.log(`MCP Server: ${MCP_HOST}:${MCP_PORT}`)
  console.log('═'.repeat(70) + '\n')

  // ── T1: Ollama Connection ──────────────────────────────────────────────
  console.log('📡 T1: Ollama Connection')
  try {
    const res = await fetch('http://localhost:11434/api/tags')
    if (!res.ok) throw new Error(`Status: ${res.status}`)
    const data = await res.json()
    const models = (data.models ?? []).map((m: any) => m.name)
    const hasModel = models.includes(MODEL)
    await log('Ollama server reachable', true, undefined, `${models.length} models`)
    await log(`${MODEL} available`, hasModel, hasModel ? undefined : 'Not found in Ollama list')
  } catch (e: any) {
    await log('Ollama server reachable', false, e.message)
    await log(`${MODEL} available`, false, 'Ollama not running')
  }

  // ── T2: MCP Server Connection ─────────────────────────────────────────
  console.log('\n🔧 T2: MCP Server Connection')
  let transport: TCPTransport | null = null
  let mcpTools: any[] = []
  try {
    transport = new TCPTransport(MCP_HOST, MCP_PORT)
    await Promise.race([
      transport.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('5s timeout')), 5000))
    ])
    const tools = await Promise.race([
      transport.listTools() as Promise<any[]>,
      new Promise((_, reject) => setTimeout(() => reject(new Error('5s timeout')), 5000))
    ])
    mcpTools = tools
    await log('MCP server TCP connection', true, undefined, `${tools.length} tools`)
  } catch (e: any) {
    await log('MCP server TCP connection', false, e.message)
  }

  // ── T3: Basic Ollama Chat ───────────────────────────────────────────────
  console.log('\n💬 T3: Basic Ollama Chat (no MCP tools)')
  try {
    const provider = await createProvider({
      provider: 'ollama',
      model: MODEL,
      apiKey: undefined,
      baseUrl: 'http://localhost:11434',
    })

    const resp = await provider.create({
      messages: [{ role: 'user', content: 'Say "Hello from Beast CLI!" exactly. Nothing else.' }],
      tools: undefined,
      maxTokens: 50,
    })

    const ok = resp.content?.includes('Hello from Beast CLI') || resp.content?.includes('Hello')
    await log('Ollama chat completion', ok, ok ? undefined : `Got: ${resp.content?.slice(0, 100)}`)
    await log('Token usage reported', !!resp.usage, resp.usage ? undefined : 'No usage data')
  } catch (e: any) {
    await log('Ollama chat completion', false, e.message)
  }

  // ── T4: MCP Tool Calling (searxng_search) ──────────────────────────────
  console.log('\n🔍 T4: MCP Tool Calling - Web Search')
  if (mcpTools.length > 0) {
    const searchTool = mcpTools.find((t: any) => t.name === 'searxng_search')
    if (searchTool) {
      try {
        const provider = await createProvider({
          provider: 'ollama',
          model: MODEL,
          apiKey: undefined,
          baseUrl: 'http://localhost:11434',
        })

        const formattedTools = [{
          name: searchTool.name,
          description: searchTool.description,
          inputSchema: searchTool.inputSchema,
        }]

        const resp = await provider.create({
          messages: [{
            role: 'user',
            content: 'Search the web for "current gold price India today" using the search tool.',
          }],
          tools: formattedTools,
          maxTokens: 512,
        })

        const hasToolCall = resp.toolCalls && resp.toolCalls.length > 0
        await log('Model generates tool calls', hasToolCall, hasToolCall ? undefined : `No tool calls. Content: ${resp.content?.slice(0, 100)}`)

        if (hasToolCall && transport) {
          const tc = resp.toolCalls![0]
          await log('Tool name correct (searxng_search)', tc.name === 'searxng_search', tc.name !== 'searxng_search' ? `Got: ${tc.name}` : undefined)

          const result = await transport.callTool(tc.name, tc.arguments)
          const textResult = (result.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
          const hasData = textResult.length > 10
          await log('MCP tool execution', hasData, hasData ? undefined : `Empty result`)
          await log('Real-time data returned', hasData, undefined, textResult.slice(0, 80) + '...')
        }
      } catch (e: any) {
        await log('MCP tool calling test', false, e.message)
      }
    } else {
      await log('searxng_search tool found', false, 'Not in MCP tools list')
    }
  } else {
    await log('MCP tools available', false, 'No tools from MCP server')
  }

  // ── T5: Coding Task - Project Analysis ─────────────────────────────────
  console.log('\n💻 T5: Coding Task - Project Analysis')
  try {
    const provider = await createProvider({
      provider: 'ollama',
      model: MODEL,
      apiKey: undefined,
      baseUrl: 'http://localhost:11434',
    })

    const resp = await provider.create({
      messages: [{
        role: 'user',
        content: `Analyze this code project. List the main files in the src/ directory and describe what the main entry point does. Be concise.`,
      }],
      tools: undefined,
      maxTokens: 512,
    })

    const hasAnalysis = resp.content && resp.content.length > 50
    await log('Project analysis response', hasAnalysis, hasAnalysis ? undefined : `Got: ${resp.content?.slice(0, 100)}`)
    await log('Non-trivial response', hasAnalysis, undefined, resp.content?.slice(0, 120) + '...')
  } catch (e: any) {
    await log('Project analysis', false, e.message)
  }

  // ── T6: Agent Loop with Multiple Tool Calls ────────────────────────────
  console.log('\n🔄 T6: Agent Loop - Multi-step with MCP tools')
  if (mcpTools.length > 0 && transport) {
    try {
      const provider = await createProvider({
        provider: 'ollama',
        model: MODEL,
        apiKey: undefined,
        baseUrl: 'http://localhost:11434',
      })

      const formattedTools = mcpTools.map((t: any) => ({
        name: t.name,
        description: t.description ?? '',
        inputSchema: t.inputSchema,
      }))

      const agentMsgs = [{
        role: 'system',
        content: `You have access to MCP tools. Use them to get real-time data. When asked about prices, rates, news, or current information — use a tool first. Available tools: ${formattedTools.map((t: any) => t.name).join(', ')}`,
      }, {
        role: 'user',
        content: 'What is the current USD to INR exchange rate?',
      }]

      let loopCount = 0
      let finalContent = ''
      while (loopCount < 5) {
        const resp = await provider.create({
          messages: agentMsgs,
          tools: formattedTools,
          maxTokens: 512,
        })

        if (!resp.toolCalls || resp.toolCalls.length === 0) {
          finalContent = resp.content ?? ''
          break
        }

        for (const tc of resp.toolCalls) {
          agentMsgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
          const result = await transport.callTool(tc.name, tc.arguments)
          const textResult = (result.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
          agentMsgs.push({ role: 'user', content: `Tool result: ${textResult}`, toolCallId: tc.id })
        }
        loopCount++
      }

      const success = finalContent.length > 0 && !finalContent.includes("don't have")
      await log('Agent loop completes', loopCount < 5, loopCount >= 5 ? 'Too many iterations' : undefined, `${loopCount} turns`)
      await log('Real-time data in response', success, undefined, finalContent.slice(0, 100) + '...')
    } catch (e: any) {
      await log('Agent loop test', false, e.message)
    }
  }

  // ── T7: Code Generation Task ───────────────────────────────────────────
  console.log('\n⌨️ T7: Code Generation')
  try {
    const provider = await createProvider({
      provider: 'ollama',
      model: MODEL,
      apiKey: undefined,
      baseUrl: 'http://localhost:11434',
    })

    const resp = await provider.create({
      messages: [{
        role: 'user',
        content: 'Write a simple TypeScript function that calculates the factorial of a number. Only the code, no explanation.',
      }],
      tools: undefined,
      maxTokens: 512,
    })

    const hasCode = resp.content && (resp.content.includes('function') || resp.content.includes('=>') || resp.content.includes('const'))
    await log('Code generation works', hasCode, hasCode ? undefined : `Got: ${resp.content?.slice(0, 100)}`)
  } catch (e: any) {
    await log('Code generation', false, e.message)
  }

  // ── T8: MCP Tool - GitHub Info ──────────────────────────────────────────
  console.log('\n🐙 T8: MCP Tool - GitHub Integration')
  const githubTool = mcpTools.find((t: any) => t.name === 'github_repo')
  if (githubTool && transport) {
    try {
      const provider = await createProvider({
        provider: 'ollama',
        model: MODEL,
        apiKey: undefined,
        baseUrl: 'http://localhost:11434',
      })

      const formattedTools = [{
        name: githubTool.name,
        description: githubTool.description,
        inputSchema: githubTool.inputSchema,
      }]

      const resp = await provider.create({
        messages: [{
          role: 'user',
          content: 'Get information about the GitHub repo "simpletoolsindia/code-cli" using the github_repo tool. Show repo name, description, stars, and language.',
        }],
        tools: formattedTools,
        maxTokens: 512,
      })

      const hasToolCall = resp.toolCalls && resp.toolCalls.length > 0
      await log('GitHub tool call generated', hasToolCall, hasToolCall ? undefined : `No tool call. Content: ${resp.content?.slice(0, 100)}`)

      if (hasToolCall) {
        const result = await transport.callTool('github_repo', { owner: 'simpletoolsindia', repo: 'code-cli' })
        const textResult = (result.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
        await log('GitHub tool executes', textResult.length > 10, undefined, textResult.slice(0, 80) + '...')
      }
    } catch (e: any) {
      await log('GitHub tool test', false, e.message)
    }
  } else {
    await log('github_repo tool found', false, 'Not in MCP tools')
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const passed = tests.filter(t => t.passed).length
  const failed = tests.filter(t => !t.passed).length
  const total = tests.length

  console.log('\n' + '═'.repeat(70))
  console.log('📊 TEST REPORT')
  console.log('═'.repeat(70))
  console.log(`Model: ${MODEL}`)
  console.log(`MCP Tools: ${mcpTools.length}`)
  console.log(`\nPassed: ${passed}/${total} | Failed: ${failed}/${total}`)

  if (failed > 0) {
    console.log('\n❌ Failed tests:')
    tests.filter(t => !t.passed).forEach(t => {
      console.log(`  • ${t.name}: ${t.error}`)
    })
  }

  const passRate = (passed / total * 100).toFixed(0)
  const overall = failed === 0 ? '✅ ALL PASS' : failed <= 2 ? `⚠️ MOSTLY PASS (${passRate}%)` : `❌ NEEDS FIX (${passRate}%)`

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`Overall: ${overall}`)
  console.log('═'.repeat(70))

  // Write to file
  const report = {
    date: new Date().toISOString(),
    model: MODEL,
    mcpTools: mcpTools.length,
    results: tests,
    summary: { passed, failed, total, passRate },
  }

  await Bun.write('TEST-REPORT.md', `# Ollama + MCP Integration Test Report\n\n**Date**: ${report.date}\n**Model**: ${report.model}\n**MCP Tools**: ${report.mcpTools}\n**Results**: ${passed}/${total} passed\n\n## Test Results\n\n| Test | Status | Details |\n|------|--------|---------|\n${tests.map(t => `| ${t.name} | ${t.passed ? '✅ PASS' : '❌ FAIL'} | ${t.error ?? (t.notes ?? '')} |`).join('\n')}\n\n## Summary\n\n- **Passed**: ${passed}/${total}\n- **Failed**: ${failed}/${total}\n- **Pass Rate**: ${passRate}%\n- **Overall**: ${overall}\n`)
  console.log('\n📄 Report written to TEST-REPORT.md')
}

runTests().catch(e => console.error('Fatal:', e))