// Run all tests sequentially
console.log('🐉 Beast CLI - Running All Tests')
console.log('═'.repeat(70))

const tests = [
  'test-p1.ts',
  'test-p2.ts',
  'test-p3.ts',
  'test-p4.ts',
  'test-multiagent.ts',
]

let failed = false

for (const test of tests) {
  console.log(`\n📦 Running ${test}...`)
  const { spawn } = require('child_process')

  try {
    const result = Bun.spawn({
      cmd: ['bun', 'run', test],
      cwd: process.cwd(),
      stdout: 'inherit',
      stderr: 'inherit',
    })

    const exit = await result.exited
    if (exit !== 0) {
      console.log(`❌ ${test} FAILED`)
      failed = true
    } else {
      console.log(`✅ ${test} PASSED`)
    }
  } catch (e) {
    console.log(`❌ ${test} ERROR: ${e.message}`)
    failed = true
  }
}

console.log('\n' + '═'.repeat(70))
if (failed) {
  console.log('❌ Some tests failed')
  process.exit(1)
} else {
  console.log('✅ All tests passed!')
}