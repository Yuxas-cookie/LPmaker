import { useState, useCallback } from 'react'
import type { PanelRect } from '@/types'

function uid() {
  return `panel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function snap(value: number, grid: number): number {
  return Math.round(value / grid) * grid
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function usePanelEditor() {
  const [panels, setPanels] = useState<PanelRect[]>([])
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null)
  const [globalBorderWidth, setGlobalBorderWidthState] = useState(4)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  const addPanel = useCallback(() => {
    const id = uid()
    const newPanel: PanelRect = {
      id,
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      borderWidth: globalBorderWidth,
      label: `パネル ${panels.length + 1}`,
    }
    setPanels(prev => [...prev, newPanel])
    setSelectedPanelId(id)
  }, [globalBorderWidth, panels.length])

  const removePanel = useCallback((id: string) => {
    setPanels(prev => prev.filter(p => p.id !== id))
    setSelectedPanelId(prev => (prev === id ? null : prev))
  }, [])

  const updatePanel = useCallback((id: string, partial: Partial<PanelRect>) => {
    setPanels(prev => prev.map(p => {
      if (p.id !== id) return p
      const updated = { ...p, ...partial }
      // Clamp values to valid range
      updated.x = clamp(updated.x, 0, 100 - updated.width)
      updated.y = clamp(updated.y, 0, 100 - updated.height)
      updated.width = clamp(updated.width, 10, 100 - updated.x)
      updated.height = clamp(updated.height, 10, 100 - updated.y)
      return updated
    }))
  }, [])

  const selectPanel = useCallback((id: string | null) => {
    setSelectedPanelId(id)
  }, [])

  const setGlobalBorderWidth = useCallback((n: number) => {
    setGlobalBorderWidthState(n)
    setPanels(prev => prev.map(p => ({ ...p, borderWidth: n })))
  }, [])

  const initFromAIDraft = useCallback((draftPanels: PanelRect[], bgImage?: string | null) => {
    const withIds = draftPanels.map((p, i) => ({
      ...p,
      id: p.id || uid(),
      borderWidth: p.borderWidth || globalBorderWidth,
      label: p.label || `パネル ${i + 1}`,
    }))
    setPanels(withIds)
    setSelectedPanelId(null)
    setBackgroundImage(bgImage ?? null)
  }, [globalBorderWidth])

  const initEmpty = useCallback(() => {
    setPanels([])
    setSelectedPanelId(null)
    setBackgroundImage(null)
  }, [])

  const exportToCanvas = useCallback((aspectWidth: number, aspectHeight: number): string => {
    // Scale to a reasonable resolution
    const scale = 1920 / aspectWidth
    const canvasW = Math.round(aspectWidth * scale)
    const canvasH = Math.round(aspectHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = canvasW
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')!

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasW, canvasH)

    // Draw each panel
    for (const p of panels) {
      const px = (p.x / 100) * canvasW
      const py = (p.y / 100) * canvasH
      const pw = (p.width / 100) * canvasW
      const ph = (p.height / 100) * canvasH

      // Black border
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = p.borderWidth * 2 // scale up for resolution
      ctx.strokeRect(px, py, pw, ph)

      // Light gray fill
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(px + p.borderWidth, py + p.borderWidth, pw - p.borderWidth * 2, ph - p.borderWidth * 2)

      // Label text centered
      if (p.label) {
        ctx.fillStyle = '#666666'
        const fontSize = Math.min(pw, ph) * 0.12
        ctx.font = `bold ${Math.max(14, fontSize)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.label, px + pw / 2, py + ph / 2, pw - 20)
      }
    }

    return canvas.toDataURL('image/png')
  }, [panels])

  const exportToPromptText = useCallback((): string => {
    if (panels.length === 0) return ''
    const lines = panels.map((p, i) =>
      `パネル${i + 1}: 左上(${Math.round(p.x)}%,${Math.round(p.y)}%) サイズ(${Math.round(p.width)}%x${Math.round(p.height)}%) ラベル:${p.label}`
    )
    return `【コマ割り構成】\n${lines.join('\n')}`
  }, [panels])

  const reset = useCallback(() => {
    setPanels([])
    setSelectedPanelId(null)
    setBackgroundImage(null)
  }, [])

  return {
    panels,
    selectedPanelId,
    globalBorderWidth,
    snapToGrid,
    showGrid,
    backgroundImage,
    addPanel,
    removePanel,
    updatePanel,
    selectPanel,
    setGlobalBorderWidth,
    setSnapToGrid,
    setShowGrid,
    initFromAIDraft,
    initEmpty,
    exportToCanvas,
    exportToPromptText,
    reset,
    snap,
  }
}
