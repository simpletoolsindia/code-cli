export default function ConfigurationPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Configuration</h1>
        <p className="text-lg text-slate-400">
          Complete reference for BeastCLI configuration — project-level, global, and environment variables.
        </p>
      </div>

      {/* Config Files */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Config Files</h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <ConfigCard
            title="Project Config"
            path=".beastcli/beastcli.jsonc"
            description="Per-project settings — model, agent, permissions, MCP servers."
          />
          <ConfigCard
            title="Global Config"
            path="~/.config/beastcli/config.json"
            description="User-wide defaults — providers, notifications, plugins."
          />
        </div>
      </section>

      {/* Full Schema */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Configuration Schema</h2>

        <ConfigSection title="General" items={[
          { key: '$schema', type: 'string', desc: 'JSON schema reference for validation' },
          { key: 'shell', type: 'string', desc: 'Default shell for terminal and bash tool' },
          { key: 'logLevel', type: 'string', desc: 'DEBUG, INFO, WARN, ERROR' },
          { key: 'model', type: 'string', desc: 'Default model in provider/model format' },
          { key: 'small_model', type: 'string', desc: 'Small model for lightweight tasks (titles, etc.)' },
          { key: 'default_agent', type: 'string', desc: 'Default primary agent name' },
          { key: 'username', type: 'string', desc: 'Custom username for conversations' },
          { key: 'snapshot', type: 'boolean', desc: 'Enable snapshot tracking' },
          { key: 'share', type: 'string', desc: 'manual, auto, or disabled' },
          { key: 'autoupdate', type: 'boolean | "notify"', desc: 'Auto-update behavior' },
        ]} />

        <ConfigSection title="Providers" items={[
          { key: 'disabled_providers', type: 'string[]', desc: 'Hide specific auto-detected providers' },
          { key: 'enabled_providers', type: 'string[]', desc: 'ONLY enable these providers (whitelist)' },
          { key: 'provider', type: 'object', desc: 'Custom provider configurations' },
        ]} />

        <ConfigSection title="Agents" items={[
          { key: 'agent', type: 'object', desc: 'Agent definitions keyed by name' },
        ]} />

        <ConfigSection title="MCP Servers" items={[
          { key: 'mcp', type: 'object', desc: 'MCP server configurations keyed by name' },
        ]} />

        <ConfigSection title="Permissions" items={[
          { key: 'permission', type: 'object', desc: 'Permission rules (allow/deny/ask per tool)' },
          { key: 'tools', type: 'Record<string, boolean>', desc: 'Enable/disable specific tools' },
        ]} />

        <ConfigSection title="Search" items={[
          { key: 'search_engine', type: 'string', desc: 'exa, ddg, or searxng' },
          { key: 'search_config', type: 'object', desc: '{ searxng_url: string }' },
        ]} />

        <ConfigSection title="Skills" items={[
          { key: 'skills.paths', type: 'string[]', desc: 'Additional skill directories' },
          { key: 'skills.urls', type: 'string[]', desc: 'Remote skill repos to pull' },
        ]} />

        <ConfigSection title="Instructions" items={[
          { key: 'instructions', type: 'string[]', desc: 'Additional instruction files or URLs' },
        ]} />

        <ConfigSection title="Plugins" items={[
          { key: 'plugin', type: 'array', desc: 'Plugin specs: { path } or { npm }' },
        ]} />

        <ConfigSection title="Compaction" items={[
          { key: 'compaction.auto', type: 'boolean', desc: 'Enable automatic compaction (default: true)' },
          { key: 'compaction.prune', type: 'boolean', desc: 'Prune old tool outputs (default: true)' },
          { key: 'compaction.tail_turns', type: 'number', desc: 'Recent turns to keep verbatim' },
          { key: 'compaction.preserve_recent_tokens', type: 'number', desc: 'Max tokens to preserve' },
          { key: 'compaction.reserved', type: 'number', desc: 'Token buffer for compaction' },
        ]} />

        <ConfigSection title="Tool Output" items={[
          { key: 'tool_output.max_lines', type: 'number', desc: 'Max lines before truncation' },
          { key: 'tool_output.max_bytes', type: 'number', desc: 'Max bytes before truncation' },
        ]} />

        <ConfigSection title="Experimental" items={[
          { key: 'experimental.disable_paste_summary', type: 'boolean', desc: 'Disable paste summary' },
          { key: 'experimental.batch_tool', type: 'boolean', desc: 'Enable batch tool' },
          { key: 'experimental.opentelemetry', type: 'boolean', desc: 'Enable OpenTelemetry spans' },
          { key: 'experimental.primary_tools', type: 'string[]', desc: 'Tools for primary agents only' },
          { key: 'experimental.continue_loop_on_deny', type: 'boolean', desc: 'Continue after permission deny' },
          { key: 'experimental.mcp_timeout', type: 'number', desc: 'MCP request timeout (ms)' },
          { key: 'experimental.search_timeout', type: 'number', desc: 'Search tool timeout (ms)' },
        ]} />
      </section>

      {/* Example Config */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Example Configuration</h2>
        <CodeBlock>{`{
  "model": "anthropic/claude-sonnet-4",
  "small_model": "ollama/llama3.2",
  "default_agent": "build",
  "shell": "bash",
  "share": "manual",
  "autoupdate": true,
  "search_engine": "exa",
  "permission": {
    "read": "allow",
    "edit": { "*.env": "ask", "*": "allow" },
    "bash": "ask"
  },
  "tools": {
    "github-triage": false
  },
  "mcp": {
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp"],
      "enabled": false
    }
  },
  "agent": {},
  "provider": {},
  "compaction": {
    "auto": true,
    "prune": true,
    "tail_turns": 5
  },
  "tool_output": {
    "max_lines": 2000,
    "max_bytes": 100000
  }
}`}</CodeBlock>
      </section>

      {/* Environment Variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Environment Variables</h2>
        <table className="doc-table">
          <thead>
            <tr><th>Variable</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code className="doc-code">BEAST_CONFIG</code></td><td>Override config file path</td></tr>
            <tr><td><code className="doc-code">BEAST_CONFIG_DIR</code></td><td>Override config directory</td></tr>
            <tr><td><code className="doc-code">BEAST_CONFIG_CONTENT</code></td><td>Inline JSON config</td></tr>
            <tr><td><code className="doc-code">BEAST_AUTH_CONTENT</code></td><td>Inline auth config</td></tr>
            <tr><td><code className="doc-code">BEAST_DISABLE_PROJECT_CONFIG</code></td><td>Disable project-level config</td></tr>
            <tr><td><code className="doc-code">BEAST_DISABLE_EXTERNAL_SKILLS</code></td><td>Disable external skill discovery</td></tr>
            <tr><td><code className="doc-code">BEAST_DISABLE_CLAUDE_CODE_SKILLS</code></td><td>Disable Claude Code skills</td></tr>
            <tr><td><code className="doc-code">BEAST_DISABLE_CLAUDE_CODE_PROMPT</code></td><td>Disable CLAUDE.md loading</td></tr>
            <tr><td><code className="doc-code">BEAST_EXPERIMENTAL_LSP_TOOL</code></td><td>Enable LSP tool</td></tr>
            <tr><td><code className="doc-code">BEAST_EXPERIMENTAL_PLAN_MODE</code></td><td>Enable plan mode</td></tr>
            <tr><td><code className="doc-code">BEAST_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS</code></td><td>Override bash timeout</td></tr>
            <tr><td><code className="doc-code">BEAST_CLIENT</code></td><td>Client ID (app, cli, desktop)</td></tr>
            <tr><td><code className="doc-code">BEAST_ENABLE_QUESTION_TOOL</code></td><td>Enable question tool in CLI</td></tr>
          </tbody>
        </table>
      </section>

      {/* Global Config Files */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Global Config Files</h2>
        <table className="doc-table">
          <thead>
            <tr><th>File</th><th>Purpose</th></tr>
          </thead>
          <tbody>
            <tr><td><code className="doc-code">config.json</code></td><td>Global settings, providers, MCP servers</td></tr>
            <tr><td><code className="doc-code">notifier.json</code></td><td>Notification configuration</td></tr>
            <tr><td><code className="doc-code">tui.json</code></td><td>TUI theme and keybinds</td></tr>
            <tr><td><code className="doc-code">auth.json</code></td><td>Provider credentials (auto-managed)</td></tr>
            <tr><td><code className="doc-code">mcp-auth.json</code></td><td>MCP OAuth tokens (auto-managed)</td></tr>
          </tbody>
        </table>
      </section>
    </>
  )
}

function ConfigCard({ title, path, description }: { title: string, path: string, description: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
      <h3 className="text-white font-medium mb-1">{title}</h3>
      <code className="text-cyber-400 text-sm">{path}</code>
      <p className="text-slate-500 text-sm mt-2">{description}</p>
    </div>
  )
}

function ConfigSection({ title, items }: { title: string, items: { key: string, type: string, desc: string }[] }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <table className="doc-table">
        <thead>
          <tr><th>Key</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.key}>
              <td><code className="doc-code">{item.key}</code></td>
              <td><span className="text-cyber-400 text-xs">{item.type}</span></td>
              <td className="text-sm">{item.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-slate-950/80 rounded-lg p-4 font-mono text-sm text-cyber-400 border border-slate-800/50 overflow-x-auto">
      <code>{children}</code>
    </pre>
  )
}
