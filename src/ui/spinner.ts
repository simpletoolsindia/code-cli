// Beast CLI - Non-Destructive Spinner
// Writes to stderr so output can be captured/redirected

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export class Spinner {
  private frame = 0
  private handle: ReturnType<typeof setInterval> | null = null
  private label: string = ''
  private started = false

  start(label: string): void {
    if (this.started) this.stop()
    this.label = label
    this.frame = 0
    this.started = true

    // Write initial frame to stderr (non-destructive)
    process.stderr.write(`\r${label} ${FRAMES[this.frame]}  `)

    this.handle = setInterval(() => {
      this.frame = (this.frame + 1) % FRAMES.length
      process.stderr.write(`\r${this.label} ${FRAMES[this.frame]}  `)
    }, 80)
  }

  stop(status: 'done' | 'error' | 'skip' = 'done', label?: string): void {
    if (!this.started) return

    if (this.handle) {
      clearInterval(this.handle)
      this.handle = null
    }

    // Clear the spinner line
    process.stderr.write('\r' + ' '.repeat(50) + '\r')

    if (status === 'done') {
      process.stderr.write(`${label || this.label} ${getCheckmark()}\n`)
    } else if (status === 'error') {
      process.stderr.write(`${label || this.label} ${getCross()}\n`)
    }
    // 'skip' just clears without status

    this.started = false
    this.label = ''
  }

  update(label: string): void {
    this.label = label
    if (this.started) {
      process.stderr.write(`\r${label} ${FRAMES[this.frame]}  `)
    }
  }
}

// Unicode symbols that work in most terminals
function getCheckmark(): string {
  return '\x1b[32m✓\x1b[0m'
}

function getCross(): string {
  return '\x1b[31m✗\x1b[0m'
}

// ── Global spinner instance ───────────────────────────────────────────────────

export const spinner = new Spinner()

// Quick helpers
export function startSpinner(label: string): void {
  spinner.start(label)
}

export function stopSpinner(done = true, label = ''): void {
  spinner.stop(done ? 'done' : 'skip', label)
}

// ── Thinking indicator (for AI responses) ───────────────────────────────────

export function thinking(label = 'Thinking'): void {
  spinner.start(label)
}

export function doneThinking(label = 'Done'): void {
  spinner.stop('done', label)
}
