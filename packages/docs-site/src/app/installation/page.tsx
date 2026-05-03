'use client'

import { motion } from 'framer-motion'
import { Download, Check, Copy, ChevronRight, Terminal, Box, Github, Zap, Server, Cpu } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 7.334v8.5h2.459v2.547h1.235V7.334H0zm4.376 0v8.5h5.833v-2.547H6.611v-5.953H4.376zm9.46 0v2.547h1.666v5.953h2.46V7.334h-4.126z"/>
    </svg>
  )
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function InstallationPage() {
  const [activeMethod, setActiveMethod] = useState('npm')
  const [copied, setCopied] = useState<string | null>(null)

  const installMethods = [
    {
      id: 'npm',
      title: 'npm (Recommended)',
      icon: NpmIcon,
      command: 'npm install -g @simpletoolsindia/beast-cli',
      description: 'Best for most users. Automatically downloads the correct native binary for your platform.',
      highlights: ['Automatic platform detection', 'Easy updates with npm update -g', 'No manual downloads needed']
    },
    {
      id: 'bun',
      title: 'Bun',
      icon: Box,
      command: 'bun install -g @simpletoolsindia/beast-cli',
      description: 'For Bun users who prefer the Bun runtime and ecosystem.',
      highlights: ['Fastest installation', 'Native Bun support', 'Zero extra dependencies']
    },
    {
      id: 'homebrew',
      title: 'Homebrew',
      icon: Box,
      command: 'brew install simpletoolsindia/tap/beastcli',
      description: 'macOS/Linux package manager via Homebrew tap.',
      highlights: ['Homebrew ecosystem integration', 'Easy uninstall', 'Update with brew upgrade beastcli']
    },
    {
      id: 'scoop',
      title: 'Scoop',
      icon: Box,
      command: 'scoop install beastcli',
      description: 'Windows command-line installer via Scoop bucket.',
      highlights: ['Windows-native experience', 'Scoop bucket support', 'Clean uninstallation']
    },
    {
      id: 'source',
      title: 'Build from Source',
      icon: Github,
      command: 'git clone https://github.com/simpletoolsindia/code-cli.git && cd code-cli && bun install && cd packages/beastcli && bun run build --single --baseline',
      description: 'Build the native binary from source code using Bun.',
      highlights: ['Full control over build', 'Access to latest features', 'Contribute back to the project']
    },
  ]

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command)
    setCopied(command)
    setTimeout(() => setCopied(null), 2000)
  }

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
              <Download className="w-4 h-4 text-beast-400" />
              <span className="text-sm text-beast-300">v2.4.12</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Install
              <span className="gradient-text"> BeastCLI</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Get BeastCLI up and running in minutes. Available for macOS, Linux, and Windows.
              Built with Bun and distributed as a native binary.
            </p>
          </motion.div>

          {/* Installation Methods Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-20">
            {installMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveMethod(method.id)}
                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  activeMethod === method.id
                    ? 'bg-beast-500/10 border-beast-500/50 glow-primary'
                    : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    activeMethod === method.id
                      ? 'bg-beast-500/20'
                      : 'bg-slate-800/50'
                  }`}>
                    <method.icon className={`w-6 h-6 ${
                      activeMethod === method.id ? 'text-beast-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{method.title}</h3>
                    <p className="text-sm text-slate-500">{method.description}</p>
                  </div>
                </div>

                {/* Command */}
                <div className="relative bg-slate-950/80 rounded-lg p-3 font-mono text-sm mb-4">
                  <code className="text-cyber-400 break-all">{method.command}</code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyCommand(method.command)
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                  >
                    {copied === method.command ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Highlights */}
                <ul className="space-y-2">
                  {method.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-green-400" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Prerequisites */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-beast-400" />
                Prerequisites
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">For Installation</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Node.js 18+ (for npm installation)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Bun 1.0+ (for Bun installation or building from source)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      macOS, Linux, or Windows
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">For Local Models</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-beast-400" />
                      Ollama, LM Studio, Jan, MLX, or vLLM
                    </li>
                    <li className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-beast-400" />
                      One of 5 supported local providers running
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      No API keys needed for local models
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Verification */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Terminal className="w-6 h-6 text-beast-400" />
                Verify Installation
              </h2>
              <p className="text-slate-400 mb-6">
                After installation, verify that BeastCLI is working correctly:
              </p>

              <div className="bg-slate-950/80 rounded-lg p-4 font-mono">
                <div className="text-slate-500 mb-2"># Check the version</div>
                <div className="text-slate-300 mb-4">
                  <span className="text-green-400">$</span> beast --version
                </div>

                <div className="text-slate-500 mb-2"># Run diagnostics</div>
                <div className="text-slate-300 mb-4">
                  <span className="text-green-400">$</span> beast doctor
                </div>

                <div className="text-slate-500 mb-2"># Start an interactive session</div>
                <div className="text-slate-300">
                  <span className="text-green-400">$</span> beast
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-300">
                  <Check className="w-4 h-4 inline mr-2" />
                  If you see the BeastCLI prompt, you're all set!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Next Steps</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/quickstart"
                className="flex items-center gap-2 px-6 py-3 bg-beast-500/10 hover:bg-beast-500/20 text-beast-300 rounded-xl transition-colors"
              >
                Quick Start Guide
                <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/simpletoolsindia/code-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-colors"
              >
                GitHub Repository
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}