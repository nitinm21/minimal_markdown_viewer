import { useEffect, useRef, useState } from 'react'
import type { Tab } from '../types'

type Props = {
  tabs: Tab[]
  activeId: string | null
  collapsed: boolean
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
  onRename: (id: string, title: string) => void
  onToggleCollapse: () => void
}

export default function Sidebar({
  tabs,
  activeId,
  collapsed,
  onSelect,
  onClose,
  onNew,
  onRename,
  onToggleCollapse,
}: Props) {
  return (
    <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="sidebar-head">
        {!collapsed && <span className="sidebar-title">Documents</span>}
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={`${collapsed ? 'Expand' : 'Collapse'} sidebar  (⌘\\)`}
        >
          <ChevronIcon pointsRight={collapsed} />
        </button>
      </div>

      <div className="sidebar-list" role="tablist" aria-orientation="vertical">
        {!collapsed &&
          tabs.map((t) => (
            <DocItem
              key={t.id}
              tab={t}
              active={t.id === activeId}
              onSelect={() => onSelect(t.id)}
              onClose={() => onClose(t.id)}
              onRename={(title) => onRename(t.id, title)}
              canClose={tabs.length > 1}
            />
          ))}
      </div>

      <button
        className="sidebar-new"
        onClick={onNew}
        aria-label="New document"
        title="New document"
      >
        <PlusIcon />
        {!collapsed && <span>New document</span>}
      </button>
    </aside>
  )
}

function DocItem({
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
      className={`doc-item${active ? ' is-active' : ''}`}
      onClick={onSelect}
      onDoubleClick={() => setEditing(true)}
      role="tab"
      aria-selected={active}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="doc-title-input"
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
        <span className="doc-title">{tab.title}</span>
      )}
      {canClose && !editing && (
        <button
          className="doc-close"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label={`Close ${tab.title}`}
          title="Close document"
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

function ChevronIcon({ pointsRight }: { pointsRight: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      style={{ transform: pointsRight ? 'rotate(180deg)' : 'none' }}
    >
      <path
        d="M9 3.5L5 7l4 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M7 2.5v9M2.5 7h9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
