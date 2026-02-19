import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { PanelRect } from '@/types'
import { EditorToolbar } from './EditorToolbar'
import './PanelEditorCanvas.css'

type Props = {
  panels: PanelRect[]
  selectedPanelId: string | null
  globalBorderWidth: number
  snapToGrid: boolean
  showGrid: boolean
  backgroundImage: string | null
  aspectRatio: number // width / height
  onAddPanel: () => void
  onRemovePanel: (id: string) => void
  onUpdatePanel: (id: string, partial: Partial<PanelRect>) => void
  onSelectPanel: (id: string | null) => void
  onSetGlobalBorderWidth: (n: number) => void
  onToggleSnap: () => void
  onToggleGrid: () => void
  onConfirm: () => void
  onCancel: () => void
  snapFn: (value: number, grid: number) => number
}

type DragState = {
  type: 'move' | 'resize'
  panelId: string
  startX: number
  startY: number
  startPanel: PanelRect
  handle?: string // e.g. 'nw','n','ne','e','se','s','sw','w'
}

const GRID_STEP = 5
const RESIZE_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const
type HandleDir = typeof RESIZE_HANDLES[number]

export function PanelEditorCanvas({
  panels, selectedPanelId, globalBorderWidth,
  snapToGrid, showGrid, backgroundImage, aspectRatio,
  onAddPanel, onRemovePanel, onUpdatePanel, onSelectPanel,
  onSetGlobalBorderWidth, onToggleSnap, onToggleGrid,
  onConfirm, onCancel, snapFn,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [editingLabelValue, setEditingLabelValue] = useState('')
  const labelInputRef = useRef<HTMLInputElement>(null)

  // Measure canvas size
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Focus label input when editing
  useEffect(() => {
    if (editingLabelId && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [editingLabelId])

  // px → % conversion
  const pxToPercent = useCallback((px: number, axis: 'x' | 'y') => {
    const total = axis === 'x' ? canvasSize.width : canvasSize.height
    if (total === 0) return 0
    return (px / total) * 100
  }, [canvasSize])

  const maybeSnap = useCallback((val: number) => {
    return snapToGrid ? snapFn(val, GRID_STEP) : val
  }, [snapToGrid, snapFn])

  // Pointer handlers for drag/resize
  const handlePointerDown = useCallback((e: React.PointerEvent, panelId: string, type: 'move' | 'resize', handle?: HandleDir) => {
    e.preventDefault()
    e.stopPropagation()
    const panel = panels.find(p => p.id === panelId)
    if (!panel) return

    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    onSelectPanel(panelId)
    setDragState({
      type,
      panelId,
      startX: e.clientX,
      startY: e.clientY,
      startPanel: { ...panel },
      handle,
    })
  }, [panels, onSelectPanel])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return
    e.preventDefault()

    const dx = pxToPercent(e.clientX - dragState.startX, 'x')
    const dy = pxToPercent(e.clientY - dragState.startY, 'y')
    const sp = dragState.startPanel

    if (dragState.type === 'move') {
      onUpdatePanel(dragState.panelId, {
        x: maybeSnap(sp.x + dx),
        y: maybeSnap(sp.y + dy),
      })
      return
    }

    // Resize
    const h = dragState.handle
    let newX = sp.x, newY = sp.y, newW = sp.width, newH = sp.height

    if (h?.includes('w')) {
      newX = sp.x + dx
      newW = sp.width - dx
    }
    if (h?.includes('e')) {
      newW = sp.width + dx
    }
    if (h?.includes('n')) {
      newY = sp.y + dy
      newH = sp.height - dy
    }
    if (h?.includes('s')) {
      newH = sp.height + dy
    }

    onUpdatePanel(dragState.panelId, {
      x: maybeSnap(newX),
      y: maybeSnap(newY),
      width: maybeSnap(newW),
      height: maybeSnap(newH),
    })
  }, [dragState, pxToPercent, maybeSnap, onUpdatePanel])

  const handlePointerUp = useCallback(() => {
    setDragState(null)
  }, [])

  // Canvas background click → deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectPanel(null)
    }
  }, [onSelectPanel])

  // Label double-click
  const handleLabelDoubleClick = useCallback((panelId: string, currentLabel: string) => {
    setEditingLabelId(panelId)
    setEditingLabelValue(currentLabel)
  }, [])

  const commitLabel = useCallback(() => {
    if (editingLabelId) {
      onUpdatePanel(editingLabelId, { label: editingLabelValue || 'パネル' })
      setEditingLabelId(null)
    }
  }, [editingLabelId, editingLabelValue, onUpdatePanel])

  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitLabel()
    } else if (e.key === 'Escape') {
      setEditingLabelId(null)
    }
  }, [commitLabel])

  // Delete key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedPanelId && !editingLabelId) {
        onRemovePanel(selectedPanelId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPanelId, editingLabelId, onRemovePanel])

  return (
    <div className="panel-editor">
      <EditorToolbar
        panelCount={panels.length}
        globalBorderWidth={globalBorderWidth}
        snapToGrid={snapToGrid}
        showGrid={showGrid}
        hasSelection={selectedPanelId !== null}
        onAddPanel={onAddPanel}
        onRemoveSelected={() => selectedPanelId && onRemovePanel(selectedPanelId)}
        onBorderWidthChange={onSetGlobalBorderWidth}
        onToggleSnap={onToggleSnap}
        onToggleGrid={onToggleGrid}
      />

      <div
        className="panel-editor-canvas"
        ref={canvasRef}
        style={{ aspectRatio: `${aspectRatio}` }}
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Background image (AI draft) */}
        {backgroundImage && (
          <img
            className="panel-editor-bg"
            src={backgroundImage}
            alt="AI draft background"
            draggable={false}
          />
        )}

        {/* Grid overlay */}
        {showGrid && (
          <div className="panel-editor-grid" aria-hidden="true">
            {Array.from({ length: 19 }, (_, i) => {
              const pos = (i + 1) * 5
              return (
                <div key={`v${i}`}>
                  <div className="grid-line grid-line-v" style={{ left: `${pos}%` }} />
                  <div className="grid-line grid-line-h" style={{ top: `${pos}%` }} />
                </div>
              )
            })}
          </div>
        )}

        {/* Panels */}
        {panels.map(panel => {
          const isSelected = panel.id === selectedPanelId
          const isEditing = panel.id === editingLabelId
          return (
            <div
              key={panel.id}
              className={`panel-editor-panel ${isSelected ? 'panel-selected' : ''}`}
              style={{
                left: `${panel.x}%`,
                top: `${panel.y}%`,
                width: `${panel.width}%`,
                height: `${panel.height}%`,
                borderWidth: `${panel.borderWidth}px`,
              }}
              onPointerDown={(e) => handlePointerDown(e, panel.id, 'move')}
              onClick={(e) => { e.stopPropagation(); onSelectPanel(panel.id) }}
              onDoubleClick={(e) => { e.stopPropagation(); handleLabelDoubleClick(panel.id, panel.label) }}
            >
              {/* Label */}
              {isEditing ? (
                <input
                  ref={labelInputRef}
                  className="panel-label-input"
                  value={editingLabelValue}
                  onChange={(e) => setEditingLabelValue(e.target.value)}
                  onBlur={commitLabel}
                  onKeyDown={handleLabelKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="panel-label">{panel.label}</span>
              )}

              {/* Resize handles (visible only when selected) */}
              {isSelected && RESIZE_HANDLES.map(dir => (
                <div
                  key={dir}
                  className={`resize-handle resize-handle-${dir}`}
                  onPointerDown={(e) => handlePointerDown(e, panel.id, 'resize', dir)}
                />
              ))}
            </div>
          )
        })}

        {/* Empty state hint */}
        {panels.length === 0 && (
          <div className="panel-editor-empty-hint">
            「パネル追加」でコマを配置してください
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="panel-editor-actions">
        <motion.button
          className="panel-editor-confirm"
          onClick={onConfirm}
          disabled={panels.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          この構成で生成
        </motion.button>
        <motion.button
          className="panel-editor-cancel"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          キャンセル
        </motion.button>
      </div>
    </div>
  )
}
