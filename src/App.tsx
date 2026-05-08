import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TabBar from './components/TabBar'
import SplitPane from './components/SplitPane'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { loadTabs, saveTabs } from './lib/storage'
import type { Tab } from './types'
import './App.css'

const SAMPLE_MD = `# Welcome to Markdown Viewer

A clean, minimal place to **read** and **render** Markdown — with multiple tabs.

## What works

- GitHub-flavored Markdown (tables, task lists, strikethrough)
- Syntax-highlighted code blocks
- Multiple tabs — like Google Docs
- Auto-saved to your browser

## Try it

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`
}

greet('world')
\`\`\`

| Feature | Status |
| --- | --- |
| Rendering | ✅ |
| Tabs | ✅ |
| Dark mode | soon |

> Tip: double-click a tab to rename it.

- [x] Render Markdown
- [x] Tabs
- [ ] More to come
`

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function newTab(title = 'Untitled', content = ''): Tab {
  return { id: uid(), title, content }
}

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('mdv:theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)
  const initRef = useRef(false)

  // Hydrate from storage
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    const { tabs: saved, activeId: savedActive } = loadTabs()
    if (saved.length > 0) {
      setTabs(saved)
      setActiveId(savedActive && saved.find((t) => t.id === savedActive) ? savedActive : saved[0].id)
    } else {
      const t = newTab('Welcome', SAMPLE_MD)
      setTabs([t])
      setActiveId(t.id)
    }
  }, [])

  // Persist on change (debounced minimally via microtask)
  useEffect(() => {
    if (!initRef.current) return
    const handle = setTimeout(() => saveTabs(tabs, activeId), 120)
    return () => clearTimeout(handle)
  }, [tabs, activeId])

  // Persist theme + apply to document
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('mdv:theme', theme)
  }, [theme])

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeId) ?? null,
    [tabs, activeId],
  )

  const updateActiveContent = useCallback(
    (content: string) => {
      if (!activeId) return
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id !== activeId) return t
          // auto-derive title from first heading or first line if user hasn't renamed
          const next: Tab = { ...t, content }
          if (t.title === 'Untitled' || t.title === '') {
            const derived = deriveTitle(content)
            if (derived) next.title = derived
          }
          return next
        }),
      )
    },
    [activeId],
  )

  const onNewTab = useCallback(() => {
    const t = newTab('Untitled')
    setTabs((prev) => [...prev, t])
    setActiveId(t.id)
  }, [])

  const onCloseTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev
        const idx = prev.findIndex((t) => t.id === id)
        const next = prev.filter((t) => t.id !== id)
        if (id === activeId) {
          const fallback = next[Math.max(0, idx - 1)] ?? next[0]
          setActiveId(fallback.id)
        }
        return next
      })
    },
    [activeId],
  )

  const onRenameTab = useCallback((id: string, title: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
  }, [])

  return (
    <div className="app">
      <header className="appbar">
        <div className="brand">
          <span className="brand-name">Markdown Viewer</span>
        </div>
        <TabBar
          tabs={tabs}
          activeId={activeId}
          onSelect={setActiveId}
          onClose={onCloseTab}
          onNew={onNewTab}
          onRename={onRenameTab}
        />
        <div className="appbar-actions">
          <button
            className="iconbtn"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <main className="main">
        {activeTab ? (
          <SplitPane
            storageKey="mdv:split"
            left={
              <Editor
                key={activeTab.id}
                value={activeTab.content}
                onChange={updateActiveContent}
              />
            }
            right={<Preview source={activeTab.content} theme={theme} />}
          />
        ) : null}
      </main>
    </div>
  )
}

function deriveTitle(content: string): string | null {
  const lines = content.split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const heading = line.match(/^#{1,6}\s+(.+)$/)
    if (heading) return truncate(heading[1].trim())
    return truncate(line)
  }
  return null
}

function truncate(s: string, n = 28) {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…'
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M13.2 9.6A5.4 5.4 0 0 1 6.4 2.8a.6.6 0 0 0-.8-.7 6.4 6.4 0 1 0 8.3 8.3.6.6 0 0 0-.7-.8z"
        fill="currentColor"
      />
    </svg>
  )
}
