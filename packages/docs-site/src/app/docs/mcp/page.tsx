export default function MCPPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">MCP Servers</h1>
        <p className="text-lg text-slate-400">
          Model Context Protocol (MCP) enables BeastCLI to connect to external tool servers, expanding the AI's capabilities beyond built-in tools.
        </p>
      </div>

      {/* For Non-Technical Users */}
      <section className="mb-12 p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
        <h2 className="text-xl font-bold text-white mb-3">What is MCP?</h2>
        <p className="text-slate-400 mb-4">
          MCP (Model Context Protocol) is like a plugin system for AI. It lets external servers provide tools that the AI can use. For example, a "GitHub MCP server" could let the AI read your repositories, manage issues, and create pull requests — all through a standardized interface.
        </p>
        <p className="text-slate-400">
          Think of it as giving the AI new superpowers. BeastCLI already has many built-in tools, but MCP servers let you add more from the community or build your own.
        </p>
      </section>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How MCP Works</h2>
        <div className="space-y-4 text-slate-400">
          <p>
            MCP servers can be <strong className="text-white">local</strong> (run as a command on your machine) or <strong className="text-white">remote</strong> (accessed via HTTP). Each server exposes tools that appear alongside BeastCLI's built-in tools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-white font-medium mb-2">Local Server</h3>
            <p className="text-slate-500 text-sm mb-3">Runs as a command on your machine</p>
            <CodeBlock>{`{
  "type": "local",
  "command": ["npx", "-y", "@upstash/context7-mcp"],
  "enabled": true,
  "timeout": 30000
}`}</CodeBlock>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-white font-medium mb-2">Remote Server</h3>
            <p className="text-slate-500 text-sm mb-3">Accessed via HTTP URL</p>
            <CodeBlock>{`{
  "type": "remote",
  "url": "https://api.example.com/mcp/",
  "enabled": true,
  "headers": {
    "Authorization": "Bearer TOKEN"
  }
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Configuration</h2>
        <p className="text-slate-400 mb-4">Add MCP servers to your project or global config:</p>
        <CodeBlock>{`// .beastcli/beastcli.jsonc or ~/.config/beastcli/config.json
{
  "mcp": {
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp"],
      "enabled": true,
      "timeout": 30000
    },
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "enabled": true,
      "oauth": {
        "enabled": true,
        "authorizationUrl": "https://github.com/login/oauth/authorize",
        "tokenUrl": "https://github.com/login/oauth/access_token",
        "clientId": "...",
        "scopes": ["repo", "read:org"]
      }
    }
  }
}`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Server Properties</h3>
        <table className="doc-table">
          <thead>
            <tr><th>Property</th><th>Type</th><th>Required</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td className="text-white">type</td><td><code className="doc-code">local</code> | <code className="doc-code">remote</code></td><td>Yes</td><td>Server type</td></tr>
            <tr><td className="text-white">command</td><td>string[]</td><td>Local only</td><td>Command and args to run</td></tr>
            <tr><td className="text-white">url</td><td>string</td><td>Remote only</td><td>Server URL</td></tr>
            <tr><td className="text-white">enabled</td><td>boolean</td><td>No</td><td>Whether the server is active (default: false)</td></tr>
            <tr><td className="text-white">timeout</td><td>number</td><td>No</td><td>Request timeout in milliseconds</td></tr>
            <tr><td className="text-white">environment</td><td>object</td><td>No</td><td>Environment variables for local servers</td></tr>
            <tr><td className="text-white">headers</td><td>object</td><td>No</td><td>HTTP headers for remote servers</td></tr>
            <tr><td className="text-white">oauth</td><td>object</td><td>No</td><td>OAuth 2.0 configuration</td></tr>
          </tbody>
        </table>
      </section>

      {/* Commands */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">MCP Commands</h2>
        <table className="doc-table">
          <thead>
            <tr><th>Command</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code className="doc-code">beast mcp list</code></td><td>List all configured MCP servers and their connection status</td></tr>
            <tr><td><code className="doc-code">beast mcp add</code></td><td>Interactive wizard to add a new MCP server</td></tr>
            <tr><td><code className="doc-code">beast mcp auth [name]</code></td><td>Start OAuth flow for an MCP server</td></tr>
            <tr><td><code className="doc-code">beast mcp logout [name]</code></td><td>Remove stored OAuth credentials</td></tr>
            <tr><td><code className="doc-code">beast mcp debug &lt;name&gt;</code></td><td>Debug connection and show detailed diagnostics</td></tr>
            <tr><td><code className="doc-code">beast mcp discover</code></td><td>Auto-discover MCP servers from system configs</td></tr>
          </tbody>
        </table>
      </section>

      {/* Auto-Discovery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Auto-Discovery</h2>
        <p className="text-slate-400 mb-4">
          BeastCLI scans for MCP servers in these locations:
        </p>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-3">
            <span className="text-beast-400">•</span>
            <span>Claude Desktop config: <code className="doc-code">~/Library/Application Support/Claude/claude_desktop_config.json</code></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400">•</span>
            <span>Cursor config</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400">•</span>
            <span>npm global packages with MCP tool definitions</span>
          </li>
        </ul>
        <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-yellow-300 text-sm">
            Discovered servers default to <code className="doc-code">enabled: false</code> to prevent auth prompt blocking.
            Enable them manually after reviewing their configuration.
          </p>
        </div>
      </section>

      {/* OAuth */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">OAuth Authentication</h2>
        <p className="text-slate-400 mb-4">
          MCP servers can require OAuth 2.0 authentication. BeastCLI supports the full flow:
        </p>
        <ol className="space-y-3 text-slate-400">
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">1.</span>
            <span>Server indicates auth required (401 response or OAuth metadata)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">2.</span>
            <span>BeastCLI opens your browser for authorization</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">3.</span>
            <span>You authorize on the provider's website</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">4.</span>
            <span>Callback received at <code className="doc-code">http://127.0.0.1:19876/mcp/callback</code></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">5.</span>
            <span>Tokens stored in <code className="doc-code">~/.config/beastcli/mcp-auth.json</code></span>
          </li>
        </ol>
      </section>

      {/* Transports */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Supported Transports</h2>
        <table className="doc-table">
          <thead>
            <tr><th>Transport</th><th>Use Case</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td className="text-white">StreamableHTTP</td><td>Remote servers (modern)</td><td>Yes (remote)</td></tr>
            <tr><td className="text-white">SSE</td><td>Remote servers (legacy)</td><td>Fallback</td></tr>
            <tr><td className="text-white">Stdio</td><td>Local command-based servers</td><td>Yes (local)</td></tr>
          </tbody>
        </table>
      </section>
    </>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-slate-950/80 rounded-lg p-4 font-mono text-sm text-cyber-400 border border-slate-800/50 overflow-x-auto">
      <code>{children}</code>
    </pre>
  )
}
