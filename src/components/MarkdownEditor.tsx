import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { buildExtensions, getMarkdown } from '../lib/editor'

type Props = {
  /** Initial markdown for this document. Read once on mount. */
  value: string
  /** Called with serialized markdown whenever the document changes. */
  onChange: (markdown: string) => void
}

export default function MarkdownEditor({ value, onChange }: Props) {
  // Keep onChange current without re-creating the editor on every render.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const editor = useEditor({
    extensions: buildExtensions(),
    content: value,
    editorProps: {
      attributes: {
        class: 'markdown-body doc-body',
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current(getMarkdown(editor))
    },
  })

  // Focus the document once it's ready so users can type immediately.
  useEffect(() => {
    if (editor) editor.commands.focus('end')
  }, [editor])

  return (
    <div
      className="editor-shell"
      onMouseDown={(e) => {
        // Clicking the gutter around the page focuses the editor at the end.
        if (e.target === e.currentTarget && editor) {
          e.preventDefault()
          editor.commands.focus('end')
        }
      }}
    >
      <EditorContent editor={editor} className="editor-doc" />
    </div>
  )
}
