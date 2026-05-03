export default function GettingStartedPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Getting Started</h1>
        <p className="text-lg text-slate-400">
          From installation to your first AI-assisted coding session in under 5 minutes.
        </p>
      </div>

      {/* For Non-Technical Users */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">For Non-Technical Users</h2>
        <p className="text-slate-400 mb-6">
          BeastCLI is an AI assistant that lives in your terminal. It can read your code, make changes, run tests, and answer questions — all while you stay in control.
        </p>

        <div className="space-y-6">
          <Step number={1} title="Install BeastCLI">
            <p className="text-slate-400 mb-3">
              Open your terminal (the black window where you type commands) and run:
            </p>
            <CodeBlock>npm install -g @simpletoolsindia/beast-cli</CodeBlock>
            <p className="text-slate-500 text-sm mt-3">
              This downloads and installs BeastCLI on your computer. You only need to do this once.
              If you don't have npm installed, you can get it from <a href="https://nodejs.org" className="doc-link">nodejs.org</a>.
            </p>
          </Step>

          <Step number={2} title="Open Your Project">
            <p className="text-slate-400 mb-3">
              Navigate to the folder where your code lives:
            </p>
            <CodeBlock>cd ~/my-project</CodeBlock>
          </Step>

          <Step number={3} title="Start BeastCLI">
            <p className="text-slate-400 mb-3">
              Simply type:
            </p>
            <CodeBlock>beast</CodeBlock>
            <p className="text-slate-500 text-sm mt-3">
              A beautiful interface will appear in your terminal. BeastCLI will automatically detect any
              local AI servers you have running (like Ollama) or ask you to connect a cloud provider.
            </p>
          </Step>

          <Step number={4} title="Ask It to Build Something">
            <p className="text-slate-400 mb-3">
              Type what you want to build at the prompt:
            </p>
            <TerminalBlock>
              <span className="text-green-400">❯</span> Create a login page with email and password validation
            </TerminalBlock>
            <p className="text-slate-500 text-sm mt-3">
              BeastCLI will analyze your project, read existing files, and start building. You can watch
              it work in real-time — it reads files, writes new code, and runs commands right in front of you.
            </p>
          </Step>
        </div>
      </section>

      {/* For Technical Users */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">For Technical Users</h2>
        <p className="text-slate-400 mb-6">
          BeastCLI is built with Bun and Effect, uses Vercel AI SDK for provider abstraction, and stores sessions in SQLite.
        </p>

        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Prerequisites</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Bun 1.3+ (for development) or Node.js 20+ (for npm install)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> pnpm 10+ (for monorepo development)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> An AI provider API key (or a local AI server)
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Install</h3>
            <CodeBlock>npm install -g @simpletoolsindia/beast-cli</CodeBlock>
            <p className="text-slate-500 text-sm mt-3">Or build from source:</p>
            <CodeBlock>
{`git clone https://github.com/simpletoolsindia/code-cli.git
cd code-cli && pnpm install
cd packages/beastcli && bun run build --single --baseline`}
            </CodeBlock>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Connect a Provider</h3>
            <p className="text-slate-400 mb-3">Use the interactive wizard:</p>
            <CodeBlock>beast /connect</CodeBlock>
            <p className="text-slate-500 text-sm mt-3">Or set via environment variable:</p>
            <CodeBlock>export ANTHROPIC_API_KEY="sk-ant-..."</CodeBlock>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Run Modes</h3>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <ModeCard title="Interactive TUI" command="beast" desc="Full terminal UI with sidebar" />
              <ModeCard title="One-shot task" command='beast run "fix tests"' desc="Run without TUI" />
              <ModeCard title="Headless server" command="beast serve" desc="HTTP API for integrations" />
              <ModeCard title="Web interface" command="beast web" desc="Browser-based UI" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-3">Local Providers (Zero Config)</h3>
            <p className="text-slate-400 mb-3">
              If you run any of these locally, BeastCLI auto-detects them:
            </p>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Port</th>
                  <th>Setup</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Ollama</td><td><code className="doc-code">11434</code></td><td>Just start it</td></tr>
                <tr><td>LM Studio</td><td><code className="doc-code">1234</code></td><td>Start server</td></tr>
                <tr><td>Jan</td><td><code className="doc-code">1337</code></td><td>Start server</td></tr>
                <tr><td>MLX</td><td><code className="doc-code">8080</code></td><td>Start server</td></tr>
                <tr><td>vLLM</td><td><code className="doc-code">8001</code></td><td>Start server</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="p-6 rounded-xl bg-gradient-to-br from-beast-500/10 to-cyber-500/10 border border-beast-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Pro Tips</h3>
        <ul className="space-y-3 text-slate-300">
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">1.</span>
            <span>Start with <code className="doc-code">beast --agent plan</code> to get a plan before the AI starts making changes</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">2.</span>
            <span>Use <code className="doc-code">Ctrl/Cmd + K</code> to open the commands palette for quick actions</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">3.</span>
            <span>Use <code className="doc-code">Ctrl/Cmd + O</code> to switch models mid-session</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">4.</span>
            <span>Create a <code className="doc-code">.beastcli/beastcli.jsonc</code> file to set project-specific defaults</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">5.</span>
            <span>Use <code className="doc-code">beast run --continue</code> to pick up where you left off</span>
          </li>
        </ul>
      </section>
    </>
  )
}

function Step({ number, title, children }: { number: number, title: string, children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-beast-500 text-white flex items-center justify-center font-bold shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {children}
      </div>
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

function TerminalBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-950/80 rounded-lg p-4 font-mono text-sm border border-slate-800/50">
      {children}
    </div>
  )
}

function ModeCard({ title, command, desc }: { title: string, command: string, desc: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
      <p className="text-white font-medium text-sm">{title}</p>
      <code className="text-cyber-400 text-xs">{command}</code>
      <p className="text-slate-500 text-xs mt-1">{desc}</p>
    </div>
  )
}
