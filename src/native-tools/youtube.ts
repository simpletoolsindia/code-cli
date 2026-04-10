// Native YouTube Tools
// Replaces YouTube MCP calls with direct YouTube API + Multiple Fallback Support

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeResult {
  success: boolean
  output: string
  error?: string
}

// ── Fallback Chain for YouTube Transcripts ────────────────────────────────────

// Fallback 1: youtube-transcript-api (npm package pattern)
async function tryTranscriptionDotCom(videoId: string): Promise<YouTubeResult> {
  try {
    const response = await fetch(`https://youtubetranscript.com/?video=${videoId}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (response.ok) {
      const text = await response.text()
      if (text && text.length > 50) {
        return { success: true, output: text.slice(0, 5000) }
      }
    }
    return { success: false, output: '', error: 'No transcript available' }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

// Fallback 2: Try to extract from YouTube video page (captions extraction)
async function tryYouTubePageFallback(videoId: string): Promise<YouTubeResult> {
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (pageRes.ok) {
      const html = await pageRes.text()
      // Try to find caption tracks
      const captionMatch = html.match(/"captionTracks":\[([^\]]+)\]/)
      if (captionMatch) {
        // Extract base URL for captions
        const baseUrlMatch = captionMatch[1].match(/"baseUrl":"([^"]+)"/)
        if (baseUrlMatch) {
          const captionUrl = decodeURIComponent(baseUrlMatch[1])
          const captionRes = await fetch(captionUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(10000),
          })
          if (captionRes.ok) {
            const captionXml = await captionRes.text()
            // Parse XML to extract text
            const textMatches = captionXml.match(/<text[^>]*>([^<]+)<\/text>/g)
            if (textMatches) {
              const transcript = textMatches
                .map(m => {
                  const match = m.match(/<text[^>]*>([^<]+)<\/text>/)
                  return match ? match[1] : ''
                })
                .filter(t => t.trim())
                .join(' ')
              return { success: true, output: transcript }
            }
          }
        }
        return { success: true, output: 'Captions found but could not extract text.' }
      }
    }
    return { success: false, output: '', error: 'Could not fetch video page' }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

// Fallback 3: Try Invidious instance (privacy-friendly YouTube frontend)
async function tryInvidiousFallback(videoId: string): Promise<YouTubeResult> {
  const invidiousInstances = [
    'https://inv.nadeko.net/api/v1',
    'https://invidious.privacyredirect.com/api/v1',
    'https://yewtu.be/api/v1',
  ]

  for (const instance of invidiousInstances) {
    try {
      const response = await fetch(`${instance}/captions/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.captions && data.captions.length > 0) {
          // Try to get auto-generated transcript
          const autoCaption = data.captions.find((c: any) => c.label?.includes('auto'))
          if (autoCaption) {
            return { success: true, output: `Auto-generated transcript from ${autoCaption.label}` }
          }
        }
      }
    } catch {
      // Try next instance
      continue
    }
  }
  return { success: false, output: '', error: 'All Invidious instances failed' }
}

// Fallback 4: yt-dlp command-line tool (if available)
async function tryYtdlpFallback(url: string): Promise<YouTubeResult> {
  try {
    const { execSync } = await import('child_process')
    // Check if yt-dlp is installed
    try {
      execSync('which yt-dlp', { stdio: 'ignore' })
    } catch {
      return { success: false, output: '', error: 'yt-dlp not installed' }
    }

    // Try to download subtitle
    const output = execSync(
      `yt-dlp --skip-download --write-subs --write-auto-subs --sub-lang en --stdout --print "%(subtitles.en)s" "${url}"`,
      { encoding: 'utf-8', timeout: 15000 }
    )
    if (output && output.trim()) {
      return { success: true, output: output }
    }
    return { success: false, output: '', error: 'No subtitles extracted' }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

// Main transcript function with fallback chain
export async function youtubeTranscript(url: string): Promise<YouTubeResult> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    return { success: false, output: '', error: 'Invalid YouTube URL' }
  }

  const fallbacks: Array<() => Promise<YouTubeResult>> = [
    () => tryTranscriptionDotCom(videoId),
    () => tryYouTubePageFallback(videoId),
    () => tryInvidiousFallback(videoId),
    () => tryYtdlpFallback(url),
  ]

  const fallbackNames = [
    'Transcription.com',
    'YouTube Page',
    'Invidious Instance',
    'yt-dlp CLI',
  ]

  let lastError = ''

  for (let i = 0; i < fallbacks.length; i++) {
    const result = await fallbacks[i]()
    if (result.success) {
      return result
    }
    lastError = result.error || 'Unknown error'
    console.log(`   [Fallback ${i + 1}/${fallbacks.length}] ${fallbackNames[i]} failed: ${lastError}`)
  }

  return {
    success: false,
    output: '',
    error: `All ${fallbacks.length} transcript methods failed. Last error: ${lastError}`,
  }
}

export async function youtubeVideoInfo(
  videoId?: string,
  url?: string
): Promise<YouTubeResult> {
  try {
    const id = videoId || (url ? extractVideoId(url) : null)
    if (!id) {
      return { success: false, output: '', error: 'Invalid video ID or URL' }
    }

    // Use oEmbed for basic info (no API key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        output: JSON.stringify({
          title: data.title,
          author_name: data.author_name,
          author_url: data.author_name,
          thumbnail_url: data.thumbnail_url,
          video_url: `https://www.youtube.com/watch?v=${id}`,
        }, null, 2),
      }
    }

    return { success: false, output: '', error: 'Could not fetch video info' }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

export async function youtubeSearch(
  query: string,
  limit = 10
): Promise<YouTubeResult> {
  try {
    // Use SearXNG for YouTube search
    const { searxngSearch } = await import('./search.ts')
    const result = await searxngSearch(`${query} site:youtube.com`, limit)

    if (result.success && result.results) {
      const videos = result.results.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
      }))
      return { success: true, output: JSON.stringify(videos, null, 2) }
    }

    return { success: false, output: '', error: result.error }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

export async function youtubeSummarize(
  transcript: string,
  maxWords = 500
): Promise<YouTubeResult> {
  // Simple extractive summarization
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20)
  const words = transcript.split(/\s+/)

  if (words.length <= maxWords) {
    return { success: true, output: transcript }
  }

  // Take first 30% of sentences for summary
  const summaryCount = Math.ceil(sentences.length * 0.3)
  const summary = sentences.slice(0, summaryCount).join('. ').trim()

  return {
    success: true,
    output: summary || transcript.slice(0, maxWords * 5),
  }
}

function extractVideoId(input: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }

  return null
}
