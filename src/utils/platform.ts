// Cross-platform utilities for Windows/macOS/Linux support
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

// Get home directory - works on all platforms
export function getHomeDir(): string {
  // Unix systems use HOME, Windows uses USERPROFILE
  if (process.platform === 'win32') {
    return process.env.USERPROFILE || homedir()
  }
  return process.env.HOME || homedir()
}

// Build a path relative to home directory - cross-platform
export function homePath(...parts: string[]): string {
  return join(getHomeDir(), ...parts)
}

// Resolve a path with home directory support
export function resolveHome(path: string): string {
  if (path.startsWith('~/') || path === '~') {
    return resolve(getHomeDir(), path.slice(1))
  }
  return path
}

// Platform detection shortcuts
export const isWindows = process.platform === 'win32'
export const isMac = process.platform === 'darwin'
export const isLinux = process.platform === 'linux'

// Get default config directory for this platform
export function getConfigDir(): string {
  if (isWindows) {
    return process.env.APPDATA || homePath('AppData', 'Roaming')
  }
  if (isMac) {
    return homePath('Library', 'Application Support')
  }
  // Linux - follow XDG spec
  return process.env.XDG_CONFIG_HOME || homePath('.config')
}

// Get default cache directory for this platform
export function getCacheDir(): string {
  if (isWindows) {
    return process.env.LOCALAPPDATA || homePath('AppData', 'Local')
  }
  if (isMac) {
    return homePath('Library', 'Caches')
  }
  // Linux - follow XDG spec
  return process.env.XDG_CACHE_HOME || homePath('.cache')
}

// Get default state directory for this platform
export function getStateDir(): string {
  if (isWindows) {
    return process.env.LOCALAPPDATA || homePath('AppData', 'Local')
  }
  if (isMac) {
    return homePath('Library', 'Application Support')
  }
  // Linux - follow XDG spec
  return process.env.XDG_STATE_HOME || homePath('.local', 'state')
}

// Cross-platform audio player command
export function getAudioPlayerArgs(filePath: string): { cmd: string; args: string[] } {
  if (isWindows) {
    // On Windows, use PowerShell to play audio
    // Convert to absolute Windows path
    const absPath = resolve(filePath)
    return {
      cmd: 'powershell',
      args: ['-Command', `(New-Object System.Media.SoundPlayer '${absPath.replace(/'/g, "''")}').PlaySync(); Start-Sleep -Milliseconds 100`]
    }
  }
  // Unix: use ffplay (part of ffmpeg)
  return {
    cmd: 'ffplay',
    args: ['-nodisp', '-autoexit', '-loglevel', 'quiet', filePath]
  }
}

// Check if we're running in a real terminal
export function isTTY(): boolean {
  return process.stdin.isTTY && process.stdout.isTTY
}
