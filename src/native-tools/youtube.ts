// Native YouTube Tools
// Replaces YouTube MCP calls with direct YouTube API

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeResult {
  success: boolean
  output: string
  error?: string
}

// YouTube Data API v3 requires a key, but we can use oEmbed/embed as fallback
export async function youtubeTranscript(
  url: string
): Promise<YouTubeResult> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      return { success: false, output: '', error: 'Invalid YouTube URL' }
    }

    // Try to get subtitles via youtube-transcript-api pattern
    // This is a heuristic - YouTube doesn't have a public API for transcripts
    const transcriptUrl = `https://youtubetranscript.com/?video=${videoId}`
    const response = await fetch(transcriptUrl, {
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const text = await response.text()
      return {
        success: true,
        output: text.slice(0, 5000),
      }
    }

    // Fallback: fetch video page and try to extract
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (pageRes.ok) {
      const html = await pageRes.text()
      const captionMatch = html.match(/"captionTracks":\[([^\]]+)\]/)
      if (captionMatch) {
        return { success: true, output: 'Captions available. Use youtube_video_info for details.' }
      }
    }

    return {
      success: false,
      output: '',
      error: 'Transcript not available. Video may not have captions.',
    }
  } catch (e: any) {
    return { success: false, output: '', error: e.message }
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
