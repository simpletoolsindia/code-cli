// Custom Commands System - User-defined command shortcuts
// Inspired by opencode's custom commands (Ctrl+K)

// In Node.js environment
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'

export interface CommandArgument {
  name: string
  description?: string
  required?: boolean
  default?: string
}

export interface Command {
  /** Unique command ID (e.g., "user:git:commit" or "project:analyze") */
  id: string
  /** Display name */
  name: string
  /** Description shown in command picker */
  description: string
  /** Command content (markdown with RUN/READ/GREP etc.) */
  content: string
  /** Arguments supported by this command */
  arguments?: CommandArgument[]
  /** Source: user or project */
  source: 'user' | 'project'
  /** File path if loaded from disk */
  filePath?: string
}

export interface CommandResult {
  command: Command
  /** Parsed actions to execute */
  actions: CommandAction[]
  /** Argument values provided */
  args: Record<string, string>
}

export type CommandAction =
  | { type: 'run'; command: string; description?: string }
  | { type: 'read'; file: string; description?: string }
  | { type: 'grep'; pattern: string; path?: string; description?: string }
  | { type: 'glob'; pattern: string; description?: string }
  | { type: 'send'; message: string }

// Argument placeholder pattern: $NAME where NAME is uppercase alphanumeric
const ARG_PLACEHOLDER = /\$([A-Z][A-Z0-9_]*)/g

// Command parsing patterns
const PATTERNS = {
  RUN: /^RUN\s+(.+)$/i,
  READ: /^READ\s+(.+)$/i,
  GREP: /^GREP\s+(.+)$/i,
  GLOB: /^GLOB\s+(.+)$/i,
  SEND: /^(?!RUN|READ|GREP|GLOB|SEND).+$/,
}

/**
 * Parse command content into actions
 */
export function parseCommandContent(
  content: string,
  args: Record<string, string> = {}
): CommandAction[] {
  const actions: CommandAction[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue

    // Apply argument substitution
    const expanded = expandArguments(trimmed, args)

    // Parse action type
    let runMatch = PATTERNS.RUN.exec(expanded)
    if (runMatch) {
      actions.push({ type: 'run', command: runMatch[1] })
      continue
    }

    let readMatch = PATTERNS.READ.exec(expanded)
    if (readMatch) {
      actions.push({ type: 'read', file: readMatch[1] })
      continue
    }

    let grepMatch = PATTERNS.GREP.exec(expanded)
    if (grepMatch) {
      const parts = grepMatch[1].split(/\s+/)
      const pattern = parts[0]
      const path = parts.slice(1).join(' ')
      actions.push({ type: 'grep', pattern, path: path || undefined })
      continue
    }

    let globMatch = PATTERNS.GLOB.exec(expanded)
    if (globMatch) {
      actions.push({ type: 'glob', pattern: globMatch[1] })
      continue
    }

    // Default: send as message
    if (expanded) {
      actions.push({ type: 'send', message: expanded })
    }
  }

  return actions
}

/**
 * Extract argument names from command content
 */
export function extractArguments(content: string): CommandArgument[] {
  const args: CommandArgument[] = []
  const seen = new Set<string>()

  let match
  while ((match = ARG_PLACEHOLDER.exec(content)) !== null) {
    const name = match[1]
    if (!seen.has(name)) {
      seen.add(name)
      args.push({
        name,
        required: true,
      })
    }
  }

  return args
}

/**
 * Expand argument placeholders in text
 */
export function expandArguments(
  text: string,
  args: Record<string, string>
): string {
  return text.replace(ARG_PLACEHOLDER, (match, name) => {
    return args[name] ?? match
  })
}

/**
 * Validate that all required arguments are provided
 */
export function validateArguments(
  args: Record<string, string>,
  required: CommandArgument[]
): { valid: boolean; missing?: string[] } {
  const missing: string[] = []

  for (const arg of required) {
    if (arg.required && !args[arg.name] && !arg.default) {
      missing.push(arg.name)
    }
  }

  return { valid: missing.length === 0, missing }
}

// ── Command Discovery ─────────────────────────────────────────────────────────

function getCommandsDir(source: 'user' | 'project', projectDir?: string): string | null {
  const home = process.env.HOME || process.env.USERPROFILE || '~'
  const xdgConfig = process.env.XDG_CONFIG_HOME

  if (source === 'user') {
    const userDir = xdgConfig
      ? resolve(xdgConfig, 'beast-cli', 'commands')
      : resolve(home, '.config', 'beast-cli', 'commands')

    // Also check old location
    const oldDir = resolve(home, '.beast-cli', 'commands')

    if (existsSync(userDir)) return userDir
    if (existsSync(oldDir)) return oldDir
    return null
  }

  // Project commands
  if (projectDir) {
    const projectDir = resolve(projectDir, '.beast-cli', 'commands')
    if (existsSync(projectDir)) return projectDir
  }

  return null
}

function loadCommandFile(
  filePath: string,
  source: 'user' | 'project'
): Command | null {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const name = basename(filePath, '.md')

    // Extract metadata from content
    const lines = content.split('\n')
    let description = ''
    let actualContent = content

    // Check for description in first comment
    if (lines[0]?.startsWith('#')) {
      description = lines[0].substring(1).trim()
      actualContent = lines.slice(1).join('\n').trim()
    }

    // Build command ID
    const relativePath = filePath
      .replace(/\\/g, '/')
      .split('commands/')
      .pop() || name
    const prefix = source === 'user' ? 'user' : 'project'
    const id = `${prefix}:${relativePath.replace(/\.md$/, '').replace(/\//g, ':')}`

    // Extract arguments
    const arguments_ = extractArguments(actualContent)

    return {
      id,
      name: name.replace(/:/g, ' '),
      description: description || `Custom command: ${name}`,
      content: actualContent,
      arguments: arguments_,
      source,
      filePath,
    }
  } catch (error) {
    console.error(`Failed to load command from ${filePath}:`, error)
    return null
  }
}

/**
 * Discover all commands from disk
 */
export function discoverCommands(projectDir?: string): Command[] {
  const commands: Command[] = []

  // Load user commands
  const userDir = getCommandsDir('user')
  if (userDir) {
    loadCommandsFromDir(userDir, 'user', commands)
  }

  // Load project commands
  const projectDir_ = getCommandsDir('project', projectDir)
  if (projectDir_) {
    loadCommandsFromDir(projectDir_, 'project', commands)
  }

  return commands
}

function loadCommandsFromDir(
  dir: string,
  source: 'user' | 'project',
  commands: Command[]
): void {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      return
    }

    const files = readdirSync(dir, { withFileTypes: true })

    for (const entry of files) {
      const fullPath = resolve(dir, entry.name)

      if (entry.isDirectory()) {
        // Recurse into subdirectories
        loadCommandsFromDir(fullPath, source, commands)
      } else if (entry.name.endsWith('.md')) {
        const cmd = loadCommandFile(fullPath, source)
        if (cmd) commands.push(cmd)
      }
    }
  } catch (error) {
    console.error(`Failed to load commands from ${dir}:`, error)
  }
}

// ── Command Manager ────────────────────────────────────────────────────────────

export class CommandManager {
  private commands: Map<string, Command> = new Map()
  private projectDir?: string
  private lastDiscover = 0
  private readonly DISCOVER_INTERVAL = 5000 // Re-discover every 5 seconds

  constructor(projectDir?: string) {
    this.projectDir = projectDir
    this.discover()
  }

  /**
   * Refresh command list from disk
   */
  discover(): void {
    const commands = discoverCommands(this.projectDir)

    this.commands.clear()
    for (const cmd of commands) {
      this.commands.set(cmd.id, cmd)
    }

    this.lastDiscover = Date.now()
  }

  /**
   * Get all commands
   */
  getAll(): Command[] {
    // Re-discover if stale
    if (Date.now() - this.lastDiscover > this.DISCOVER_INTERVAL) {
      this.discover()
    }

    return Array.from(this.commands.values())
  }

  /**
   * Get command by ID
   */
  get(id: string): Command | undefined {
    return this.commands.get(id)
  }

  /**
   * Search commands by name/description
   */
  search(query: string): Command[] {
    const q = query.toLowerCase()
    return this.getAll().filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.id.toLowerCase().includes(q)
    )
  }

  /**
   * Execute a command with arguments
   */
  execute(
    id: string,
    args: Record<string, string> = {}
  ): CommandResult | null {
    const command = this.commands.get(id)
    if (!command) return null

    // Validate arguments
    if (command.arguments) {
      const { valid, missing } = validateArguments(args, command.arguments)
      if (!valid) {
        console.error(`Missing required arguments: ${missing?.join(', ')}`)
        return null
      }
    }

    // Parse actions
    const actions = parseCommandContent(command.content, args)

    return { command, actions, args }
  }

  /**
   * Save a new command
   */
  save(command: Omit<Command, 'filePath'>): Command | null {
    const dir = command.source === 'user'
      ? getCommandsDir('user') || resolve(process.env.HOME!, '.config', 'beast-cli', 'commands')
      : this.projectDir
        ? resolve(this.projectDir, '.beast-cli', 'commands')
        : null

    if (!dir) return null

    // Determine file path
    const fileName = command.id
      .replace(/^(user|project):/, '')
      .replace(/:/g, '/') + '.md'

    const filePath = resolve(dir, fileName)

    // Ensure directory exists
    mkdirSync(dirname(filePath), { recursive: true })

    // Write file
    try {
      const content = `# ${command.description}\n\n${command.content}`
      writeFileSync(filePath, content, 'utf-8')

      // Reload commands
      this.discover()

      return this.commands.get(command.id) || null
    } catch (error) {
      console.error('Failed to save command:', error)
      return null
    }
  }

  /**
   * Delete a command
   */
  delete(id: string): boolean {
    const command = this.commands.get(id)
    if (!command || !command.filePath) return false

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { unlinkSync } = require('node:fs')
      unlinkSync(command.filePath)
      this.discover()
      return true
    } catch (error) {
      console.error('Failed to delete command:', error)
      return false
    }
  }
}

// ── Built-in Commands ────────────────────────────────────────────────────────

export const BUILTIN_COMMANDS: Command[] = [
  {
    id: 'builtin:init',
    name: 'Initialize Project',
    description: 'Analyze project and create AGENTS.md',
    content: `RUN git ls-files
READ README.md
READ package.json
SEND Analyze this codebase and create a comprehensive AGENTS.md file with project overview, architecture, key files, conventions, and common workflows.`,
    source: 'user',
  },
  {
    id: 'builtin:compact',
    name: 'Compact Session',
    description: 'Summarize current conversation and start fresh',
    content: `SEND Summarize the current conversation into a compact summary that captures:
1. What was accomplished
2. Key files modified
3. Outstanding issues or next steps
4. Any important decisions made

Then start a new conversation with this summary prepended.`,
    source: 'user',
  },
  {
    id: 'builtin:debug',
    name: 'Debug Issue',
    description: 'Investigate and trace a bug',
    content: `READ package.json
RUN git status
GREP console.error
SEND Investigate the current bug/issue by:
1. Running relevant tests to reproduce the issue
2. Reading the relevant source files
3. Identifying the root cause
4. Proposing a fix`,
    source: 'user',
  },
  {
    id: 'builtin:review',
    name: 'Review Changes',
    description: 'Review staged and unstaged changes',
    content: `RUN git diff
RUN git diff --cached
RUN git status
SEND Review these changes and provide feedback on:
1. Overall quality and correctness
2. Potential bugs or issues
3. Style and consistency
4. Suggestions for improvement`,
    source: 'user',
  },
  {
    id: 'builtin:test',
    name: 'Run Tests',
    description: 'Run test suite and analyze results',
    content: `RUN npm test 2>&1 || bun test 2>&1 || yarn test 2>&1
SEND Analyze the test results and:
1. Note any failing tests
2. Identify patterns in failures
3. Suggest fixes if applicable`,
    source: 'user',
  },
]

// ── Create Command Examples ────────────────────────────────────────────────────

/**
 * Create example commands for new users
 */
export function createExampleCommands(): void {
  const home = process.env.HOME || process.env.USERPROFILE
  if (!home) return

  const xdgConfig = process.env.XDG_CONFIG_HOME
  const dir = xdgConfig
    ? resolve(xdgConfig, 'beast-cli', 'commands')
    : resolve(home, '.config', 'beast-cli', 'commands')

  if (existsSync(dir)) return // Don't overwrite

  const examples: Array<{ name: string; description: string; content: string }> = [
    {
      name: 'git-commit.md',
      description: 'Stage and commit changes',
      content: `# Stage and commit changes
RUN git status
RUN git diff

# Add all changes
RUN git add -A

# Commit with generated message
RUN git commit -m "$COMMIT_MESSAGE"`,
    },
    {
      name: 'pr-context.md',
      description: 'Get PR context for code review',
      content: `# Get context for pull request
RUN gh pr view $PR_NUMBER --json title,body,files,comments
READ package.json
GREP $PATTERN
SEND Analyze the changes in PR #$PR_NUMBER and provide a code review focusing on:
1. Correctness and potential bugs
2. Security concerns
3. Performance implications
4. Code style and maintainability`,
    },
    {
      name: 'explore-api.md',
      description: 'Explore API structure',
      content: `# Explore API structure
GLOB **/api/**/*
GLOB **/*controller.*
GLOB **/*router.*
GREP export (async )?function
SEND Map out the API structure and explain:
1. Main endpoints and their purposes
2. Authentication/authorization flow
3. Request/response patterns
4. How middleware is used`,
    },
  ]

  try {
    mkdirSync(dir, { recursive: true })

    for (const example of examples) {
      const content = `# ${example.description}\n\n${example.content}`
      writeFileSync(resolve(dir, example.name), content, 'utf-8')
    }

    console.log(`Created example commands in ${dir}`)
  } catch (error) {
    console.error('Failed to create example commands:', error)
  }
}

// Singleton
let manager: CommandManager | null = null

export function getCommandManager(projectDir?: string): CommandManager {
  if (!manager) {
    manager = new CommandManager(projectDir)
  }
  return manager
}

export default {
  CommandManager,
  getCommandManager,
  parseCommandContent,
  extractArguments,
  expandArguments,
  discoverCommands,
  BUILTIN_COMMANDS,
  createExampleCommands,
}
