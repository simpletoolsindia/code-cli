export default function ProvidersPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">AI Providers</h1>
        <p className="text-lg text-slate-400">
          Connect to any AI provider — cloud APIs, local servers, or self-hosted gateways. BeastCLI supports 20+ providers out of the box.
        </p>
      </div>

      {/* For Non-Technical Users */}
      <section className="mb-12 p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
        <h2 className="text-xl font-bold text-white mb-3">For Non-Technical Users</h2>
        <p className="text-slate-400 mb-4">
          A "provider" is the company or service that powers the AI. Think of it like a phone company — you pick one, and BeastCLI uses it to "call" the AI.
        </p>
        <p className="text-slate-400 mb-4">
          You can use cloud providers (like Anthropic's Claude or OpenAI's GPT) which require an API key, or run AI models locally on your own computer using tools like Ollama (free, no keys needed).
        </p>
        <h3 className="text-white font-medium mb-2">How to Connect</h3>
        <ol className="space-y-3 text-slate-400">
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">1.</span>
            <span>Type <code className="doc-code">beast /connect</code> in your terminal</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">2.</span>
            <span>Select your provider from the list</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">3.</span>
            <span>Follow the on-screen instructions to enter your API key</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-beast-400 font-bold">4.</span>
            <span>That's it — you're connected!</span>
          </li>
        </ol>
      </section>

      {/* Cloud Providers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Cloud Providers</h2>
        <p className="text-slate-400 mb-4">
          Cloud providers host AI models on their servers. You need an API key to use them, and you pay per token used.
        </p>

        <table className="doc-table">
          <thead>
            <tr><th>Provider</th><th>Auth</th><th>Key Models</th><th>Setup</th></tr>
          </thead>
          <tbody>
            <tr><td className="text-white">Anthropic</td><td>API key</td><td>Claude 4, 3.5 Sonnet, Opus</td><td>beast /connect</td></tr>
            <tr><td className="text-white">OpenAI</td><td>API key / OAuth</td><td>GPT-4o, o3, o1</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Google</td><td>API key / OAuth</td><td>Gemini 2.5 Pro, Flash</td><td>beast /connect</td></tr>
            <tr><td className="text-white">OpenRouter</td><td>API key</td><td>200+ models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">GitHub Copilot</td><td>OAuth</td><td>GPT-4o, Claude Sonnet</td><td>Interactive login</td></tr>
            <tr><td className="text-white">GitLab</td><td>OAuth</td><td>Various</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Azure</td><td>OAuth</td><td>Azure OpenAI models</td><td>Interactive login</td></tr>
            <tr><td className="text-white">Cloudflare</td><td>API token</td><td>Routed models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Venice</td><td>API key</td><td>Various</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Together AI</td><td>API key</td><td>Various open models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Groq</td><td>API key</td><td>Fast inference</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Cohere</td><td>API key</td><td>Command models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Mistral</td><td>API key</td><td>Mistral models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Perplexity</td><td>API key</td><td>Search models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">X.ai (Grok)</td><td>API key</td><td>Grok models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Alibaba</td><td>API key</td><td>Qwen models</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Cerebras</td><td>API key</td><td>Fast inference</td><td>beast /connect</td></tr>
            <tr><td className="text-white">DeepInfra</td><td>API key</td><td>Various</td><td>beast /connect</td></tr>
            <tr><td className="text-white">Vercel</td><td>API key</td><td>AI Gateway</td><td>beast /connect</td></tr>
          </tbody>
        </table>
      </section>

      {/* Local Providers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Local Providers</h2>
        <p className="text-slate-400 mb-4">
          Local providers run AI models on your own machine. No API keys, no usage costs, and no data leaves your computer. BeastCLI auto-detects these — just start the server.
        </p>

        <table className="doc-table">
          <thead>
            <tr><th>Provider</th><th>Default Port</th><th>Best For</th></tr>
          </thead>
          <tbody>
            <tr><td className="text-white">Ollama</td><td><code className="doc-code">11434</code></td><td>Easy setup, many models</td></tr>
            <tr><td className="text-white">LM Studio</td><td><code className="doc-code">1234</code></td><td>GGUF models, GUI</td></tr>
            <tr><td className="text-white">Jan</td><td><code className="doc-code">1337</code></td><td>Open-source, cross-platform</td></tr>
            <tr><td className="text-white">MLX</td><td><code className="doc-code">8080</code></td><td>Apple Silicon optimized</td></tr>
            <tr><td className="text-white">vLLM</td><td><code className="doc-code">8001</code></td><td>High-performance serving</td></tr>
          </tbody>
        </table>

        <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-green-300 text-sm">
            Zero configuration needed. Start your local server and BeastCLI will find it automatically.
          </p>
        </div>
      </section>

      {/* Provider Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Provider Configuration</h2>

        <h3 className="text-lg font-semibold text-white mb-3">Using beast /connect</h3>
        <p className="text-slate-400 mb-4">The interactive wizard guides you through connecting any provider.</p>

        <h3 className="text-lg font-semibold text-white mb-3">Environment Variables</h3>
        <p className="text-slate-400 mb-3">Alternatively, set environment variables:</p>
        <CodeBlock>{`# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI
export OPENAI_API_KEY="sk-..."

# Google
export GOOGLE_GENERATIVE_AI_API_KEY="..."`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Custom Provider Configuration</h3>
        <p className="text-slate-400 mb-3">Add custom providers to your config:</p>
        <CodeBlock>{`{
  "provider": {
    "my-custom-openai": {
      "id": "openai-compatible",
      "name": "My Custom Server",
      "apiId": "custom",
      "baseUrl": "http://localhost:8080/v1",
      "models": [
        { "id": "my-model", "name": "My Model", "reasoning": false }
      ]
    }
  }
}`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Disabling Providers</h3>
        <p className="text-slate-400 mb-3">Control which providers are visible:</p>
        <CodeBlock>{`{
  "disabled_providers": ["openai", "google"],
  "enabled_providers": ["anthropic", "ollama"]
}`}</CodeBlock>
        <p className="text-slate-500 text-sm mt-2">
          <code className="doc-code">disabled_providers</code> hides specific providers. <code className="doc-code">enabled_providers</code> shows ONLY those listed.
        </p>
      </section>

      {/* Model Selection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Model Selection</h2>
        <p className="text-slate-400 mb-4">
          Set your default model in config or override per-session:
        </p>
        <CodeBlock>{`# In beastcli.jsonc
{
  "model": "anthropic/claude-sonnet-4",
  "small_model": "ollama/llama3.2"
}

# Override on command line
beast --model ollama/llama3.3
beast run "task" -m anthropic/claude-sonnet-4`}</CodeBlock>
        <p className="text-slate-500 text-sm mt-3">
          The <code className="doc-code">small_model</code> is used for lightweight tasks like generating session titles.
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
