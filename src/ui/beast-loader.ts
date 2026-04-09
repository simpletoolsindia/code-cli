// Beast CLI - Beast Loader Animation
// Animated 🐉 frames for LLM response wait states

import { s, fg, bold } from './colors.ts'

// ASCII art beast frames — cycles to simulate movement
const BEAST_FRAMES = [
  [
    '      🐉 ',
    '     /    ',
    '    /_____',
    '   (  ●●  )',
    '   |      |',
    '   |  ▼▼  |',
    '   |______|',
    '    |    |',
    '   /|    |\\',
  ],
  [
    '       🐉',
    '      /   ',
    '    _/____ ',
    '   (  ●●  )',
    '   |      |',
    '   |  ▼▼  |',
    '   |______|',
    '    |    |',
    '   /|    |\\',
  ],
  [
    '   🐉     ',
    '     \\    ',
    '   ____\\  ',
    '   (  ●●  )',
    '   |      |',
    '   |  ▼▼  |',
    '   |______|',
    '    |    |',
    '   /|    |\\',
  ],
  [
    '  🐉      ',
    '   \\      ',
    '   \\______',
    '   (  ●●  )',
    '   |      |',
    '   |  ▼▼  |',
    '   |______|',
    '    |    |',
    '   /|    |\\',
  ],
]

const FRAME_DELAY_MS = 150
const PROGRESS_CHARS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export interface BeastLoaderOptions {
  label?: string
  sublabel?: string
  showProgress?: boolean
}

// Draws a static beast frame
function drawFrame(frame: string[], color: string, label: string, sublabel: string, progress: string): string {
  const maxLen = Math.max(...frame.map(l => l.length), label.length + sublabel.length + 20)
  const separator = '─'.repeat(Math.max(15, maxLen))

  const top = s(` ┌${separator}┐`, fg.muted)
  const lines = frame.map(l => s(` │ ${l.padEnd(maxLen - 2)} │`, color))
  const sep2 = s(` ├${separator}┤`, fg.muted)

  const labelLine = ` │ ${s(label, fg.accent, bold).padEnd(maxLen - 2)} │`
  const subLine = sublabel
    ? ` │ ${s(sublabel, fg.secondary).padEnd(maxLen - 2)} │`
    : ` │ ${s(progress, fg.muted).padEnd(maxLen - 2)} │`
  const bot = s(` └${separator}┘`, fg.muted)

  return [top, ...lines, sep2, labelLine, subLine, bot].join('\n')
}

// Animate beast for an async operation
export async function beastAnimate<T>(
  label: string,
  sublabel: string,
  promise: Promise<T>,
  options: BeastLoaderOptions = {}
): Promise<T> {
  let frame = 0
  let aborted = false

  // Animate beast while waiting
  const ticker = setInterval(() => {
    if (aborted) return
    const f = BEAST_FRAMES[frame % BEAST_FRAMES.length]
    const progress = PROGRESS_CHARS[frame % PROGRESS_CHARS.length]
    const output = drawFrame(f, fg.warning, label, sublabel, progress)
    // Move cursor up to overwrite
    const lines = output.split('\n').length
    process.stderr.write('\x1b[' + lines + 'A')
    process.stderr.write(output + '\n')
    frame++
  }, FRAME_DELAY_MS)

  try {
    const result = await promise
    aborted = true
    clearInterval(ticker)
    // Clear beast box
    const f = BEAST_FRAMES[0]
    const maxLen = Math.max(...f.map(l => l.length), label.length + sublabel.length + 20)
    const lines = f.length + 4
    process.stderr.write('\x1b[' + lines + 'A')
    process.stderr.write(' '.repeat(maxLen + 4) + '\n'.repeat(lines + 1))
    process.stderr.write('\x1b[' + lines + 'A')
    process.stderr.write(s(` ✓ ${label}`, fg.success) + '\n')
    return result
  } catch (e) {
    aborted = true
    clearInterval(ticker)
    process.stderr.write(s(` ✗ ${label}`, fg.error) + '\n')
    throw e
  }
}

// Simple animated beast for quick inline use
export class BeastSpinner {
  private handle: ReturnType<typeof setInterval> | null = null
  private frame = 0
  private started = false

  start(label = 'Thinking with Beast'): void {
    if (this.started) this.stop()
    this.started = true
    this.frame = 0

    this.handle = setInterval(() => {
      if (!this.started) return
      const f = BEAST_FRAMES[this.frame % BEAST_FRAMES.length]
      // Draw top line of beast
      process.stderr.write('\x1b[2K\r') // Clear line
      process.stderr.write(s(f[0], fg.accent) + s(' ' + label + ' ' + PROGRESS_CHARS[this.frame % PROGRESS_CHARS.length], fg.secondary) + '\n')
      this.frame++
    }, FRAME_DELAY_MS)
  }

  stop(status: 'done' | 'error' = 'done'): void {
    if (!this.started) return
    if (this.handle) { clearInterval(this.handle); this.handle = null }
    process.stderr.write('\x1b[2K\r')
    if (status === 'done') {
      process.stderr.write(s('✓ ', fg.success) + s('Ready', fg.secondary) + '\n')
    } else {
      process.stderr.write(s('✗ ', fg.error) + s('Error', fg.secondary) + '\n')
    }
    this.started = false
  }
}

export const beastSpinner = new BeastSpinner()
