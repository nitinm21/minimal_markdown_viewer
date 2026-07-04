import StarterKit from '@tiptap/starter-kit'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { TableKit } from '@tiptap/extension-table'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { common, createLowlight } from 'lowlight'
import type { Editor, Extensions } from '@tiptap/core'

// One shared highlighter instance for all editor mounts.
const lowlight = createLowlight(common)

export const PLACEHOLDER = 'Paste or write Markdown — it renders as you type…'

export function buildExtensions(): Extensions {
  return [
    // StarterKit ships the core nodes/marks (headings, lists, bold, italic,
    // strike, blockquote, links, underline, history…). We swap its plain
    // code block for the syntax-highlighted one below.
    StarterKit.configure({ codeBlock: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: false } }),
    CodeBlockLowlight.configure({ lowlight }),
    Placeholder.configure({ placeholder: PLACEHOLDER }),
    // The markdown layer: parses pasted/initial markdown into rich nodes and
    // serializes the document back to markdown on demand.
    Markdown.configure({
      html: false,
      transformPastedText: true,
      transformCopiedText: true,
      breaks: false,
    }),
  ]
}

type MarkdownStorage = { markdown: { getMarkdown(): string } }

export function getMarkdown(editor: Editor): string {
  return (editor.storage as unknown as MarkdownStorage).markdown.getMarkdown()
}
