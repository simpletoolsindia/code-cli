// Native GitHub Tools
// Replaces GitHub MCP calls with direct GitHub API

const GITHUB_API = 'https://api.github.com'

// Use GitHub token if available
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''

async function githubFetch(path: string): Promise<{ ok: boolean; data: unknown; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'BeastCLI/1.0',
    }
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
    }

    const response = await fetch(`${GITHUB_API}${path}`, {
      headers,
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      const error = await response.text()
      return { ok: false, data: null, error: `GitHub API ${response.status}: ${error}` }
    }

    const data = await response.json()
    return { ok: true, data }
  } catch (e: any) {
    return { ok: false, data: null, error: e.message }
  }
}

export async function githubRepo(owner: string, repo: string): Promise<{ success: boolean; output: string; error?: string }> {
  const result = await githubFetch(`/repos/${owner}/${repo}`)

  if (!result.ok) {
    return { success: false, output: '', error: result.error }
  }

  const r = result.data as any
  const repoData = {
    repo_name: r.name,
    full_name: r.full_name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    license: r.license?.name || r.license?.spdx_id || null,
    topics: r.topics || [],
    open_issues: r.open_issues_count,
    watchers: r.watchers_count,
    default_branch: r.default_branch,
    created_at: r.created_at,
    updated_at: r.updated_at,
    homepage: r.homepage,
  }

  return { success: true, output: JSON.stringify(repoData, null, 2) }
}

export async function githubReadme(
  owner: string,
  repo: string
): Promise<{ success: boolean; output: string; error?: string }> {
  const result = await githubFetch(`/repos/${owner}/${repo}/readme`)

  if (!result.ok) {
    return { success: false, output: '', error: result.error }
  }

  const r = result.data as any
  // README content is base64 encoded
  const content = Buffer.from(r.content, 'base64').toString('utf-8')

  return { success: true, output: content }
}

export async function githubIssues(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'open',
  limit = 20
): Promise<{ success: boolean; output: string; error?: string }> {
  const result = await githubFetch(`/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`)

  if (!result.ok) {
    return { success: false, output: '', error: result.error }
  }

  const issues = (result.data as any[]).map(i => ({
    number: i.number,
    title: i.title,
    state: i.state,
    labels: i.labels?.map((l: any) => l.name) || [],
    author: i.user?.login,
    created_at: i.created_at,
    url: i.html_url,
  }))

  return { success: true, output: JSON.stringify(issues, null, 2) }
}

export async function githubCommits(
  owner: string,
  repo: string,
  limit = 20
): Promise<{ success: boolean; output: string; error?: string }> {
  const result = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=${limit}`)

  if (!result.ok) {
    return { success: false, output: '', error: result.error }
  }

  const commits = (result.data as any[]).map(c => ({
    sha: c.sha?.slice(0, 7),
    message: c.commit?.message?.split('\n')[0],
    author: c.commit?.author?.name,
    date: c.commit?.author?.date,
    url: c.html_url,
  }))

  return { success: true, output: JSON.stringify(commits, null, 2) }
}

export async function githubSearchRepos(
  query: string,
  limit = 10
): Promise<{ success: boolean; output: string; error?: string }> {
  const result = await githubFetch(`/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`)

  if (!result.ok) {
    return { success: false, output: '', error: result.error }
  }

  const data = result.data as any
  const repos = (data.items || []).map((r: any) => ({
    name: r.name,
    owner: r.owner?.login,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    url: r.html_url,
  }))

  return { success: true, output: JSON.stringify(repos, null, 2) }
}
