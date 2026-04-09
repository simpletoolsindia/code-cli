#!/usr/bin/env bun
/**
 * Beast CLI - Stock Price Test with 8B Free Model
 * Uses gemma-3-4b-it:free (4B) or qwen3.6-plus via OpenRouter
 */

import { StdioTransport } from './mcp/index.ts'

const OPENROUTER_KEY = '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'
const MODEL_8B = 'google/gemma-3-4b-it:free'  // 4B free tier model (closest to 8B)
const MODEL_MAIN = 'qwen/qwen3.6-plus'
const BASE_URL = 'https://openrouter.ai/api/v1'

// MCP server config
const MCP_CMD = 'bash'
const MCP_ARGS = ['-c', 'cd /tmp/extra_skills_mcp/src && PYTHONPATH=/tmp/extra_skills_mcp/src /tmp/mcp-venv/bin/python -m mcp_server']

async function fetchFromMCP(url: string): Promise<string> {
  const transport = new StdioTransport(MCP_CMD, MCP_ARGS, {})

  try {
    await transport.connect()
    await transport.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'beast-cli', version: '1.0.0' },
    })

    const result = await transport.send('tools/call', {
      name: 'fetch_web_content',
      arguments: { url, max_tokens: 5000 }
    }) as any

    await transport.disconnect()
    return result.content?.[0]?.text || JSON.stringify(result)
  } catch (err) {
    return `Error: ${err}`
  }
}

async function askLLM(model: string, messages: any[]): Promise<any> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://beast-cli.dev',
      'X-Title': 'Beast CLI Stock Test',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 512,
      temperature: 0.1,
    }),
  })
  return res.json()
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 TATA POWER STOCK PRICE TEST')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Try multiple sources
  const sources = [
    'https://www.moneycontrol.com/india/stockpricequote/consolidated/tatapower/TPCG06',
    'https://www.goodreturns.in/stockquote/tata-power-company-ltd.php',
    'https://www.screener.in/company/TATAPOWER/',
    'https://www.google.com/finance/quote/NSE:TATAPOWER',
  ]

  let stockData = ''
  let successSource = ''

  for (const url of sources) {
    console.log(`📡 Trying: ${url}`)
    const data = await fetchFromMCP(url)

    if (data.length > 500 && !data.includes('error') && !data.includes('HTTP')) {
      stockData = data
      successSource = url
      console.log(`✅ Success! Got ${data.length} chars`)
      break
    } else {
      console.log(`❌ Failed or too short (${data.length} chars)`)
    }
  }

  if (!stockData) {
    console.log('\n❌ All sources failed, using last result')
    stockData = await fetchFromMCP(sources[0])
  }

  console.log(`\n📊 Data from: ${successSource || 'unknown'}`)
  console.log(`Data preview: ${stockData.slice(0, 500)}...\n`)

  // Extract price using LLM
  console.log('🤖 Using LLM to extract stock price...')

  // Try 8B model first
  console.log(`\n🔹 Model: ${MODEL_8B}`)
  const llm8b = await askLLM(MODEL_8B, [
    {
      role: 'system',
      content: 'You are a financial data extractor. Extract ONLY the current stock price of Tata Power from the provided text. Return format: "Tata Power: ₹<price>" or "Not found" if unavailable. Do not make up prices.'
    },
    {
      role: 'user',
      content: `Extract Tata Power stock price from:\n\n${stockData.slice(0, 3000)}`
    }
  ])

  const answer8b = llm8b.choices?.[0]?.message?.content || 'Error'
  console.log(`8B Model Answer: ${answer8b}`)

  // Also try main model for comparison
  console.log(`\n🔹 Model: ${MODEL_MAIN}`)
  const llmMain = await askLLM(MODEL_MAIN, [
    {
      role: 'system',
      content: 'You are a financial data extractor. Extract ONLY the current stock price of Tata Power from the provided text. Return format: "Tata Power: ₹<price>" or "Not found" if unavailable. Do not make up prices.'
    },
    {
      role: 'user',
      content: `Extract Tata Power stock price from:\n\n${stockData.slice(0, 3000)}`
    }
  ])

  const answerMain = llmMain.choices?.[0]?.message?.content || 'Error'
  console.log(`Main Model Answer: ${answerMain}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📈 TEST RESULT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!answer8b.includes('Not found') && answer8b.includes('₹')) {
    console.log(`✅ 8B Model: ${answer8b}`)
  }
  if (!answerMain.includes('Not found') && answerMain.includes('₹')) {
    console.log(`✅ Main Model: ${answerMain}`)
  }

  if (answer8b.includes('Not found') && answerMain.includes('Not found')) {
    console.log('❌ Could not extract stock price')
    console.log('💡 Suggestion: Check if MCP fetch is working correctly')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(console.error)