export default function AgentsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Agents</h1>
        <p className="text-lg text-slate-400">
          Agents define how the AI behaves — what tools it can use, what permissions it has, and how it approaches tasks.
        </p>
      </div>

      {/* For Non-Technical Users */}
      <section className="mb-12 p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
        <h2 className="text-xl font-bold text-white mb-3">What Are Agents?</h2>
        <p className="text-slate-400 mb-4">
          An agent is like a "personality" for the AI. Different agents have different strengths:
        </p>
        <ul className="space-y-3 text-slate-400">
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">Build Agent</span>
            <span>The default. Can read files, write code, run commands. Use it for building features, fixing bugs, and refactoring.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">Plan Agent</span>
            <span>Read-only. Analyzes your code and suggests changes without actually making them. Great for reviewing before committing.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">General Agent</span>
            <span>A research specialist. Good for multi-step tasks that need exploration and synthesis.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">Explore Agent</span>
            <span>A fast codebase explorer. Quickly finds and reads files to understand project structure.</span>
          </li>
        </ul>
      </section>

      {/* Built-in Agents */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Built-in Agents</h2>

        <table className="doc-table">
          <thead>
            <tr><th>Name</th><th>Mode</th><th>Description</th><th>Tools</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-white">build</td>
              <td>Primary</td>
              <td>Default agent for building, editing, and executing</td>
              <td>All tools</td>
            </tr>
            <tr>
              <td className="text-white">plan</td>
              <td>Primary</td>
              <td>Read-only analysis — disallows file edits</td>
              <td>Read-only tools + plan_exit</td>
            </tr>
            <tr>
              <td className="text-white">general</td>
              <td>Subagent</td>
              <td>Research and multi-step tasks</td>
              <td>All tools except todowrite</td>
            </tr>
            <tr>
              <td className="text-white">explore</td>
              <td>Subagent</td>
              <td>Fast codebase exploration</td>
              <td>grep, glob, read, bash, webfetch, websearch</td>
            </tr>
          </tbody>
        </table>

        <p className="text-slate-500 text-sm mt-3">
          Hidden agents (<code className="doc-code">compaction</code>, <code className="doc-code">title</code>, <code className="doc-code">summary</code>) operate behind the scenes and are not user-facing.
        </p>
      </section>

      {/* Agent Modes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Agent Modes</h2>
        <table className="doc-table">
          <thead>
            <tr><th>Mode</th><th>Behavior</th><th>Used For</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-white">primary</td>
              <td>Receives user prompts directly, manages its own session</td>
              <td>Top-level interaction with the user</td>
            </tr>
            <tr>
              <td className="text-white">subagent</td>
              <td>Invoked via the task tool, runs in a child session</td>
              <td>Delegated tasks (research, exploration)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Switching Agents */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Switching Agents</h2>
        <CodeBlock>{`# In TUI — use Cmd/Ctrl+K for commands palette
# From command line
beast --agent plan "refactor the database layer"
beast run "research best practices" --agent general`}</CodeBlock>
      </section>

      {/* Custom Agents */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Custom Agents</h2>
        <p className="text-slate-400 mb-4">Create agents tailored to your workflow:</p>
        <CodeBlock>{`// .beastcli/beastcli.jsonc
{
  "agent": {
    "reviewer": {
      "name": "Reviewer",
      "description": "Senior code review specialist",
      "mode": "subagent",
      "model": {
        "providerID": "anthropic",
        "modelID": "claude-sonnet-4"
      },
      "permission": [
        { "permission": "read", "action": "allow" },
        { "permission": "edit", "action": "ask" },
        { "permission": "bash", "action": "allow" }
      ],
      "temperature": 0.3,
      "prompt": "You are a senior code reviewer. Focus on security, performance, and maintainability.",
      "steps": 20
    }
  }
}`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Agent Properties</h3>
        <table className="doc-table">
          <thead>
            <tr><th>Property</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td className="text-white">name</td><td>string</td><td>Agent display name</td></tr>
            <tr><td className="text-white">description</td><td>string</td><td>What the agent does</td></tr>
            <tr><td className="text-white">mode</td><td>string</td><td>primary, subagent, or all</td></tr>
            <tr><td className="text-white">model</td><td>object</td><td>Default model &#123; providerID, modelID &#125;</td></tr>
            <tr><td className="text-white">permission</td><td>array</td><td>Permission rules</td></tr>
            <tr><td className="text-white">temperature</td><td>number</td><td>Creativity (0-1)</td></tr>
            <tr><td className="text-white">topP</td><td>number</td><td>Top-p sampling parameter</td></tr>
            <tr><td className="text-white">prompt</td><td>string</td><td>Custom system prompt</td></tr>
            <tr><td className="text-white">steps</td><td>number</td><td>Maximum tool call steps</td></tr>
            <tr><td className="text-white">variant</td><td>string</td><td>Model variant for reasoning effort</td></tr>
            <tr><td className="text-white">options</td><td>object</td><td>Additional provider options</td></tr>
          </tbody>
        </table>
      </section>

      {/* AI Agent Creation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">AI-Assisted Agent Creation</h2>
        <p className="text-slate-400 mb-4">
          BeastCLI can create agents for you using AI:
        </p>
        <CodeBlock>beast agent create</CodeBlock>
        <p className="text-slate-500 text-sm mt-3">
          The AI will ask you what you want the agent to do, then generate the configuration with appropriate tools, permissions, and system prompt.
        </p>
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
