'use client'

import { motion } from 'framer-motion'
import { Rocket, Play, Zap, ChevronRight, Terminal, Check, Brain, Server, Cpu } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

function ConnectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const steps = [
  {
    icon: Play,
    title: 'Start BeastCLI',
    description: 'Launch BeastCLI in your project directory. It will auto-detect local providers.',
    code: `# Start an interactive session
beast

# Run in a specific directory
beast ./my-project

# Start in development mode (requires Bun)
bun run dev`,
    output: `Connecting to providers...
✓ Ollama detected on port 11434
✓ Anthropic configured (API key set)
✓ OpenAI configured (API key set)

Using: llama3.3:70b via Ollama
Context limit: 200,000 tokens

Ready. What would you like to build?`,
  },
  {
    icon: ConnectIcon,
    title: 'Connect Providers',
    description: 'Configure API keys and choose your AI provider and model.',
    code: `# Open the connect wizard
beast /connect

# Or directly pick a model/provider
beast /model

# Check provider status
beast doctor

# Set a specific provider
beast --provider anthropic`,
    output: `Provider Configuration
═══════════════════════════

Cloud Providers:
  1. Anthropic (Claude)    ✓ Configured
  2. OpenAI (GPT-4o)        ✓ Configured
  3. Google (Gemini)       Not configured
  4. OpenRouter            ✓ Configured

Local Providers:
  5. Ollama (port 11434)   ✓ Auto-detected
  6. LM Studio (port 1234) Not running
  7. Jan (port 1337)        Not running

Select provider: 1
Select model: claude-sonnet-4-20250514

✓ Connected to Anthropic (Claude)`,
  },
  {
    icon: Zap,
    title: 'Start Building',
    description: 'Tell BeastCLI what you want to build, fix, or understand.',
    code: `# Build a feature
beast "Add user authentication with JWT"

# Fix a bug
beast "Fix the login redirect issue"

# Understand code
beast "Explain how the payment flow works"

# Use plan mode first (read-only)
beast --agent plan "Refactor the auth module"

# Use build mode for modifications
beast --agent build "Add rate limiting"`,
    output: `Analyzing: "Add user authentication with JWT"

I'll help you build a secure authentication system.
Let me first understand your codebase structure...

Found:
  - src/
  - package.json
  - src/middleware/
  - src/database/

Creating files:
  ✓ src/auth/jwt.ts
  ✓ src/auth/login.ts
  ✓ src/auth/register.ts
  ✓ src/middleware/auth.ts
  ✓ tests/auth.test.ts

Applying changes...

✓ Authentication system created!
Review the changes with: git diff`,
  },
]

export default function QuickStartPage() {
  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beast-500/10 border border-beast-500/20 mb-6">
              <Rocket className="w-4 h-4 text-beast-400" />
              <span className="text-sm text-beast-300">v2.4.12</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Quick Start
              <span className="gradient-text"> Guide</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Get started with BeastCLI in three simple steps. From installation to your first feature.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-8 mb-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="grid lg:grid-cols-2 gap-8 items-center"
              >
                {/* Step Info */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-beast-500/20 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-beast-400" />
                    </div>
                    <div>
                      <div className="text-sm text-beast-400 font-medium">
                        Step {index + 1}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-slate-400 mb-6">{step.description}</p>

                  <div className="bg-slate-950/80 rounded-lg p-4 font-mono">
                    <pre className="text-slate-300 whitespace-pre-wrap text-sm">
                      {step.code}
                    </pre>
                  </div>
                </div>

                {/* Terminal Output */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="terminal-window rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex-1 text-center text-sm text-slate-400 font-mono">
                        {step.title.toLowerCase().replace(' ', '-')}
                      </div>
                    </div>
                    <div className="bg-slate-950/90 p-6 font-mono text-sm">
                      <pre className="text-green-400 whitespace-pre-wrap">
                        {step.output}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Agent Modes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Brain className="w-6 h-6 text-beast-400" />
                Agent Modes
              </h2>
              <p className="text-slate-400 mb-6">
                BeastCLI supports three agent modes for different use cases:
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="text-beast-400 font-medium mb-2">Build Agent</div>
                  <div className="text-sm text-slate-400">
                    Full access to create, modify, and delete files. Use for active development.
                  </div>
                  <code className="text-xs text-cyber-400 mt-2 block">beast --agent build</code>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="text-cyber-400 font-medium mb-2">Plan Agent</div>
                  <div className="text-sm text-slate-400">
                    Read-only mode. Analyzes code and proposes changes without modifying files.
                  </div>
                  <code className="text-xs text-cyber-400 mt-2 block">beast --agent plan</code>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="text-green-400 font-medium mb-2">General Agent</div>
                  <div className="text-sm text-slate-400">
                    Subagent mode. Useful for calling BeastCLI from other tools.
                  </div>
                  <code className="text-xs text-cyber-400 mt-2 block">beast --agent general</code>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Local Providers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Server className="w-6 h-6 text-beast-400" />
                Auto-Detected Local Providers
              </h2>
              <p className="text-slate-400 mb-6">
                BeastCLI automatically detects these local AI providers when they're running:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Ollama', port: '11434', desc: 'Most popular local LLM runner' },
                  { name: 'LM Studio', port: '1234', desc: 'Desktop app for GGUF models' },
                  { name: 'Jan', port: '1337', desc: 'Privacy-first local AI' },
                  { name: 'MLX', port: '8080', desc: 'Apple Silicon optimized' },
                  { name: 'vLLM', port: '8001', desc: 'High-throughput inference' },
                ].map((provider) => (
                  <div key={provider.name} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <Cpu className="w-4 h-4 text-beast-400" />
                    <div>
                      <div className="text-white font-medium">{provider.name}</div>
                      <div className="text-xs text-slate-500">Port {provider.port} · {provider.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-300">
                  <Check className="w-4 h-4 inline mr-2" />
                  No API keys needed! Local models work out of the box.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pro Tips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Pro Tips</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Be Specific',
                  desc: '"Add a REST API endpoint for /users with JWT auth" works better than "add user stuff"'
                },
                {
                  title: 'Use Plan Mode',
                  desc: 'Run beast --agent plan first to preview changes before making them'
                },
                {
                  title: 'Leverage Keyboard Shortcuts',
                  desc: 'Ctrl+K opens commands, Ctrl+O switches models, Ctrl+B toggles the sidebar'
                },
                {
                  title: 'Check with Doctor',
                  desc: 'Run beast doctor to diagnose provider connection issues'
                },
                {
                  title: 'Context Matters',
                  desc: 'BeastCLI works best when you provide context about your project structure'
                },
                {
                  title: 'Local First',
                  desc: 'Try local models first for privacy and cost savings — auto-detected and ready to go'
                },
              ].map((tip, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/50"
                >
                  <Check className="w-5 h-5 text-beast-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">{tip.title}</h3>
                  <p className="text-sm text-slate-400">{tip.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/installation"
              className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Installation
            </Link>
            <a
              href="https://github.com/simpletoolsindia/code-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-beast-500/10 hover:bg-beast-500/20 text-beast-300 rounded-xl transition-colors"
            >
              GitHub Repository
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}