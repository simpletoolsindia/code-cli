// Native Code Execution Sandbox
// Replaces run_code, run_python_snippet MCP calls with local execution

import { spawn } from 'node:child_process'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'crypto'
import { tmpdir } from 'node:os'

const isWindows = process.platform === 'win32'
const SANDBOX_DIR = isWindows
  ? join(tmpdir(), 'beast-sandbox')
  : '/tmp/beast-sandbox'
const TIMEOUT_MS = 30000

// Get platform-appropriate shell
function getShell(): { command: string; args: string[] } {
  if (isWindows) {
    return { command: 'cmd.exe', args: ['/c'] }
  }
  return { command: '/bin/bash', args: ['-c'] }
}

// Get platform-appropriate PATH
function getSandboxEnv(): NodeJS.ProcessEnv {
  const baseEnv = { ...process.env }
  if (isWindows) {
    return baseEnv // Use system PATH on Windows
  }
  return {
    ...baseEnv,
    HOME: SANDBOX_DIR,
    PATH: '/usr/bin:/bin:/usr/local/bin',
  }
}

// Ensure sandbox directory exists
if (!existsSync(SANDBOX_DIR)) {
  mkdirSync(SANDBOX_DIR, { recursive: true })
}

export interface CodeResult {
  success: boolean
  output: string
  error?: string
  executionTime?: number
  language?: string
}

export async function runCode(
  code: string,
  language: 'python' | 'javascript' | 'bash',
  timeout = 30
): Promise<CodeResult> {
  const start = Date.now()

  try {
    switch (language) {
      case 'python':
        return runPython(code, timeout, start)
      case 'javascript':
        return runJavaScript(code, timeout, start)
      case 'bash':
        return runBash(code, timeout, start)
      default:
        return { success: false, output: '', error: `Unsupported language: ${language}` }
    }
  } catch (e: any) {
    return { success: false, output: '', error: e.message, executionTime: Date.now() - start }
  }
}

export async function runPythonSnippet(code: string, timeout = 30): Promise<CodeResult> {
  const start = Date.now()

  // Prepend common imports
  const fullCode = `
import json
import math
import re
import datetime
import itertools
from collections import Counter, defaultdict

${code}
`

  return runPython(fullCode, timeout, start)
}

async function runPython(code: string, timeout: number, start: number): Promise<CodeResult> {
  const id = randomUUID()
  const filePath = join(SANDBOX_DIR, `${id}.py`)

  try {
    writeFileSync(filePath, code, 'utf-8')

    const result = await execProcess('python3', ['-u', filePath], timeout * 1000)
    const executionTime = Date.now() - start

    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: 'python',
    }
  } finally {
    try { unlinkSync(filePath) } catch {}
  }
}

async function runJavaScript(code: string, timeout: number, start: number): Promise<CodeResult> {
  const id = randomUUID()
  const filePath = join(SANDBOX_DIR, `${id}.js`)

  try {
    writeFileSync(filePath, code, 'utf-8')

    const result = await execProcess('node', ['--input-type=module', filePath], timeout * 1000)
    const executionTime = Date.now() - start

    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: 'javascript',
    }
  } finally {
    try { unlinkSync(filePath) } catch {}
  }
}

async function runBash(code: string, timeout: number, start: number): Promise<CodeResult> {
  const id = randomUUID()
  const filePath = join(SANDBOX_DIR, `${id}${isWindows ? '.bat' : '.sh'}`)

  try {
    // Write script file
    writeFileSync(filePath, code, 'utf-8')

    const shell = getShell()
    const args = isWindows
      ? ['/c', code] // Windows: execute directly
      : ['-c', code]
    const result = await execProcess(shell.command, args, timeout * 1000)
    const executionTime = Date.now() - start

    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: 'bash',
    }
  } finally {
    try { unlinkSync(filePath) } catch {}
  }
}

function execProcess(
  command: string,
  args: string[],
  timeoutMs: number
): Promise<{ stdout: string; stderr: string; error?: string }> {
  return new Promise(resolve => {
    const proc = spawn(command, args, {
      timeout: timeoutMs,
      cwd: SANDBOX_DIR,
      env: getSandboxEnv(),
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', d => { stdout += d.toString() })
    proc.stderr?.on('data', d => { stderr += d.toString() })

    proc.on('error', e => resolve({ stdout, stderr, error: e.message }))

    proc.on('close', code => {
      if (code !== 0 && !stderr) {
        resolve({ stdout, stderr, error: `Exit code: ${code}` })
      } else {
        resolve({ stdout, stderr, error: code !== 0 ? `Exit code: ${code}` : undefined })
      }
    })
  })
}

// ── Data Analysis Tools ───────────────────────────────────────────────────

export async function pandasCreate(
  data: string,
  name = 'df'
): Promise<{ success: boolean; output: string; error?: string }> {
  // For CLI purposes, we handle JSON data without actual pandas
  // This creates a simple in-memory dataset representation
  try {
    const parsed = JSON.parse(data)
    const rows = Array.isArray(parsed) ? parsed : [parsed]
    const keys = Object.keys(rows[0] || {})

    const summary = {
      name,
      rowCount: rows.length,
      columns: keys,
      preview: rows.slice(0, 5),
    }

    return {
      success: true,
      output: JSON.stringify(summary, null, 2),
    }
  } catch (e: any) {
    return { success: false, output: '', error: `Invalid JSON: ${e.message}` }
  }
}

export async function pandasFilter(
  data: unknown[],
  conditions: string
): Promise<{ success: boolean; output: string; error?: string }> {
  try {
    const parsedConditions = JSON.parse(conditions)
    const filtered = data.filter((row: any) => {
      for (const [key, op] of Object.entries(parsedConditions)) {
        const rowVal = row[key]
        if (typeof op === 'object') {
          for (const [cmp, val] of Object.entries(op)) {
            switch (cmp) {
              case '$eq': if (rowVal !== val) return false; break
              case '$ne': if (rowVal === val) return false; break
              case '$gt': if ((rowVal as number) <= (val as number)) return false; break
              case '$gte': if ((rowVal as number) < (val as number)) return false; break
              case '$lt': if ((rowVal as number) >= (val as number)) return false; break
              case '$lte': if ((rowVal as number) > (val as number)) return false; break
              case '$contains': if (!String(rowVal).includes(String(val))) return false; break
            }
          }
        } else {
          if (rowVal !== op) return false
        }
      }
      return true
    })

    return {
      success: true,
      output: JSON.stringify(filtered, null, 2),
    }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

export async function pandasAggregate(
  data: unknown[],
  groupBy: string[],
  aggregations: Record<string, string>
): Promise<{ success: boolean; output: string; error?: string }> {
  try {
    const rows = data as Record<string, unknown>[]
    const groups = new Map<string, Record<string, unknown>[]>()

    for (const row of rows) {
      const key = groupBy.map(k => String(row[k])).join('|')
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)
    }

    const results = []
    for (const [key, groupRows] of groups) {
      const result: Record<string, unknown> = {}
      const keyParts = key.split('|')
      groupBy.forEach((k, i) => { result[k] = keyParts[i] })

      for (const [col, fn] of Object.entries(aggregations)) {
        const values = groupRows.map(r => Number(r[col])).filter(v => !isNaN(v))
        switch (fn) {
          case 'sum': result[`${col}_sum`] = values.reduce((a, b) => a + b, 0); break
          case 'avg': result[`${col}_avg`] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break
          case 'count': result[`${col}_count`] = values.length; break
          case 'min': result[`${col}_min`] = Math.min(...values); break
          case 'max': result[`${col}_max`] = Math.max(...values); break
        }
      }
      results.push(result)
    }

    return { success: true, output: JSON.stringify(results, null, 2) }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}
