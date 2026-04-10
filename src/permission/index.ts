// Permission System - Command/tool execution permissions
// Inspired by opencode's permission model

export type PermissionAction = 'execute' | 'write' | 'read' | 'delete'

export interface PermissionRequest {
  sessionId: string
  path: string
  toolName: string
  action: PermissionAction
  description: string
  params?: Record<string, unknown>
}

export type PermissionDecision = 'allow' | 'deny' | 'allow_session' | 'ask'

export interface PermissionResponse {
  decision: PermissionDecision
  expiresAt?: number
}

export interface PermissionRule {
  toolName: string
  action: PermissionAction
  pathPattern?: RegExp
  autoApprove?: boolean
}

// Default permission rules
const DEFAULT_RULES: PermissionRule[] = [
  // Safe read-only commands (auto-approved)
  { toolName: 'bash', action: 'execute', autoApprove: false },
  { toolName: 'glob', action: 'read', autoApprove: true },
  { toolName: 'grep', action: 'read', autoApprove: true },
  { toolName: 'view', action: 'read', autoApprove: true },
  { toolName: 'ls', action: 'read', autoApprove: true },
  { toolName: 'fetch', action: 'read', autoApprove: true },

  // File operations need approval
  { toolName: 'write', action: 'write', autoApprove: false },
  { toolName: 'edit', action: 'write', autoApprove: false },
  { toolName: 'patch', action: 'write', autoApprove: false },

  // Destructive operations need approval
  { toolName: 'bash', action: 'delete', autoApprove: false },
]

// Banned commands (like opencode)
const BANNED_COMMANDS = [
  'alias',
  'curl',
  'curlie',
  'wget',
  'axel',
  'aria2c',
  'nc',
  'telnet',
  'lynx',
  'w3m',
  'links',
  'httpie',
  'xh',
  'http-prompt',
  'chrome',
  'firefox',
  'safari',
]

// Safe read-only bash commands
const SAFE_READONLY_COMMANDS = [
  'ls', 'echo', 'pwd', 'date', 'cal', 'uptime', 'whoami', 'id', 'groups',
  'env', 'printenv', 'set', 'unset', 'which', 'type', 'whereis', 'whatis',
  'uname', 'hostname', 'df', 'du', 'free', 'top', 'ps', 'kill', 'killall',
  'nice', 'nohup', 'time', 'timeout',

  'git status', 'git log', 'git diff', 'git show', 'git branch', 'git tag',
  'git remote', 'git ls-files', 'git ls-remote', 'git rev-parse',
  'git config --get', 'git config --list', 'git describe', 'git blame',
  'git grep', 'git shortlog',

  'go version', 'go help', 'go list', 'go env', 'go doc', 'go vet', 'go fmt',
  'go mod', 'go test', 'go build', 'go run', 'go install', 'go clean',
]

export interface PermissionService {
  request(req: PermissionRequest): boolean
  isAllowed(req: PermissionRequest): boolean
  addRule(rule: PermissionRule): void
  clearSession(sessionId: string): void
  getHistory(sessionId: string): PermissionResponse[]
}

/**
 * In-memory permission service
 */
export class PermissionServiceImpl implements PermissionService {
  private rules: PermissionRule[] = [...DEFAULT_RULES]
  private decisions: Map<string, PermissionResponse> = new Map()
  private pending: Map<string, PermissionRequest> = new Map()
  private history: Map<string, PermissionResponse[]> = new Map()

  constructor(private mode: 'default' | 'bypass' | 'dontAsk' = 'default') {}

  /**
   * Request permission for an action
   */
  request(req: PermissionRequest): boolean {
    const key = this.makeKey(req)

    // Check cache
    const cached = this.decisions.get(key)
    if (cached) {
      if (cached.expiresAt && cached.expiresAt < Date.now()) {
        this.decisions.delete(key)
      } else {
        return cached.decision === 'allow' || cached.decision === 'allow_session'
      }
    }

    // Check bypass mode
    if (this.mode === 'bypass') {
      return true
    }

    // Check rules
    const rule = this.rules.find(
      (r) => r.toolName === req.toolName && r.action === req.action
    )

    if (rule?.autoApprove) {
      return true
    }

    // Check if it's a safe read-only bash command
    if (req.toolName === 'bash' && req.action === 'execute') {
      if (this.isSafeReadOnly(req.description)) {
        return true
      }
    }

    // Check for banned commands
    if (req.toolName === 'bash' && this.isBannedCommand(req.description)) {
      console.error(`Permission denied: command is banned`)
      return false
    }

    // In dontAsk mode, deny by default
    if (this.mode === 'dontAsk') {
      return false
    }

    // Store as pending and return false (caller should prompt user)
    this.pending.set(key, req)

    return false
  }

  /**
   * Check if a request is already allowed
   */
  isAllowed(req: PermissionRequest): boolean {
    return this.request(req)
  }

  /**
   * Record a permission decision
   */
  recordDecision(req: PermissionRequest, decision: PermissionDecision): void {
    const key = this.makeKey(req)

    const response: PermissionResponse = {
      decision,
      expiresAt:
        decision === 'allow_session'
          ? Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          : undefined,
    }

    this.decisions.set(key, response)

    // Track history
    const sessionHistory = this.history.get(req.sessionId) || []
    sessionHistory.push(response)
    this.history.set(req.sessionId, sessionHistory)

    // Remove from pending
    this.pending.delete(key)
  }

  /**
   * Add a custom rule
   */
  addRule(rule: PermissionRule): void {
    this.rules.push(rule)
  }

  /**
   * Clear all decisions for a session
   */
  clearSession(sessionId: string): void {
    for (const key of this.decisions.keys()) {
      if (key.startsWith(sessionId)) {
        this.decisions.delete(key)
      }
    }
    this.history.delete(sessionId)
    this.pending.clear()
  }

  /**
   * Get permission history for a session
   */
  getHistory(sessionId: string): PermissionResponse[] {
    return this.history.get(sessionId) || []
  }

  /**
   * Get pending permission requests
   */
  getPending(): PermissionRequest[] {
    return Array.from(this.pending.values())
  }

  /**
   * Check if command is safe read-only
   */
  private isSafeReadOnly(command: string): boolean {
    const cmdLower = command.toLowerCase().trim()

    for (const safe of SAFE_READONLY_COMMANDS) {
      if (cmdLower === safe.toLowerCase()) {
        return true
      }
      if (cmdLower.startsWith(safe.toLowerCase() + ' ')) {
        return true
      }
    }

    return false
  }

  /**
   * Check if command is banned
   */
  private isBannedCommand(command: string): boolean {
    const parts = command.trim().split(/\s+/)
    const baseCmd = parts[0].toLowerCase()

    return BANNED_COMMANDS.some(
      (banned) => banned.toLowerCase() === baseCmd
    )
  }

  private makeKey(req: PermissionRequest): string {
    return `${req.sessionId}:${req.toolName}:${req.action}:${req.path}`
  }
}

// Error for denied permission
export class PermissionDeniedError extends Error {
  constructor(message = 'Permission denied') {
    super(message)
    this.name = 'PermissionDeniedError'
  }
}

export const ErrorPermissionDenied = new PermissionDeniedError()

// Singleton
let permissionInstance: PermissionServiceImpl | null = null

export function getPermissionService(): PermissionService {
  if (!permissionInstance) {
    permissionInstance = new PermissionServiceImpl()
  }
  return permissionInstance
}

export function createPermissionRequest(
  sessionId: string,
  toolName: string,
  action: PermissionAction,
  description: string,
  params?: Record<string, unknown>
): PermissionRequest {
  return {
    sessionId,
    path: process.cwd(),
    toolName,
    action,
    description,
    params,
  }
}

export default {
  PermissionServiceImpl,
  getPermissionService,
  createPermissionRequest,
  ErrorPermissionDenied,
  BANNED_COMMANDS,
  SAFE_READONLY_COMMANDS,
}
