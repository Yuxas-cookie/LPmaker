import { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { HistoryItem, WireframeCandidate, LayoutGenerationPhase, PanelRect } from '@/types'
import { downloadImage } from '@/services/imageUtils'
import { FullscreenPreview } from './FullscreenPreview'
import { LayoutSelector } from './LayoutSelector'
import { PanelEditorCanvas } from '@/components/editor/PanelEditorCanvas'
import { useFullscreen } from '@/hooks/useFullscreen'
import './PreviewPanel.css'

type Props = {
  isEditMode: boolean
  generatedImage: string | null
  isLoading: boolean
  imageRevealed: boolean
  editHistory: HistoryItem[]
  onGenerate: () => void
  onReset: () => void
  onSelectHistoryItem: (item: HistoryItem) => void
  onAnalyze?: () => void
  // Layout selection props
  layoutPhase: LayoutGenerationPhase
  layoutWireframes: WireframeCandidate[]
  layoutSelectedIndex: number
  onLayoutSelect: (index: number) => void
  onLayoutConfirm: () => void
  onLayoutCancel: () => void
  autoMode: boolean
  onAutoModeChange: (value: boolean) => void
  isGeneratingLayouts: boolean
  // Panel editor props
  panelEditorProps?: {
    panels: PanelRect[]
    selectedPanelId: string | null
    globalBorderWidth: number
    snapToGrid: boolean
    showGrid: boolean
    backgroundImage: string | null
    aspectRatio: number
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
  // Entry point callbacks for manual mode
  onStartFromScratch?: () => void
  onStartAIDraft?: () => void
}

export function PreviewPanel({
  isEditMode, generatedImage, isLoading,
  imageRevealed, editHistory, onGenerate, onReset,
  onSelectHistoryItem, onAnalyze,
  layoutPhase, layoutWireframes, layoutSelectedIndex,
  onLayoutSelect, onLayoutConfirm, onLayoutCancel,
  autoMode, onAutoModeChange, isGeneratingLayouts,
  panelEditorProps,
  onStartFromScratch,
  onStartAIDraft,
}: Props) {
  const {
    isFullscreen, zoom, containerRef,
    openFullscreen, closeFullscreen, zoomIn, zoomOut,
  } = useFullscreen()

  const handleDownload = () => {
    if (generatedImage) downloadImage(generatedImage)
  }

  const currentIndex = useMemo(
    () => editHistory.findIndex(item => item.imageData === generatedImage),
    [editHistory, generatedImage]
  )

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < editHistory.length - 1

  const handlePrev = useCallback(() => {
    if (hasPrev) onSelectHistoryItem(editHistory[currentIndex - 1])
  }, [hasPrev, currentIndex, editHistory, onSelectHistoryItem])

  const handleNext = useCallback(() => {
    if (hasNext) onSelectHistoryItem(editHistory[currentIndex + 1])
  }, [hasNext, currentIndex, editHistory, onSelectHistoryItem])

  if (!isEditMode || !generatedImage) {
    return (
      <div className="preview-panel">
        <div className="preview-ambient" aria-hidden="true">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
          <div className="ambient-grid" />
          <div className="noise-overlay" />
        </div>

        {layoutPhase === 'generating-layouts' && (
          <div className="layout-loading">
            <div className="layout-loading-spinner" />
            <p className="layout-loading-text">ワイヤーフレームを生成中...</p>
          </div>
        )}

        {layoutPhase === 'selecting-layout' && layoutWireframes.length > 0 && (
          <LayoutSelector
            wireframes={layoutWireframes}
            selectedIndex={layoutSelectedIndex}
            onSelect={onLayoutSelect}
            onConfirm={onLayoutConfirm}
            onCancel={onLayoutCancel}
          />
        )}

        {layoutPhase === 'editing-panels' && panelEditorProps && (
          <PanelEditorCanvas {...panelEditorProps} />
        )}

        {layoutPhase === 'idle' && (
          <div className="preview-empty">
            <div className="preview-empty-visual" aria-hidden="true">
              <div className="empty-ring empty-ring-1" />
              <div className="empty-ring empty-ring-2" />
              <div className="empty-ring empty-ring-3" />
              <div className="empty-diamond" />
            </div>
            <p className="preview-empty-text">Generate your first image</p>

            {autoMode ? (
              <motion.button
                onClick={onGenerate}
                disabled={isLoading || isGeneratingLayouts}
                className="generate-button"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? '生成中...' : '画像を生成'}
              </motion.button>
            ) : (
              <div className="manual-mode-entry">
                <motion.button
                  onClick={onStartFromScratch}
                  disabled={isLoading || isGeneratingLayouts}
                  className="generate-button generate-button-outline"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ゼロからコマ割り
                </motion.button>
                <motion.button
                  onClick={onStartAIDraft}
                  disabled={isLoading || isGeneratingLayouts}
                  className="generate-button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGeneratingLayouts ? 'AIドラフト生成中...' : 'AIドラフトで開始'}
                </motion.button>
              </div>
            )}

            <div className="auto-mode-toggle">
              <div
                className={`auto-mode-switch ${autoMode ? 'active' : ''}`}
                onClick={() => onAutoModeChange(!autoMode)}
              >
                <div className="auto-mode-switch-knob" />
              </div>
              <span
                className="auto-mode-toggle-label"
                onClick={() => onAutoModeChange(!autoMode)}
              >
                {autoMode ? '自動モード（直接生成）' : '手動モード（コマ割りエディタ）'}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="preview-panel">
      <div className="preview-ambient" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
        <div className="ambient-grid" />
        <div className="noise-overlay" />
      </div>

      <div className="result-header">
        <h2>生成結果</h2>
        <div className="result-header-actions">
          {onAnalyze && (
            <motion.button
              onClick={onAnalyze}
              className="analyze-trigger-button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              分析
            </motion.button>
          )}
          <motion.button
            onClick={onReset}
            className="new-button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            新規作成
          </motion.button>
        </div>
      </div>

      {/* Gallery: all history images */}
      <div className="preview-gallery">
        {editHistory.map((item, index) => {
          const isActive = item.imageData === generatedImage
          return (
            <div
              key={item.id}
              className={`gallery-item ${isActive ? 'gallery-item-active' : ''}`}
              onClick={() => onSelectHistoryItem(item)}
            >
              <div className="gallery-item-label">
                {index === 0 ? 'オリジナル' : `編集 ${index}`}
              </div>
              <div className={`gallery-item-image ${isActive && imageRevealed ? 'revealed' : ''}`}>
                <img src={item.imageData} alt={index === 0 ? 'オリジナル' : `編集 ${index}`} />
                {isActive && (
                  <button
                    className="fullscreen-trigger"
                    onClick={(e) => { e.stopPropagation(); openFullscreen() }}
                    title="フルスクリーン"
                    aria-label="フルスクリーンプレビュー"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <motion.button
        onClick={handleDownload}
        className="download-button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        選択中の画像をダウンロード
      </motion.button>

      {isFullscreen && (
        <FullscreenPreview
          containerRef={containerRef}
          imageUrl={generatedImage}
          zoom={zoom}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onClose={closeFullscreen}
          onDownload={handleDownload}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  )
}
