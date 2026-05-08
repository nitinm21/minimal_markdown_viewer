import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  left: ReactNode
  right: ReactNode
  initial?: number
  min?: number
  max?: number
  storageKey?: string
}

export default function SplitPane({
  left,
  right,
  initial = 0.5,
  min = 0.2,
  max = 0.8,
  storageKey,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [ratio, setRatio] = useState<number>(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const v = parseFloat(stored)
        if (!Number.isNaN(v) && v >= min && v <= max) return v
      }
    }
    return initial
  })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, String(ratio))
  }, [ratio, storageKey])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const r = Math.min(max, Math.max(min, x / rect.width))
      setRatio(r)
    }
    function onUp() {
      if (draggingRef.current) {
        draggingRef.current = false
        setDragging(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [min, max])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    setDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const onDoubleClick = () => setRatio(0.5)

  return (
    <div className="split" ref={containerRef}>
      <div className="split-pane" style={{ flexBasis: `${ratio * 100}%` }}>
        {left}
      </div>
      <div
        className={`split-divider${dragging ? ' is-dragging' : ''}`}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panes"
      >
        <span className="split-divider-handle" />
      </div>
      <div className="split-pane">{right}</div>
    </div>
  )
}
