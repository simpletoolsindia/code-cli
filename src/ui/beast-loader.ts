// Beast CLI - Clean Spinner
// Single-line spinner for thinking / loading states

import { s, fg, bold } from './colors.ts'

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// ── Simple one-line spinner ─────────────────────────────────────────────────

class BeastSpinner {
  private handle: ReturnType<typeof setInterval> | null = null
  private frame = 0
  private started = false
  private label = ''

  start(label = 'Thinking'): void {
    if (this.started) this.stop()
    this.started = true
    this.frame = 0
    this.label = label
    this.writeFrame()
    this.handle = setInterval(() => this.writeFrame(), 100)
  }

  private writeFrame(): void {
    if (!this.started) return
    // Clear line + write spinner
    process.stderr.write('\r' + this.label + ' ' + FRAMES[this.frame] + '  ')
    this.frame = (this.frame + 1) % FRAMES.length
  }

  stop(status: 'done' | 'error' | 'skip' = 'done', customLabel?: string): void {
    if (!this.started) return
    if (this.handle) {
      clearInterval(this.handle)
      this.handle = null
    }
    this.started = false

    // Clear the spinner line
    process.stderr.write('\r' + ' '.repeat(50) + '\r')

    if (status === 'done') {
      process.stderr.write(s('✓ ', fg.success) + (customLabel || this.label) + '\n')
    } else if (status === 'error') {
      process.stderr.write(s('✗ ', fg.error) + (customLabel || 'Error') + '\n')
    }
  }
}

export const beastSpinner = new BeastSpinner()
export default beastSpinner