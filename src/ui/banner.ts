// Beast CLI - Modern Clean Banner

import { s, fg, bold, reset } from './colors.ts'

// Clean 2-line modern logo (no image dependencies)
export function renderCleanBanner(): string {
  return `${fg.accent}
   ██████╗ ██╗     ███████╗██╗  ██╗
  ██╔════╝ ██║     ██╔════╝╚██╗██╔╝
  ██║  ███╗██║     █████╗   ╚███╔╝
  ██║   ██║██║     ██╔══╝   ██╔██╗
  ╚██████╔╝███████╗███████╗██╔╝ ██╗
   ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝${reset}

${s('AI Coding Agent', fg.muted)} ${s('·', fg.overlay)} ${s('45+ Providers', fg.muted)} ${s('·', fg.overlay)} ${s('39 Tools', fg.muted)} ${s('·', fg.overlay)} ${s('Local AI Ready', fg.muted)}`
}

// Single-line compact header
export function renderCompactBanner(): string {
  return `${s('🐉', fg.accent)} ${s('Beast CLI', fg.accent, bold)} ${s('v1.2.8', fg.muted)}`
}

// Fallback (never used, but kept for compatibility)
export function renderLionBanner(): string {
  return renderCleanBanner()
}

// Minimal logo for inline use
export function miniLogo(): string {
  return s('🐉', fg.accent)
}