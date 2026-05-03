'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal,
  Zap,
  Code2,
  Globe,
  Download,
  ChevronRight,
  Copy,
  Check,
  Box,
  Cpu,
  Key,
  Rocket,
  Menu,
  X,
  Github,
  Home,
  Book,
  ChevronDown,
  Sparkles,
  Brain,
  Server,
  Plug,
  Link as LinkIcon,
  Wallet,
} from 'lucide-react'
import { clsx } from 'clsx'

// Custom icons for missing lucide-react exports
function NpmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 7.334v8.5h2.459v2.547h1.235V7.334H0zm4.376 0v8.5h5.833v-2.547H6.611v-5.953H4.376zm9.46 0v2.547h1.666v5.953h2.46V7.334h-4.126z"/>
    </svg>
  )
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  )
}

function GitlabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-1.44a.91.91 0 0 1 1.03-.26l3.96 1.96 2.95-1.72a.93.93 0 0 1 1-.18l3.42 1.79 2.69-1.57a.91.91 0 0 1 1-.17l2.83 1.03 2.57-1.52a.9.9 0 0 1 .91-.09l3.58 2.09.93-.54a.83.83 0 0 1 1.01-.05l.49.4 1.22 4.48a.84.84 0 0 1-.35.99z"/>
    </svg>
  )
}

function VeniceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  )
}

function DeepinfraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <path d="M12 6V2M8 6V4M16 6V4"/>
    </svg>
  )
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Terminal Window Component
function TerminalWindow({ children, title = "beast" }: { children: React.ReactNode, title?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="terminal-window rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 text-center text-xs sm:text-sm text-slate-400 font-mono">{title}</div>
      </div>
      <div className="bg-slate-950/90 p-3 sm:p-4 lg:p-6 font-mono text-xs sm:text-sm">
        {children}
      </div>
    </motion.div>
  )
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-beast-500/30 transition-all duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-beast-500/5 to-cyber-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl" />
      <div className="relative">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-beast-500/20 to-cyber-500/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-beast-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// Install Method Card (using div instead of button to avoid nesting)
function InstallMethodCard({
  title,
  command,
  description,
  icon: Icon,
  isActive,
  onClick
}: {
  title: string
  command: string
  description: string
  icon: React.ElementType
  isActive: boolean
  onClick: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyCommand = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={clsx(
        "w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer",
        isActive
          ? "bg-beast-500/10 border-beast-500/50"
          : "bg-slate-900/30 border-slate-800/50 hover:border-slate-700"
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={clsx(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
          isActive ? "bg-beast-500/20" : "bg-slate-800/50"
        )}>
          <Icon className={clsx("w-4 h-4 sm:w-5 sm:h-5", isActive ? "text-beast-400" : "text-slate-400")} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm sm:text-base truncate">{title}</h4>
          <p className="text-xs text-slate-500 hidden sm:block">{description}</p>
        </div>
        <ChevronRight className={clsx(
          "w-4 h-4 shrink-0 transition-transform",
          isActive ? "text-beast-400 rotate-90" : "text-slate-600"
        )} />
      </div>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 sm:mt-4"
        >
          <div className="relative bg-slate-950/80 rounded-lg p-2 sm:p-3 font-mono text-xs sm:text-sm">
            <code className="text-cyber-400 break-all">{command}</code>
            <button
              onClick={copyCommand}
              className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Provider Badge
function ProviderBadge({ name, icon, color }: { name: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-all text-xs sm:text-sm"
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-slate-300">{name}</span>
    </motion.div>
  )
}

// Navigation
function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Features', href: '/#features', icon: Sparkles },
    { label: 'Install', href: '/installation', icon: Download },
    { label: 'Quick Start', href: '/quickstart', icon: Rocket },
    { label: 'Docs', href: '/docs', icon: Book },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-beast-500 to-cyber-500 flex items-center justify-center">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg text-white">BeastCLI</span>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/simpletoolsindia/code-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Star</span>
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </a>
              ))}
              <a
                href="https://github.com/simpletoolsindia/code-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-14 sm:pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-beast-500/5 via-transparent to-transparent" />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-beast-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-80 sm:h-80 bg-cyber-500/20 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-beast-500/10 border border-beast-500/20 mb-6 sm:mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-beast-400" />
            <span className="text-xs sm:text-sm text-beast-300">v2.4.12 - Now with AI Gateway & MCP Support</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
          >
            <span className="text-white">The </span>
            <span className="gradient-text">Open-Source AI</span>
            <br className="hidden sm:block" />
            <span className="text-white">Coding Agent for </span>
            <span className="gradient-text">Your Terminal</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
          >
            Provider-agnostic AI coding assistant with a rich TUI. Built with Bun, powered by Effect.
            Use Claude, OpenAI, Gemini, or run local models with Ollama.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 px-4"
          >
            <a
              href="/installation"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-beast-600 to-beast-500 hover:from-beast-500 hover:to-beast-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-beast-500/25 hover:shadow-beast-500/40 text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Install BeastCLI
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="/quickstart"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-medium rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300 text-sm sm:text-base"
            >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
              Quick Start
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl sm:max-w-3xl mx-auto px-2"
          >
            <TerminalWindow>
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
                  <span className="text-cyber-400">❯</span>
                  <span>beast</span>
                </div>
                <div className="text-slate-300 text-xs sm:text-sm">
                  <span className="text-green-400">✓</span> Connected to Ollama (auto-detected)
                </div>
                <div className="text-slate-300 text-xs sm:text-sm">
                  <span className="text-beast-400">🤖</span> Using model: llama3.3:70b
                </div>
                <div className="h-px bg-slate-800" />
                <div className="text-slate-400 text-xs sm:text-sm">
                  <span className="text-yellow-400">⚡</span> Context: 2,847 / 8,192 tokens
                </div>
                <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-800/50">
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Ready to assist. What would you like to build today?
                  </p>
                </div>
              </div>
            </TerminalWindow>
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
      </motion.div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Terminal,
      title: "Rich TUI",
      description: "Mission Control sidebar with real-time context progress and keyboard shortcuts.",
    },
    {
      icon: Globe,
      title: "Multi-Provider Support",
      description: "Claude, OpenAI, Gemini, GitHub Copilot, OpenRouter + local providers.",
    },
    {
      icon: Zap,
      title: "Bun-Native",
      description: "Built with Bun and Effect framework. Fast startup, low memory usage.",
    },
    {
      icon: Box,
      title: "Auto-Detection",
      description: "Local AI servers discovered automatically — no configuration needed.",
    },
    {
      icon: Plug,
      title: "Plugin SDK",
      description: "Build custom agents, tools, and providers with the plugin SDK.",
    },
    {
      icon: LinkIcon,
      title: "MCP Support",
      description: "Full Model Context Protocol support for external tools.",
    },
  ]

  return (
    <section id="features" className="relative py-16 sm:py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-beast-500/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.span variants={fadeInUp} className="text-beast-400 font-medium text-xs sm:text-sm uppercase tracking-wider">
            Features
          </motion.span>
          <motion.h2 variants={fadeInUp} className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Everything You Need for
            <br className="hidden sm:block" />
            <span className="gradient-text">AI-Powered Development</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Built for developers who want full control over their AI coding tools.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Installation Section
function InstallationSection() {
  const [activeMethod, setActiveMethod] = useState('npm')

  const installMethods = [
    { id: 'npm', title: 'npm', icon: NpmIcon, command: 'npm install -g @simpletoolsindia/beast-cli', description: 'Best for most users' },
    { id: 'bun', title: 'Bun', icon: Box, command: 'bun install -g @simpletoolsindia/beast-cli', description: 'For Bun users' },
    { id: 'homebrew', title: 'Homebrew', icon: Box, command: 'brew install simpletoolsindia/tap/beastcli', description: 'macOS/Linux' },
    { id: 'scoop', title: 'Scoop', icon: Box, command: 'scoop install beastcli', description: 'Windows' },
    { id: 'source', title: 'From Source', icon: Github, command: 'git clone https://github.com/simpletoolsindia/code-cli.git && cd code-cli && bun install && cd packages/beastcli && bun run build --single --baseline', description: 'Build from source' },
  ]

  return (
    <section id="installation" className="relative py-16 sm:py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-500/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.span variants={fadeInUp} className="text-cyber-400 font-medium text-xs sm:text-sm uppercase tracking-wider">
            Installation
          </motion.span>
          <motion.h2 variants={fadeInUp} className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Get Started in
            <span className="gradient-text"> Minutes</span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2 sm:space-y-3"
          >
            {installMethods.map((method) => (
              <InstallMethodCard
                key={method.id}
                {...method}
                isActive={activeMethod === method.id}
                onClick={() => setActiveMethod(method.id)}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6"
          >
            <TerminalWindow title="terminal">
              <div className="space-y-2 sm:space-y-3">
                <div className="text-slate-500 text-xs sm:text-sm"># Install globally</div>
                <div>
                  <span className="text-green-400">$</span>{' '}
                  <span className="text-cyber-400 text-xs sm:text-sm">
                    {installMethods.find(m => m.id === activeMethod)?.command}
                  </span>
                </div>
                <div className="text-slate-500 mt-3 sm:mt-4 text-xs sm:text-sm"># Verify installation</div>
                <div>
                  <span className="text-green-400">$</span>{' '}
                  <span className="text-cyber-400 text-xs sm:text-sm">beast --version</span>
                </div>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-beast-500/10 border border-beast-500/20 rounded-lg">
                  <span className="text-beast-300 text-xs sm:text-sm">beast-cli v2.4.12</span>
                </div>
              </div>
            </TerminalWindow>

            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
              <Key className="w-4 h-4 shrink-0" />
              <span>Connect API keys with <code className="text-cyber-400">beast /connect</code></span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Quick Start Section
function QuickStartSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: 'Start a Session',
      description: 'Launch BeastCLI in your project directory',
      code: '# Start an interactive session\nbeast\n\n# Run in a specific directory\nbeast ./my-project',
      output: 'Connecting to providers...\n\n✓ Ollama (Local) - Port 11434\n✓ Anthropic (Cloud)\n\nUsing: llama3.3:70b via Ollama\n\nReady. What would you like to build?',
    },
    {
      title: 'Connect a Provider',
      description: 'Configure your AI provider and model',
      code: '# Open the connect wizard\nbeast /connect\n\n# Check provider status\nbeast doctor',
      output: 'Providers:\n  1. Ollama (local) - ✓ connected\n  2. Anthropic (cloud) - ✓ configured\n  3. OpenAI (cloud) - Not configured\n\nSelect provider for this session:',
    },
    {
      title: 'Start Building',
      description: 'Tell BeastCLI what to build or fix',
      code: '# Build a feature\nbeast "Add user auth"\n\n# Use plan mode first\nbeast --agent plan "Refactor"',
      output: 'Analyzing request...\n\nI\'ll help you build a secure authentication system.\n\nCreating:\n  ✓ src/auth/jwt.ts\n  ✓ src/auth/login.ts\n  ✓ tests/auth.test.ts\n\nShall I proceed?',
    },
  ]

  return (
    <section id="quickstart" className="relative py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.span variants={fadeInUp} className="text-beast-400 font-medium text-xs sm:text-sm uppercase tracking-wider">
            Quick Start
          </motion.span>
          <motion.h2 variants={fadeInUp} className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Start Building in
            <span className="gradient-text"> 60 Seconds</span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="flex lg:flex-col gap-2">
              {steps.map((step, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl text-left transition-all duration-300 text-sm",
                    activeStep === index
                      ? "bg-beast-500/10 border border-beast-500/30"
                      : "bg-slate-900/30 border border-slate-800/50 hover:border-slate-700"
                  )}
                >
                  <div className={clsx(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0",
                    activeStep === index
                      ? "bg-beast-500 text-white"
                      : "bg-slate-800 text-slate-400"
                  )}>
                    {index + 1}
                  </div>
                  <span className={activeStep === index ? "text-white" : "text-slate-400"}>
                    {step.title}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TerminalWindow title={steps[activeStep].title.toLowerCase().replace(' ', '-')}>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-slate-500 text-xs uppercase tracking-wider">
                      {steps[activeStep].description}
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap font-mono text-xs sm:text-sm">
                      {steps[activeStep].code}
                    </pre>
                    <div className="h-px bg-slate-800" />
                    <div className="text-slate-500 text-xs uppercase tracking-wider">Output</div>
                    <div className="text-green-400 font-mono text-xs sm:text-sm">
                      {steps[activeStep].output}
                    </div>
                  </div>
                </TerminalWindow>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

// Providers Section
function ProvidersSection() {
  return (
    <section id="providers" className="relative py-16 sm:py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-beast-500/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.span variants={fadeInUp} className="text-beast-400 font-medium text-xs sm:text-sm uppercase tracking-wider">
            Supported Providers
          </motion.span>
          <motion.h2 variants={fadeInUp} className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Your Models,
            <br className="hidden sm:block" />
            <span className="gradient-text">Your Choice</span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyber-500/20 flex items-center justify-center">
                <CloudIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Cloud Providers</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <ProviderBadge name="Anthropic" icon={<Brain className="w-3 h-3 sm:w-4 sm:h-4" />} color="#FF6B6B" />
              <ProviderBadge name="OpenAI" icon={<Zap className="w-3 h-3 sm:w-4 sm:h-4" />} color="#00D9FF" />
              <ProviderBadge name="Google" icon={<Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />} color="#34D399" />
              <ProviderBadge name="OpenRouter" icon={<Globe className="w-3 h-3 sm:w-4 sm:h-4" />} color="#FB7185" />
              <ProviderBadge name="Copilot" icon={<Code2 className="w-3 h-3 sm:w-4 sm:h-4" />} color="#a855f7" />
              <ProviderBadge name="GitLab" icon={<GitlabIcon className="w-3 h-3 sm:w-4 sm:h-4" />} color="#FC6D26" />
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> 200+ models via OpenRouter</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> Claude 4, GPT-4o, Gemini 2.5</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-beast-500/20 flex items-center justify-center">
                <Server className="w-4 h-4 sm:w-5 sm:h-5 text-beast-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Local Providers</h3>
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">Auto-detected</span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {[
                { name: 'Ollama', port: '11434', models: 'llama3.3, mistral...' },
                { name: 'LM Studio', port: '1234', models: 'Any GGUF model' },
                { name: 'Jan', port: '1337', models: 'Mistral, Neural Chat...' },
                { name: 'MLX', port: '8080', models: 'Apple Silicon' },
                { name: 'vLLM', port: '8001', models: 'High-perf serving' },
              ].map((provider) => (
                <div key={provider.name} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-beast-400" />
                    <span className="text-white font-medium text-xs sm:text-sm">{provider.name}</span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-500">Port {provider.port}</div>
                    <div className="text-xs text-slate-400">{provider.models}</div>
                  </div>
                  <div className="sm:hidden text-xs text-slate-500">:{provider.port}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs sm:text-sm text-green-300">No API keys needed. Your models, running locally.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Keyboard Shortcuts Section
function ShortcutsSection() {
  const shortcuts = [
    { key: 'Ctrl/Cmd + K', action: 'Commands' },
    { key: 'Ctrl/Cmd + O', action: 'Switch model' },
    { key: 'Ctrl/Cmd + B', action: 'Toggle sidebar' },
    { key: 'Ctrl/Cmd + S', action: 'Switch session' },
    { key: 'Ctrl/Cmd + T', action: 'Theme' },
    { key: 'Ctrl/Cmd + H', action: 'Help' },
    { key: 'Esc', action: 'Stop' },
  ]

  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Keyboard Shortcuts</h3>
            <p className="text-slate-400 mt-1 sm:mt-2 text-sm">Work faster with these shortcuts</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
              >
                <span className="text-slate-400 text-xs sm:text-sm">{shortcut.action}</span>
                <kbd className="px-1.5 sm:px-3 py-1 text-xs sm:text-sm font-mono bg-slate-800 text-beast-300 rounded border border-slate-700 shrink-0 ml-2">
                  {shortcut.key}
                </kbd>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Packages Section
function PackagesSection() {
  const packages = [
    { name: '@simpletoolsindia/beast-cli', desc: 'Native CLI binary + npm wrapper', color: '#7B61FF' },
    { name: '@simpletoolsindia/plugin', desc: 'Plugin SDK for custom agents', color: '#00E5FF' },
    { name: '@simpletoolsindia/sdk', desc: 'JavaScript/TypeScript client SDK', color: '#00E676' },
    { name: '@simpletoolsindia/core', desc: 'Core utilities & filesystem', color: '#FFAB00' },
  ]

  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">NPM Packages</h3>
            <p className="text-slate-400 mt-1 sm:mt-2 text-sm">Explore all BeastCLI packages</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {packages.map((pkg, index) => (
              <motion.a
                key={pkg.name}
                href={`https://www.npmjs.com/package/${pkg.name}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 transition-colors"
              >
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: pkg.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-xs sm:text-sm truncate">{pkg.name}</div>
                  <div className="text-xs text-slate-500 hidden sm:block">{pkg.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="relative py-12 sm:py-16 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-beast-500 to-cyber-500 flex items-center justify-center">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-base sm:text-lg text-white">BeastCLI</span>
            </div>
            <p className="text-slate-400 text-sm">The open-source AI coding agent that puts you in control.</p>
            <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
              <a href="https://github.com/simpletoolsindia/code-cli" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.npmjs.com/package/@simpletoolsindia/beast-cli" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white transition-colors">
                <NpmIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['Documentation', 'API Reference', 'Plugins', 'Changelog'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Community</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: 'GitHub Discussions', href: 'https://github.com/simpletoolsindia/code-cli/discussions' },
                { label: 'Discord', href: '#' },
                { label: 'Contributing', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Version</h4>
            <p className="text-slate-400 text-xs sm:text-sm">v2.4.12</p>
            <p className="text-slate-500 text-xs mt-2">Built with Bun + Effect</p>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-slate-500">
            MIT License. Built by <a href="https://github.com/simpletoolsindia" className="text-beast-400 hover:text-beast-300">@simpletoolsindia</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function HomePage() {
  return (
    <main className="relative">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <InstallationSection />
      <QuickStartSection />
      <ProvidersSection />
      <ShortcutsSection />
      <PackagesSection />
      <Footer />
    </main>
  )
}