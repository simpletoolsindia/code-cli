export default function ArchitecturePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Architecture</h1>
        <p className="text-lg text-slate-400">
          Technical deep-dive into BeastCLI's source structure, technology stack, and internal request flow.
        </p>
      </div>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Technology Stack</h2>
        <table className="doc-table">
          <thead>
            <tr><th>Layer</th><th>Technology</th><th>Purpose</th></tr>
          </thead>
          <tbody>
            <tr><td className="text-white">Runtime</td><td>Bun 1.3+</td><td>JavaScript runtime, native binary compilation</td></tr>
            <tr><td className="text-white">Language</td><td>TypeScript 5.8</td><td>Type-safe development</td></tr>
            <tr><td className="text-white">Effect System</td><td>Effect v4 (beta)</td><td>Functional effect system, dependency injection</td></tr>
            <tr><td className="text-white">Terminal UI</td><td>OpenTUI + Solid.js</td><td>Rich TUI with reactive components</td></tr>
            <tr><td className="text-white">AI Integration</td><td>Vercel AI SDK 6.0</td><td>Multi-provider adapter abstraction</td></tr>
            <tr><td className="text-white">Database</td><td>SQLite + Drizzle ORM</td><td>Session and message storage</td></tr>
            <tr><td className="text-white">Package Manager</td><td>pnpm 10</td><td>Workspace monorepo management</td></tr>
            <tr><td className="text-white">Build</td><td>Bun build</td><td>Native binary compilation</td></tr>
            <tr><td className="text-white">Testing</td><td>Bun test</td><td>Unit and integration tests</td></tr>
            <tr><td className="text-white">Linting</td><td>oxlint</td><td>Fast TypeScript linting</td></tr>
            <tr><td className="text-white">Shell Parsing</td><td>Tree-sitter</td><td>Bash/PowerShell command analysis</td></tr>
            <tr><td className="text-white">MCP</td><td>@modelcontextprotocol/sdk</td><td>Model Context Protocol</td></tr>
            <tr><td className="text-white">ACP</td><td>@agentclientprotocol/sdk</td><td>Agent Client Protocol</td></tr>
          </tbody>
        </table>
      </section>

      {/* Package Structure */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Package Structure</h2>
        <CodeBlock>{`beastcli/
├── packages/
│   ├── beastcli/              # Main CLI application
│   │   ├── src/
│   │   │   ├── agent/         # Agent definitions and management
│   │   │   ├── auth/          # Authentication providers (OAuth, API keys)
│   │   │   ├── bus/           # Event bus (pub/sub for session events)
│   │   │   ├── cli/cmd/       # CLI commands (run, serve, web, etc.)
│   │   │   ├── config/        # Configuration loading and schema
│   │   │   ├── effect/        # Effect utilities (bridge, instance-state)
│   │   │   ├── file/          # File operations, ripgrep integration
│   │   │   ├── lsp/           # Language Server Protocol integration
│   │   │   ├── mcp/           # MCP server management and OAuth
│   │   │   ├── notifier/      # Notification system (macOS, Telegram)
│   │   │   ├── permission/    # Permission rules and prompts
│   │   │   ├── plugin/        # Plugin loader and hook system
│   │   │   ├── provider/      # AI provider adapters and transforms
│   │   │   ├── session/       # Session management and message processing
│   │   │   ├── shell/         # Shell detection (bash, zsh, powershell)
│   │   │   ├── skill/         # Skills discovery and loading
│   │   │   ├── tool/          # Built-in tool implementations
│   │   │   └── util/          # Shared utilities
│   │   └── test/              # Test suite
│   │
│   ├── plugin/                # Plugin SDK (@simpletoolsindia/plugin)
│   ├── sdk/                   # JavaScript/TypeScript client SDK
│   ├── core/                  # Core utilities and filesystem
│   ├── app/                   # Web application
│   ├── desktop-electron/      # Desktop Electron app
│   └── docs-site/             # Documentation website
│
├── patches/                   # npm package patches
├── pnpm-lock.yaml
└── package.json               # Workspace root`}</CodeBlock>
      </section>

      {/* Key Modules */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Modules</h2>

        <ModuleCard
          name="Session/Prompt"
          path="src/session/prompt.ts"
          description="Orchestrates the main conversation loop. Builds model messages, resolves tools, handles subtasks, manages the step loop, and processes LLM responses."
        />

        <ModuleCard
          name="Session/LLM"
          path="src/session/llm.ts"
          description="Streams text to the AI provider. Handles provider-specific options, tool injection, repair logic, LiteLLM proxy compatibility, and telemetry."
        />

        <ModuleCard
          name="Tool Registry"
          path="src/tool/registry.ts"
          description="Manages all available tools. Loads built-in tools, plugin tools, and MCP tools. Implements tool preselection based on prompt keywords."
        />

        <ModuleCard
          name="Provider"
          path="src/provider/provider.ts"
          description="Abstracts AI provider connections. Supports 20+ providers via Vercel AI SDK adapters. Handles model listing, auth, and provider-specific transforms."
        />

        <ModuleCard
          name="Config"
          path="src/config/config.ts"
          description="Loads and merges config from project (.beastcli/beastcli.jsonc), global (~/.config/beastcli/), and environment variables. Validates against schema."
        />

        <ModuleCard
          name="MCP"
          path="src/mcp/index.ts"
          description="Manages MCP server connections. Supports local (stdio) and remote (StreamableHTTP, SSE) transports. Full OAuth 2.0 flow with dynamic client registration."
        />
      </section>

      {/* Request Flow */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Request Flow</h2>
        <CodeBlock>{`User Input ("fix the login bug")
         │
         ▼
┌─────────────────────────────┐
│  Session Manager            │
│  - Creates/loads session    │
│  - Stores messages in SQLite│
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Prompt Builder             │
│  - Builds model messages    │
│  - Resolves tools           │
│  - Loads system prompt      │
│  - Applies plugin hooks     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  LLM Stream                 │
│  - Sends to provider        │
│  - Streams response chunks  │
│  - Handles tool calls       │
│  - Retry/repair logic       │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Session Processor          │
│  - Processes text parts     │
│  - Executes tool calls      │
│  - Updates message state    │
│  - Handles permissions      │
└─────────────┬───────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│ Text │ │ Tool │ │ Error│
│      │ │ Call │ │      │
└──┬───┘ └──┬───┘ └──┬───┘
   │        │        │
   ▼        ▼        ▼
  TUI    Execute   Handle
  Output  Result   & Retry`}</CodeBlock>
      </section>

      {/* Effect System */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Effect System</h2>
        <p className="text-slate-400 mb-4">
          BeastCLI uses Effect v4 for dependency injection, error handling, and resource management:
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-white font-medium mb-2">Service Pattern</h3>
            <p className="text-slate-400 text-sm">Each module defines a Service class with an Interface and a Layer:</p>
            <CodeBlock>{`export interface Interface {
  readonly cancel: (sessionID: SessionID) => Effect.Effect<void>
  readonly prompt: (input: PromptInput) => Effect.Effect<MessageV2.WithParts>
}

export class Service extends Context.Service<Service, Interface>()("@simpletoolsindia/SessionPrompt") {}

export const layer = Layer.effect(Service, Effect.gen(function* () {
  // Implementation
}))`}</CodeBlock>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-white font-medium mb-2">Instance State</h3>
            <p className="text-slate-400 text-sm">Per-directory state with automatic cleanup:</p>
            <CodeBlock>{`const state = yield* InstanceState.make<State>(
  Effect.fn("ToolRegistry.state")(function* (ctx) {
    // ctx.directory and ctx.worktree are available
    // State is scoped to the project directory
    // Automatically cleaned up when project is closed
  }),
)`}</CodeBlock>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <h3 className="text-white font-medium mb-2">Layer Composition</h3>
            <p className="text-slate-400 text-sm">Layers compose dependencies:</p>
            <CodeBlock>{`export const defaultLayer = Layer.suspend(() =>
  layer.pipe(
    Layer.provide(Auth.defaultLayer),
    Layer.provide(Config.defaultLayer),
    Layer.provide(Provider.defaultLayer),
    Layer.provide(Plugin.defaultLayer),
  )
)`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* Development */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Development Commands</h2>
        <table className="doc-table">
          <thead>
            <tr><th>Command</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code className="doc-code">bun run dev</code></td><td>Start development mode</td></tr>
            <tr><td><code className="doc-code">bun run typecheck</code></td><td>TypeScript type checking (via tsgo)</td></tr>
            <tr><td><code className="doc-code">bun test</code></td><td>Run test suite</td></tr>
            <tr><td><code className="doc-code">bun run build</code></td><td>Build native binary</td></tr>
            <tr><td><code className="doc-code">bun run db generate --name &lt;slug&gt;</code></td><td>Generate Drizzle migration</td></tr>
          </tbody>
        </table>
      </section>
    </>
  )
}

function ModuleCard({ name, path, description }: { name: string, path: string, description: string }) {
  return (
    <div className="mb-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-white font-medium">{name}</span>
        <code className="text-cyber-400 text-xs">{path}</code>
      </div>
      <p className="text-slate-500 text-sm">{description}</p>
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
