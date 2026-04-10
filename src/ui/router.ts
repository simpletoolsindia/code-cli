// Beast CLI - UI Router
// Picks REPL or Ink TUI at startup based on --tui flag or interactive prompt

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { s, fg, dim } from './colors.ts'
import { renderCleanBanner } from './banner.ts'

export type UIMode = 'repl' | 'ink' | 'auto'

// Detect if we're in a non-interactive context (pipe, redirect)
function isInteractive(): boolean {
  return process.stdin.isTTY === true
}

// Resolve ink source path from this module's location (works when installed globally)
function getInkSourcePath(): string {
  const selfDir = dirname(fileURLToPath(import.meta.url))
  // bundled beast.js lives in bin/, so go ../.. to project root, then src/ui/ink/
  return resolve(selfDir, '..', 'src', 'ui', 'ink', 'index.tsx')
}

// Launch the REPL mode via bun (avoids dynamic .ts import issues in bundled output)
export async function launchRepl(): Promise<void> {
  try {
    const { dirname } = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    const { spawn } = await import('node:child_process')

    const selfDir = dirname(fileURLToPath(import.meta.url))
    const srcEntry = selfDir + '/../index.ts'
    const bunPath = process.env.BUN_INSTALL
      ? process.env.BUN_INSTALL + '/bin/bun'
      : 'bun'

    const child = spawn(bunPath, ['--bun', 'run', srcEntry, '--defaults'], {
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    child.on('exit', (code) => process.exit(code ?? 0))
  } catch (err) {
    console.error(s('\nFailed to launch REPL: ' + String(err), fg.error))
    process.exit(1)
  }
}

// Launch the Ink TUI mode via bun --bun (runs TSX source directly)
export async function launchInk(): Promise<void> {
  try {
    const inkSource = getInkSourcePath()
    // Find bun — prefer BUN_INSTALL env var, fallback to 'bun'
    const bunPath = process.env.BUN_INSTALL
      ? process.env.BUN_INSTALL + '/bin/bun'
      : 'bun'

    const child = spawn(bunPath, ['--bun', 'run', inkSource], {
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    child.on('exit', (code) => process.exit(code ?? 0))
  } catch (err) {
    console.error(s('\nFailed to launch Ink TUI: ' + String(err), fg.error))
    console.error(s('Falling back to REPL mode...\n', fg.warning))
    await launchRepl()
  }
}

// Interactive mode picker
async function promptMode(): Promise<UIMode> {
  const readline = await import('readline')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  return new Promise((resolve) => {
    console.log(renderCleanBanner())
    console.log()
    console.log(`  ${s('[1]', fg.accent)} ${s('Minimal REPL', fg.primary)}   ${dim}— fast, ASCII-safe, tab complete`)
    console.log(`  ${s('[2]', fg.accent)} ${s('Rich TUI', fg.primary)}       ${dim}— modern React/Ink with spinners & panels`)
    console.log()
    console.log(`  ${s('Tip:', fg.warning)} ${s('Use', fg.muted)} ${s('--tui', fg.accent)} ${s('flag to skip this prompt', fg.muted)}`)
    console.log()

    rl.question(s('  Choose [1]', fg.muted) + ' ', (answer: string) => {
      rl.close()
      resolve(answer.trim() === '2' ? 'ink' : 'repl')
    })
  })
}

// Main router — replaces the direct repl() call at the bottom of src/index.ts
export async function launchUI(mode: UIMode = 'auto'): Promise<void> {
  // --tui flag → go straight to Ink
  if (process.argv.includes('--tui')) {
    console.log(s('\n  Launching Rich TUI...', fg.accent))
    await launchInk()
    return
  }

  // Non-interactive → always REPL
  if (!isInteractive()) {
    await launchRepl()
    return
  }

  if (mode === 'auto') {
    const chosen = await promptMode()
    if (chosen === 'ink') {
      await launchInk()
    } else {
      await launchRepl()
    }
    return
  }

  mode === 'ink' ? await launchInk() : await launchRepl()
}
