import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DOMParser as PMDOMParser } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

// tiptap-markdown wires its parser onto `clipboardTextParser`, which ProseMirror
// only consults for plain-text pastes — i.e. when the clipboard carries *no*
// `text/html` flavor (see prosemirror-view: `asText = !!text && (… || !html)`).
// Most sources (chat UIs, docs, editors) put an HTML flavor on the clipboard, so
// the markdown layer is skipped entirely: block syntax like `##`/`---`/`- ` is
// left literal, and every blank line the source encodes as an empty `<p></p>`
// survives as an empty paragraph node — the oversized gaps between paragraphs.
//
// This extension makes paste behave the way a markdown editor should (and the way
// Notion does): markdown-looking text is always parsed as markdown regardless of
// any HTML flavor, and genuinely-rich HTML pastes get their empty paragraphs
// stripped so they don't render as dead vertical space.

/** Any one of these signals is enough to treat a paste as markdown. */
const MARKDOWN_SIGNAL = new RegExp(
  [
    '^#{1,6}\\s', // # heading
    '^\\s*[-*+]\\s+\\S', // - bullet list item
    '^\\s*\\d+\\.\\s+\\S', // 1. ordered list item
    '^\\s*>\\s', // > blockquote
    '^\\s*```', // ``` fenced code block
    '^\\s*(?:-{3,}|\\*{3,}|_{3,})\\s*$', // --- thematic break
    '^\\|.*\\|', // | table row |
    '\\*\\*[^*\\n]+\\*\\*', // **bold**
    '\\[[^\\]\\n]+\\]\\([^)\\n]+\\)', // [text](url)
    '`[^`\\n]+`', // `inline code`
  ].join('|'),
  'm',
)

function looksLikeMarkdown(text: string): boolean {
  return MARKDOWN_SIGNAL.test(text)
}

// Mirror tiptap-markdown's own DOM helper: wrap in <body> so leading/trailing
// whitespace is preserved through parsing.
function elementFromString(html: string): HTMLElement {
  return new window.DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body
}

// Blank-line artifacts sources emit between blocks: <p></p>, <p> </p>,
// <p>&nbsp;</p>, <p><br></p>, possibly with attributes.
const EMPTY_PARAGRAPH = /<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi

type MarkdownParserStorage = {
  markdown: { parser: { parse(content: string, opts?: { inline?: boolean }): string } }
}

export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',
  // Run before other paste handlers so markdown text wins over the HTML flavor.
  priority: 120,
  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin({
        key: new PluginKey('markdownPaste'),
        props: {
          handlePaste: (view: EditorView, event: ClipboardEvent) => {
            const text = event.clipboardData?.getData('text/plain')
            if (!text) return false

            // Respect verbatim-paste requests: Shift held, or inside a code block.
            const shiftHeld = (view as unknown as { input?: { shiftKey?: boolean } }).input
              ?.shiftKey
            if (shiftHeld) return false
            if (view.state.selection.$from.parent.type.spec.code) return false

            // Leave real rich content (Word, Docs, web pages) to the HTML path.
            if (!looksLikeMarkdown(text)) return false

            const { parser } = (editor.storage as unknown as MarkdownParserStorage).markdown
            const slice = PMDOMParser.fromSchema(view.state.schema).parseSlice(
              elementFromString(parser.parse(text, { inline: true })),
              { preserveWhitespace: true, context: view.state.selection.$from },
            )
            view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView())
            return true
          },

          // Fallback for the rich-HTML path we deliberately don't intercept above.
          transformPastedHTML: (html: string) => html.replace(EMPTY_PARAGRAPH, ''),
        },
      }),
    ]
  },
})
