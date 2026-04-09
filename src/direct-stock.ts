#!/usr/bin/env bun
/**
 * Beast CLI - Direct MCP Stock Price Fetch
 * No LLM needed - directly fetch and parse
 */

import { StdioTransport } from './mcp/index.ts'

const MCP_CMD = 'bash'
const MCP_ARGS = ['-c', 'cd /tmp/extra_skills_mcp/src && PYTHONPATH=/tmp/extra_skills_mcp/src /tmp/mcp-venv/bin/python -m mcp_server']

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 DIRECT MCP STOCK PRICE TEST')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const transport = new StdioTransport(MCP_CMD, MCP_ARGS, {})
  await transport.connect()
  await transport.send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: 'beast-cli', version: '1.0.0' },
  })

  // Test different stock price sources
  const urls = [
    'https://www.goodreturns.in/stockquote/tata-power-company-ltd.php',
    'https://www.moneycontrol.com/india/stockpricequote/consolidated/tatapower/TPCG06',
    'https://www.screener.in/company/TATAPOWER/consolidated/',
  ]

  console.log('🔍 Fetching stock prices from multiple sources...\n')

  for (const url of urls) {
    console.log(`📡 Source: ${url}`)
    const result = await transport.send('tools/call', {
      name: 'fetch_web_content',
      arguments: { url, max_tokens: 5000 }
    }) as any

    const data = result.content?.[0]?.text || JSON.stringify(result)
    console.log(`Result length: ${data.length} chars`)

    // Try to find price pattern
    const priceMatch = data.match(/₹\s*([\d,]+\.?\d*)|Rs\.?\s*([\d,]+\.?\d*)|([\d,]+\.?\d*)\s*INR/i)
    if (priceMatch) {
      console.log(`💰 Found price: ${priceMatch[0]}`)
    }

    // Look for Tata Power specific data
    if (data.includes('Tata') && data.includes('Power')) {
      console.log('✅ Contains Tata Power data')

      // Extract key info
      const cleanData = data.replace(/\s+/g, ' ').slice(0, 1000)
      console.log(`Data preview: ${cleanData.slice(0, 300)}...`)
    }
    console.log('')
  }

  await transport.disconnect()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(console.error)