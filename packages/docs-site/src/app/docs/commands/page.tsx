export default function CommandsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">CLI Commands</h1>
        <p className="text-lg text-slate-400">
          Complete reference for every BeastCLI command, flag, and option.
        </p>
      </div>

      {/* Core Commands */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Core Commands</h2>

        <CommandBlock
          name="beast"
          description="Start the interactive terminal UI in the current directory."
          examples={[
            { cmd: 'beast', desc: 'Start in current directory' },
            { cmd: 'beast ./my-project', desc: 'Start in a specific directory' },
          ]}
        />

        <CommandBlock
          name="beast run"
          description="Execute a one-shot task without entering the TUI. The AI reads your project, works on the task, and exits."
          options={[
            { flag: '-m, --model <provider/model>', desc: 'Model to use (e.g., anthropic/claude-sonnet-4)' },
            { flag: '--agent <name>', desc: 'Agent mode: build, plan, general, explore' },
            { flag: '-c, --continue', desc: 'Continue the last session' },
            { flag: '-s, --session <id>', desc: 'Continue a specific session by ID' },
            { flag: '--fork', desc: 'Fork session before continuing' },
            { flag: '--share', desc: 'Share the session URL' },
            { flag: '-f, --file <path>', desc: 'Attach file(s) to the prompt (repeatable)' },
            { flag: '--title <text>', desc: 'Set session title' },
            { flag: '--variant <name>', desc: 'Model variant for reasoning effort' },
            { flag: '--thinking', desc: 'Show thinking/reasoning blocks' },
            { flag: '--format <json|text>', desc: 'Output format' },
            { flag: '--dangerously-skip-permissions', desc: 'Auto-approve all permissions' },
            { flag: '--attach <url>', desc: 'Attach to a running beast serve' },
            { flag: '--port <number>', desc: 'Local server port' },
          ]}
          examples={[
            { cmd: 'beast run "add unit tests for auth"', desc: 'Run a task with default model' },
            { cmd: 'beast run "fix login bug" --model ollama/llama3.3', desc: 'Run with a specific model' },
            { cmd: 'beast run "refactor DB layer" --agent plan', desc: 'Run in plan mode first' },
            { cmd: 'beast run "continue working" --continue', desc: 'Continue the last session' },
            { cmd: 'beast run "review this PR" -f ./diff.patch', desc: 'Attach a file' },
          ]}
        />

        <CommandBlock
          name="beast serve"
          description="Start a headless HTTP server for API access. Other applications can send prompts and receive streaming responses."
          examples={[
            { cmd: 'beast serve', desc: 'Start on default port' },
            { cmd: 'beast serve --port 3000', desc: 'Start on a specific port' },
          ]}
        />

        <CommandBlock
          name="beast web"
          description="Start the server and automatically open the web-based interface in your browser."
          examples={[
            { cmd: 'beast web', desc: 'Start and open browser' },
          ]}
        />

        <CommandBlock
          name="beast acp"
          description="Start an Agent Client Protocol (ACP) server for agent-to-agent communication via NDJSON streaming."
          examples={[
            { cmd: 'beast acp', desc: 'Start ACP server' },
          ]}
        />
      </section>

      {/* Management Commands */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Management Commands</h2>

        <CommandBlock
          name="beast providers"
          description="Manage AI provider connections."
          subcommands={[
            { name: 'list', desc: 'List all configured providers and their status' },
            { name: 'login [url]', desc: 'Connect a new provider (interactive or with URL)' },
            { name: 'logout', desc: 'Disconnect a provider' },
          ]}
          examples={[
            { cmd: 'beast providers list', desc: 'See which providers are connected' },
            { cmd: 'beast providers login', desc: 'Start the connection wizard' },
          ]}
        />

        <CommandBlock
          name="beast models"
          description="List available models from connected providers."
          options={[
            { flag: '--verbose', desc: 'Show detailed model information' },
            { flag: '--refresh', desc: 'Force refresh the model list' },
          ]}
          examples={[
            { cmd: 'beast models', desc: 'List all models' },
            { cmd: 'beast models anthropic', desc: 'List Anthropic models only' },
          ]}
        />

        <CommandBlock
          name="beast agent"
          description="Manage AI agents."
          subcommands={[
            { name: 'create', desc: 'Create a custom agent with AI assistance' },
            { name: 'list', desc: 'List all available agents' },
          ]}
          examples={[
            { cmd: 'beast agent create', desc: 'Interactive agent creation' },
            { cmd: 'beast agent list', desc: 'See all agents' },
          ]}
        />

        <CommandBlock
          name="beast session"
          description="Manage conversation sessions."
          subcommands={[
            { name: 'list', desc: 'List sessions with filtering options' },
            { name: 'delete <id>', desc: 'Delete a session and all its children' },
          ]}
          options={[
            { flag: '--max-count, -n <number>', desc: 'Limit to N most recent sessions' },
            { flag: '--format <table|json>', desc: 'Output format' },
          ]}
          examples={[
            { cmd: 'beast session list', desc: 'List recent sessions' },
            { cmd: 'beast session list -n 5', desc: 'Show last 5 sessions' },
            { cmd: 'beast session list --format json', desc: 'JSON output' },
          ]}
        />

        <CommandBlock
          name="beast mcp"
          description="Manage Model Context Protocol servers."
          subcommands={[
            { name: 'list', desc: 'List MCP servers and connection status' },
            { name: 'add', desc: 'Add a new MCP server (interactive)' },
            { name: 'auth [name]', desc: 'Authenticate with OAuth-enabled server' },
            { name: 'logout [name]', desc: 'Remove OAuth credentials' },
            { name: 'debug <name>', desc: 'Debug MCP server connection' },
            { name: 'discover', desc: 'Auto-discover MCP servers from system' },
          ]}
        />

        <CommandBlock
          name="beast stats"
          description="View token usage and cost statistics."
          options={[
            { flag: '--days <number>', desc: 'Show stats for the last N days' },
            { flag: '--tools', desc: 'Break down by tool usage' },
            { flag: '--models', desc: 'Break down by model' },
            { flag: '--project', desc: 'Break down by project' },
          ]}
        />

        <CommandBlock
          name="beast upgrade"
          description="Upgrade BeastCLI to the latest version."
          options={[
            { flag: '[target]', desc: 'Specific version to upgrade to' },
            { flag: '--method', desc: 'Installation method (npm, brew, scoop)' },
          ]}
        />
      </section>

      {/* Keyboard Shortcuts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Keyboard Shortcuts</h2>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Shortcut</th>
              <th>Action</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><kbd className="doc-code">Cmd/Ctrl + K</kbd></td><td>Commands palette</td><td>Always</td></tr>
            <tr><td><kbd className="doc-code">Cmd/Ctrl + O</kbd></td><td>Switch model</td><td>In session</td></tr>
            <tr><td><kbd className="doc-code">Cmd/Ctrl + B</kbd></td><td>Toggle sidebar</td><td>In session</td></tr>
            <tr><td><kbd className="doc-code">Cmd/Ctrl + S</kbd></td><td>Switch session</td><td>Always</td></tr>
            <tr><td><kbd className="doc-code">Cmd/Ctrl + T</kbd></td><td>Theme switcher</td><td>Always</td></tr>
            <tr><td><kbd className="doc-code">Cmd/Ctrl + H</kbd></td><td>Help dialog</td><td>Always</td></tr>
            <tr><td><kbd className="doc-code">Esc</kbd></td><td>Stop generation / Close dialog</td><td>Always</td></tr>
            <tr><td><kbd className="doc-code">Q</kbd></td><td>Close dialog</td><td>In dialog</td></tr>
          </tbody>
        </table>
      </section>
    </>
  )
}

function CommandBlock({ name, description, options, subcommands, examples }: {
  name: string
  description: string
  options?: { flag: string, desc: string }[]
  subcommands?: { name: string, desc: string }[]
  examples?: { cmd: string, desc: string }[]
}) {
  return (
    <div className="mb-8 p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
      <div className="flex items-center gap-3 mb-2">
        <code className="text-lg font-bold text-beast-400">{name}</code>
      </div>
      <p className="text-slate-400 mb-4">{description}</p>

      {subcommands && subcommands.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Subcommands</h4>
          <table className="doc-table">
            <thead>
              <tr><th>Command</th><th>Description</th></tr>
            </thead>
            <tbody>
              {subcommands.map(sub => (
                <tr key={sub.name}>
                  <td><code className="doc-code">{name} {sub.name}</code></td>
                  <td>{sub.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {options && options.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Options</h4>
          <table className="doc-table">
            <thead>
              <tr><th>Flag</th><th>Description</th></tr>
            </thead>
            <tbody>
              {options.map(opt => (
                <tr key={opt.flag}>
                  <td><code className="doc-code">{opt.flag}</code></td>
                  <td>{opt.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {examples && examples.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Examples</h4>
          <div className="space-y-2">
            {examples.map((ex, i) => (
              <div key={i} className="flex items-start gap-3">
                <code className="text-cyber-400 text-sm font-mono bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 shrink-0">{ex.cmd}</code>
                <span className="text-slate-500 text-sm">{ex.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
