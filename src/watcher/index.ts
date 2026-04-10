// File Watcher - Real-time file change detection
// Inspired by opencode's file watching for session changes

import { watch as fsWatch, FSWatcher } from 'node:fs'
import { existsSync, statSync, readdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'

export type WatchEventType = 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir'

export interface WatchEvent {
  type: WatchEventType
  path: string
  /** Full path to the file */
  fullPath: string
  /** Relative path from watch root */
  relativePath: string
  /** File size (for add/change events) */
  size?: number
  /** Modification timestamp */
  mtime?: number
}

export interface WatcherOptions {
  /** Root directory to watch */
  root: string
  /** Glob patterns to include */
  include?: string[]
  /** Glob patterns to exclude */
  exclude?: string[]
  /** Watch subdirectories recursively */
  recursive?: boolean
  /** Debounce delay in ms */
  debounce?: number
  /** Include hidden files */
  includeHidden?: boolean
}

type WatchCallback = (event: WatchEvent) => void

/**
 * Compile glob pattern to regex (simple implementation)
 */
function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  return new RegExp(`^${escaped}$`, 'i')
}

/**
 * Check if a path matches any pattern
 */
function matchesGlob(path: string, patterns: string[]): boolean {
  if (patterns.length === 0) return true

  for (const pattern of patterns) {
    if (globToRegex(pattern).test(path)) {
      return true
    }
  }

  return false
}

/**
 * Simple file watcher with glob filtering
 */
export class FileWatcher {
  private watchers: Map<string, FSWatcher> = new Map()
  private root: string
  private include: string[]
  private exclude: string[]
  private recursive: boolean
  private includeHidden: boolean
  private debounce: number
  private callbacks: Set<WatchCallback> = new Set()
  private pendingEvents: Map<string, WatchEvent> = new Map()
  private debounceTimer?: ReturnType<typeof setTimeout>
  private lastEvent: Map<string, number> = new Map()

  constructor(options: WatcherOptions) {
    this.root = options.root
    this.include = options.include || ['**/*']
    this.exclude = options.exclude || [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/*.log',
    ]
    this.recursive = options.recursive ?? true
    this.includeHidden = options.includeHidden ?? false
    this.debounce = options.debounce ?? 100
  }

  /**
   * Start watching the root directory
   */
  start(): void {
    this.watchDirectory(this.root)
  }

  /**
   * Stop watching
   */
  stop(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close()
    }
    this.watchers.clear()
  }

  /**
   * Add a callback for watch events
   */
  on(callback: WatchCallback): void {
    this.callbacks.add(callback)
  }

  /**
   * Remove a callback
   */
  off(callback: WatchCallback): void {
    this.callbacks.delete(callback)
  }

  /**
   * Emit an event to all callbacks
   */
  private emit(event: WatchEvent): void {
    // Debounce events
    const key = `${event.type}:${event.path}`
    const now = Date.now()
    const last = this.lastEvent.get(key) || 0

    if (now - last < this.debounce) {
      // Update pending event
      this.pendingEvents.set(key, event)
      this.scheduleFlush()
      return
    }

    this.lastEvent.set(key, now)
    this.dispatchEvent(event)
  }

  private scheduleFlush(): void {
    if (this.debounceTimer) return

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = undefined

      for (const event of this.pendingEvents.values()) {
        this.dispatchEvent(event)
      }
      this.pendingEvents.clear()
    }, this.debounce)
  }

  private dispatchEvent(event: WatchEvent): void {
    for (const callback of this.callbacks) {
      try {
        callback(event)
      } catch (error) {
        console.error('Watch callback error:', error)
      }
    }
  }

  /**
   * Watch a directory
   */
  private watchDirectory(dir: string): void {
    if (this.watchers.has(dir)) return

    try {
      const watcher = fsWatch(dir, { persistent: false }, (eventType, filename) => {
        if (!filename) return

        const fullPath = resolve(dir, filename)
        const relPath = relative(this.root, fullPath)

        // Skip hidden files if configured
        if (!this.includeHidden && pathContainsHidden(relPath)) {
          return
        }

        // Check exclude patterns
        if (!matchesGlob(relPath, this.include) || matchesGlob(relPath, this.exclude)) {
          return
        }

        // Determine event type
        let type: WatchEventType | null = null

        if (eventType === 'rename') {
          // Could be add or unlink
          if (existsSync(fullPath)) {
            try {
              const stat = statSync(fullPath)
              type = stat.isDirectory() ? 'addDir' : 'add'
            } catch {
              return
            }
          } else {
            type = 'unlink'
          }
        } else if (eventType === 'change') {
          type = 'change'
        }

        if (!type) return

        // Get file stats
        let size: number | undefined
        let mtime: number | undefined

        try {
          const stat = statSync(fullPath)
          size = stat.size
          mtime = stat.mtimeMs
        } catch {}

        this.emit({
          type,
          path: filename,
          fullPath,
          relativePath: relPath,
          size,
          mtime,
        })

        // If a directory was added and we're recursive, watch it too
        if (type === 'addDir' && this.recursive) {
          this.watchDirectory(fullPath)
        }
      })

      this.watchers.set(dir, watcher)

      // If recursive, watch all subdirectories
      if (this.recursive) {
        try {
          const entries = readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const subdir = resolve(dir, entry.name)
              if (entry.name !== '.git' && entry.name !== 'node_modules') {
                this.watchDirectory(subdir)
              }
            }
          }
        } catch (error) {
          // Directory might not be readable
        }
      }
    } catch (error) {
      console.error(`Failed to watch ${dir}:`, error)
    }
  }

  /**
   * Get watched directories
   */
  getWatchedDirectories(): string[] {
    return Array.from(this.watchers.keys())
  }
}

/**
 * Check if path contains hidden segments
 */
function pathContainsHidden(path: string): boolean {
  const parts = path.split('/')
  return parts.some((part) => part.startsWith('.') && part !== '.' && part !== '..')
}

// ── File Change Tracker ───────────────────────────────────────────────────────

export interface FileChange {
  path: string
  type: WatchEventType
  timestamp: number
  size?: number
  content?: string
}

export class FileChangeTracker {
  private changes: Map<string, FileChange> = new Map()
  private watcher?: FileWatcher
  private root: string

  constructor(root: string) {
    this.root = root
  }

  /**
   * Start tracking changes
   */
  start(options?: Partial<WatcherOptions>): void {
    this.watcher = new FileWatcher({
      root: this.root,
      recursive: true,
      debounce: 100,
      ...options,
    })

    this.watcher.on((event) => {
      this.changes.set(event.relativePath, {
        path: event.relativePath,
        type: event.type,
        timestamp: Date.now(),
        size: event.size,
      })
    })

    this.watcher.start()
  }

  /**
   * Stop tracking
   */
  stop(): void {
    this.watcher?.stop()
    this.watcher = undefined
  }

  /**
   * Get all changes
   */
  getChanges(): FileChange[] {
    return Array.from(this.changes.values())
  }

  /**
   * Get changes since a timestamp
   */
  getChangesSince(timestamp: number): FileChange[] {
    return this.getChanges().filter((c) => c.timestamp > timestamp)
  }

  /**
   * Check if a file was changed
   */
  wasChanged(path: string): boolean {
    return this.changes.has(path)
  }

  /**
   * Get the latest change type for a file
   */
  getChangeType(path: string): WatchEventType | undefined {
    return this.changes.get(path)?.type
  }

  /**
   * Clear changes
   */
  clear(): void {
    this.changes.clear()
  }

  /**
   * Clear changes for a specific file
   */
  clearFile(path: string): void {
    this.changes.delete(path)
  }

  /**
   * Get summary of changes
   */
  getSummary(): {
    added: number
    modified: number
    deleted: number
    total: number
  } {
    let added = 0
    let modified = 0
    let deleted = 0

    for (const change of this.changes.values()) {
      switch (change.type) {
        case 'add':
        case 'addDir':
          added++
          break
        case 'change':
          modified++
          break
        case 'unlink':
        case 'unlinkDir':
          deleted++
          break
      }
    }

    return { added, modified, deleted, total: this.changes.size }
  }
}

// ── Project File Index ────────────────────────────────────────────────────────

export interface FileIndex {
  root: string
  files: Set<string>
  directories: Set<string>
  lastUpdated: number
}

/**
 * Watcher that maintains a file index
 */
export class FileIndexWatcher {
  private watcher?: FileWatcher
  private root: string
  private files: Set<string> = new Set()
  private directories: Set<string> = new Set()
  private listeners: Array<(index: FileIndex) => void> = []

  constructor(root: string) {
    this.root = root
    this.scan()
  }

  /**
   * Scan and build initial index
   */
  private scan(): void {
    this.files.clear()
    this.directories.clear()
    this.scanDirectory(this.root)
  }

  private scanDirectory(dir: string): void {
    this.directories.add(relative(this.root, dir))

    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue

        const fullPath = resolve(dir, entry.name)
        const relPath = relative(this.root, fullPath)

        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            this.scanDirectory(fullPath)
          }
        } else {
          this.files.add(relPath)
        }
      }
    } catch {}
  }

  /**
   * Start watching for changes
   */
  start(): void {
    this.watcher = new FileWatcher({
      root: this.root,
      recursive: true,
      exclude: ['**/node_modules/**', '**/.git/**'],
    })

    this.watcher.on((event) => {
      switch (event.type) {
        case 'add':
          this.files.add(event.relativePath)
          break
        case 'unlink':
          this.files.delete(event.relativePath)
          break
        case 'addDir':
          this.directories.add(event.relativePath)
          break
        case 'unlinkDir':
          this.directories.delete(event.relativePath)
          break
      }

      this.notify()
    })

    this.watcher.start()
  }

  /**
   * Stop watching
   */
  stop(): void {
    this.watcher?.stop()
    this.watcher = undefined
  }

  /**
   * Get current index
   */
  getIndex(): FileIndex {
    return {
      root: this.root,
      files: new Set(this.files),
      directories: new Set(this.directories),
      lastUpdated: Date.now(),
    }
  }

  /**
   * Check if a file exists in the index
   */
  hasFile(path: string): boolean {
    return this.files.has(path)
  }

  /**
   * Subscribe to index changes
   */
  onUpdate(callback: (index: FileIndex) => void): void {
    this.listeners.push(callback)
  }

  /**
   * Unsubscribe
   */
  offUpdate(callback: (index: FileIndex) => void): void {
    const idx = this.listeners.indexOf(callback)
    if (idx >= 0) {
      this.listeners.splice(idx, 1)
    }
  }

  private notify(): void {
    const index = this.getIndex()
    for (const listener of this.listeners) {
      try {
        listener(index)
      } catch {}
    }
  }
}

// ── Debounced Watcher Helper ──────────────────────────────────────────────────

/**
 * Create a simple one-time or ongoing watch with callbacks
 */
export function watchDirectory(
  root: string,
  callbacks: {
    onAdd?: (path: string) => void
    onChange?: (path: string) => void
    onDelete?: (path: string) => void
  },
  options?: Partial<WatcherOptions>
): () => void {
  const watcher = new FileWatcher({
    root,
    ...options,
  })

  watcher.on((event) => {
    switch (event.type) {
      case 'add':
        callbacks.onAdd?.(event.relativePath)
        break
      case 'change':
        callbacks.onChange?.(event.relativePath)
        break
      case 'unlink':
        callbacks.onDelete?.(event.relativePath)
        break
    }
  })

  watcher.start()

  // Return stop function
  return () => watcher.stop()
}

export default {
  FileWatcher,
  FileChangeTracker,
  FileIndexWatcher,
  watchDirectory,
}
