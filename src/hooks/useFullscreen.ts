import { useState, useCallback, useEffect, useRef } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true)
    setZoom(1)
    if (containerRef.current && document.fullscreenEnabled) {
      containerRef.current.requestFullscreen().catch(() => {
        // CSS fallback is already active via isFullscreen state
      })
    }
  }, [])

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false)
    setZoom(1)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25))
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen()
      }
    }
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, closeFullscreen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false)
        setZoom(1)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [isFullscreen])

  return {
    isFullscreen, zoom,
    containerRef,
    openFullscreen, closeFullscreen,
    zoomIn, zoomOut,
  }
}
