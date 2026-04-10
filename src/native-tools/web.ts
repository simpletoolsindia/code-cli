// Native Web Fetching Tools
// Replaces MCP server calls with local implementations

import { execSync } from 'node:child_process'

const DEFAULT_TIMEOUT = 15000
const isWindows = process.platform === 'win32'

export interface FetchResult {
  success: boolean
  content: string
  title?: string
  url?: string
  error?: string
}

// Windows using curl (built into Windows 10+)
async function fetchWithCurl(url: string, timeout: number): Promise<FetchResult> {
  try {
    // Use curl on Windows - it handles SSL certs better via Windows cert store
    const html = execSync(
      `curl -sL --max-time ${timeout} -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', timeout: (timeout + 5) * 1000, shell: 'cmd.exe' }
    )
    const text = stripHtml(html)
    const title = extractTitle(html)

    return {
      success: true,
      content: text.slice(0, 16000),
      title,
      url,
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export async function fetchWebContent(url: string, maxTokens = 4000): Promise<FetchResult> {
  // On Windows, prefer curl for better SSL handling
  if (isWindows) {
    const result = await fetchWithCurl(url, 15)
    if (result.success && result.content.length > 0) {
      return { ...result, content: result.content.slice(0, maxTokens * 4) }
    }
    // If curl failed, try native fetch as fallback
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BeastCLI/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return { success: false, content: '', error: `HTTP ${response.status}` }
    }

    const html = await response.text()
    const text = stripHtml(html)
    const title = extractTitle(html)
    const truncated = text.slice(0, maxTokens * 4)

    return {
      success: true,
      content: truncated,
      title,
      url: response.url,
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export async function quickFetch(url: string): Promise<FetchResult> {
  const result = await fetchWebContent(url, 1500)
  if (result.success && result.content) {
    // Return only first paragraph/summary
    const lines = result.content.split('\n').filter(l => l.trim().length > 30)
    return { ...result, content: lines.slice(0, 3).join('\n\n') }
  }
  return result
}

export async function fetchStructured(
  url: string,
  extractionType: 'article' | 'product' | 'table' | 'links',
  maxTokens = 2000
): Promise<FetchResult> {
  const result = await fetchWebContent(url, maxTokens)
  if (!result.success) return result

  switch (extractionType) {
    case 'article':
      return extractArticle(result.content, url)
    case 'product':
      return extractProduct(result.content, url)
    case 'table':
      return extractTable(result.content)
    case 'links':
      return extractLinks(result.content, url)
    default:
      return result
  }
}

export async function fetchWithSelectors(
  url: string,
  selectors: Record<string, string>,
  maxTokens = 2000
): Promise<FetchResult> {
  const result = await fetchWebContent(url, maxTokens)
  if (!result.success) return result

  // Simple CSS selector simulation for common patterns
  const extracted: Record<string, string> = {}
  for (const [field, selector] of Object.entries(selectors)) {
    if (selector.includes('title')) extracted[field] = result.title ?? ''
    if (selector.includes('price')) {
      const priceMatch = result.content.match(/[\₹$]?[\d,]+\.?\d*/)
      if (priceMatch) extracted[field] = priceMatch[0]
    }
    if (selector.includes('description') || selector.includes('content')) {
      extracted[field] = result.content.slice(0, 500)
    }
  }

  return {
    success: true,
    content: JSON.stringify(extracted, null, 2),
    url,
  }
}

export async function scrapeFreedium(url: string, maxTokens = 4000): Promise<FetchResult> {
  // Freedium adds ?outputType=amp to Medium URLs
  const freediumUrl = url.includes('freedium.cfd') ? url : `https://freedium.cfd/${url}`
  const result = await fetchWebContent(freediumUrl, maxTokens)
  if (!result.success) return result

  return {
    success: true,
    content: result.content,
    title: result.title,
    url: freediumUrl,
  }
}

export async function webclawExtractArticle(url: string): Promise<FetchResult> {
  return fetchWebContent(url, 4000)
}

export async function webclawExtractProduct(url: string): Promise<FetchResult> {
  const result = await fetchWebContent(url, 2000)
  if (!result.success) return result

  // Extract common product fields
  const product: Record<string, string> = {}

  const titleMatch = result.content.match(/<title>([^<]+)<\/title>/i)
  if (titleMatch) product.title = titleMatch[1]

  const priceMatch = result.content.match(/price["\s:>]+["\s]*([₹$]?[\d,]+\.?\d*)/i)
  if (priceMatch) product.price = priceMatch[1]

  const descMatch = result.content.match(/description["\s:>]+["']([^"']+)["']/i)
  if (descMatch) product.description = descMatch[1]

  return {
    success: true,
    content: JSON.stringify(product, null, 2),
    url,
  }
}

export async function webclawCrawl(url: string, selectors?: Record<string, string>): Promise<FetchResult> {
  // If no selectors provided, just fetch the page content
  if (!selectors || Object.keys(selectors).length === 0) {
    return fetchWebContent(url, 4000)
  }
  return fetchWithSelectors(url, selectors)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? match[1].trim() : ''
}

function extractArticle(content: string, url: string): FetchResult {
  const paragraphs = content.split('\n\n').filter(p => p.length > 100)
  return {
    success: true,
    content: paragraphs.slice(0, 5).join('\n\n'),
    url,
  }
}

function extractProduct(content: string, url: string): FetchResult {
  const product: Record<string, string> = {}
  const lines = content.split('\n').filter(l => l.trim())

  for (const line of lines.slice(0, 20)) {
    if (line.includes(':')) {
      const [key, ...vals] = line.split(':')
      if (key && vals.length) product[key.trim()] = vals.join(':').trim().slice(0, 200)
    }
  }

  return {
    success: true,
    content: JSON.stringify(product, null, 2),
    url,
  }
}

function extractTable(content: string): FetchResult {
  const lines = content.split('\n').filter(l => l.includes('|'))
  return {
    success: true,
    content: lines.join('\n'),
  }
}

function extractLinks(content: string, baseUrl: string): FetchResult {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const links: { text: string; url: string }[] = []
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2] })
  }

  return {
    success: true,
    content: JSON.stringify(links.slice(0, 20), null, 2),
    url: baseUrl,
  }
}
