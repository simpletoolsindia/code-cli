import Link from 'next/link'
import { Terminal, Zap, Globe, Box, Plug, Code2, Server, Brain, Shield, Layers, Rocket, BookOpen, Wrench, Cpu } from 'lucide-react'

export default function DocsPage() {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Everything you need to know to get up and running with BeastCLI.',
      items: [
        { icon: BookOpen, title: 'Introduction', href: '/docs', desc: 'What is BeastCLI and why it matters' },
        { icon: Rocket, title: 'Getting Started', href: '/docs/getting-started', desc: 'Install, configure, and run your first session' },
      ],
    },
    {
      title: 'Usage',
      description: 'Learn how to use BeastCLI effectively in your daily workflow.',
      items: [
        { icon: Terminal, title: 'Commands', href: '/docs/commands', desc: 'Complete CLI command reference' },
        { icon: Wrench, title: 'Tools', href: '/docs/tools', desc: 'Built-in tools the AI uses to work with your code' },
        { icon: Brain, title: 'Agents', href: '/docs/agents', desc: 'Agent modes, custom agents, and subagents' },
        { icon: Globe, title: 'Providers', href: '/docs/providers', desc: 'Connect cloud and local AI providers' },
        { icon: Cpu, title: 'Configuration', href: '/docs/configuration', desc: 'Full config schema reference and examples' },
      ],
    },
    {
      title: 'Integrations',
      description: 'Extend BeastCLI with external tools and custom code.',
      items: [
        { icon: Layers, title: 'MCP Servers', href: '/docs/mcp', desc: 'Model Context Protocol integration' },
        { icon: Plug, title: 'Plugins', href: '/docs/plugins', desc: 'Build custom tools, agents, and hooks' },
        { icon: BookOpen, title: 'Skills', href: '/docs/skills', desc: 'Specialized instruction packs for domain expertise' },
      ],
    },
    {
      title: 'Technical',
      description: 'Understand the internals for contributing or debugging.',
      items: [
        { icon: Code2, title: 'Architecture', href: '/docs/architecture', desc: 'Source structure, tech stack, and request flow' },
      ],
    },
  ]

  return (
    <>
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Documentation
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Comprehensive guides for every aspect of BeastCLI — from your first session to building custom plugins.
        </p>
      </div>

      {sections.map(section => (
        <div key={section.title} className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">{section.title}</h2>
          <p className="text-slate-500 mb-6">{section.description}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group p-5 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-beast-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-beast-500/20 to-cyber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-beast-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1 group-hover:text-beast-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-beast-500/10 to-cyber-500/10 border border-beast-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">Quick Reference</h3>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Install</p>
            <code className="text-sm text-cyber-400">npm install -g @simpletoolsindia/beast-cli</code>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Start</p>
            <code className="text-sm text-cyber-400">beast</code>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Run a task</p>
            <code className="text-sm text-cyber-400">beast run "your task"</code>
          </div>
        </div>
      </div>
    </>
  )
}
