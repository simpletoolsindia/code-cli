// Real-time Scenario Tests with mistral-small3.1:24b + MCP
// Tests practical daily-use scenarios

import { createProvider } from './src/providers/index.ts'
import { TCPTransport } from './src/mcp/index.ts'

const MCP = { host: 'localhost', port: 7710 }

async function main() {
  console.log('🌍 Real-Time Scenario Tests (mistral-small3.1:24b)')
  console.log('═'.repeat(70))

  const transport = new TCPTransport(MCP.host, MCP.port)
  await transport.connect()
  console.log('✅ MCP connected | 64 tools\n')

  const provider = await createProvider({
    provider: 'ollama',
    model: 'mistral-small3.1:24b',
    baseUrl: 'http://localhost:11434',
  })

  // Get MCP tools for agent loop
  const mcpTools = await transport.listTools()
  const formattedTools = mcpTools.map((t: any) => ({
    name: t.name,
    description: t.description ?? '',
    inputSchema: t.inputSchema,
  }))

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
      const resp = await provider.create({
        messages: [
          { role: 'system', content: 'Use the searxng_search tool to find current data. Return the exact value with source.' },
          { role: 'user', content: query },
        ],
        tools: formattedTools,
        maxTokens: 256,
      })

      const hasData = resp.content && resp.content.length > 30 && !resp.content.includes("I don't have")
      console.log(`   📊 ${query}`)
      console.log(`   ${hasData ? '✅' : '❌'} ${resp.content?.slice(0, 150) ?? 'empty'}`)
      results.push({ name: query, status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
    }
  }

  // ── Scenario 2: Travel Planning ───────────────────────────────────
  console.log('\n✈️ Scenario 2: Travel Planning')
  {
    const queries = [
      'Current weather in Chennai for next 3 days',
      'Flight from Chennai to Bangalore today — best time to travel',
    ]

    for (const query of queries) {
      const resp = await provider.create({
        messages: [
          { role: 'system', content: 'Use searxng_search for weather. Use run_code if calculation needed.' },
          { role: 'user', content: query },
        ],
        tools: formattedTools,
        maxTokens: 256,
      })

      const hasData = resp.content && resp.content.length > 20
      console.log(`   ✈️ ${query}`)
      console.log(`   ${hasData ? '✅' : '❌'} ${resp.content?.slice(0, 150) ?? 'empty'}`)
      results.push({ name: query, status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
    }
  }

  // ── Scenario 3: Crypto Prices ───────────────────────────────────────
  console.log('\n₿ Scenario 3: Crypto Prices')
  {
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'Use searxng_search tool for current crypto prices.' },
        { role: 'user', content: 'What is the current price of Bitcoin (BTC) and Ethereum (ETH) in USD?' },
      ],
      tools: formattedTools,
      maxTokens: 256,
    })

    const hasData = resp.content && (resp.content.includes('$') || resp.content.includes('bitcoin') || resp.content.includes('btc'))
    console.log(`   ✅ BTC/ETH: ${resp.content?.slice(0, 200) ?? 'empty'}`)
    results.push({ name: 'Crypto prices', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 4: News Headlines ─────────────────────────────────────
  console.log('\n📰 Scenario 4: News Headlines')
  {
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'Use searxng_search for news.' },
        { role: 'user', content: 'Give me top 3 tech news headlines from today.' },
      ],
      tools: formattedTools,
      maxTokens: 384,
    })

    const hasData = resp.content && resp.content.length > 50
    console.log(`   ✅ Headlines: ${resp.content?.slice(0, 300) ?? 'empty'}`)
    results.push({ name: 'News headlines', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 5: Sports Score ───────────────────────────────────────
  console.log('\n🏏 Scenario 5: Sports Score')
  {
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'Use searxng_search to find current sports scores.' },
        { role: 'user', content: 'IPL cricket match score today — who is winning?' },
      ],
      tools: formattedTools,
      maxTokens: 256,
    })

    const hasData = resp.content && (resp.content.includes('IPL') || resp.content.includes('cricket') || resp.content.includes('score'))
    console.log(`   ✅ ${resp.content?.slice(0, 200) ?? 'empty'}`)
    results.push({ name: 'Sports score', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 6: Package Delivery Tracking ─────────────────────────
  console.log('\n📦 Scenario 6: Package Tracking')
  {
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'You have access to web search and scraping tools. Track packages by searching for courier status.' },
        { role: 'user', content: 'How do I track an Amazon India delivery? What is the typical delivery time?' },
      ],
      tools: formattedTools,
      maxTokens: 256,
    })

    const hasData = resp.content && resp.content.length > 30
    console.log(`   ✅ ${resp.content?.slice(0, 200) ?? 'empty'}`)
    results.push({ name: 'Delivery tracking', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 7: Recipe Lookup ──────────────────────────────────────
  console.log('\n🍳 Scenario 7: Recipe Lookup')
  {
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'Use searxng_search to find recipes.' },
        { role: 'user', content: 'How to make chicken biryani? Give ingredients and steps.' },
      ],
      tools: formattedTools,
      maxTokens: 384,
    })

    const hasData = resp.content && (resp.content.includes('chicken') || resp.content.includes('biryani') || resp.content.includes('rice'))
    console.log(`   ✅ ${resp.content?.slice(0, 250) ?? 'empty'}`)
    results.push({ name: 'Recipe lookup', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 8: Stock Portfolio Calc ──────────────────────────────
  console.log('\n📈 Scenario 8: Portfolio Calculation')
  {
    // Real-time stock price + calculation
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'Use searxng_search to find RELIANCE stock price on NSE today. Then calculate portfolio value using run_code.' },
        { role: 'user', content: 'I own 100 shares of RELIANCE. What is my current portfolio value?' },
      ],
      tools: formattedTools,
      maxTokens: 384,
    })

    const hasData = resp.content && resp.content.length > 30
    console.log(`   ✅ ${resp.content?.slice(0, 300) ?? 'empty'}`)
    results.push({ name: 'Portfolio calc', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 9: Health Info ───────────────────────────────────────
  console.log('\n🏥 Scenario 9: Health Information')
  {
    const resp = await provider.create({
      messages: [
        { role: 'system', content: 'Use searxng_search to find health information. Always recommend consulting a doctor.' },
        { role: 'user', content: 'What are the symptoms of dengue fever and how to prevent it?' },
      ],
      tools: formattedTools,
      maxTokens: 384,
    })

    const hasData = resp.content && (resp.content.includes('dengue') || resp.content.includes('fever') || resp.content.includes('symptom'))
    console.log(`   ✅ ${resp.content?.slice(0, 250) ?? 'empty'}`)
    results.push({ name: 'Health info', status: hasData ? 'PASS' : 'FAIL', detail: resp.content?.slice(0, 100) ?? '' })
  }

  // ── Scenario 10: Multi-step Research ─────────────────────────────
  console.log('\n🔬 Scenario 10: Multi-step Research (Agent Loop)')
  {
    const msgs = [
      { role: 'system', content: `You are a research assistant. Use tools to gather data. Available: ${formattedTools.map((t: any) => t.name).join(', ')}` },
      { role: 'user', content: 'Compare investment options: FD vs Gold vs S&P 500. Show current returns for each.' },
    ]

    let turns = 0
    let finalResp = ''
    while (turns < 4) {
      const resp = await provider.create({ messages: msgs, tools: formattedTools, maxTokens: 384 })

      if (!resp.toolCalls || resp.toolCalls.length === 0) {
        finalResp = resp.content ?? ''
        break
      }

      for (const tc of resp.toolCalls) {
        msgs.push({ role: 'assistant', content: resp.content, toolCalls: [tc] })
        const result = await transport.callTool(tc.name, tc.arguments)
        const textResult = (result.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
        msgs.push({ role: 'user', content: `Result: ${textResult.slice(0, 300)}`, toolCallId: tc.id })
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
  const report = `# Real-Time Scenario Test Report

**Date**: ${new Date().toISOString()}
**Model**: mistral-small3.1:24b
**MCP Tools**: ${mcpTools.length}

## Results

| Scenario | Status | Details |
|----------|--------|---------|
${results.map(r => `| ${r.name} | ${r.status === 'PASS' ? '✅ PASS' : r.status === 'PARTIAL' ? '⚠️ PARTIAL' : '❌ FAIL'} | ${r.detail} |`).join('\n')}

## Summary

- **Passed**: ${passed}/${results.length}
- **Failed**: ${failed}/${results.length}
- **Pass Rate**: ${(passed/results.length*100).toFixed(0)}%
`

  await Bun.write('REALTIME-SCENARIO-REPORT.md', report)
  console.log('\n📄 Report written to REALTIME-SCENARIO-REPORT.md')
}

main().catch(e => console.error('Fatal:', e))
