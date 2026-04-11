// Beast CLI - Clean Banner System
// Inspired by Gemini CLI: minimal, professional, responsive ASCII art

import { s, fg, bold, dim, reset, isColorEnabled } from './colors.ts'

// Get terminal width safely
function termWidth(): number {
  try {
    return process.stdout.columns || 80
  } catch {
    return 80
  }
}

// ── Google Purple accent for branding ──────────────────────────────────────
const googlePurple = '\x1b[38;2;142;54;255m'
const googleBlue = '\x1b[38;2;70;130;255m'

// ── Full ASCII Logo (for wide terminals >= 60 cols) ──────────────────────────
const FULL_LOGO =
  `\n ${googlePurple}+==================================================================+${reset}` +
  `\n ${googlePurple}|${reset}  🐉  ${s('BEAST', googlePurple, bold)}   ${s('CLI', googleBlue, bold)}    ${dim}AI Coding Agent · 45+ Providers · 51+ Tools     ${googlePurple}|${reset}` +
  `\n ${googlePurple}+==================================================================+${reset}\n`

const COMPACT_LOGO =
  `\n ${googlePurple}+----------------------------------------------+${reset}` +
  `\n ${googlePurple}|${reset}  🐉  ${s('BEAST', googlePurple, bold)}  ${s('CLI', googleBlue, bold)}  ${dim}AI Coding Agent                  ${googlePurple}|${reset}` +
  `\n ${googlePurple}+----------------------------------------------+${reset}\n`

const TINY_LOGO = ` 🐉 ${s('BEAST CLI', googlePurple, bold)} ${dim}~ \n`

// ── Clean Text Logo (no box, just text — fallback) ──────────────────────────
const googlePurple2 = '\x1b[38;2;142;54;255m'
const googleBlue2 = '\x1b[38;2;70;130;255m'
const TEXT_LOGO = ` ${s('BEAST', googlePurple2, bold)} ${s('CLI', googleBlue2, bold)} `

// ── Polished Feature Highlights ─────────────────────────────────────────────
const FEATURE_CARDS = [
  { label: 'Blazing Fast', color: fg.warning },
  { label: 'Private & Local', color: fg.success },
  { label: '45+ Providers', color: fg.sapphire },
  { label: '51+ Tools', color: fg.tool },
]

// Staggered reveal tagline for wide terminals
const REVEAL_TAGLINE =
  `${s('·', fg.overlay)} ${s('45+ Providers', fg.muted)} ` +
  `${s('·', fg.overlay)} ${s('51+ Tools', fg.muted)} ` +
  `${s('·', fg.overlay)} ${s('Local AI Ready', fg.muted)}`

// ── Polished Banner (with feature reveal) ────────────────────────────────────
export function renderCleanBanner(): string {
  if (!isColorEnabled()) return 'BEAST CLI - AI Coding Agent'

  const width = termWidth()

  let logo: string
  if (width >= 60) {
    logo = FULL_LOGO
  } else if (width >= 40) {
    logo = COMPACT_LOGO
  } else {
    logo = TINY_LOGO
  }

  if (width < 50) {
    return logo
  }

  // Polished reveal: tagline + feature cards with spacing
  const tagline = REVEAL_TAGLINE + '\n'

  // Feature highlights strip (like polpo.sh card layout)
  const cardSep = '  '
  const cardLines = FEATURE_CARDS.map(card => {
    return s(card.label, card.color)
  }).join(s(cardSep, fg.overlay))

  return logo + tagline + '\n' + cardLines + '\n'
}

// ── Polished Session Banner ──────────────────────────────────────────────────
export function renderSessionBanner(provider: string, model: string, toolsCount: number): string {
  if (!isColorEnabled()) {
    return `BEAST CLI | ${provider} | ${model} | ${toolsCount} tools`
  }

  const gpP = '\x1b[38;2;142;54;255m'
  const gpB = '\x1b[38;2;70;130;255m'

  // Polished: gradient-style separators with smooth visual hierarchy
  const sep = s('·', fg.overlay)
  const parts = [
    s('🐉', gpP),
    s('BEAST', gpP, bold),
    s('CLI', gpB, bold),
    sep,
    s(provider, fg.green),
    sep,
    s(model, fg.sapphire),
    sep,
    s(`${toolsCount} tools`, fg.tool),
  ]

  return '\n' + parts.join('') + '\n'
}

// ── Polished Compact Banner ──────────────────────────────────────────────────
export function renderCompactBanner(): string {
  if (!isColorEnabled()) return 'BEAST CLI'
  return TEXT_LOGO
}

// ── Polished Minimal Logo ───────────────────────────────────────────────────
export function miniLogo(): string {
  if (!isColorEnabled()) return 'BEAST'
  return s('BEAST', fg.accent, bold)
}

// ── Polished Fallback ───────────────────────────────────────────────────────
export function renderLionBanner(): string {
  return renderCleanBanner()
}

// ── Tool-specific Progress Banners ─────────────────────────────────────────────

function toolBox(topChar: string, bottomChar: string, labelColor: string, content: string): string {
  const innerWidth = Math.min(content.length + 6, 55)
  const padded = content + ' '.repeat(Math.max(0, innerWidth - content.length - 3))
  return [
    ` ${labelColor}${topChar}${'─'.repeat(innerWidth)}${labelColor}${topChar === '┌' ? '┐' : topChar}${reset}`,
    ` ${labelColor}${topChar === '┌' ? '│' : '│'}${reset} ${padded} ${labelColor}${topChar === '┌' ? '│' : '│'}${reset}`,
    ` ${labelColor}${bottomChar}${'─'.repeat(innerWidth)}${bottomChar}${bottomChar === '└' ? '┘' : bottomChar}${reset}`,
  ].join('\n')
}

export function renderFileReadBanner(filename: string): string {
  const short = filename.length > 40 ? filename.slice(0, 37) + '...' : filename
  const gpBlue = fg.sapphire
  return toolBox('┌', '└', gpBlue, `${s('▷', gpBlue)} Reading: ${s(short, fg.secondary)}`)
}

export function renderFileWriteBanner(filename: string): string {
  const short = filename.length > 40 ? filename.slice(0, 37) + '...' : filename
  const gpYellow = fg.warning
  return toolBox('┌', '└', gpYellow, `${s('✎', gpYellow)} Writing: ${s(short, fg.secondary)}`)
}

export function renderFileCopyBanner(src: string, dst: string): string {
  const sSrc = src.length > 25 ? src.slice(0, 22) + '...' : src
  const sDst = dst.length > 25 ? dst.slice(0, 22) + '...' : dst
  const gpMauve = fg.mauve
  const barWidth = 55
  return [
    ` ${gpMauve}┌${'─'.repeat(barWidth)}┐${reset}`,
    ` ${gpMauve}│${reset} ${s('▣', gpMauve)} Copy: ${s(sSrc, fg.secondary)}`,
    ` ${gpMauve}│${reset}   → ${s(sDst, fg.secondary)}`,
    ` ${gpMauve}└${'─'.repeat(barWidth)}┘${reset}`,
  ].join('\n')
}

export function renderLLMBanner(model: string, provider: string): string {
  const gpPurple = '\x1b[38;2;142;54;255m'
  return toolBox('┌', '└', gpPurple, `${s('◐', fg.accent)} ${model} ${s('@', fg.muted)} ${s(provider, fg.secondary)}`)
}

export function renderSearchBanner(query: string): string {
  const short = query.length > 40 ? query.slice(0, 37) + '...' : query
  const gpBlue = fg.blue
  return toolBox('┌', '└', gpBlue, `${s('⌕', gpBlue)} Search: ${s(short, fg.secondary)}`)
}

export function renderToolBanner(toolName: string): string {
  const short = toolName.length > 40 ? toolName.slice(0, 37) + '...' : toolName
  const gpPeach = fg.tool
  return toolBox('┌', '└', gpPeach, `${s('›', gpPeach)} ${s(short, fg.secondary)}`)
}

export function renderWebFetchBanner(url: string): string {
  const short = url.length > 40 ? url.slice(0, 37) + '...' : url
  const gpTeal = fg.teal
  return toolBox('┌', '└', gpTeal, `${s('◎', gpTeal)} Fetch: ${s(short, fg.secondary)}`)
}

export function renderCodeRunBanner(language: string): string {
  const gpGreen = fg.success
  return toolBox('┌', '└', gpGreen, `${s('⚡', gpGreen)} Run ${s(language, fg.secondary)} code`)
}

// ── Animated Welcome ────────────────────────────────────────────────────────────

export function renderAnimatedWelcome(provider: string, model: string, toolsCount: number): string {
  if (!isColorEnabled()) {
    return `\nBEAST CLI | ${provider} | ${model} | ${toolsCount} tools\n`
  }
  const gpPurple = '\x1b[38;2;142;54;255m'
  const gpBlue = '\x1b[38;2;70;130;255m'
  const sep = s('·', fg.overlay)
  const info = [
    s('🐉', gpPurple),
    s('BEAST', gpPurple, bold),
    s('CLI', gpBlue, bold),
    sep,
    s(provider, fg.green),
    sep,
    s(model, fg.sapphire),
    sep,
    s(`${toolsCount} tools`, fg.tool),
  ]
  return '\n' + info.join('') + '\n'
}
