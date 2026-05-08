import { useEffect, useRef, useState } from 'react'
import { getHighlighter, normalizeLang } from '../lib/highlighter'

type Props = {
  code: string
  lang?: string
  theme: 'light' | 'dark'
}

export default function CodeBlock({ code, lang, theme }: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const normalized = normalizeLang(lang)
    if (!normalized) {
      setHtml(null)
      return
    }
    getHighlighter().then((hl) => {
      if (cancelled || !mounted.current) return
      try {
        const out = hl.codeToHtml(code, {
          lang: normalized,
          theme: theme === 'dark' ? 'github-dark' : 'github-light',
        })
        setHtml(out)
      } catch {
        setHtml(null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [code, lang, theme])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // ignore
    }
  }

  return (
    <div className="codeblock">
      <div className="codeblock-header">
        <span className="codeblock-lang">{lang || 'text'}</span>
        <button className="codeblock-copy" onClick={onCopy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {html ? (
        <div className="codeblock-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="codeblock-body codeblock-fallback">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
