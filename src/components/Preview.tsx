import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'

type Props = {
  source: string
  theme: 'light' | 'dark'
}

export default function Preview({ source, theme }: Props) {
  if (!source.trim()) {
    return (
      <div className="preview-empty">
        <div className="preview-empty-inner">
          <div className="preview-empty-title">Nothing to preview yet</div>
          <div className="preview-empty-sub">
            Paste or type Markdown on the left and watch it render here.
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            if (!match) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
            const codeStr = String(children).replace(/\n$/, '')
            return <CodeBlock code={codeStr} lang={match[1]} theme={theme} />
          },
          a({ href, children, ...props }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            )
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </article>
  )
}
