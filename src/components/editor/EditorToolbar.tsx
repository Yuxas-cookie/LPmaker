import './EditorToolbar.css'

type Props = {
  panelCount: number
  globalBorderWidth: number
  snapToGrid: boolean
  showGrid: boolean
  hasSelection: boolean
  onAddPanel: () => void
  onRemoveSelected: () => void
  onBorderWidthChange: (value: number) => void
  onToggleSnap: () => void
  onToggleGrid: () => void
}

export function EditorToolbar({
  panelCount,
  globalBorderWidth,
  snapToGrid,
  showGrid,
  hasSelection,
  onAddPanel,
  onRemoveSelected,
  onBorderWidthChange,
  onToggleSnap,
  onToggleGrid,
}: Props) {
  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-left">
        <button className="editor-toolbar-btn editor-toolbar-btn-add" onClick={onAddPanel}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          パネル追加
        </button>
        <button
          className="editor-toolbar-btn editor-toolbar-btn-delete"
          onClick={onRemoveSelected}
          disabled={!hasSelection}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M3.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          削除
        </button>
        <span className="editor-toolbar-count">{panelCount} パネル</span>
      </div>

      <div className="editor-toolbar-right">
        <label className="editor-toolbar-toggle" onClick={onToggleGrid}>
          <div className={`editor-toolbar-toggle-switch ${showGrid ? 'active' : ''}`}>
            <div className="editor-toolbar-toggle-knob" />
          </div>
          <span>グリッド</span>
        </label>

        <label className="editor-toolbar-toggle" onClick={onToggleSnap}>
          <div className={`editor-toolbar-toggle-switch ${snapToGrid ? 'active' : ''}`}>
            <div className="editor-toolbar-toggle-knob" />
          </div>
          <span>スナップ</span>
        </label>

        <div className="editor-toolbar-slider">
          <span className="editor-toolbar-slider-label">枠線</span>
          <input
            type="range"
            min={1}
            max={10}
            value={globalBorderWidth}
            onChange={(e) => onBorderWidthChange(Number(e.target.value))}
          />
          <span className="editor-toolbar-slider-value">{globalBorderWidth}px</span>
        </div>
      </div>
    </div>
  )
}
