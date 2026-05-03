'use client'

import React from 'react'
import { Terminal, Github } from 'lucide-react'
import Link from 'next/link'

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 7.334v8.5h2.459v2.547h1.235V7.334H0zm4.376 0v8.5h5.833v-2.547H6.611v-5.953H4.376zm9.46 0v2.547h1.666v5.953h2.46V7.334h-4.126z"/>
    </svg>
  )
}

export default function Footer(): React.ReactElement {
  return (
    <footer className="relative py-16 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-beast-500 to-cyber-500 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">BeastCLI</span>
            </div>
            <p className="text-slate-400 max-w-md">
              The open-source AI coding agent that puts you in control.
              Provider-agnostic, extensible, and designed for developers.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com/simpletoolsindia/code-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.npmjs.com/package/@simpletoolsindia/beast-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <NpmIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {[
                { label: 'Documentation', href: '/docs' },
                { label: 'Commands', href: '/docs/commands' },
                { label: 'Plugins', href: '/docs/plugins' },
                { label: 'GitHub', href: 'https://github.com/simpletoolsindia/code-cli' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-3">
              {[
                { label: 'GitHub Discussions', href: 'https://github.com/simpletoolsindia/code-cli/discussions' },
                { label: 'Discord', href: '#' },
                { label: 'Twitter', href: '#' },
                { label: 'Contributing', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            MIT License. Built by{' '}
            <a
              href="https://github.com/simpletoolsindia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-beast-400 hover:text-beast-300"
            >
              @simpletoolsindia
            </a>
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Version 2.6.0</span>
            <span>·</span>
            <span>Made with AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
