// Beast CLI - Text-to-Speech Module
// Uses Microsoft Edge TTS (free, high quality, streaming support)

import { Communicate } from 'edge-tts-universal'
import { spawn } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TTSOptions {
  voice?: string
  speed?: string
  pitch?: string
  outputFormat?: string
}

export interface TTSVoice {
  ShortName: string
  FriendlyName: string
  Locale: string
  Gender: string
}

export const DEFAULT_VOICE = 'en-US-AriaNeural'
export const DEFAULT_SPEED = '+0%'
export const DEFAULT_PITCH = '+0Hz'
export const DEFAULT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3'

// ── List available English voices ─────────────────────────────────────────────

export async function listVoices(): Promise<TTSVoice[]> {
  const { listVoicesUniversal } = await import('edge-tts-universal')
  const voices = await listVoicesUniversal()
  return voices.filter((v: any) => v.Locale.startsWith('en-')) as TTSVoice[]
}

// ── Generate audio buffer from text ──────────────────────────────────────────

export async function generateAudio(text: string, options: TTSOptions = {}): Promise<Buffer> {
  const voice = options.voice || DEFAULT_VOICE
  const speed = options.speed || DEFAULT_SPEED
  const pitch = options.pitch || DEFAULT_PITCH
  const outputFormat = options.outputFormat || DEFAULT_FORMAT

  const communicate = new Communicate(text, { voice, speed, pitch }, { outputFormat })
  const chunks: Buffer[] = []

  for await (const chunk of communicate.stream()) {
    if (chunk.type === 'audio') chunks.push(chunk.data)
  }

  return Buffer.concat(chunks)
}

// ── Speak text aloud ──────────────────────────────────────────────────────────

export async function speak(text: string, options: TTSOptions = {}): Promise<void> {
  const audioBuffer = await generateAudio(text, options)
  const tempFile = join(tmpdir(), `beast-tts-${Date.now()}.mp3`)

  try {
    writeFileSync(tempFile, audioBuffer)
    await playAudioFile(tempFile)
  } finally {
    try { unlinkSync(tempFile) } catch {}
  }
}

// ── Play audio file ────────────────────────────────────────────────────────────

export async function playAudioFile(filePath: string): Promise<void> {
  return new Promise((resolve) => {
    const player = spawn('ffplay', [
      '-nodisp', '-autoexit', '-loglevel', 'quiet', filePath,
    ], { stdio: 'ignore' })
    player.on('close', () => resolve())
    player.on('error', () => resolve())
  })
}

// ── Config helpers ─────────────────────────────────────────────────────────────

export interface TTSConfig {
  enabled?: boolean
  defaultVoice?: string
  autoPlay?: boolean
}

export function loadTTSConfig(): TTSConfig {
  try {
    const { existsSync, readFileSync } = require('node:fs')
    const path = join(process.env.HOME || '', '.beast-cli', 'tts.json')
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {}
  return { enabled: false, defaultVoice: DEFAULT_VOICE, autoPlay: true }
}

export function saveTTSConfig(config: TTSConfig): void {
  try {
    const { existsSync, mkdirSync, writeFileSync } = require('node:fs')
    const dir = join(process.env.HOME || '', '.beast-cli')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'tts.json'), JSON.stringify(config, null, 2))
  } catch {}
}