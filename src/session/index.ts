// Session Storage - SQLite-based persistent sessions
// Inspired by opencode's SQLite session management

import { resolve, dirname } from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'

export interface Session {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  model: string
  provider: string
  workingDir: string
  messageCount: number
}

export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  toolCalls?: string // JSON serialized
}

export interface SessionStore {
  // Session operations
  createSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'messageCount'>): Session
  getSession(id: string): Session | null
  listSessions(): Session[]
  updateSession(id: string, updates: Partial<Session>): Session | null
  deleteSession(id: string): boolean

  // Message operations
  addMessage(message: Omit<Message, 'id'>): Message
  getMessages(sessionId: string): Message[]
  getLastMessage(sessionId: string): Message | null

  // Stats
  getSessionStats(): { sessionCount: number; messageCount: number; storageSize: number }
}

/**
 * JSON-based session store (works without SQLite)
 * Provides the same interface as SQLite but stores in JSON files
 */
export class JsonSessionStore implements SessionStore {
  private baseDir: string
  private sessions: Map<string, Session> = new Map()
  private messages: Map<string, Message[]> = new Map() // sessionId -> messages

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? resolve(process.env.HOME ?? '.', '.beast-cli', 'sessions')
    this.ensureDir()
    this.load()
  }

  private ensureDir(): void {
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true })
    }
  }

  private getSessionsFile(): string {
    return resolve(this.baseDir, 'sessions.json')
  }

  private getMessagesFile(sessionId: string): string {
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_')
    return resolve(this.baseDir, `${safeId}.messages.json`)
  }

  load(): void {
    try {
      const file = this.getSessionsFile()
      if (existsSync(file)) {
        const data = readFileSync(file, 'utf-8')
        const sessions: Session[] = JSON.parse(data)
        for (const session of sessions) {
          this.sessions.set(session.id, session)
        }
      }
    } catch (error) {
      console.warn('Failed to load sessions:', error)
    }
  }

  save(): void {
    try {
      const sessions = Array.from(this.sessions.values())
      writeFileSync(
        this.getSessionsFile(),
        JSON.stringify(sessions, null, 2),
        'utf-8'
      )
    } catch (error) {
      console.warn('Failed to save sessions:', error)
    }
  }

  createSession(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'messageCount'>
  ): Session {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = Date.now()

    const session: Session = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    }

    this.sessions.set(id, session)
    this.messages.set(id, [])
    this.save()

    return session
  }

  getSession(id: string): Session | null {
    return this.sessions.get(id) || null
  }

  listSessions(): Session[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.updatedAt - a.updatedAt
    )
  }

  updateSession(id: string, updates: Partial<Session>): Session | null {
    const session = this.sessions.get(id)
    if (!session) return null

    const updated = {
      ...session,
      ...updates,
      updatedAt: Date.now(),
    }

    this.sessions.set(id, updated)
    this.save()

    return updated
  }

  deleteSession(id: string): boolean {
    if (!this.sessions.has(id)) return false

    this.sessions.delete(id)
    this.messages.delete(id)

    // Delete message file
    try {
      const msgFile = this.getMessagesFile(id)
      if (existsSync(msgFile)) {
        unlinkSync(msgFile)
      }
    } catch {}

    this.save()
    return true
  }

  addMessage(data: Omit<Message, 'id'>): Message {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const message: Message = {
      ...data,
      id,
    }

    const sessionMessages = this.messages.get(data.sessionId) || []
    sessionMessages.push(message)
    this.messages.set(data.sessionId, sessionMessages)

    // Update session
    const session = this.sessions.get(data.sessionId)
    if (session) {
      session.messageCount = sessionMessages.length
      session.updatedAt = Date.now()
      this.save()
    }

    // Save messages to file
    try {
      writeFileSync(
        this.getMessagesFile(data.sessionId),
        JSON.stringify(sessionMessages, null, 2),
        'utf-8'
      )
    } catch (error) {
      console.warn('Failed to save messages:', error)
    }

    return message
  }

  getMessages(sessionId: string): Message[] {
    // Try to load from file if not in memory
    if (!this.messages.has(sessionId)) {
      try {
        const file = this.getMessagesFile(sessionId)
        if (existsSync(file)) {
          const data = readFileSync(file, 'utf-8')
          this.messages.set(sessionId, JSON.parse(data))
        }
      } catch {}
    }

    return this.messages.get(sessionId) || []
  }

  getLastMessage(sessionId: string): Message | null {
    const messages = this.getMessages(sessionId)
    return messages[messages.length - 1] || null
  }

  getSessionStats(): { sessionCount: number; messageCount: number; storageSize: number } {
    let messageCount = 0
    for (const msgs of this.messages.values()) {
      messageCount += msgs.length
    }

    // Calculate storage size
    let storageSize = 0
    try {
      const sessionsFile = this.getSessionsFile()
      if (existsSync(sessionsFile)) {
        storageSize += readFileSync(sessionsFile, 'utf-8').length
      }
      for (const [sessionId] of this.sessions) {
        const msgFile = this.getMessagesFile(sessionId)
        if (existsSync(msgFile)) {
          storageSize += readFileSync(msgFile, 'utf-8').length
        }
      }
    } catch {}

    return {
      sessionCount: this.sessions.size,
      messageCount,
      storageSize,
    }
  }
}

/**
 * SQLite-based session store (if better-sqlite3 is available)
 */
export class SqliteSessionStore implements SessionStore {
  private db: any = null
  private baseDir: string

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? resolve(process.env.HOME ?? '.', '.beast-cli', 'sessions')

    // Try to load better-sqlite3
    try {
      // Dynamic import to avoid hard dependency
      const sqlite3 = require('better-sqlite3')
      this.ensureDir()
      this.db = new sqlite3.default(resolve(this.baseDir, 'sessions.db'))
      this.initDb()
    } catch (error) {
      console.warn('SQLite not available, falling back to JSON store')
      // Return a JSON store as fallback
      return new JsonSessionStore(baseDir) as unknown as SqliteSessionStore
    }
  }

  private ensureDir(): void {
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true })
    }
  }

  private initDb(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        model TEXT NOT NULL,
        provider TEXT NOT NULL,
        working_dir TEXT NOT NULL,
        message_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        tool_calls TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);
    `)
  }

  createSession(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'messageCount'>
  ): Session {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = Date.now()

    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, title, created_at, updated_at, model, provider, working_dir, message_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `)

    stmt.run(id, data.title, now, now, data.model, data.provider, data.workingDir)

    return {
      id,
      title: data.title,
      createdAt: now,
      updatedAt: now,
      model: data.model,
      provider: data.provider,
      workingDir: data.workingDir,
      messageCount: 0,
    }
  }

  getSession(id: string): Session | null {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?')
    const row = stmt.get(id)

    if (!row) return null

    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      model: row.model,
      provider: row.provider,
      workingDir: row.working_dir,
      messageCount: row.message_count,
    }
  }

  listSessions(): Session[] {
    const stmt = this.db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC')
    const rows = stmt.all()

    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      model: row.model,
      provider: row.provider,
      workingDir: row.working_dir,
      messageCount: row.message_count,
    }))
  }

  updateSession(id: string, updates: Partial<Session>): Session | null {
    const now = Date.now()
    const fields: string[] = ['updated_at = ?']
    const values: any[] = [now]

    if (updates.title !== undefined) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.messageCount !== undefined) {
      fields.push('message_count = ?')
      values.push(updates.messageCount)
    }

    values.push(id)

    const stmt = this.db.prepare(
      `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`
    )
    stmt.run(...values)

    return this.getSession(id)
  }

  deleteSession(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  addMessage(data: Omit<Message, 'id'>): Message {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const stmt = this.db.prepare(`
      INSERT INTO messages (id, session_id, role, content, timestamp, tool_calls)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.sessionId,
      data.role,
      data.content,
      data.timestamp,
      data.toolCalls || null
    )

    // Update session message count
    this.db.prepare(`
      UPDATE sessions SET message_count = (
        SELECT COUNT(*) FROM messages WHERE session_id = ?
      ), updated_at = ? WHERE id = ?
    `).run(data.sessionId, Date.now(), data.sessionId)

    return { ...data, id }
  }

  getMessages(sessionId: string): Message[] {
    const stmt = this.db.prepare(
      'SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC'
    )
    const rows = stmt.all(sessionId)

    return rows.map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      toolCalls: row.tool_calls,
    }))
  }

  getLastMessage(sessionId: string): Message | null {
    const stmt = this.db.prepare(`
      SELECT * FROM messages WHERE session_id = ?
      ORDER BY timestamp DESC LIMIT 1
    `)
    const row = stmt.get(sessionId)

    if (!row) return null

    return {
      id: row.id,
      sessionId: row.session_id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      toolCalls: row.tool_calls,
    }
  }

  getSessionStats(): { sessionCount: number; messageCount: number; storageSize: number } {
    const sessions = this.db.prepare('SELECT COUNT(*) as count FROM sessions').get()
    const messages = this.db.prepare('SELECT COUNT(*) as count FROM messages').get()
    const dbFile = resolve(this.baseDir, 'sessions.db')

    let storageSize = 0
    try {
      if (existsSync(dbFile)) {
        storageSize = readFileSync(dbFile, 'utf-8').length
      }
    } catch {}

    return {
      sessionCount: sessions?.count || 0,
      messageCount: messages?.count || 0,
      storageSize,
    }
  }
}

// Singleton
let store: SessionStore | null = null

export function getSessionStore(): SessionStore {
  if (!store) {
    // Try SQLite first, fall back to JSON
    try {
      require.resolve('better-sqlite3')
      store = new SqliteSessionStore()
    } catch {
      store = new JsonSessionStore()
    }
  }
  return store
}

export default {
  JsonSessionStore,
  SqliteSessionStore,
  getSessionStore,
}
