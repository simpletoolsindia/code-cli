'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Terminal, Menu, X, Github, ChevronDown, ChevronRight } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Install', href: '/installation' },
  { label: 'Quick Start', href: '/quickstart' },
  { label: 'Docs', href: '/docs' },
]

const docNav = [
  {
    group: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Getting Started', href: '/docs/getting-started' },
    ],
  },
  {
    group: 'Usage',
    items: [
      { label: 'Commands', href: '/docs/commands' },
      { label: 'Tools', href: '/docs/tools' },
      { label: 'Agents', href: '/docs/agents' },
      { label: 'Providers', href: '/docs/providers' },
      { label: 'Configuration', href: '/docs/configuration' },
    ],
  },
  {
    group: 'Integrations',
    items: [
      { label: 'MCP Servers', href: '/docs/mcp' },
      { label: 'Plugins', href: '/docs/plugins' },
      { label: 'Skills', href: '/docs/skills' },
    ],
  },
  {
    group: 'Technical',
    items: [
      { label: 'Architecture', href: '/docs/architecture' },
    ],
  },
]

function DocSidebar({ mobile = false, onClose }: { mobile?: boolean, onClose?: () => void }) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(docNav.map(g => [g.group, true]))
  )

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <nav className="space-y-1">
      {docNav.map(group => (
        <div key={group.group}>
          <button
            onClick={() => toggleGroup(group.group)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300"
          >
            {group.group}
            {openGroups[group.group] ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          {openGroups[group.group] && (
            <div className="ml-2 space-y-0.5">
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => mobile && onClose?.()}
                  className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-beast-500 to-cyber-400 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">BeastCLI</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/simpletoolsindia/code-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute right-0 top-14 bottom-0 w-64 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="sidebar-link block"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950">
      <TopNav />
      
      <div className="pt-14 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800/50">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            <DocSidebar />
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-30 p-3 bg-beast-600 hover:bg-beast-500 text-white rounded-full shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-20" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <aside
              className="absolute left-0 top-14 bottom-0 w-72 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <DocSidebar mobile onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
