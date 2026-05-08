import { useCallback } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: Props) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const target = e.currentTarget
        const start = target.selectionStart
        const end = target.selectionEnd
        const next = value.slice(0, start) + '  ' + value.slice(end)
        onChange(next)
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2
        })
      }
    },
    [value, onChange],
  )

  return (
    <textarea
      className="editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={'# Start writing Markdown…\n\nUse **bold**, _italic_, `code`, lists, tables, and more.'}
      spellCheck={false}
    />
  )
}
