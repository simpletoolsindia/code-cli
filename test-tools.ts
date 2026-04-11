// Comprehensive tool testing for beast-cli
// Run with: bun run test-tools.ts

import * as webTools from './src/native-tools/web.ts'
import * as fileTools from './src/native-tools/files.ts'
import * as searchTools from './src/native-tools/search.ts'
import * as codeTools from './src/native-tools/code.ts'
import * as nativeTools from './src/native-tools/index.ts'

const results: { name: string; category: string; passed: boolean; error?: string; duration: number }[] = []

async function testTool(category: string, name: string, fn: () => Promise<any>) {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    const passed = result?.success !== false && !result?.error?.includes('Could not fetch')
    results.push({ name, category, passed, duration, error: result?.error })
    console.log(`${passed ? '✅' : '⚠️'} ${name} (${duration}ms)${result?.error && passed ? ` - ${result.error}` : ''}`)
    return result
  } catch (e: any) {
    const duration = Date.now() - start
    results.push({ name, category, passed: false, error: e.message, duration })
    console.log(`❌ ${name} (${duration}ms) - ERROR: ${e.message}`)
    return null
  }
}

async function runTests() {
  console.log('🐉 Beast CLI - Tool Testing Report')
  console.log('='.repeat(60))
  console.log(`Platform: ${process.platform} | Node: ${process.version}`)
  console.log('')

  // Web Tools
  console.log('📡 Web Tools:')
  console.log('-'.repeat(40))
  await testTool('web', 'fetchWebContent', () => webTools.fetchWebContent('https://example.com', 2000))
  await testTool('web', 'quickFetch', () => webTools.quickFetch('https://example.com'))
  await testTool('web', 'pythonWebScrape', () => webTools.pythonWebScrape('https://example.com', 2000))
  await testTool('web', 'scrapeFreedium', () => webTools.scrapeFreedium('https://freedium.cfd/test', 1000))
  await testTool('web', 'webclawExtractArticle', () => webTools.webclawExtractArticle('https://example.com'))
  await testTool('web', 'fetchWithSelectors', () => webTools.fetchWithSelectors('https://example.com', { title: 'title', content: 'body' }))
  console.log('')

  // Search Tools
  console.log('🔍 Search Tools:')
  console.log('-'.repeat(40))
  await testTool('search', 'searxng_search', () => searchTools.searxngSearch('test', 5))
  await testTool('search', 'searchImages', () => searchTools.searchImages('test', 3))
  await testTool('search', 'hackernews_top', () => searchTools.hackernewsTop(5))
  await testTool('search', 'hackernews_new', () => searchTools.hackernewsNew(5))
  await testTool('search', 'hackernews_best', () => searchTools.hackernewsBest(5))
  console.log('')

  // File Tools
  console.log('📁 File Tools:')
  console.log('-'.repeat(40))
  await testTool('file', 'fileRead (package.json)', () => fileTools.fileRead('./package.json', 5000))
  await testTool('file', 'fileList (.)', () => fileTools.fileList('./', 10))
  await testTool('file', 'fileSearch (*.ts)', () => fileTools.fileSearch('.', '*.ts', 10))
  await testTool('file', 'fileGrep (test)', () => fileTools.fileGrep('.', 'test', 10, '*.ts'))
  console.log('')

  // Code Execution
  console.log('⚡ Code Execution:')
  console.log('-'.repeat(40))
  await testTool('code', 'run_code (Python)', () => codeTools.runCode('print("Hello from Python!")', 'python', 10))
  await testTool('code', 'run_code (JavaScript)', () => codeTools.runCode('console.log("Hello from JS!")', 'javascript', 10))
  await testTool('code', 'run_code (Bash)', () => codeTools.runCode('echo "Hello from Bash!"', 'bash', 10))
  await testTool('code', 'runPythonSnippet', () => codeTools.runPythonSnippet('import sys; print(sys.version)', 10))
  console.log('')

  // Native Tools Registry
  console.log('🔧 Tool Registry:')
  console.log('-'.repeat(40))
  const allTools = nativeTools.getAllTools()
  console.log(`Total registered tools: ${allTools.length}`)

  const categories: Record<string, number> = {}
  allTools.forEach(t => {
    const cat = t.name.split('_')[0]
    categories[cat] = (categories[cat] || 0) + 1
  })
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} tools`)
  })
  console.log('')

  // Summary
  console.log('='.repeat(60))
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  console.log(`📊 Summary: ${passed} passed, ${failed} failed (${totalDuration}ms total)`)
  console.log('')

  if (failed > 0) {
    console.log('❌ Failed tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - [${r.category}] ${r.name}: ${r.error}`)
    })
  }

  // Save markdown report
  const fs = await import('fs')
  const report = `# Beast CLI - Tool Testing Report

**Date:** ${new Date().toISOString()}
**Platform:** ${process.platform}
**Node:** ${process.version}

## Summary
- **Total Registered Tools:** ${allTools.length}
- **Tests Run:** ${results.length}
- **Passed:** ${passed} ✅
- **Failed:** ${failed} ❌
- **Duration:** ${totalDuration}ms

## Tool Categories
${Object.entries(categories).map(([cat, count]) => `- **${cat}**: ${count} tools`).join('\n')}

## Test Results

| Category | Tool | Status | Duration | Error |
|----------|------|--------|----------|-------|
${results.map(r => `| ${r.category} | ${r.name} | ${r.passed ? '✅ PASS' : '❌ FAIL'} | ${r.duration}ms | ${r.error || '-'} |`).join('\n')}

## Detailed Results

### Web Tools
${results.filter(r => r.category === 'web').map(r => `- **${r.name}**: ${r.passed ? '✅' : '❌'} ${r.duration}ms`).join('\n')}

### Search Tools
${results.filter(r => r.category === 'search').map(r => `- **${r.name}**: ${r.passed ? '✅' : '❌'} ${r.duration}ms`).join('\n')}

### File Tools
${results.filter(r => r.category === 'file').map(r => `- **${r.name}**: ${r.passed ? '✅' : '❌'} ${r.duration}ms`).join('\n')}

### Code Execution
${results.filter(r => r.category === 'code').map(r => `- **${r.name}**: ${r.passed ? '✅' : '❌'} ${r.duration}ms`).join('\n')}

---

*Generated by Beast CLI Testing Suite*
`
  fs.writeFileSync('./TEST-REPORT.md', report)
  console.log('📄 Report saved to TEST-REPORT.md')
}

runTests().catch(console.error)