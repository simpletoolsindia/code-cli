// Beast CLI - Fun ASCII Animations
// Animated characters for loading states and interactive fun

import { s, fg, bold, isColorEnabled } from './colors.ts'

// ── Animation Types ─────────────────────────────────────────────────────────

export type AnimationState = 'thinking' | 'searching' | 'coding' | 'analyzing' | 'tool' | 'formatting'

// ── ASCII Character Animations ─────────────────────────────────────────────

// Each animation has multiple frames that cycle
const ANIMATIONS = {
  // 🐕 Dog - happy wagging tail
  dog: {
    frames: [
      '(◕‿◕)🐕',
      '(◕‿◕)🐕',
      '(◕ω◕)🐕',
      '(◕‿◕)🐕',
      '(◕ω◕)🐕',
      '(◕‿◕)🐕',
    ],
    speed: 150,
  },

  // 🐱 Cat - stretching and pawing
  cat: {
    frames: [
      '(=^・^=)',
      '(=^・ω・^=)',
      '(=^・^=)',
      '(=^・ω・^=)',
      '(=⌒‿⌒=)',
      '(=^・^=)',
    ],
    speed: 200,
  },

  // 🐟 Fish - swimming
  fish: {
    frames: [
      '><(((º>',
      ' ><(((º>',
      '  ><(((º>',
      '   ><(((º>',
      '  ><(((º>',
      ' ><(((º>',
    ],
    speed: 120,
  },

  // 🦆 Duck - floating
  duck: {
    frames: [
      '<(º)>',
      '<(º)>',
      '<(º)>',
      '<( · )>',
      '<(º)>',
    ],
    speed: 180,
  },

  // 👽 Alien - pulsing
  alien: {
    frames: [
      '(◕‿◕)',
      '(◠‿◠)',
      '(◕‿◕)',
      '(◡‿◡)',
      '(◕‿◕)',
    ],
    speed: 250,
  },

  // 🦊 Fox - curious
  fox: {
    frames: [
      '(¨)',
      '(◕‿◕)',
      '(¨)',
      '(◠‿◠)',
      '(¨)',
    ],
    speed: 200,
  },

  // 🐰 Rabbit - hopping
  rabbit: {
    frames: [
      '(=・)',
      '(\\/)',
      '(=・)',
      '(/^)',
      '(=・)',
    ],
    speed: 150,
  },

  // 🦋 Butterfly - flying
  butterfly: {
    frames: [
      '( ..)',
      '(> <)',
      '(\\/\\)',
      '(> <)',
      '( ..)',
    ],
    speed: 180,
  },

  // ⭐ Stars - twinkling
  star: {
    frames: [
      '✧',
      '✦',
      '✧',
      '★',
      '✧',
    ],
    speed: 150,
  },

  // 🔥 Fire - crackling
  fire: {
    frames: [
      '🔥',
      '🔥',
      '🔥',
      '🔥',
      '🔥',
    ],
    speed: 200,
  },

  // 🐸 Frog - jumping
  frog: {
    frames: [
      '( @)',
      '(\\)',
      '( @)',
      '(/)',
      '( @)',
    ],
    speed: 150,
  },

  // 🐢 Turtle - walking
  turtle: {
    frames: [
      '🐢',
      '🐢',
      '🐢',
      '🐢',
      '🐢',
    ],
    speed: 300,
  },

  // 🐙 Octopus - waving
  octopus: {
    frames: [
      '( --- )',
      '( === )',
      '( --- )',
      '( ~~~ )',
      '( --- )',
    ],
    speed: 200,
  },

  // 🦄 Unicorn - magical
  unicorn: {
    frames: [
      '🦄✨',
      '✨🦄',
      '🦄✨',
      '✨🦄',
      '🦄✨',
    ],
    speed: 180,
  },

  // 🐝 Bee - buzzing
  bee: {
    frames: [
      '(^)',
      '(•)',
      '(^)',
      '(•)',
      '(^)',
    ],
    speed: 100,
  },
}

// Character names for random selection
const THINKING_CHARS = ['dog', 'cat', 'fox', 'rabbit', 'frog']
const SEARCH_CHARS = ['fish', 'duck', 'bee', 'turtle']
const CODING_CHARS = ['rabbit', 'butterfly', 'bee', 'frog']
const ANALYZING_CHARS = ['alien', 'star', 'fire', 'unicorn']
const TOOL_CHARS = ['cat', 'dog', 'fox', 'rabbit', 'bee']
const FORMATTING_CHARS = ['star', 'butterfly', 'fire', 'unicorn']

// ── Fun Spinner Class ───────────────────────────────────────────────────────

export class FunSpinner {
  private handle: ReturnType<typeof setInterval> | null = null
  private frame = 0
  private started = false
  private label = ''
  private animation: string[] = []
  private speed = 150
  private state: AnimationState = 'thinking'
  private color = ''

  /**
   * Start the spinner with an animated character
   */
  start(state: AnimationState = 'thinking', char?: string): void {
    if (this.handle) this.stop()

    this.state = state
    this.frame = 0

    // Select character
    const selectedChar = char || this.getRandomChar(state)
    const anim = ANIMATIONS[selectedChar as keyof typeof ANIMATIONS]

    if (!anim) {
      // Fallback to default
      this.animation = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
      this.speed = 80
    } else {
      this.animation = anim.frames
      this.speed = anim.speed
    }

    // Set color based on state
    this.color = this.getColor(state)

    // Set label
    this.label = this.getLabel(state)

    this.started = true
    this.writeFrame()
    this.handle = setInterval(() => this.writeFrame(), this.speed)
  }

  /**
   * Update the spinner with a new state
   */
  update(state: AnimationState): void {
    if (!this.started) {
      this.start(state)
      return
    }

    this.frame = 0
    this.state = state
    this.color = this.getColor(state)
    this.label = this.getLabel(state)

    // Get new animation
    const selectedChar = this.getRandomChar(state)
    const anim = ANIMATIONS[selectedChar as keyof typeof ANIMATIONS]
    if (anim) {
      this.animation = anim.frames
      this.speed = anim.speed
    }

    // Restart with new speed
    if (this.handle) clearInterval(this.handle)
    this.writeFrame()
    this.handle = setInterval(() => this.writeFrame(), this.speed)
  }

  /**
   * Stop the spinner
   */
  stop(status: 'done' | 'error' | 'skip' = 'done', customLabel?: string): void {
    if (!this.started) return

    if (this.handle) {
      clearInterval(this.handle)
      this.handle = null
    }
    this.started = false

    // Clear the line
    process.stderr.write('\r' + ' '.repeat(60) + '\r')

    // Write status
    if (!isColorEnabled()) {
      if (status === 'done') console.log(customLabel || this.label + ' ✓')
      else if (status === 'error') console.log(customLabel || 'Error ✗')
      return
    }

    if (status === 'done') {
      process.stderr.write(s('✓ ', fg.success) + (customLabel || this.label) + '\n')
    } else if (status === 'error') {
      process.stderr.write(s('✗ ', fg.error) + (customLabel || 'Error') + '\n')
    }
  }

  private writeFrame(): void {
    if (!this.started || !isColorEnabled()) return

    this.frame = (this.frame + 1) % this.animation.length
    const char = this.animation[this.frame]

    // Format: [label] [character] [spinning dots]
    const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴'][this.frame % 6]
    process.stderr.write(`\r${s(this.label, this.color)} ${char} ${dots}  `)
  }

  private getRandomChar(state: AnimationState): string {
    const chars = this.getCharsForState(state)
    return chars[Math.floor(Math.random() * chars.length)]
  }

  private getCharsForState(state: AnimationState): string[] {
    switch (state) {
      case 'thinking': return THINKING_CHARS
      case 'searching': return SEARCH_CHARS
      case 'coding': return CODING_CHARS
      case 'analyzing': return ANALYZING_CHARS
      case 'tool': return TOOL_CHARS
      case 'formatting': return FORMATTING_CHARS
      default: return THINKING_CHARS
    }
  }

  private getColor(state: AnimationState): string {
    switch (state) {
      case 'thinking': return fg.accent
      case 'searching': return fg.info
      case 'coding': return fg.warning
      case 'analyzing': return fg.mauve
      case 'tool': return fg.tool
      case 'formatting': return fg.success
      default: return fg.accent
    }
  }

  private getLabel(state: AnimationState): string {
    switch (state) {
      case 'thinking': return 'Thinking'
      case 'searching': return 'Searching'
      case 'coding': return 'Coding'
      case 'analyzing': return 'Analyzing'
      case 'tool': return 'Running tool'
      case 'formatting': return 'Formatting'
      default: return 'Loading'
    }
  }
}

// Singleton instance
export const funSpinner = new FunSpinner()

// ── Random Fun Fact Generator ───────────────────────────────────────────────

const FUN_FACTS = [
  "You can type `/clear` to reset the conversation",
  "Use Tab for auto-complete!",
  "↑/↓ navigates your history",
  "ChatGPT Plus works FREE via OAuth!",
  "Ollama runs AI locally — no internet needed",
  "Type `/model gpt-4o` to switch instantly",
  "Context auto-compacts at 95%",
  "Try `/provider ollama` for local models",
  "Use `--theme claude` for warm styling",
  "beast --defaults auto-selects best option",
  "51+ tools available — try `/tools`!",
  "Run `run_python` for inline Python execution",
  "Use `searxng_search` for web research",
  "GitHub repos searchable with `/tools`",
  "Type `/help` anytime for commands",
]

export function randomFunFact(): string {
  const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]
  return `${s('💡 Fun tip:', fg.warning)} ${s(fact, fg.secondary)}`
}

// ── Animated Progress Messages ──────────────────────────────────────────────

export function thinkingMessage(): string {
  const messages = [
    'Consulting the oracle...',
    'Consulting the neural network...',
    'Invoking the AI...',
    'Querying the model...',
    'Processing your request...',
    'Computing response...',
    'Decoding your message...',
    'Processing...',
  ]
  const msg = messages[Math.floor(Math.random() * messages.length)]
  return s(msg, fg.secondary)
}

export function toolRunningMessage(toolName: string): string {
  const msgs = [
    `Executing ${toolName}...`,
    `Running ${toolName}...`,
    `Calling ${toolName}...`,
    `${toolName} in progress...`,
  ]
  return msgs[Math.floor(Math.random() * msgs.length)]
}

// ── ASCII Art Helper ────────────────────────────────────────────────────────

export function asciiBeast(): string {
  return `
${s('    ╔═══════════════════════════════════╗', fg.accent)}
${s('    ║  🐉 BEAST CLI v1.2.8                ║', fg.accent)}
${s('    ║  AI Coding Agent                   ║', fg.secondary)}
${s('    ╚═══════════════════════════════════╝', fg.accent)}
`
}

export function successAscii(): string {
  return s('✓', fg.success)
}

export function errorAscii(): string {
  return s('✗', fg.error)
}

// ── Colorful Status Messages ────────────────────────────────────────────────

export function statusMessage(msg: string, type: 'info' | 'success' | 'warning' | 'error'): string {
  const color = type === 'info' ? fg.info : type === 'success' ? fg.success : type === 'warning' ? fg.warning : fg.error
  const icon = type === 'info' ? 'ℹ' : type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✗'
  return `${s(icon, color)} ${s(msg, color)}`
}

// ── Debug/Verbose Helpers ────────────────────────────────────────────────────

export function debug(msg: string): string {
  return s(`[DEBUG] ${msg}`, fg.muted)
}

export function info(msg: string): string {
  return s(`[INFO] ${msg}`, fg.info)
}

export function warn(msg: string): string {
  return s(`[WARN] ${msg}`, fg.warning)
}

export function error(msg: string): string {
  return s(`[ERROR] ${msg}`, fg.error)
}