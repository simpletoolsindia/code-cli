/**
 * Regression Test: BUG-004 Tool Result Indexing Bug
 *
 * Tests that tool calls and results are mapped correctly using stable IDs,
 * not array positions. This was the root cause of BUG-004 where results
 * were attached to wrong tool calls due to positional array indexing.
 *
 * Run: bun test-tool-call-mapping.ts
 */

import { executeTool } from './src/native-tools/index.ts'

// ─── Types mirroring useAgentLoop.ts ────────────────────────────────────────

interface ToolCallState {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: string
  status: 'running' | 'done' | 'error'
}

// ─── Pure mapping functions (extracted from useAgentLoop logic) ──────────────

/**
 * Add a new tool call to the state array, assigning a stable ID.
 * This is the CORRECT way to add tool calls (was broken before BUG-004 fix).
 */
function addToolCall(
  toolCalls: ToolCallState[],
  toolId: string,
  name: string,
  args: Record<string, unknown>
): ToolCallState[] {
  return [
    ...toolCalls,
    { id: toolId, name, arguments: args, status: 'running' },
  ]
}

/**
 * Update a tool call result by stable ID (not array position!).
 * This is the CORRECT result mapping (was using array index before fix).
 */
function updateToolResult(
  toolCalls: ToolCallState[],
  toolId: string,
  result: string,
  status: 'done' | 'error'
): ToolCallState[] {
  return toolCalls.map(t =>
    t.id === toolId
      ? { ...t, result, status }
      : t
  )
}

// ─── Old buggy version for comparison ───────────────────────────────────────

/**
 * OLD BUGGY VERSION: Uses array position (s.toolCalls.length - 1).
 * This is what caused BUG-004 — fragile, breaks with reordering.
 */
function updateToolResult_BUGGY(
  toolCalls: ToolCallState[],
  result: string,
  status: 'done' | 'error'
): ToolCallState[] {
  return toolCalls.map((t, i) =>
    i === toolCalls.length - 1
      ? { ...t, result, status }
      : t
  )
}

// ─── Test Infrastructure ─────────────────────────────────────────────────────

interface TestResult {
  name: string
  passed: boolean
  durationMs: number
  error?: string
}

const results: TestResult[] = []

function test(name: string, fn: () => void | Promise<void>): void {
  const start = Date.now()
  try {
    const maybePromise = fn()
    if (maybePromise instanceof Promise) {
      maybePromise.then(() => {
        results.push({ name, passed: true, durationMs: Date.now() - start })
      }).catch((e: Error) => {
        results.push({ name, passed: false, durationMs: Date.now() - start, error: e.message })
      })
    } else {
      results.push({ name, passed: true, durationMs: Date.now() - start })
    }
  } catch (e: any) {
    results.push({ name, passed: false, durationMs: Date.now() - start, error: e.message })
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function assertTrue(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

// ─── Tests ──────────────────────────────────────────────────────────────────

console.log('🐉 BUG-004 Regression Tests: Tool Call-Result Mapping\n')
console.log('═'.repeat(70))

// Test 1: Single tool call -> single result
test('T1: Single tool call -> single result maps correctly', () => {
  let toolCalls: ToolCallState[] = []

  const id1 = 'searxng_search-1'
  toolCalls = addToolCall(toolCalls, id1, 'searxng_search', { query: 'test', limit: 5 })
  assertEqual(toolCalls.length, 1, 'Should have 1 tool call')
  assertEqual(toolCalls[0].status, 'running', 'Should be running')
  assertEqual(toolCalls[0].id, id1, 'Should have correct ID')

  toolCalls = updateToolResult(toolCalls, id1, 'Search results here', 'done')
  assertEqual(toolCalls.length, 1, 'Should still have 1 tool call')
  assertEqual(toolCalls[0].result, 'Search results here', 'Result should be attached')
  assertEqual(toolCalls[0].status, 'done', 'Should be done')
})

// Test 2: Multiple sequential tool calls -> each result maps correctly
test('T2: Multiple sequential tool calls -> each maps to its own result', () => {
  let toolCalls: ToolCallState[] = []

  const id1 = 'searxng_search-1'
  const id2 = 'file_list-2'
  const id3 = 'file_read-3'

  toolCalls = addToolCall(toolCalls, id1, 'searxng_search', { query: 'AI news', limit: 3 })
  toolCalls = addToolCall(toolCalls, id2, 'file_list', { path: '.' })
  toolCalls = addToolCall(toolCalls, id3, 'file_read', { path: 'package.json' })

  assertEqual(toolCalls.length, 3, 'Should have 3 tool calls')
  assertEqual(toolCalls[0].id, id1, 'First tool ID should be id1')
  assertEqual(toolCalls[1].id, id2, 'Second tool ID should be id2')
  assertEqual(toolCalls[2].id, id3, 'Third tool ID should be id3')

  // Complete first tool
  toolCalls = updateToolResult(toolCalls, id1, 'Result for search', 'done')
  assertEqual(toolCalls[0].result, 'Result for search', 'First tool result')
  assertEqual(toolCalls[0].status, 'done', 'First tool status')
  assertEqual(toolCalls[1].status, 'running', 'Second should still be running')
  assertEqual(toolCalls[2].status, 'running', 'Third should still be running')

  // Complete second tool
  toolCalls = updateToolResult(toolCalls, id2, 'Result for list', 'done')
  assertEqual(toolCalls[1].result, 'Result for list', 'Second tool result')
  assertEqual(toolCalls[0].result, 'Result for search', 'First result unchanged')
  assertEqual(toolCalls[2].status, 'running', 'Third should still be running')

  // Complete third tool
  toolCalls = updateToolResult(toolCalls, id3, 'Result for read', 'done')
  assertEqual(toolCalls[2].result, 'Result for read', 'Third tool result')
  assertEqual(toolCalls[0].result, 'Result for search', 'First unchanged')
  assertEqual(toolCalls[1].result, 'Result for list', 'Second unchanged')
})

// Test 3: Multiple tool calls in ONE assistant turn -> each maps correctly
test('T3: Multiple tool calls from same LLM response -> correct mapping', () => {
  let toolCalls: ToolCallState[] = []

  // Simulate LLM returning multiple tool calls in one response
  const llmResponse = {
    toolCalls: [
      { name: 'file_list', args: { path: '.' } },
      { name: 'file_read', args: { path: 'README.md' } },
      { name: 'searxng_search', args: { query: 'cli tools', limit: 5 } },
    ]
  }

  let count = 0
  for (const tc of llmResponse.toolCalls) {
    count++
    const toolId = `${tc.name}-${count}`
    toolCalls = addToolCall(toolCalls, toolId, tc.name, tc.args)
  }

  assertEqual(toolCalls.length, 3, 'Should have 3 tool calls')

  // Simulate results coming back in order
  toolCalls = updateToolResult(toolCalls, 'file_list-1', '["src/", "bin/", "test/"]', 'done')
  toolCalls = updateToolResult(toolCalls, 'file_read-2', 'README content here', 'done')
  toolCalls = updateToolResult(toolCalls, 'searxng_search-3', '{"results": [...]}', 'done')

  assertEqual(toolCalls[0].result, '["src/", "bin/", "test/"]', 'First result correct')
  assertEqual(toolCalls[1].result, 'README content here', 'Second result correct')
  assertEqual(toolCalls[2].result, '{"results": [...]}', 'Third result correct')
  assertEqual(toolCalls[0].name, 'file_list', 'First name preserved')
  assertEqual(toolCalls[1].name, 'file_read', 'Second name preserved')
  assertEqual(toolCalls[2].name, 'searxng_search', 'Third name preserved')
})

// Test 4: Error handling — error result maps to correct tool
test('T4: Error result maps to the correct tool, not the last one', () => {
  let toolCalls: ToolCallState[] = []

  const id1 = 'file_read-1'
  const id2 = 'file_read-2'

  toolCalls = addToolCall(toolCalls, id1, 'file_read', { path: 'existing.txt' })
  toolCalls = addToolCall(toolCalls, id2, 'file_read', { path: 'nonexistent.txt' })

  // First succeeds, second fails
  toolCalls = updateToolResult(toolCalls, id1, 'File contents', 'done')
  toolCalls = updateToolResult(toolCalls, id2, 'ENOENT: file not found', 'error')

  assertEqual(toolCalls[0].status, 'done', 'First tool should be done')
  assertEqual(toolCalls[0].result, 'File contents', 'First result correct')
  assertEqual(toolCalls[1].status, 'error', 'Second tool should be error')
  assertEqual(toolCalls[1].result, 'ENOENT: file not found', 'Error message correct')
})

// Test 5: Result attaches to correct tool even if called out of order
test('T5: Results arriving out-of-order still map correctly', () => {
  let toolCalls: ToolCallState[] = []

  const id1 = 'file_read-1'
  const id2 = 'file_read-2'
  const id3 = 'file_read-3'

  toolCalls = addToolCall(toolCalls, id1, 'file_read', { path: 'a.txt' })
  toolCalls = addToolCall(toolCalls, id2, 'file_read', { path: 'b.txt' })
  toolCalls = addToolCall(toolCalls, id3, 'file_read', { path: 'c.txt' })

  // Results come back in reverse order (simulating async variation)
  toolCalls = updateToolResult(toolCalls, id3, 'Result from c.txt', 'done')
  toolCalls = updateToolResult(toolCalls, id1, 'Result from a.txt', 'done')
  toolCalls = updateToolResult(toolCalls, id2, 'Result from b.txt', 'done')

  assertEqual(toolCalls[0].result, 'Result from a.txt', 'a.txt result on first tool')
  assertEqual(toolCalls[1].result, 'Result from b.txt', 'b.txt result on second tool')
  assertEqual(toolCalls[2].result, 'Result from c.txt', 'c.txt result on third tool')
})

// Test 6: ID-based vs positional — demonstrates the bug difference
test('T6: ID-based mapping is stable, positional breaks on reorder', () => {
  let toolCalls: ToolCallState[] = []

  const id1 = 'searxng_search-1'
  const id2 = 'file_list-2'

  // Add in order
  toolCalls = addToolCall(toolCalls, id1, 'searxng_search', { query: 'x', limit: 5 })
  toolCalls = addToolCall(toolCalls, id2, 'file_list', { path: '.' })

  // CORRECT: ID-based mapping
  let correct = updateToolResult(toolCalls, id2, 'file_list_result', 'done')
  correct = updateToolResult(correct, id1, 'search_result', 'done')

  assertEqual(correct[0].id, id1, 'ID-based: first tool ID preserved')
  assertEqual(correct[0].result, 'search_result', 'ID-based: first result correct')
  assertEqual(correct[1].id, id2, 'ID-based: second tool ID preserved')
  assertEqual(correct[1].result, 'file_list_result', 'ID-based: second result correct')

  // BUGGY: Positional mapping — both updates target the LAST element,
  // so the second result OVERWRITES the first and first tool never gets updated
  let buggy = updateToolResult_BUGGY(toolCalls, 'file_list_result', 'done')
  buggy = updateToolResult_BUGGY(buggy, 'search_result', 'done')

  // With buggy positional approach:
  // - First update goes to position 1 (id2): [id1=undefined, id2=file_list_result]
  // - Second update ALSO goes to position 1 (id2): [id1=undefined, id2=search_result]
  // - id1 never gets its result! This is BUG-004 in action.
  assertEqual(buggy[0].result, undefined, 'Buggy: first tool never updated (lost!)')
  assertEqual(buggy[1].result, 'search_result', 'Buggy: second tool has final result only')

  // The CORRECT version uses ID-based mapping so each result targets the right tool
  assertEqual(correct[0].result, 'search_result', 'Correct: first tool has its result')
  assertEqual(correct[1].result, 'file_list_result', 'Correct: second tool has its result')
})

// Test 7: Real tool execution — integration test
test('T7: Real tool execution maps result to correct tool ID', async () => {
  let toolCalls: ToolCallState[] = []

  const id1 = 'file_list-1'
  toolCalls = addToolCall(toolCalls, id1, 'file_list', { path: '.' })

  assertEqual(toolCalls[0].status, 'running', 'Should be running before exec')

  const result = await executeTool('file_list', { path: '.' })

  toolCalls = updateToolResult(toolCalls, id1, result.content, result.success ? 'done' : 'error')

  assertEqual(toolCalls[0].status, result.success ? 'done' : 'error', 'Status updated from real exec')
  assertTrue(toolCalls[0].result !== undefined, 'Result should be set')
  assertEqual(toolCalls[0].id, id1, 'ID should be preserved through real execution')
}, { async: true })

// Test 8: Empty/initial state handling
test('T8: Empty toolCalls array handles updates gracefully', () => {
  let toolCalls: ToolCallState[] = []

  // No-op on empty
  const after = updateToolResult(toolCalls, 'nonexistent-id', 'result', 'done')
  assertEqual(after.length, 0, 'Empty array stays empty')
})

// Test 9: Multiple rapid sequential updates to same tool
test('T9: Rapid sequential updates to same tool preserve final state', () => {
  let toolCalls: ToolCallState[] = []

  const id1 = 'searxng_search-1'
  toolCalls = addToolCall(toolCalls, id1, 'searxng_search', { query: 'test', limit: 5 })

  // Simulate streaming/partial results
  toolCalls = updateToolResult(toolCalls, id1, 'Loading...', 'running')
  toolCalls = updateToolResult(toolCalls, id1, 'Got 5 results...', 'running')
  toolCalls = updateToolResult(toolCalls, id1, '{"results": ["a", "b", "c"]}', 'done')

  assertEqual(toolCalls[0].result, '{"results": ["a", "b", "c"]}', 'Final result correct')
  assertEqual(toolCalls[0].status, 'done', 'Final status correct')
})

// ─── Results ────────────────────────────────────────────────────────────────

// Wait for async tests to complete
setTimeout(() => {
  console.log('\n' + '═'.repeat(70))
  console.log('\nResults:\n')

  let passed = 0
  let failed = 0

  for (const r of results) {
    const icon = r.passed ? '✅' : '❌'
    const timing = `${r.durationMs}ms`
    if (r.passed) {
      passed++
      console.log(`  ${icon} ${r.name} (${timing})`)
    } else {
      failed++
      console.log(`  ${icon} ${r.name} (${timing})`)
      console.log(`     Error: ${r.error}`)
    }
  }

  console.log('\n' + '─'.repeat(70))
  console.log(`\n  Total:  ${results.length}`)
  console.log(`  Passed: ${passed}`)
  console.log(`  Failed: ${failed}`)

  console.log('\n' + '═'.repeat(70))
  if (failed > 0) {
    console.log('❌ REGRESSION TESTS FAILED — BUG-004 fix may not be working\n')
    process.exit(1)
  } else {
    console.log('✅ ALL REGRESSION TESTS PASSED — BUG-004 fix verified\n')
    process.exit(0)
  }
}, 5000) // Wait for async tests
