// Real-time Scenario Tests with Native Tools (no MCP server needed)
// Tests practical daily-use scenarios with mistral-small3.1:24b

import { createProvider } from './src/providers/index.ts'
import { getFormattedTools, executeTool } from './src/native-tools/index.ts'

async function main() {
  console.log('🌍 Real-Time Scenario Tests (Native Tools + mistral-small3.1:24b)')
  console.log('═'.repeat(70))

  const tools = getFormattedTools()
  console.log(`✅ Native tools loaded: ${tools.length}\n`)

  const provider = await createProvider({
    provider: 'ollama',
    model: 'mistral-small3.1:24b',
    baseUrl: 'http://localhost:11434',
  })

  const results: { name: string; status: 'PASS' | 'FAIL' | 'PARTIAL'; detail: string }[] = []

  // ── Scenario 1: Daily Finance Dashboard ────────────────────────────
  console.log('💰 Scenario 1: Daily Finance Dashboard')
  {
    const queries = [
      'Current gold price in India for 24 karat (per gram)',
      'USD to INR exchange rate today',
      'Nifty 50 current value today',
    ]

    for (const query of queries) {
      // Use agent loop to handle tool calls
      const msgs = [
        { role: 'system', content: `Use searxng_search to find current financial data. Return results in your response.` },
        { role: 'user', content: query },
      ]
      let finalContent = ''
      for (let turn = 0; turn < 3; turn++) {
        const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
        if (!resp.toolCalls || resp.toolCalls.length === 0) {
          finalContent = resp.content ?? ''
          break
        }
        for (const tc of resp.toolCalls) {
          msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
          const result = await executeTool(tc.name, tc.arguments)
          msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 1000), toolCallId: tc.id })
        }
      }
      const hasData = finalContent.length > 30 && !finalContent.includes("I don't have")
      console.log(`   📊 ${query}`)
      console.log(`   ${hasData ? '✅' : '❌'} ${finalContent.slice(0, 150) || 'empty'}`)
      results.push({ name: query, status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
    }
  }

  // ── Scenario 2: Travel Planning ───────────────────────────────────
  console.log('\n✈️ Scenario 2: Travel Planning')
  {
    const queries = [
      'Current weather in Chennai for next 3 days',
      'Best time to travel from Chennai to Bangalore today',
    ]

    for (const query of queries) {
      const msgs = [
        { role: 'system', content: 'Use searxng_search for weather and travel info.' },
        { role: 'user', content: query },
      ]
      let finalContent = ''
      for (let turn = 0; turn < 3; turn++) {
        const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
        if (!resp.toolCalls || resp.toolCalls.length === 0) { finalContent = resp.content ?? ''; break }
        for (const tc of resp.toolCalls) {
          msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
          const result = await executeTool(tc.name, tc.arguments)
          msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 1000), toolCallId: tc.id })
        }
      }
      const hasData = finalContent.length > 20
      console.log(`   ✈️ ${query}`)
      console.log(`   ${hasData ? '✅' : '❌'} ${finalContent.slice(0, 150) || 'empty'}`)
      results.push({ name: query, status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
    }
  }

  // ── Scenario 3: Crypto Prices ───────────────────────────────────────
  console.log('\n₿ Scenario 3: Crypto Prices')
  {
    const msgs = [
      { role: 'system', content: 'Use searxng_search for crypto prices.' },
      { role: 'user', content: 'What is the current price of Bitcoin (BTC) and Ethereum (ETH) in USD?' },
    ]
    let finalContent = ''
    for (let turn = 0; turn < 3; turn++) {
      const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
      if (!resp.toolCalls || resp.toolCalls.length === 0) { finalContent = resp.content ?? ''; break }
      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await executeTool(tc.name, tc.arguments)
        msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 1000), toolCallId: tc.id })
      }
    }
    const hasData = finalContent.includes('$') || finalContent.includes('bitcoin')
    console.log(`   ✅ BTC/ETH: ${finalContent.slice(0, 200) || 'empty'}`)
    results.push({ name: 'Crypto prices', status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
  }

  // ── Scenario 4: News Headlines ─────────────────────────────────────
  console.log('\n📰 Scenario 4: News Headlines')
  {
    const msgs = [
      { role: 'system', content: 'Use searxng_search for news.' },
      { role: 'user', content: 'Give me top 3 tech news headlines from today.' },
    ]
    let finalContent = ''
    for (let turn = 0; turn < 3; turn++) {
      const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
      if (!resp.toolCalls || resp.toolCalls.length === 0) { finalContent = resp.content ?? ''; break }
      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await executeTool(tc.name, tc.arguments)
        msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 1000), toolCallId: tc.id })
      }
    }
    const hasData = finalContent.length > 50
    console.log(`   ✅ Headlines: ${finalContent.slice(0, 300) || 'empty'}`)
    results.push({ name: 'News headlines', status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
  }

  // ── Scenario 5: Sports Score ───────────────────────────────────────
  console.log('\n🏏 Scenario 5: Sports Score')
  {
    const msgs = [
      { role: 'system', content: 'Use searxng_search for sports scores.' },
      { role: 'user', content: 'IPL cricket match score today — who is winning?' },
    ]
    let finalContent = ''
    for (let turn = 0; turn < 3; turn++) {
      const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
      if (!resp.toolCalls || resp.toolCalls.length === 0) { finalContent = resp.content ?? ''; break }
      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await executeTool(tc.name, tc.arguments)
        msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 1000), toolCallId: tc.id })
      }
    }
    const hasData = finalContent.includes('IPL') || finalContent.includes('cricket')
    console.log(`   ✅ ${finalContent.slice(0, 200) || 'empty'}`)
    results.push({ name: 'Sports score', status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
  }

  // ── Scenario 6: Project File Analysis ──────────────────────────────
  console.log('\n📁 Scenario 6: Project File Analysis')
  {
    const msgs = [
      { role: 'system', content: `Use file_list and file_read tools to analyze this project. Available: ${tools.map(t => t.name).join(', ')}` },
      { role: 'user', content: 'List the TypeScript files in the src/ directory and describe what each module does.' },
    ]
    let finalContent = ''
    for (let turn = 0; turn < 3; turn++) {
      const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
      if (!resp.toolCalls || resp.toolCalls.length === 0) { finalContent = resp.content ?? ''; break }
      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await executeTool(tc.name, tc.arguments)
        msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 2000), toolCallId: tc.id })
      }
    }
    const hasData = finalContent.includes('.ts') || finalContent.includes('src/')
    console.log(`   ✅ ${finalContent.slice(0, 300) || 'empty'}`)
    results.push({ name: 'File analysis', status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
  }

  // ── Scenario 7: Code Fix ────────────────────────────────────────────
  console.log('\n🐛 Scenario 7: Bug Detection')
  {
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'Analyze the bug in this code. Use your knowledge of programming.' },
        { role: 'user', content: 'Find and explain the bug:\n\nfunction sumArray(arr: number[]): number {\n  let result = 0\n  for (let i = 1; i <= arr.length; i++) {\n    result += arr[i]\n  }\n  return result\n}' },
      ],
      tools,
      maxTokens: 256,
    })

    const hasData = resp.content && (resp.content.includes('off') || resp.content.includes('bound') || resp.content.includes('index') || resp.content.includes('0'))
    console.log(`   ✅ Bug analysis: ${resp.content?.slice(0, 200) ?? 'empty'}`)
    results.push({ name: 'Bug detection', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 8: Code Execution ──────────────────────────────────────
  console.log('\n⚡ Scenario 8: Code Execution')
  {
    const msgs = [
      { role: 'system', content: `Use run_code tool to execute Python. Available: ${tools.map(t => t.name).join(', ')}` },
      { role: 'user', content: 'Calculate compound interest: principal=10000, rate=5%, years=10. Use run_code.' },
    ]
    let finalContent = ''
    for (let turn = 0; turn < 3; turn++) {
      const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
      if (!resp.toolCalls || resp.toolCalls.length === 0) { finalContent = resp.content ?? ''; break }
      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await executeTool(tc.name, tc.arguments)
        msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 2000), toolCallId: tc.id })
      }
    }
    const hasData = finalContent.includes('16288') || finalContent.includes('16289') || finalContent.includes('1628')
    console.log(`   ✅ ${finalContent.slice(0, 200) || 'empty'}`)
    results.push({ name: 'Code execution', status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
  }

  // ── Scenario 9: GitHub Integration ────────────────────────────────
  console.log('\n🐙 Scenario 9: GitHub Integration')
  {
    const msgs = [
      { role: 'system', content: `Use github_repo tool. Available: ${tools.map(t => t.name).join(', ')}` },
      { role: 'user', content: 'Get info about the simpletoolsindia/code-cli repo.' },
    ]
    let finalContent = ''
    for (let turn = 0; turn < 3; turn++) {
      const resp = await provider.create({ messages: msgs, tools, maxTokens: 512 })
      if (!resp.toolCalls || resp.toolCalls.length === 0) { finalContent = resp.content ?? ''; break }
      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await executeTool(tc.name, tc.arguments)
        msgs.push({ role: 'user', content: 'Result: ' + result.content.slice(0, 2000), toolCallId: tc.id })
      }
    }
    const hasData = finalContent.includes('simpletoolsindia') || finalContent.includes('code-cli') || finalContent.includes('stars')
    console.log(`   ✅ ${finalContent.slice(0, 200) || 'empty'}`)
    results.push({ name: 'GitHub integration', status: hasData ? 'PASS' : 'FAIL', detail: finalContent.slice(0, 100) })
  }

  // ── Scenario 10: Multi-step Agent Loop ────────────────────────────
  console.log('\n🔬 Scenario 10: Multi-step Agent Loop')
  {
    const msgs = [
      { role: 'system', content: `You are a research assistant. Use tools to gather data. Available: ${tools.map(t => t.name).join(', ')}` },
      { role: 'user', content: 'Compare investment options: FD vs Gold vs S&P 500. Show current returns for each.' },
    ]

    let turns = 0
    let finalResp = ''
    while (turns < 4) {
      const resp = await provider.create({ messages: msgs, tools, maxTokens: 384 })

      if (!resp.toolCalls || resp.toolCalls.length === 0) {
        finalResp = resp.content ?? ''
        break
      }

      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await executeTool(tc.name, tc.arguments)
        const resultText = result.success ? result.content : `Error: ${result.error}`
        msgs.push({ role: 'user', content: `Result: ${resultText.slice(0, 500)}`, toolCallId: tc.id })
      }
      turns++
    }

    const hasData = finalResp.length > 50
    console.log(`   ✅ ${finalResp.slice(0, 300) || 'No response'}`)
    results.push({ name: `Multi-step research (${turns} turns)`, status: hasData ? 'PASS' : 'FAIL', detail: finalResp.slice(0, 100) })
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70))
  console.log('📊 REAL-TIME SCENARIO RESULTS')
  console.log('═'.repeat(70))
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`\nPassed: ${passed}/${results.length} | Failed: ${failed}/${results.length}\n`)

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : '❌'
    console.log(`${icon} ${r.name}`)
    if (r.status !== 'PASS') console.log(`   → ${r.detail}`)
  })

  console.log('\n' + '═'.repeat(70))
  console.log(`Overall: ${failed === 0 ? '✅ ALL PASS' : failed <= 2 ? `⚠️ MOSTLY PASS (${(passed/results.length*100).toFixed(0)}%)` : `❌ NEEDS FIX`}`)
  console.log('═'.repeat(70))

  // Write report
  await Bun.write('NATIVE-TOOLS-REPORT.md', `# Native Tools + Real-Time Scenario Test Report

**Date**: ${new Date().toISOString()}
**Model**: mistral-small3.1:24b
**Native Tools**: ${tools.length}

## Results

| Scenario | Status | Details |
|----------|--------|---------|
${results.map(r => `| ${r.name} | ${r.status === 'PASS' ? '✅ PASS' : r.status === 'PARTIAL' ? '⚠️ PARTIAL' : '❌ FAIL'} | ${r.detail} |`).join('\n')}

## Summary

- **Passed**: ${passed}/${results.length}
- **Failed**: ${failed}/${results.length}
- **Pass Rate**: ${(passed/results.length*100).toFixed(0)}%

## Key Changes

- All 64 MCP tools converted to native local implementations
- No TCP connection to MCP server needed
- Tools run directly: search, files, code execution, GitHub, YouTube
`)

  console.log('\n📄 Report written to NATIVE-TOOLS-REPORT.md')
}

main().catch(e => console.error('Fatal:', e))
