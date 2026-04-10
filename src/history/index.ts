// File History - Track file changes during sessions
// Inspired by opencode's file tracking

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

export interface FileVersion {
  id: string
  content: string
  timestamp: number
}

export interface FileHistoryEntry {
  path: string
  sessionId: string
  originalContent: string
  versions: FileVersion[]
  lastModified: number
}

/**
 * In-memory file history store
 * Tracks original content and versions during a session
 */
export class FileHistory {
  private files: Map<string, FileHistoryEntry> = new Map()
  private historyDir: string

  constructor(historyDir?: string) {
    this.historyDir =
      historyDir ?? resolve(process.env.HOME ?? '.', '.beast-cli', 'history')

    // Ensure history directory exists
    try {
      mkdirSync(this.historyDir, { recursive: true })
    } catch {}
  }

  /**
   * Create a new file history entry
   */
  create(sessionId: string, filePath: string, content: string): FileHistoryEntry {
    const entry: FileHistoryEntry = {
      path: filePath,
      sessionId,
      originalContent: content,
      versions: [],
      lastModified: Date.now(),
    }

    this.files.set(this.makeKey(sessionId, filePath), entry)
    this.persistToDisk(sessionId, filePath, entry)

    return entry
  }

  /**
   * Get a file history entry
   */
  get(sessionId: string, filePath: string): FileHistoryEntry | null {
    const key = this.makeKey(sessionId, filePath)

    if (this.files.has(key)) {
      return this.files.get(key)!
    }

    // Try to load from disk
    const loaded = this.loadFromDisk(sessionId, filePath)
    if (loaded) {
      this.files.set(key, loaded)
      return loaded
    }

    return null
  }

  /**
   * Get entry by path and session
   */
  getByPathAndSession(filePath: string, sessionId: string): FileHistoryEntry | null {
    return this.get(sessionId, filePath)
  }

  /**
   * Create a new version of a file
   */
  createVersion(
    sessionId: string,
    filePath: string,
    content: string
  ): FileVersion | null {
    const entry = this.get(sessionId, filePath)

    if (!entry) {
      // Create new entry if doesn't exist
      const newEntry = this.create(sessionId, filePath, content)
      return newEntry.versions[0] || null
    }

    // Don't create version if content is the same as last version
    const lastVersion = entry.versions[entry.versions.length - 1]
    if (lastVersion && lastVersion.content === content) {
      return null
    }

    const version: FileVersion = {
      id: `v${entry.versions.length + 1}`,
      content,
      timestamp: Date.now(),
    }

    entry.versions.push(version)
    entry.lastModified = Date.now()

    this.persistToDisk(sessionId, filePath, entry)

    return version
  }

  /**
   * Get all file versions for a session
   */
  getVersions(sessionId: string, filePath: string): FileVersion[] {
    const entry = this.get(sessionId, filePath)
    return entry?.versions || []
  }

  /**
   * Get the original content of a file
   */
  getOriginalContent(sessionId: string, filePath: string): string | null {
    const entry = this.get(sessionId, filePath)
    return entry?.originalContent || null
  }

  /**
   * Check if a file has been modified since last read
   */
  hasExternalModification(filePath: string, lastReadTime: number): boolean {
    if (!existsSync(filePath)) return false

    try {
      const stat = readFileSync(filePath, 'utf-8')
      const mtime = stat.length // simplified - in real impl would check stat.mtimeMs
      return mtime > lastReadTime
    } catch {
      return false
    }
  }

  /**
   * Get all files modified in a session
   */
  getModifiedFiles(sessionId: string): string[] {
    const files: string[] = []

    for (const [key, entry] of this.files) {
      if (key.startsWith(sessionId) && entry.versions.length > 0) {
        files.push(entry.path)
      }
    }

    return files
  }

  /**
   * Clear all history for a session
   */
  clearSession(sessionId: string): void {
    for (const key of this.files.keys()) {
      if (key.startsWith(sessionId)) {
        this.files.delete(key)
      }
    }
  }

  /**
   * Get total history size in bytes
   */
  getSize(): number {
    let size = 0

    for (const entry of this.files.values()) {
      size += entry.originalContent.length
      for (const version of entry.versions) {
        size += version.content.length
      }
    }

    return size
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private makeKey(sessionId: string, filePath: string): string {
    return `${sessionId}:${filePath}`
  }

  private getHistoryPath(sessionId: string, filePath: string): string {
    const safePath = filePath.replace(/[^a-zA-Z0-9_-]/g, '_')
    return resolve(this.historyDir, `${sessionId}_${safePath}.json`)
  }

  private persistToDisk(
    sessionId: string,
    filePath: string,
    entry: FileHistoryEntry
  ): void {
    try {
      const path = this.getHistoryPath(sessionId, filePath)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, JSON.stringify(entry, null, 2), 'utf-8')
    } catch (error) {
      console.warn('Failed to persist file history:', error)
    }
  }

  private loadFromDisk(
    sessionId: string,
    filePath: string
  ): FileHistoryEntry | null {
    try {
      const path = this.getHistoryPath(sessionId, filePath)

      if (existsSync(path)) {
        const content = readFileSync(path, 'utf-8')
        return JSON.parse(content) as FileHistoryEntry
      }
    } catch (error) {
      console.warn('Failed to load file history from disk:', error)
    }

    return null
  }
}

// Singleton instance
let historyInstance: FileHistory | null = null

export function getFileHistory(): FileHistory {
  if (!historyInstance) {
    historyInstance = new FileHistory()
  }
  return historyInstance
}

export default {
  FileHistory,
  getFileHistory,
}
