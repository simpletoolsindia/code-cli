// Beast CLI - Clean UI Animations
// Minimal, professional spinner and status animations (no emoji)

import { s, fg, bold, isColorEnabled, spinnerFrames } from './colors.ts'

// ── State Types ───────────────────────────────────────────────────────────────
export type AnimationState =
  | 'thinking' | 'searching' | 'coding' | 'analyzing' | 'tool' | 'formatting'
  | 'tool:read_file' | 'tool:write_file' | 'tool:copy_file'
  | 'tool:web_fetch' | 'tool:code_run' | 'tool:mcp_call'
  | 'llm_processing' | 'tool:generic'

// Polished: state config with smooth transitions
const STATE_CONFIG: Record<string, { label: string; color: string; frames: string[] }> = {
  thinking:  { label: 'Thinking',   color: fg.accent,    frames: spinnerFrames.dots },
  searching: { label: 'Searching', color: fg.sapphire,  frames: spinnerFrames.arrow },
  coding:    { label: 'Coding',    color: fg.warning,   frames: spinnerFrames.blocks },
  analyzing: { label: 'Analyzing', color: fg.mauve,     frames: spinnerFrames.dots },
  tool:      { label: 'Running',   color: fg.tool,      frames: spinnerFrames.dots },
  formatting:{ label: 'Formatting', color: fg.success,   frames: spinnerFrames.star },
  // Tool-specific
  'tool:read_file':  { label: 'Reading file',  color: fg.sapphire,  frames: spinnerFrames.dots },
  'tool:write_file': { label: 'Writing file',  color: fg.warning,   frames: spinnerFrames.blocks },
  'tool:copy_file':  { label: 'Copying file', color: fg.mauve,     frames: spinnerFrames.dots },
  'tool:web_fetch':  { label: 'Fetching web',  color: fg.blue,      frames: spinnerFrames.arrow },
  'tool:code_run':   { label: 'Running code',  color: fg.success,   frames: spinnerFrames.star },
  'tool:mcp_call':   { label: 'MCP call',     color: fg.lavender, frames: spinnerFrames.dots },
  'llm_processing':  { label: 'LLM processing', color: fg.accent,  frames: spinnerFrames.dots },
  'tool:generic':   { label: 'Running tool', color: fg.tool,      frames: spinnerFrames.dots },
}

// ── Clean Spinner Class ───────────────────────────────────────────────────────
// Polished FunSpinner: smooth transitions between states
export class FunSpinner {
  private handle: ReturnType<typeof setInterval> | null = null
  private frame = 0
  private started = false
  private label = ''
  private animation: string[] = []
  private speed = 80
  private color = ''

  start(state: AnimationState = 'thinking', customChar?: string): void {
    if (this.handle) this.stop()

    const config = STATE_CONFIG[state]
    this.label = config.label
    this.animation = config.frames
    this.speed = 80
    this.color = config.color
    this.frame = 0
    this.started = true
    this.writeFrame()

    this.handle = setInterval(() => this.writeFrame(), this.speed)
  }

  update(state: AnimationState): void {
    if (!this.started) {
      this.start(state)
      return
    }

    this.frame = 0
    this.label = STATE_CONFIG[state].label
    this.color = STATE_CONFIG[state].color
    this.animation = STATE_CONFIG[state].frames
    this.speed = 80

    if (this.handle) clearInterval(this.handle)
    this.writeFrame()
    this.handle = setInterval(() => this.writeFrame(), this.speed)
  }

  stop(status: 'done' | 'error' | 'skip' = 'done', customLabel?: string): void {
    if (!this.started) return

    if (this.handle) {
      clearInterval(this.handle)
      this.handle = null
    }
    this.started = false

    // Polished: clear line with proper spacing
    process.stderr.write('\r' + ' '.repeat(60) + '\r')

    if (!isColorEnabled()) {
      if (status === 'done') console.log(customLabel || this.label + ' done')
      else if (status === 'error') console.log(customLabel || 'Error')
      return
    }

    // Polished: clear status indicators with smooth transitions
    if (status === 'done') {
      process.stderr.write(s('✓ ', fg.success) + (customLabel || this.label) + '\n')
    } else if (status === 'error') {
      process.stderr.write(s('✗ ', fg.error) + (customLabel || 'Error') + '\n')
    }
  }

  private writeFrame(): void {
    if (!this.started || !isColorEnabled()) return
    this.frame = (this.frame + 1) % this.animation.length
    const frame = this.animation[this.frame]
    process.stderr.write(`\r${s(this.label, this.color)} ${frame}  `)
  }
}

export const funSpinner = new FunSpinner()

// ── Thinking Messages ─────────────────────────────────────────────────────────
const THINKING_MSGS = [
  'Thinking...', 'Processing...', 'Computing...', 'Analyzing...',
  'Working on it...', 'Hold on...', 'Calculating...',
]

export function thinkingMessage(): string {
  const msg = THINKING_MSGS[Math.floor(Math.random() * THINKING_MSGS.length)]
  return s(msg, fg.secondary)
}

// ── Status Messages ───────────────────────────────────────────────────────────
export function toolRunningMessage(toolName: string): string {
  return s(`${toolName}...`, fg.tool)
}

// Polished status messages with clear visual hierarchy
export function statusMessage(msg: string, type: 'info' | 'success' | 'warning' | 'error'): string {
  const color = type === 'info' ? fg.sapphire : type === 'success' ? fg.success : type === 'warning' ? fg.warning : fg.error
  const icon = type === 'info' ? 'ℹ' : type === 'success' ? '✓' : type === 'warning' ? '!' : '✗'
  return `${s(icon, color)} ${s(msg, color)}`
}

// ── ASCII Art ─────────────────────────────────────────────────────────────────
// Polished ASCII art with Google brand colors
export function asciiBeast(): string {
  if (!isColorEnabled()) return 'BEAST CLI'
  const gpPurple = '\x1b[38;2;142;54;255m'
  const gpBlue = '\x1b[38;2;70;130;255m'
  return `
${s('  ╔════════════════════════════════╗', gpPurple)}
${s('  ║  BEAST CLI v1.2.14              ║', gpPurple)}
${s('  ║  AI Coding Agent                ║', fg.secondary)}
${s('  ╚════════════════════════════════╝', gpPurple)}
`
}

// Polished success/error indicators with clear status
export function successAscii(): string {
  return s('✓', fg.success)
}

export function errorAscii(): string {
  return s('✗', fg.error)
}

// Polished debug/info/warn/error with consistent formatting
export function debug(msg: string): string {
  return s(`[debug] ${msg}`, fg.muted)
}

export function info(msg: string): string {
  return s(`[info] ${msg}`, fg.sapphire)
}

export function warn(msg: string): string {
  return s(`[warn] ${msg}`, fg.warning)
}

export function error(msg: string): string {
  return s(`[error] ${msg}`, fg.error)
}

// Polished fun facts with consistent format
const FUN_FACTS = [
  'Type /clear to reset the conversation',
  'Use Tab for auto-complete',
  'Up/Down arrows navigate your history',
  'ChatGPT Plus works free via OAuth',
  'Ollama runs AI locally — no internet needed',
  'Type /model gpt-4o to switch instantly',
  'Context auto-compacts at 95%',
  'Try /provider ollama for local models',
  'Use --theme claude for warm styling',
  'beast --defaults auto-selects the best option',
  '51+ tools available — try /tools',
  'Type /help anytime for command reference',
]

export function randomFunFact(): string {
  const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]
  return `${s('💡', fg.warning)} ${s(fact, fg.secondary)}`
}
