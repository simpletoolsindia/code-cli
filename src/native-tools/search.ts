// Native Search Tools
// Replaces SearXNG search MCP calls with local implementations

// Use local SearXNG instance for search (configured in CLAUDE.md)
const SEARX_URL = process.env.SEARX_URL || 'https://search.sridharhomelab.in'

export interface SearchResult {
  success: boolean
  results?: SearchResultItem[]
  error?: string
}

export interface SearchResultItem {
  title: string
  url: string
  snippet: string
  engine?: string
  published?: string
}

export async function searxngSearch(
  query: string,
  limit = 10,
  categories?: string,
  engines?: string[],
  timeRange?: string
): Promise<SearchResult> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      engines: engines?.join(',') || '',
      categories: categories || 'general',
      pageno: '1',
      ...(timeRange ? { time_range: timeRange } : {}),
    })

    const response = await fetch(`${SEARX_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'BeastCLI/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return { success: false, error: `Search failed: ${response.status}` }
    }

    const data = await response.json()
    const results: SearchResultItem[] = []

    for (const r of (data.results || []).slice(0, limit)) {
      results.push({
        title: r.title || '',
        url: r.url || r.link || '',
        snippet: r.content || r.snippet || '',
        engine: r.engine || '',
        published: r.published || '',
      })
    }

    return { success: true, results }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function searchImages(
  query: string,
  limit = 10
): Promise<SearchResult> {
  return searxngSearch(query, limit, 'images')
}

export async function searchNews(
  query: string,
  timeRange?: 'day' | 'week' | 'month' | 'year'
): Promise<SearchResult> {
  return searxngSearch(query, 10, 'news', undefined, timeRange)
}

export async function searxngHealth(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${SEARX_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    return { success: response.ok }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function hackernewsTop(limit = 10): Promise<SearchResult> {
  return hackernewsFetch('topstories', limit)
}

export async function hackernewsNew(limit = 10): Promise<SearchResult> {
  return hackernewsFetch('newstories', limit)
}

export async function hackernewsBest(limit = 10): Promise<SearchResult> {
  return hackernewsFetch('beststories', limit)
}

export async function hackernewsComments(
  storyId: number,
  limit = 20
): Promise<SearchResult> {
  try {
    const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
    if (!storyRes.ok) return { success: false, error: 'Story not found' }

    const story = await storyRes.json()
    const comments = []

    if (story.kids) {
      for (const kid of story.kids.slice(0, limit)) {
        const commentRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`)
        if (commentRes.ok) {
          const comment = await commentRes.json()
          comments.push({
            title: comment.text || '',
            url: `https://news.ycombinator.com/item?id=${kid}`,
            snippet: (comment.text || '').slice(0, 300),
          })
        }
      }
    }

    return {
      success: true,
      results: [
        {
          title: story.title || '',
          url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
          snippet: `${story.score || 0} points | ${story.descendants || 0} comments`,
        },
        ...comments.map(c => ({ title: c.title, url: c.url, snippet: c.snippet })),
      ],
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

async function hackernewsFetch(
  endpoint: string,
  limit: number
): Promise<SearchResult> {
  try {
    const idsRes = await fetch(`https://hacker-news.firebaseio.com/v0/${endpoint}.json`)
    if (!idsRes.ok) return { success: false, error: 'Failed to fetch stories' }

    const ids: number[] = await idsRes.json()
    const results: SearchResultItem[] = []

    for (const id of ids.slice(0, limit)) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      if (itemRes.ok) {
        const item = await itemRes.json()
        if (item && item.type === 'story') {
          results.push({
            title: item.title || '',
            url: item.url || `https://news.ycombinator.com/item?id=${id}`,
            snippet: `${item.score || 0} points | ${item.descendants || 0} comments | by ${item.by || 'unknown'}`,
          })
        }
      }
    }

    return { success: true, results }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
