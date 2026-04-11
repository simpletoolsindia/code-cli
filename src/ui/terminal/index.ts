// Beast CLI - Cross-Platform Terminal TUI
// Uses terminal-kit for Windows/Linux/macOS compatibility
// Falls back gracefully when terminal doesn't support full features

import termkit from 'terminal-kit'
import { createProvider } from '../../providers/index.ts'
import { executeTool, getFormattedTools } from '../../native-tools/index.ts'
import { loadMemory, parseAgentContext } from '../../agents/index.ts'
import { getApiKeyFromEnv, getBaseUrl } from '../../providers/discover.ts'
import { getTheme } from '../colors.ts'
import { generateDiff, formatDiffStats } from '../../diff/index.ts'
import { quickApproval, getOldContent } from '../../approval/index.ts'
import { s, fg, dim, bold, reset } from '../colors.ts'

const { terminal: term, window } = termkit

// Types
type Phase = 'idle' | 'thinking' | 'streaming' | 'done' | 'error'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
}

interface ToolState {
  name: string
  args: string
  status: 'running' | 'done' | 'error'
  result?: string
}

interface TerminalState {
  messages: Message[]
  phase: Phase
  streamedText: string
  tools: ToolState[]
  error?: string
  usage?: { totalTokens: number }
}

// Theme colors mapping to terminal-kit colors
function getThemeColors() {
  const theme = getTheme()
  return {
    primary: theme.primary || 39,      // cyan-ish
    secondary: theme.secondary || 226, // yellow-ish
    accent: theme.accent || 213,       // magenta-ish
    success: theme.success || 46,      // green
    error: theme.error || 196,         // red
    warning: theme.warning || 208,     // orange
    muted: theme.muted || 245,         // gray
    bg: theme.bg || 0,
  }
}

// Draw the header
function drawHeader(provider: string, model: string, toolsCount: number) {
  const colors = getThemeColors()
  const theme = getTheme()

  term.moveTo(1, 1)
  term.eraseLine()
  term.bold.cyan('  🐉 Beast CLI')
  term('  ')
  term.white(`[${provider}/${model}]`)
  term('  ')
  term.blue(`${toolsCount} tools`)
  term('\n')
  term.eraseLine()
  // Fallback for width in case terminal doesn't report it
  const termWidth = term.width || 80
  const lineWidth = Math.max(0, termWidth - 2)
  term.dim.gray('─'.repeat(lineWidth))
  term('\n')
}

// Draw a message
function drawMessage(msg: Message, index: number, colors: ReturnType<typeof getThemeColors>) {
  const y = 4 + index * 2

  if (msg.role === 'user') {
    term.moveTo(1, y)
    term.bold.yellow('> ')
    term.white(msg.content.slice(0, term.width - 3))
    term('\n')
  } else if (msg.role === 'assistant') {
    term.moveTo(1, y)
    term.bold.cyan('< ')
    term.white(msg.content.slice(0, term.width - 3))
    term('\n')
  } else if (msg.role === 'tool') {
    term.moveTo(1, y)
    term.dim.magenta('[tool] ')
    term.dim.white(msg.content.slice(0, term.width - 7))
    term('\n')
  }
}

// Draw tools panel
function drawTools(tools: ToolState[], startY: number, colors: ReturnType<typeof getThemeColors>) {
  if (tools.length === 0) return

  let y = startY
  for (const tool of tools) {
    term.moveTo(1, y)
    term.eraseLine()

    if (tool.status === 'running') {
      term.bgBlue('▸ ')
      term.blue(`${tool.name}...`)
    } else if (tool.status === 'done') {
      term.bgGreen('✓ ')
      term.green(`${tool.name}`)
    } else {
      term.bgRed('✗ ')
      term.red(`${tool.name}: ${tool.result || 'error'}`)
    }
    y++
  }
}

// Draw status bar
function drawStatusBar(phase: Phase, usage?: { totalTokens: number }, colors?: ReturnType<typeof getThemeColors>) {
  const statusColors = colors || getThemeColors()
  term.moveTo(1, term.height)
  term.eraseLine()
  term.bgBlack()

  if (phase === 'thinking') {
    term(statusColors.muted, 'thinking...')
  } else if (phase === 'streaming') {
    term(statusColors.primary, 'formatting...')
  } else if (phase === 'done') {
    term(statusColors.success, '✓ ready')
  } else if (phase === 'error') {
    term(statusColors.error, '✗ error')
  } else {
    term(statusColors.muted, 'idle')
  }

  if (usage?.totalTokens) {
    term.moveTo(term.width - 20, term.height)
    term(statusColors.muted, `${usage.totalTokens.toLocaleString()} tokens`)
  }
}

// Draw error message
function drawError(error: string, colors: ReturnType<typeof getThemeColors>) {
  term.moveTo(1, term.height - 2)
  term.eraseLine()
  term.bgRed(' ERROR ')
  term(' ')
  term.red(error.slice(0, term.width - 10))
  term('\n')
}

// Main TUI render function
function render(state: TerminalState, provider: string, model: string, toolsCount: number) {
  const colors = getThemeColors()

  term.clear()
  drawHeader(provider, model, toolsCount)

  // Draw messages
  let y = 4
  for (const msg of state.messages.slice(-20)) { // Last 20 messages
    drawMessage(msg, state.messages.indexOf(msg), colors)
    y++
  }

  // Draw tools if any running
  if (state.tools.length > 0) {
    term('\n')
    drawTools(state.tools.filter(t => t.status !== 'done').slice(-5), y, colors)
    y += state.tools.filter(t => t.status !== 'done').length
  }

  // Draw streamed text preview if in streaming
  if (state.phase === 'streaming' && state.streamedText) {
    term('\n')
    term.moveTo(1, y)
    term.eraseLine()
    term.cyan(state.streamedText.slice(-(term.width - 3)))
  }

  // Draw error if any
  if (state.error) {
    drawError(state.error, colors)
  }

  // Draw status bar
  drawStatusBar(state.phase, state.usage, colors)

  // Draw input prompt
  if (state.phase === 'idle') {
    term.moveTo(1, term.height - 1)
    term.eraseLine()
    term.bold.green('❯ ')
    term.white('Type your message... (Ctrl+C to exit)')
  }
}

// Input handling with auto-complete
function createInputHandler(
  onSubmit: (input: string) => void,
  state: { phase: () => Phase }
) {
  let currentInput = ''
  let history: string[] = []
  let historyIndex = -1

  term.on('key', (key: string) => {
    if (state.phase() !== 'idle') return

    if (key === 'ENTER') {
      if (currentInput.trim()) {
        history.unshift(currentInput)
        historyIndex = -1
        onSubmit(currentInput)
        currentInput = ''
      }
    } else if (key === 'BACKSPACE') {
      currentInput = currentInput.slice(0, -1)
      drawInput(currentInput)
    } else if (key === 'ArrowUp') {
      if (historyIndex < history.length - 1) {
        historyIndex++
        currentInput = history[historyIndex]
        drawInput(currentInput)
      }
    } else if (key === 'ArrowDown') {
      if (historyIndex > 0) {
        historyIndex--
        currentInput = history[historyIndex]
        drawInput(currentInput)
      } else if (historyIndex === 0) {
        historyIndex = -1
        currentInput = ''
        drawInput(currentInput)
      }
    } else if (key === 'CTRL_C') {
      term.clear()
      term.green('\n  Goodbye! 🐉\n\n')
      process.exit(0)
    }
  })

  term.on('data', (data: Buffer) => {
    if (state.phase() !== 'idle') return
    const char = data.toString()
    if (char.length === 1 && char >= ' ' && char <= '~') {
      currentInput += char
      drawInput(currentInput)
    }
  })

  function drawInput(input: string) {
    term.moveTo(1, term.height - 1)
    term.eraseLine()
    term.bold.green('❯ ')
    term.white(input)
    term.bold.green('█') // cursor blink effect
  }
}

// Create spinner animation
function createSpinner(text: string) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let frame = 0
  let interval: NodeJS.Timeout | null = null

  return {
    start: () => {
      interval = setInterval(() => {
        term.moveTo(1, term.height - 1)
        term.eraseLine()
        term(frames[frame % frames.length])
        term(' ')
        term.cyan(text)
        frame++
      }, 80)
    },
    stop: () => {
      if (interval) clearInterval(interval)
    }
  }
}

// Main TUI application
export async function runTerminalUI(options: {
  provider: string
  model: string
  apiKey?: string
  baseUrl?: string
}) {
  // Check terminal capabilities
  if (!term.isTTY) {
    console.error('Terminal TUI requires a TTY. Use beast --defaults instead.')
    process.exit(1)
  }

  const state: TerminalState = {
    messages: [],
    phase: 'idle',
    streamedText: '',
    tools: [],
  }

  const provider = options.provider
  const model = options.model
  const toolsCount = getFormattedTools().length

  // Initial render
  render(state, provider, model, toolsCount)

  // Setup input handler
  createInputHandler(handleSubmit, () => state.phase)

  // Handle window resize
  term.on('resize', () => {
    render(state, provider, model, toolsCount)
  })

  async function handleSubmit(input: string) {
    if (state.phase !== 'idle') return

    // Add user message
    state.messages.push({ role: 'user', content: input })
    state.phase = 'thinking'
    render(state, provider, model, toolsCount)

    const spinner = createSpinner('thinking...')
    spinner.start()

    try {
      const result = await runAgent(input)
      spinner.stop()

      state.messages.push({ role: 'assistant', content: result.content })
      state.phase = 'done'
      state.usage = result.usage
    } catch (err: any) {
      spinner.stop()
      state.error = err.message || String(err)
      state.phase = 'error'
    }

    render(state, provider, model, toolsCount)
  }

  async function runAgent(prompt: string): Promise<{ content: string; usage?: { totalTokens: number } }> {
    const nativeTools = getFormattedTools()
    const agentCtx = parseAgentContext(prompt)
    const memory = loadMemory()

    // Build system message
    const systemParts: string[] = []
    if (nativeTools.length > 0) {
      systemParts.push(`You have access to ${nativeTools.length} native tools: ${nativeTools.map(t => `${t.name}: ${t.description || ''}`).join(', ')}`)
    }
    if (agentCtx.agentInstructions.length > 0) {
      systemParts.push(...agentCtx.agentInstructions)
    }
    if (memory.context || memory.facts.length > 0) {
      const parts: string[] = []
      if (memory.context) parts.push(`Project Context: ${memory.context}`)
      if (memory.facts.length > 0) parts.push(`Facts: ${memory.facts.join(', ')}`)
      systemParts.push('[MEMORY]\n' + parts.join('\n'))
    }

    const agentMessages: { role: string; content: string }[] = systemParts.length > 0
      ? [{ role: 'system', content: systemParts.join('\n\n') }]
      : []

    agentMessages.push({ role: 'user', content: agentCtx.cleanedPrompt || prompt })

    const p = await createProvider({
      provider: options.provider as any,
      model: options.model,
      apiKey: options.apiKey || getApiKeyFromEnv(options.provider),
      baseUrl: options.baseUrl || getBaseUrl(options.provider) || undefined,
    })

    let toolCallCount = 0
    const MAX_TOOL_CALLS = 20

    while (toolCallCount < MAX_TOOL_CALLS) {
      state.phase = 'thinking'
      render(state, provider, model, toolsCount)

      const spinner = createSpinner('thinking...')
      spinner.start()

      const llmResponse = await p.create({
        messages: agentMessages as any,
        tools: nativeTools.length > 0 ? nativeTools : undefined,
        maxTokens: 16384,
      })

      spinner.stop()

      const content = llmResponse.content || ''

      if (!llmResponse.toolCalls || llmResponse.toolCalls.length === 0) {
        // No tools — done
        return { content, usage: llmResponse.usage as any }
      }

      // Process tool calls
      for (const tc of llmResponse.toolCalls) {
        toolCallCount++
        state.tools.push({
          name: tc.name,
          args: JSON.stringify(tc.arguments || {}),
          status: 'running',
        })
        render(state, provider, model, toolsCount)

        try {
          // ── Diff + Approval for file_write ────────────────────────────────
          if (tc.name === 'file_write') {
            const filePath = tc.arguments?.path as string
            const newContent = tc.arguments?.content as string
            const oldContent = getOldContent(filePath)

            if (oldContent && oldContent !== newContent) {
              const diff = generateDiff(oldContent, newContent, filePath)
              if (diff.additions > 0 || diff.removals > 0) {
                // Show diff inline in terminal
                term('\n')
                const stats = formatDiffStats(diff.additions, diff.removals)
                term.cyan('📄 ' + filePath + ' (' + stats + ')\n')
                const diffLines = diff.diff.split('\n').slice(2)
                const MAX_DIFF = 15
                for (const line of diffLines.slice(0, MAX_DIFF)) {
                  if (line.startsWith('@@')) {
                    term.cyan(line + '\n')
                  } else if (line.startsWith('+')) {
                    term.green(line + '\n')
                  } else if (line.startsWith('-')) {
                    term.red(line + '\n')
                  } else if (line.startsWith(' ')) {
                    term.dim(line + '\n')
                  }
                }
                if (diffLines.length > MAX_DIFF) {
                  term.dim('  ... (' + (diffLines.length - MAX_DIFF) + ' more lines)\n')
                }

                term('\n  [y] Approve  [n] Reject  > ')
                // Simple blocking prompt for terminal mode
                const answer = await new Promise<string>(resolve => {
                  term.readInput({ echo: true }, (_err: any, val: string) => {
                    resolve(val)
                  })
                })
                term.eraseLine()

                if (answer.trim().toLowerCase() !== 'y' && answer.trim() !== '') {
                  state.tools[state.tools.length - 1].status = 'error'
                  state.tools[state.tools.length - 1].result = 'Rejected by user'
                  agentMessages.push({ role: 'assistant', content })
                  agentMessages.push({ role: 'tool', content: 'Tool call rejected by user.' })
                  render(state, provider, model, toolsCount)
                  continue
                }
              }
            }
          }

          const result = await executeTool(tc.name, tc.arguments || {})

          // Update tool state
          const toolIndex = state.tools.length - 1
          state.tools[toolIndex].status = 'done'
          state.tools[toolIndex].result = result.content

          // Add tool result to messages
          agentMessages.push({ role: 'assistant', content })
          agentMessages.push({ role: 'tool', content: result.content })

          render(state, provider, model, toolsCount)
        } catch (err: any) {
          const toolIndex = state.tools.length - 1
          state.tools[toolIndex].status = 'error'
          state.tools[toolIndex].result = err.message

          agentMessages.push({ role: 'assistant', content })
          agentMessages.push({ role: 'tool', content: `Error: ${err.message}` })

          render(state, provider, model, toolsCount)
        }
      }
    }

    return { content: 'Max tool calls reached', usage: llmResponse.usage as any }
  }
}

// Entry point check
if (require.main === module || import.meta.url === `file://${process.argv[1]}`) {
  runTerminalUI({
    provider: process.env.BEAST_PROVIDER || 'ollama',
    model: process.env.BEAST_MODEL || 'llama3.2',
    apiKey: process.env.ANTHROPIC_API_KEY,
  }).catch((err) => {
    term.clear()
    console.error('Fatal error:', err)
    process.exit(1)
  })
}
