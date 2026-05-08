import { useEffect, useRef, useState } from 'react'
import type { Tab } from '../types'

type Props = {
  tabs: Tab[]
  activeId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
  onRename: (id: string, title: string) => void
}

export default function TabBar({
  tabs,
  activeId,
  onSelect,
  onClose,
  onNew,
  onRename,
}: Props) {
  return (
    <div className="tabbar" role="tablist">
      <div className="tabbar-tabs">
        {tabs.map((t) => (
          <TabItem
            key={t.id}
            tab={t}
            active={t.id === activeId}
            onSelect={() => onSelect(t.id)}
            onClose={() => onClose(t.id)}
            onRename={(title) => onRename(t.id, title)}
            canClose={tabs.length > 1}
          />
        ))}
        <button
          className="tabbar-new"
          onClick={onNew}
          aria-label="New tab"
          title="New tab"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M7 2.5v9M2.5 7h9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

function TabItem({
  tab,
  active,
  onSelect,
  onClose,
  onRename,
  canClose,
}: {
  tab: Tab
  active: boolean
  onSelect: () => void
  onClose: () => void
  onRename: (title: string) => void
  canClose: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(tab.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  useEffect(() => {
    if (!editing) setDraft(tab.title)
  }, [tab.title, editing])

  const commit = () => {
    const next = draft.trim() || 'Untitled'
    onRename(next)
    setEditing(false)
  }

  return (
    <div
      className={`tab${active ? ' is-active' : ''}`}
      onClick={onSelect}
      onDoubleClick={() => setEditing(true)}
      role="tab"
      aria-selected={active}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="tab-title-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            else if (e.key === 'Escape') {
              setDraft(tab.title)
              setEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="tab-title">{tab.title}</span>
      )}
      {canClose && !editing && (
        <button
          className="tab-close"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label={`Close ${tab.title}`}
          title="Close tab"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path
              d="M2 2l6 6M8 2l-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
