// Native YouTube Tools
// Replaces YouTube MCP calls with direct YouTube API + Multiple Fallback Support

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeResult {
  success: boolean
  output: string
  error?: string
}

// ── Fallback Chain for YouTube Transcripts ────────────────────────────────────

// Fallback 1: RapidAPI YouTube Transcript API (if key available)
async function tryRapidApiFallback(videoId: string): Promise<YouTubeResult> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return { success: false, output: '', error: 'No API key' }

  try {
    const response = await fetch(
      `https://youtube-transcript-api1.p.rapidapi.com/api/transcript?video_id=${videoId}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'youtube-transcript-api1.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (response.ok) {
      const data = await response.json()
      if (data.transcript) {
        return { success: true, output: data.transcript }
      }
    }
    return { success: false, output: '', error: 'RapidAPI failed' }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

// Fallback 2: Python youtube-transcript-api (most reliable)
async function tryPythonTranscriptApi(videoId: string): Promise<YouTubeResult> {
  try {
    const { execSync } = await import('child_process')
    const { writeFileSync, unlinkSync } = await import('fs')
    const { tmpdir } = await import('os')
    const { join } = await import('path')

    // Check if youtube-transcript-api is installed
    try {
      execSync('python3 -c "from youtube_transcript_api import YouTubeTranscriptApi" 2>/dev/null', { stdio: 'ignore' })
    } catch {
      // Try to install it
      try {
        execSync('pip3 install youtube-transcript-api --quiet 2>/dev/null', { stdio: 'ignore' })
      } catch {
        return { success: false, output: '', error: 'youtube-transcript-api not installed' }
      }
    }

    // Write Python script to temp file to avoid escaping issues
    const scriptPath = join(tmpdir(), `yt_transcript_${Date.now()}.py`)
    const script = `
from youtube_transcript_api import YouTubeTranscriptApi
import sys

try:
    ytt = YouTubeTranscriptApi()
    transcript = ytt.fetch('${videoId}', languages=['en', 'en-US'])
    text = ' '.join([s.text for s in transcript])
    print(text[:15000])  # Limit to 15k chars
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
`
    writeFileSync(scriptPath, script)

    const output = execSync(`python3 "${scriptPath}"`, {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    })

    // Clean up temp file
    try { unlinkSync(scriptPath) } catch {}

    if (output && !output.includes('ERROR:') && output.length > 50) {
      return { success: true, output: output.trim() }
    }
    return { success: false, output: '', error: 'Python API returned empty transcript' }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

// Fallback 2: youtube-transcript-api (npm package pattern)
async function tryTranscriptionDotCom(videoId: string): Promise<YouTubeResult> {
  try {
    const response = await fetch(`https://youtubetranscript.com/?video=${videoId}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (response.ok) {
      const contentType = response.headers.get('content-type') || ''
      const text = await response.text()
      // Check if we got HTML instead of transcript
      if (text.includes('<html') || text.includes('<!DOCTYPE') || text.length < 100) {
        return { success: false, output: '', error: 'Service returned HTML, not transcript' }
      }
      if (text && text.length > 50 && !text.includes('<body')) {
        return { success: true, output: text.slice(0, 5000) }
      }
    }
    return { success: false, output: '', error: 'No transcript available' }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
  }
}

// Fallback 3: Try Invidious instances (privacy-friendly YouTube frontend)
async function tryInvidiousFallback(videoId: string): Promise<YouTubeResult> {
  // More reliable Invidious instances with transcripts endpoint
  const invidiousInstances = [
    { url: 'https://inv.nadeko.net/api/v1', name: 'Nadeko' },
    { url: 'https://yewtu.be', name: 'Yewtu' },
    { url: 'https://invidious.privacyredirect.com', name: 'PrivacyRedirect' },
    { url: 'https://iv.nboeck.de', name: 'Nboeck' },
    { url: 'https://invidious.lunar.icu', name: 'Lunar' },
  ]

  for (const instance of invidiousInstances) {
    try {
      // Try captions endpoint
      const response = await fetch(`${instance.url}/api/v1/captions/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.captions && data.captions.length > 0) {
          // Find English or auto-generated caption
          const enCaption = data.captions.find(
            (c: any) =>
              c.label?.toLowerCase().includes('english') ||
              c.label?.toLowerCase().includes('en') ||
              c.label?.toLowerCase().includes('auto')
          )
          const caption = enCaption || data.captions[0]

          // Try to download the caption
          if (caption.url) {
            const captionRes = await fetch(caption.url, {
              signal: AbortSignal.timeout(10000),
            })
            if (captionRes.ok) {
              const xml = await captionRes.text()
              const textMatches = xml.match(/<text[^>]*>([^<]+)<\/text>/g)
              if (textMatches) {
                const transcript = textMatches
                  .map((m) => {
                    const match = m.match(/<text[^>]*>([^<]+)<\/text>/)
                    return match ? match[1] : ''
                  })
                  .filter((t) => t.trim())
                  .join(' ')
                if (transcript.length > 50) {
                  return { success: true, output: transcript }
                }
              }
            }
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

    // Get subtitle directly using yt-dlp
    const output = execSync(
      `yt-dlp --skip-download --write-subs --write-auto-subs --sub-lang en --convert-subs=srt --print "%(autogen_subtitle)s" "${url}" 2>/dev/null || echo ""`,
      { encoding: 'utf-8', timeout: 20000 }
    )
    if (output && output.trim()) {
      return { success: true, output: output }
    }

    // Try alternative approach - get video info with subtitles
    const videoInfo = execSync(
      `yt-dlp --skip-download --write-subs --write-auto-subs --dump-json "${url}" 2>/dev/null | head -1`,
      { encoding: 'utf-8', timeout: 20000 }
    )
    if (videoInfo) {
      try {
        const info = JSON.parse(videoInfo)
        if (info.subtitles || info.automatic_chapters) {
          return {
            success: true,
            output: 'Video has subtitles available. Install yt-dlp GUI or use --write-subs flag manually to extract.',
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    return { success: false, output: '', error: 'yt-dlp could not extract subtitles' }
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

  // Order: Python API (most reliable) > RapidAPI > Invidious > yt-dlp
  const fallbacks: Array<() => Promise<YouTubeResult>> = [
    () => tryPythonTranscriptApi(videoId),
    () => tryRapidApiFallback(videoId),
    () => tryInvidiousFallback(videoId),
    () => tryTranscriptionDotCom(videoId),
    () => tryYtdlpFallback(url),
  ]

  const fallbackNames = [
    'Python API',
    'RapidAPI',
    'Invidious',
    'Transcription.com',
    'yt-dlp CLI',
  ]

  let lastError = ''

  for (let i = 0; i < fallbacks.length; i++) {
    const result = await fallbacks[i]()
    if (result.success && result.output.length > 50) {
      return result
    }
    lastError = result.error || 'Unknown error'
    console.log(`   [Fallback ${i + 1}/${fallbacks.length}] ${fallbackNames[i]} failed: ${lastError}`)
  }

  return {
    success: false,
    output: '',
    error: `All ${fallbacks.length} transcript methods failed. Last error: ${lastError}. This video may not have captions available.`,
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
