// Beast CLI - ASCII Art Banner Generator
// Renders the lion logo as ASCII art on startup

import { s, fg, reset } from './colors.ts'
import { execSync } from 'child_process'
import path from 'node:path'

const LION_IMAGE_PATH = path.join(process.cwd(), 'lion.png')

export function renderLionBanner(): string {
  try {
    // Use chafa to render the image as ANSI art
    const output = execSync(
      `chafa --colors=16 --stretch --size=72x26 "${LION_IMAGE_PATH}" 2>/dev/null`,
      { encoding: 'utf8', timeout: 5000 }
    )
    // Strip the terminal hide/show cursor escape sequences
    return output.replace(/\x1b\?25[hl]\n?/g, '').trim()
  } catch {
    // Fallback: simple text banner if chafa fails
    return fallbackBanner()
  }
}

function fallbackBanner(): string {
  return `${fg.accent}       ╱╲
      ╱  ╲
     ╱ ══ ╲
    ╱  ══  ╲
   ╱   ══   ╲
  ╱    ══    ╲
  ╲    ══    ╱
   ╲   ══   ╱
    ╲  ══  ╱
     ╲ ══ ╱
      ╲  ╱
       ╲╱${reset}`
}
