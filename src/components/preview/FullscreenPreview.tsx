import { type RefObject, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import './FullscreenPreview.css'

type Props = {
  containerRef: RefObject<HTMLDivElement | null>
  imageUrl: string
  zoom: number
  hasPrev: boolean
  hasNext: boolean
  onClose: () => void
  onDownload: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onPrev: () => void
  onNext: () => void
}

export function FullscreenPreview({
  containerRef, imageUrl, zoom,
  hasPrev, hasNext,
  onClose, onDownload, onZoomIn, onZoomOut,
  onPrev, onNext,
}: Props) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && hasPrev) {
      e.preventDefault()
      onPrev()
    } else if (e.key === 'ArrowRight' && hasNext) {
      e.preventDefault()
      onNext()
    }
  }, [hasPrev, hasNext, onPrev, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleBackdropClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Close if clicking overlay or wrapper (not the image, buttons, or toolbar)
    if (
      target.classList.contains('fullscreen-overlay') ||
      target.classList.contains('fullscreen-image-wrapper')
    ) {
      onClose()
    }
  }

  return (
    <motion.div
      ref={containerRef}
      className="fullscreen-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleBackdropClick}
    >
      {/* Left arrow */}
      {hasPrev && (
        <button
          className="fs-nav-btn fs-nav-prev"
          onClick={onPrev}
          title="前の画像"
          aria-label="前の画像"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {hasNext && (
        <button
          className="fs-nav-btn fs-nav-next"
          onClick={onNext}
          title="次の画像"
          aria-label="次の画像"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <div className="fullscreen-image-wrapper">
        <img
          src={imageUrl}
          alt="Fullscreen preview"
          className="fullscreen-image"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      <div className="fullscreen-toolbar">
        <button className="fs-btn" onClick={onZoomOut} title="ズームアウト" aria-label="ズームアウト">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <span className="fs-zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="fs-btn" onClick={onZoomIn} title="ズームイン" aria-label="ズームイン">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="fs-separator" />
        <button className="fs-btn" onClick={onDownload} title="ダウンロード" aria-label="ダウンロード">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v9M5 9l4 4 4-4M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="fs-btn" onClick={onClose} title="閉じる" aria-label="閉じる">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
