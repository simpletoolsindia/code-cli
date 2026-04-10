/**
 * Markdown renderer with theme-aware output and syntax highlighting
 * Supports: headers, bold, italic, inline code, code blocks, lists, links
 */

import React, { memo, useMemo } from 'react'
import { Box, Text } from 'ink'
import type { ColorPalette } from './theme.ts'

interface MarkdownProps {
  content: string
  palette?: ColorPalette
}

interface CodeBlock {
  language?: string
  content: string
}

interface ParsedLine {
  type: 'text' | 'h1' | 'h2' | 'h3' | 'h4' | 'code' | 'list' | 'quote' | 'hr' | 'empty'
  content: string
  language?: string
  listLevel?: number
}

/**
 * Parse markdown into structured lines
 */
function parseMarkdown(content: string): ParsedLine[] {
  const lines = content.split('\n')
  const result: ParsedLine[] = []
  let inCodeBlock = false
  let codeLanguage = ''
  let codeContent: string[] = []

  for (const line of lines) {
    // Code block delimiter
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Start code block
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
        codeContent = []
      } else {
        // End code block
        result.push({
          type: 'code',
          content: codeContent.join('\n'),
          language: codeLanguage,
        })
        inCodeBlock = false
        codeLanguage = ''
        codeContent = []
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    // Headers
    if (line.startsWith('#### ')) {
      result.push({ type: 'h4', content: line.slice(5) })
    } else if (line.startsWith('### ')) {
      result.push({ type: 'h3', content: line.slice(4) })
    } else if (line.startsWith('## ')) {
      result.push({ type: 'h2', content: line.slice(3) })
    } else if (line.startsWith('# ')) {
      result.push({ type: 'h1', content: line.slice(2) })
    }
    // Horizontal rule
    else if (/^[-*_]{3,}$/.test(line.trim())) {
      result.push({ type: 'hr', content: '' })
    }
    // Block quote
    else if (line.startsWith('> ')) {
      result.push({ type: 'quote', content: line.slice(2) })
    }
    // List items
    else if (/^(\s*)[-*+]/.test(line) || /^\s*\d+\.\s/.test(line)) {
      const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/)
      if (match) {
        result.push({
          type: 'list',
          content: match[3] ?? '',
          listLevel: Math.floor((match[1]?.length ?? 0) / 2),
        })
      }
    }
    // Empty line
    else if (line.trim() === '') {
      result.push({ type: 'empty', content: '' })
    }
    // Regular text
    else {
      result.push({ type: 'text', content: line })
    }
  }

  return result
}

/**
 * Render inline markdown (bold, italic, code, links)
 */
function renderInline(text: string, palette: ColorPalette): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let remaining = text
  let key = 0

  // Split by markdown patterns while preserving order
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  const parts = remaining.split(pattern)

  for (const part of parts) {
    if (!part) continue

    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold
      elements.push(<Text bold key={key++}>{part.slice(2, -2)}</Text>)
    } else if (part.startsWith('*') && part.endsWith('*')) {
      // Italic
      elements.push(<Text italic key={key++}>{part.slice(1, -1)}</Text>)
    } else if (part.startsWith('`') && part.endsWith('`')) {
      // Inline code
      elements.push(
        <Text key={key++} color={palette.cyan} dim>
          {part.slice(1, -1)}
        </Text>
      )
    } else if (part.startsWith('[') && part.includes('](')) {
      // Link: [text](url) → show text only
      const match = part.match(/\[([^\]]+)\]\([^)]+\)/)
      if (match) {
        elements.push(
          <Text key={key++} color={palette.accent} underline>
            {match[1]}
          </Text>
        )
      }
    } else {
      // Plain text
      elements.push(<Text key={key++}>{part}</Text>)
    }
  }

  return elements.length > 0 ? elements : [<Text key={0}>{text}</Text>]
}

/**
 * Syntax highlighting for code blocks (basic keyword detection)
 */
function highlightCode(code: string, language: string | undefined, palette: ColorPalette): React.ReactNode[] {
  const keywords: Record<string, string[]> = {
    js: ['const', 'let', 'var', 'function', 'return', 'async', 'await', 'import', 'export', 'class', 'new', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof'],
    ts: ['const', 'let', 'var', 'function', 'return', 'async', 'await', 'import', 'export', 'class', 'new', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'interface', 'type', 'enum', 'implements', 'extends', 'public', 'private', 'protected', 'readonly', 'abstract'],
    python: ['def', 'class', 'return', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'yield', 'async', 'await'],
    bash: ['if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac', 'function', 'return', 'exit', 'echo', 'export', 'local', 'readonly', 'shift', 'source'],
    sql: ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'IN', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'INDEX', 'DROP', 'ALTER', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN'],
    go: ['func', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'go', 'defer', 'chan', 'map', 'struct', 'interface', 'package', 'import', 'type', 'var', 'const', 'true', 'false', 'nil', 'make', 'new', 'append', 'len', 'cap'],
  }

  const stringChars = ['"', "'", '`']
  const lang = (language ?? '').toLowerCase()
  const langKeywords = keywords[lang] ?? keywords.js ?? []

  const lines = code.split('\n')
  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = []
    let remaining = line
    let col = 0
    let tokenKey = lineIdx * 100

    while (remaining.length > 0) {
      // String
      const stringChar = stringChars.find(c => remaining.startsWith(c))
      if (stringChar) {
        const endIdx = remaining.slice(1).indexOf(stringChar)
        if (endIdx >= 0) {
          tokens.push(
            <Text key={tokenKey++} color={palette.success}>
              {stringChar}{remaining.slice(1, endIdx + 1)}{stringChar}
            </Text>
          )
          remaining = remaining.slice(endIdx + 2)
          continue
        }
      }

      // Word (check for keyword)
      const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)
      if (wordMatch) {
        const word = wordMatch[0]
        const isKeyword = langKeywords.some(kw =>
          kw.toLowerCase() === word.toLowerCase()
        )

        if (isKeyword) {
          tokens.push(<Text key={tokenKey++} color={palette.purple} bold>{word}</Text>)
        } else if (/^[A-Z_][A-Z0-9_]*$/.test(word)) {
          // CONSTANT or TypeName
          tokens.push(<Text key={tokenKey++} color={palette.cyan}>{word}</Text>)
        } else if (/^\d+$/.test(word)) {
          // Number
          tokens.push(<Text key={tokenKey++} color={palette.warning}>{word}</Text>)
        } else {
          tokens.push(<Text key={tokenKey++}>{word}</Text>)
        }
        remaining = remaining.slice(word.length)
        continue
      }

      // Single character (punctuation, whitespace)
      tokens.push(<Text key={tokenKey++}>{remaining[0]}</Text>)
      remaining = remaining.slice(1)
    }

    return (
      <Text key={lineIdx}>
        {tokens.length > 0 ? tokens : <Text> </Text>}
        {'\n'}
      </Text>
    )
  })
}

/**
 * Render markdown content as React nodes with theme-aware colors
 */
export function renderMarkdown(content: string, palette: ColorPalette): React.ReactNode[] {
  const parsed = parseMarkdown(content)
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of parsed) {
    switch (line.type) {
      case 'h1':
        elements.push(
          <Text key={key++} bold color={palette.accent} wrap="wrap">
            {line.content}
          </Text>
        )
        break
      case 'h2':
        elements.push(
          <Text key={key++} bold color={palette.text} wrap="wrap">
            {line.content}
          </Text>
        )
        break
      case 'h3':
        elements.push(
          <Text key={key++} bold color={palette.text} dimColor wrap="wrap">
            {line.content}
          </Text>
        )
        break
      case 'h4':
        elements.push(
          <Text key={key++} bold color={palette.muted} wrap="wrap">
            {line.content}
          </Text>
        )
        break
      case 'hr':
        elements.push(
          <Text key={key++} color={palette.border}>
            {'─'.repeat(50)}
          </Text>
        )
        break
      case 'quote':
        elements.push(
          <Box key={key++} marginLeft={2} borderColor={palette.muted} borderStyle="round" paddingX={1}>
            <Text italic color={palette.muted}>{renderInline(line.content, palette)}</Text>
          </Box>
        )
        break
      case 'list':
        elements.push(
          <Box key={key++} marginLeft={(line.listLevel ?? 0) * 2}>
            <Text color={palette.accent}>• </Text>
            <Text color={palette.text}>{renderInline(line.content, palette)}</Text>
          </Box>
        )
        break
      case 'code':
        elements.push(
          <Box
            key={key++}
            backgroundColor={palette.surface}
            borderStyle="round"
            borderColor={palette.border}
            paddingX={1}
            paddingY={0}
            marginY={1}
          >
            <Box flexDirection="column">
              {line.language && (
                <Text color={palette.muted} dim>
                  {line.language}
                </Text>
              )}
              <Text color={palette.text} wrap="wrap">
                {highlightCode(line.content, line.language, palette)}
              </Text>
            </Box>
          </Box>
        )
        break
      case 'empty':
        elements.push(<Box key={key++} height={0} />)
        break
      default:
        elements.push(
          <Text key={key++} color={palette.text} wrap="wrap">
            {renderInline(line.content, palette)}
          </Text>
        )
    }
  }

  return elements
}

// ─── Markdown component ─────────────────────────────────────────────────────

export const Markdown: React.FC<MarkdownProps> = ({ content, palette }) => {
  // Use dark theme palette if none provided
  const defaultPalette = {
    bg: '#0a0a0f',
    surface: '#12121a',
    border: '#2a2a3a',
    text: '#e4e4e7',
    muted: '#71717a',
    accent: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    purple: '#a855f7',
    cyan: '#06b6d4',
    pink: '#ec4899',
    user: '#a78bfa',
  }
  const c = palette ?? defaultPalette

  return (
    <Box flexDirection="column">
      {renderMarkdown(content, c as any)}
    </Box>
  )
}

export default Markdown
