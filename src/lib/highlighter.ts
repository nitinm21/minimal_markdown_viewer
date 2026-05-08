import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

const SUPPORTED_LANGS = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'json',
  'html',
  'css',
  'scss',
  'bash',
  'shell',
  'python',
  'go',
  'rust',
  'ruby',
  'java',
  'kotlin',
  'swift',
  'sql',
  'yaml',
  'toml',
  'markdown',
  'diff',
  'php',
  'c',
  'cpp',
  'csharp',
] as const

export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: SUPPORTED_LANGS as unknown as string[],
    })
  }
  return highlighterPromise
}

export function isSupportedLang(lang: string | undefined): lang is SupportedLang {
  if (!lang) return false
  return (SUPPORTED_LANGS as readonly string[]).includes(lang)
}

const ALIAS: Record<string, SupportedLang> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  sh: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
}

export function normalizeLang(lang: string | undefined): SupportedLang | null {
  if (!lang) return null
  const lower = lang.toLowerCase()
  if (isSupportedLang(lower)) return lower
  if (ALIAS[lower]) return ALIAS[lower]
  return null
}
