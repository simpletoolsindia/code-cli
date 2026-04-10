// Multi-Agent Coordination System + User Agent Management
// Based on Claude Code's agent swarms and coordinator pattern
// Also supports user-defined agents invoked via @name in prompts

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// ── User Agent Types ─────────────────────────────────────────────────────────

export interface UserAgent {
  id: string
  name: string
  description: string
  instructions: string
  model?: string
  createdAt: number
  updatedAt: number
}

export interface AgentMemory {
  facts: string[]
  preferences: Record<string, string>
  context: string
  updatedAt: number
}

interface AgentStore {
  agents: UserAgent[]
  activeAgent?: string
}

export type AgentRole = 'coordinator' | 'worker' | 'observer'

export interface AgentConfig {
  id: string
  name: string
  role: AgentRole
  tools?: string[]           // Allowed tools (whitelist)
  disallowedTools?: string[]  // Disallowed tools (blacklist)
  model?: string
  maxTokens?: number
  prompt?: string
}

export interface AgentInstance {
  config: AgentConfig
  status: 'idle' | 'running' | 'completed' | 'failed'
  result?: unknown
  startedAt?: Date
  completedAt?: Date
}

// ── User Agent Storage ───────────────────────────────────────────────────────

function getAgentsDir(): string {
  return resolve(process.env.HOME ?? '~', '.beast-cli', 'agents')
}

function getAgentsPath(): string {
  return resolve(getAgentsDir(), 'agents.json')
}

function getMemoryPath(): string {
  return resolve(getAgentsDir(), 'memory.json')
}

function ensureDir(): void {
  const dir = getAgentsDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function loadStore(): AgentStore {
  ensureDir()
  try {
    if (existsSync(getAgentsPath())) {
      return JSON.parse(readFileSync(getAgentsPath(), 'utf-8'))
    }
  } catch {}
  return { agents: [] }
}

function saveStore(store: AgentStore): void {
  ensureDir()
  writeFileSync(getAgentsPath(), JSON.stringify(store, null, 2), 'utf-8')
}

export function listAgents(): UserAgent[] {
  return loadStore().agents
}

export function getAgent(name: string): UserAgent | undefined {
  const store = loadStore()
  return store.agents.find(a =>
    a.name.toLowerCase() === name.toLowerCase() ||
    a.name.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  )
}

export function createAgent(data: Omit<UserAgent, 'id' | 'createdAt' | 'updatedAt'>): UserAgent {
  const store = loadStore()
  const agent: UserAgent = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  store.agents.push(agent)
  saveStore(store)
  return agent
}

export function updateAgent(id: string, updates: Partial<Omit<UserAgent, 'id' | 'createdAt'>>): UserAgent | null {
  const store = loadStore()
  const idx = store.agents.findIndex(a => a.id === id)
  if (idx === -1) return null
  store.agents[idx] = { ...store.agents[idx], ...updates, updatedAt: Date.now() }
  saveStore(store)
  return store.agents[idx]
}

export function deleteAgent(id: string): boolean {
  const store = loadStore()
  const before = store.agents.length
  store.agents = store.agents.filter(a => a.id !== id)
  if (store.agents.length < before) {
    if (store.activeAgent) {
      const stillExists = store.agents.some(a => a.name === store.activeAgent)
      if (!stillExists) store.activeAgent = undefined
    }
    saveStore(store)
    return true
  }
  return false
}

export function getActiveAgent(): UserAgent | undefined {
  const store = loadStore()
  if (!store.activeAgent) return undefined
  return getAgent(store.activeAgent)
}

export function setActiveAgent(name: string | undefined): void {
  const store = loadStore()
  store.activeAgent = name
  saveStore(store)
}

// ── Memory ─────────────────────────────────────────────────────────────────

export function loadMemory(): AgentMemory {
  try {
    if (existsSync(getMemoryPath())) {
      return JSON.parse(readFileSync(getMemoryPath(), 'utf-8'))
    }
  } catch {}
  return { facts: [], preferences: {}, context: '', updatedAt: Date.now() }
}

export function saveMemory(memory: AgentMemory): void {
  ensureDir()
  writeFileSync(getMemoryPath(), JSON.stringify(memory, null, 2), 'utf-8')
}

export function updateMemory(updates: Partial<AgentMemory>): AgentMemory {
  const memory = loadMemory()
  const updated = { ...memory, ...updates, updatedAt: Date.now() }
  saveMemory(updated)
  return updated
}

// ── Prompt injection ────────────────────────────────────────────────────────

const AGENT_REF_REGEX = /@([\w-]+)/g

export interface AgentContext {
  cleanedPrompt: string
  agentInstructions: string[]
  usedAgents: UserAgent[]
  activeAgent?: UserAgent
}

export function parseAgentContext(prompt: string): AgentContext {
  const store = loadStore()
  const instructions: string[] = []
  const usedAgents: UserAgent[] = []
  let activeAgent: UserAgent | undefined

  if (store.activeAgent) {
    activeAgent = getAgent(store.activeAgent)
    if (activeAgent) {
      instructions.push(`[AGENT: ${activeAgent.name}]\n${activeAgent.instructions}`)
      usedAgents.push(activeAgent)
    }
  }

  const matches = [...prompt.matchAll(AGENT_REF_REGEX)]
  for (const match of matches) {
    const name = match[1]
    const agent = getAgent(name)
    if (agent && !usedAgents.some(a => a.id === agent.id)) {
      instructions.push(`[AGENT: ${agent.name}]\n${agent.instructions}`)
      usedAgents.push(agent)
    }
  }

  const cleanedPrompt = prompt.replace(AGENT_REF_REGEX, '').replace(/\s+/g, ' ').trim()
  return { cleanedPrompt, agentInstructions: instructions, usedAgents, activeAgent }
}

export function buildAgentSystemMessage(context: AgentContext): string {
  const parts: string[] = []

  if (context.agentInstructions.length > 0) {
    parts.push(
      'You have access to the following custom agents:\n' +
      context.agentInstructions.join('\n\n')
    )
  }

  const memory = loadMemory()
  if (memory.context || memory.facts.length > 0) {
    const memParts: string[] = []
    if (memory.context) memParts.push(`Project Context: ${memory.context}`)
    if (memory.facts.length > 0) memParts.push(`Known Facts: ${memory.facts.map(f => `• ${f}`).join('\n')}`)
    if (Object.keys(memory.preferences).length > 0) {
      memParts.push(`Preferences: ${Object.entries(memory.preferences).map(([k, v]) => `${k}=${v}`).join(', ')}`)
    }
    parts.push('[MEMORY]\n' + memParts.join('\n'))
  }

  return parts.join('\n\n')
}

// ── Inter-agent message types
export type MessageType =
  | 'task'           // Assign task to worker
  | 'result'         // Return result from worker
  | 'status'         // Status update
  | 'error'          // Error notification
  | 'coordinate'     // Coordination message
  | 'stop'           // Stop worker signal

export interface InterAgentMessage {
  id: string
  from: string
  to: string
  type: MessageType
  payload: unknown
  timestamp: number
}

// Coordinator - manages worker agents
export class Coordinator {
  private agents: Map<string, AgentInstance> = new Map()
  private messageQueue: InterAgentMessage[] = []
  private onMessage?: (msg: InterAgentMessage) => void

  constructor(onMessage?: (msg: InterAgentMessage) => void) {
    this.onMessage = onMessage
  }

  // Register a new agent
  registerAgent(config: AgentConfig): string {
    const instance: AgentInstance = {
      config,
      status: 'idle',
    }
    this.agents.set(config.id, instance)
    console.log(`[Coordinator] Registered agent: ${config.name} (${config.role})`)
    return config.id
  }

  // Spawn a worker with config
  spawnWorker(config: Omit<AgentConfig, 'id' | 'role'>): string {
    const id = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    return this.registerAgent({
      ...config,
      id,
      role: 'worker',
    })
  }

  // Send message to agent
  sendMessage(to: string, type: MessageType, payload: unknown): void {
    const msg: InterAgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: 'coordinator',
      to,
      type,
      payload,
      timestamp: Date.now(),
    }
    this.messageQueue.push(msg)

    // Notify listener
    if (this.onMessage) {
      this.onMessage(msg)
    }

    // Handle message
    this.handleMessage(msg)
  }

  // Handle incoming message
  private handleMessage(msg: InterAgentMessage): void {
    const agent = this.agents.get(msg.to)
    if (!agent) return

    switch (msg.type) {
      case 'task':
        agent.status = 'running'
        agent.startedAt = new Date()
        console.log(`[Coordinator] Task assigned to ${agent.config.name}`)
        break

      case 'stop':
        agent.status = 'completed'
        agent.completedAt = new Date()
        console.log(`[Coordinator] ${agent.config.name} stopped`)
        break

      case 'result':
        agent.result = msg.payload
        agent.status = 'completed'
        agent.completedAt = new Date()
        console.log(`[Coordinator] Result received from ${agent.config.name}`)
        break

      case 'error':
        agent.status = 'failed'
        agent.result = msg.payload
        console.log(`[Coordinator] Error from ${agent.config.name}: ${msg.payload}`)
        break
    }
  }

  // Get agent by ID
  getAgent(id: string): AgentInstance | undefined {
    return this.agents.get(id)
  }

  // Get all agents
  getAllAgents(): AgentInstance[] {
    return Array.from(this.agents.values())
  }

  // Get agents by role
  getAgentsByRole(role: AgentRole): AgentInstance[] {
    return Array.from(this.agents.values()).filter(a => a.config.role === role)
  }

  // Stop specific agent
  stopAgent(id: string): void {
    this.sendMessage(id, 'stop', { reason: 'coordinator-stop' })
  }

  // Stop all workers
  stopAllWorkers(): void {
    const workers = this.getAgentsByRole('worker')
    for (const worker of workers) {
      this.stopAgent(worker.config.id)
    }
  }

  // Broadcast to all workers
  broadcast(type: MessageType, payload: unknown): void {
    const workers = this.getAgentsByRole('worker')
    for (const worker of workers) {
      this.sendMessage(worker.config.id, type, payload)
    }
  }

  // Synthesize results from workers
  synthesizeResults(): {
    succeeded: unknown[]
    failed: unknown[]
    totalDuration: number
  } {
    const workers = this.getAgentsByRole('worker')
    const succeeded: unknown[] = []
    const failed: unknown[] = []
    let totalDuration = 0

    for (const worker of workers) {
      if (worker.status === 'completed' && worker.result) {
        succeeded.push(worker.result)
      } else if (worker.status === 'failed') {
        failed.push(worker.result)
      }

      if (worker.startedAt && worker.completedAt) {
        totalDuration += worker.completedAt.getTime() - worker.startedAt.getTime()
      }
    }

    return { succeeded, failed, totalDuration }
  }
}

// Worker agent - executes tasks assigned by coordinator
export class WorkerAgent {
  private id: string
  private name: string
  private tools: string[]
  private disallowedTools: string[]
  private messageHandler?: (msg: InterAgentMessage) => void

  constructor(config: {
    id: string
    name: string
    tools?: string[]
    disallowedTools?: string[]
    onMessage?: (msg: InterAgentMessage) => void
  }) {
    this.id = config.id
    this.name = config.name
    this.tools = config.tools ?? ['*']
    this.disallowedTools = config.disallowedTools ?? []
    this.messageHandler = config.onMessage
  }

  getId(): string {
    return this.id
  }

  getName(): string {
    return this.name
  }

  // Check if tool is allowed
  isToolAllowed(toolName: string): boolean {
    if (this.tools.includes('*')) return true
    if (this.disallowedTools.includes(toolName)) return false
    return this.tools.includes(toolName)
  }

  // Filter allowed tools
  getAllowedTools(): string[] {
    if (this.tools.includes('*')) {
      return ['*']
    }
    return this.tools.filter(t => !this.disallowedTools.includes(t))
  }

  // Handle task from coordinator
  async handleTask(task: unknown): Promise<unknown> {
    console.log(`[Worker:${this.name}] Processing task`)

    // Simulate task execution
    // In real implementation, this would run the LLM with restricted tools

    return {
      agentId: this.id,
      agentName: this.name,
      task,
      result: 'Task completed',
      completedAt: new Date().toISOString(),
    }
  }

  // Send result back to coordinator
  sendResult(coordinatorId: string, result: unknown): void {
    const msg: InterAgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: this.id,
      to: coordinatorId,
      type: 'result',
      payload: result,
      timestamp: Date.now(),
    }

    if (this.messageHandler) {
      this.messageHandler(msg)
    }
  }
}

// Agent registry for spawning
const agentRegistry = new Map<string, (config: AgentConfig) => WorkerAgent>()

export function registerAgentType(
  type: string,
  factory: (config: AgentConfig) => WorkerAgent
): void {
  agentRegistry.set(type, factory)
}

// Create worker agent from type
export function createWorkerAgent(type: string, config: AgentConfig): WorkerAgent | null {
  const factory = agentRegistry.get(type)
  if (!factory) return null
  return factory(config)
}

// Multi-agent session manager
export class AgentSession {
  private coordinator: Coordinator
  private workers: Map<string, WorkerAgent> = new Map()
  private sessionId: string

  constructor(sessionId: string) {
    this.sessionId = sessionId
    this.coordinator = new Coordinator(msg => this.onCoordinatorMessage(msg))
  }

  // Initialize session with coordinator and workers
  async initialize(config: {
    coordinatorTools?: string[]
    workerCount: number
    workerTools?: string[]
  }): Promise<void> {
    // Register coordinator
    this.coordinator.registerAgent({
      id: `coord-${this.sessionId}`,
      name: 'main-coordinator',
      role: 'coordinator',
      tools: config.coordinatorTools,
    })

    // Spawn workers
    for (let i = 0; i < config.workerCount; i++) {
      const workerId = this.coordinator.spawnWorker({
        name: `worker-${i + 1}`,
        tools: config.workerTools,
        prompt: `You are worker ${i + 1} in a multi-agent session.`,
      })

      const worker = new WorkerAgent({
        id: workerId,
        name: `worker-${i + 1}`,
        tools: config.workerTools,
        onMessage: msg => this.coordinator.sendMessage(msg.to, msg.type, msg.payload),
      })

      this.workers.set(workerId, worker)
    }

    console.log(`[AgentSession] Initialized with ${config.workerCount} workers`)
  }

  // Handle coordinator message
  private onCoordinatorMessage(msg: InterAgentMessage): void {
    if (msg.to === `coord-${this.sessionId}`) {
      // Message for coordinator
      console.log(`[Session] Message received: ${msg.type} from ${msg.from}`)
    }
  }

  // Assign task to specific worker
  assignTask(workerId: string, task: unknown): void {
    this.coordinator.sendMessage(workerId, 'task', task)
  }

  // Assign task to all workers (parallel)
  assignToAll(task: unknown): void {
    this.coordinator.broadcast('task', task)
  }

  // Wait for all workers to complete
  async waitForCompletion(timeout = 60000): Promise<boolean> {
    const start = Date.now()

    while (Date.now() - start < timeout) {
      const workers = this.coordinator.getAgentsByRole('worker')
      const allDone = workers.every(w =>
        w.status === 'completed' || w.status === 'failed'
      )

      if (allDone) return true

      await new Promise(r => setTimeout(r, 1000))
    }

    return false
  }

  // Get session results
  getResults(): {
    coordinator: Coordinator
    results: ReturnType<Coordinator['synthesizeResults']>
    sessionId: string
  } {
    return {
      coordinator: this.coordinator,
      results: this.coordinator.synthesizeResults(),
      sessionId: this.sessionId,
    }
  }

  // Clean up session
  destroy(): void {
    this.coordinator.stopAllWorkers()
    this.workers.clear()
    console.log(`[AgentSession] Session ${this.sessionId} destroyed`)
  }
}

// Default agent types
export function registerDefaultAgents(): void {
  // Research agent - focused on reading/grepping
  registerAgentType('research', config => new WorkerAgent({
    id: config.id,
    name: config.name,
    tools: ['Read', 'Grep', 'Glob', 'WebFetch'],
  }))

  // Builder agent - focused on writing code
  registerAgentType('builder', config => new WorkerAgent({
    id: config.id,
    name: config.name,
    tools: ['Read', 'Edit', 'Write', 'Bash', 'Glob'],
  }))

  // Tester agent - focused on testing
  registerAgentType('tester', config => new WorkerAgent({
    id: config.id,
    name: config.name,
    tools: ['Read', 'Bash', 'Glob'],
  }))
}