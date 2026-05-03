export default function PluginsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Plugins</h1>
        <p className="text-lg text-slate-400">
          Extend BeastCLI with custom tools, agents, providers, and hooks using the Plugin SDK.
        </p>
      </div>

      {/* For Non-Technical Users */}
      <section className="mb-12 p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
        <h2 className="text-xl font-bold text-white mb-3">What Are Plugins?</h2>
        <p className="text-slate-400 mb-4">
          Plugins are add-ons that give BeastCLI new capabilities. Think of them like browser extensions — they add features that aren't built in by default.
        </p>
        <p className="text-slate-400">
          With plugins, you can add custom tools (like "deploy to my server"), new AI providers, or special hooks that modify how the AI behaves. Plugins require basic JavaScript/TypeScript knowledge to create.
        </p>
      </section>

      {/* Install SDK */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Install the SDK</h2>
        <CodeBlock>npm install -D @simpletoolsindia/plugin</CodeBlock>
      </section>

      {/* Creating a Plugin */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Creating a Plugin</h2>

        <h3 className="text-lg font-semibold text-white mb-3">Basic Plugin with Custom Tool</h3>
        <CodeBlock>{`// .beastcli/plugin.ts
import { Plugin } from "@simpletoolsindia/plugin"
import { z } from "zod"

export const plugin = Plugin.create({
  tools: {
    deploy: {
      description: "Deploy the current project to production",
      args: {
        environment: z.enum(["staging", "production"]),
        confirm: z.boolean().optional(),
      },
      execute: async ({ environment, confirm }) => {
        if (environment === "production" && !confirm) {
          return {
            output: "Production deploy requires explicit confirmation",
            title: "Deploy blocked",
          }
        }
        // Run deploy command
        const result = await runDeploy(environment)
        return {
          output: result.log,
          title: \`Deployed to \${environment}\`,
        }
      },
    },
  },
})`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Registering the Plugin</h3>
        <p className="text-slate-400 mb-3">Add to your config:</p>
        <CodeBlock>{`// .beastcli/beastcli.jsonc
{
  "plugin": [
    { "path": "./plugin.ts" },
    { "npm": "@my-org/my-plugin@1.0.0" }
  ]
}`}</CodeBlock>
      </section>

      {/* Plugin Hooks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Plugin Hooks</h2>
        <p className="text-slate-400 mb-4">Plugins can register hooks to modify BeastCLI behavior:</p>

        <table className="doc-table">
          <thead>
            <tr><th>Hook</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-white"><code className="doc-code">provider</code></td>
              <td>Add a custom AI provider with models, authentication, and API wrapper</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">auth</code></td>
              <td>Custom authentication methods with multiple login flows</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">chat.params</code></td>
              <td>Modify LLM request parameters (temperature, topP, etc.)</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">chat.headers</code></td>
              <td>Modify LLM request headers</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">chat.system.transform</code></td>
              <td>Transform the system prompt before sending to the LLM</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">shell.env</code></td>
              <td>Add environment variables for bash tool execution</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">tool.execute.before</code></td>
              <td>Hook before any tool execution</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">tool.execute.after</code></td>
              <td>Hook after any tool execution</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">event</code></td>
              <td>Handle internal bus events (session start, complete, etc.)</td>
            </tr>
            <tr>
              <td className="text-white"><code className="doc-code">config</code></td>
              <td>Receive config update notifications</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Advanced Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Advanced Example: Custom Provider</h2>
        <CodeBlock>{`import { Plugin } from "@simpletoolsindia/plugin"

export const plugin = Plugin.create({
  provider: {
    id: "my-custom-ai",
    name: "My Custom AI Service",
    apiId: "custom",
    models: [
      {
        id: "my-model-v2",
        name: "My Model v2",
        reasoning: false,
        input: ["text"],
        cost: { input: 0.001, output: 0.003 },
      },
    ],
    auth: {
      type: "api-key",
      key: "MY_AI_API_KEY",
    },
    createClient: async (config) => {
      // Return an AI SDK compatible language model
      const { createOpenAICompatible } = await import("@ai-sdk/openai-compatible")
      const provider = createOpenAICompatible({
        name: "my-custom-ai",
        baseUrl: "https://api.my-service.com/v1",
        apiKey: config.apiKey,
      })
      return provider.languageModel("my-model-v2")
    },
  },
})`}</CodeBlock>
      </section>

      {/* Loading Order */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Plugin Loading Order</h2>
        <p className="text-slate-400 mb-4">Plugins are loaded from multiple sources in this order:</p>
        <ol className="space-y-3 text-slate-400">
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">1.</span>
            <span><code className="doc-code">.beastcli/plugin.ts</code> — project-scoped plugin file</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">2.</span>
            <span>Plugins from <code className="doc-code">config.plugin</code> array (path or npm)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">3.</span>
            <span>Global npm-installed plugins</span>
          </li>
        </ol>
      </section>

      {/* Plugin Config */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Plugin Configuration</h2>
        <table className="doc-table">
          <thead>
            <tr><th>Spec Type</th><th>Format</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td className="text-white">Local file</td><td><code className="doc-code">{`{ "path": "./plugin.ts" }`}</code></td><td>Load from a file path</td></tr>
            <tr><td className="text-white">npm package</td><td><code className="doc-code">{`{ "npm": "@my-org/plugin@1.0.0" }`}</code></td><td>Install and load from npm</td></tr>
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
