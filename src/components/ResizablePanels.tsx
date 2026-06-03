'use client'

/**
 * ResizablePanels — 三欄可拖曳面板
 *
 * 純 CSS + React 實作，不依賴 react-resizable-panels。
 * 每欄獨立 overflow-y-auto，高度由父容器決定（須為 100% 高）。
 * 拖曳寬度寫入 localStorage，頁面刷新後保留。
 */

import { useState, useCallback, useEffect, useRef } from 'react'

interface Props {
  leftContent: React.ReactNode
  middleContent: React.ReactNode
  rightContent: React.ReactNode
}

const STORAGE_KEY = 'yf-panel-widths-v2'
const LEFT_DEFAULT  = 360
const RIGHT_DEFAULT = 300
const LEFT_MIN  = 300
const RIGHT_MIN = 240
const HANDLE_W  = 5   // drag handle width (px)

interface PanelWidths { left: number; right: number }

function loadWidths(): PanelWidths {
  if (typeof window === 'undefined') return { left: LEFT_DEFAULT, right: RIGHT_DEFAULT }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { left: LEFT_DEFAULT, right: RIGHT_DEFAULT }
    return JSON.parse(raw) as PanelWidths
  } catch {
    return { left: LEFT_DEFAULT, right: RIGHT_DEFAULT }
  }
}

function saveWidths(w: PanelWidths) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(w)) } catch { /* ignore */ }
}

// ─── Drag Handle ─────────────────────────────────────────────────

interface HandleProps {
  onDrag: (dx: number) => void
}

function DragHandle({ onDrag }: HandleProps) {
  const dragging = useRef(false)
  const lastX    = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    lastX.current = e.clientX

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const dx = ev.clientX - lastX.current
      lastX.current = ev.clientX
      onDrag(dx)
    }
    const onUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [onDrag])

  return (
    <div
      onMouseDown={onMouseDown}
      style={{ width: HANDLE_W, flexShrink: 0 }}
      className="group relative flex items-center justify-center h-full cursor-col-resize select-none bg-transparent hover:bg-blue-50 transition-colors"
    >
      {/* 1px rule */}
      <div className="absolute inset-y-0 left-[2px] w-px bg-gray-200 group-hover:bg-blue-400 transition-colors" />
      {/* grip dots */}
      <div className="absolute flex flex-col gap-[3px] opacity-0 group-hover:opacity-100 transition-opacity">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-blue-400" />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────

export default function ResizablePanels({ leftContent, middleContent, rightContent }: Props) {
  const [widths, setWidths] = useState<PanelWidths>(loadWidths)

  // Persist on change
  useEffect(() => { saveWidths(widths) }, [widths])

  const dragLeft = useCallback((dx: number) => {
    setWidths(prev => ({
      ...prev,
      left: Math.max(LEFT_MIN, prev.left + dx),
    }))
  }, [])

  const dragRight = useCallback((dx: number) => {
    setWidths(prev => ({
      ...prev,
      right: Math.max(RIGHT_MIN, prev.right - dx),
    }))
  }, [])

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      {/* ── Left: Input form ───────────────────────────── */}
      <div
        style={{ width: widths.left, minWidth: LEFT_MIN, flexShrink: 0, height: '100%', overflowY: 'auto' }}
        className="bg-white border-r border-gray-200"
      >
        {leftContent}
      </div>

      <DragHandle onDrag={dragLeft} />

      {/* ── Middle: Check results ──────────────────────── */}
      <div
        style={{ flex: 1, minWidth: 380, height: '100%', overflowY: 'auto' }}
        className="bg-gray-50 border-r border-gray-200"
      >
        {middleContent}
      </div>

      <DragHandle onDrag={dragRight} />

      {/* ── Right: Detail panel ────────────────────────── */}
      <div
        style={{ width: widths.right, minWidth: RIGHT_MIN, flexShrink: 0, height: '100%', overflowY: 'auto' }}
        className="bg-white"
      >
        {rightContent}
      </div>
    </div>
  )
}
