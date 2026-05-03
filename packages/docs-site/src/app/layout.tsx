import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BeastCLI - The Open-Source AI Coding Agent',
  description: 'Provider-agnostic AI coding agent that runs in your terminal. Supports Claude, OpenAI, Gemini, and local models like Ollama.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-gray-950 text-slate-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
