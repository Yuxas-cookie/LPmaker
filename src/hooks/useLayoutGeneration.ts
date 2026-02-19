import { useState, useCallback } from 'react'
import type { UploadedImage, AspectRatioOption, WireframeCandidate, LayoutGenerationPhase, PanelRect } from '@/types'
import { LAYOUT_DIRECTIONS } from '@/constants/layoutDirections'
import { generateAllWireframes, generateStructuredWireframe } from '@/services/layoutService'

type UseLayoutGenerationParams = {
  apiKey: string
  selectedModel: string
  prompt: string
  productImages: UploadedImage[]
  aspectRatio: AspectRatioOption | null
  customWidth?: number
  customHeight?: number
}

export function useLayoutGeneration(params: UseLayoutGenerationParams) {
  const { apiKey, selectedModel, prompt, productImages, aspectRatio, customWidth, customHeight } = params

  const [autoMode, setAutoMode] = useState(true)
  const [phase, setPhase] = useState<LayoutGenerationPhase>('idle')
  const [wireframes, setWireframes] = useState<WireframeCandidate[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isGeneratingLayouts, setIsGeneratingLayouts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiDraftPanels, setAiDraftPanels] = useState<PanelRect[]>([])
  const [aiDraftImage, setAiDraftImage] = useState<string | null>(null)

  const generateLayouts = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください')
      return
    }
    if (!prompt.trim()) {
      setError('プロンプトを入力してください')
      return
    }

    setIsGeneratingLayouts(true)
    setError(null)
    setPhase('generating-layouts')
    setWireframes([])
    setSelectedIndex(0)

    try {
      const { wireframes: results, errors } = await generateAllWireframes(
        { apiKey, modelId: selectedModel, userPrompt: prompt, productImages, aspectRatio, customWidth, customHeight },
        LAYOUT_DIRECTIONS,
      )

      if (results.length === 0) {
        setError(errors.length > 0 ? errors.join('\n') : 'ワイヤーフレーム生成に失敗しました')
        setPhase('idle')
        return
      }

      setWireframes(results)
      setPhase('selecting-layout')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'ワイヤーフレーム生成中にエラーが発生しました')
      setPhase('idle')
    } finally {
      setIsGeneratingLayouts(false)
    }
  }, [apiKey, selectedModel, prompt, productImages, aspectRatio, customWidth, customHeight])

  const getSelectedWireframeDataUrl = useCallback((): string | null => {
    if (wireframes.length === 0 || selectedIndex < 0 || selectedIndex >= wireframes.length) {
      return null
    }
    return wireframes[selectedIndex].imageDataUrl
  }, [wireframes, selectedIndex])

  const startFromScratch = useCallback(() => {
    setPhase('editing-panels')
    setAiDraftPanels([])
    setAiDraftImage(null)
    setError(null)
  }, [])

  const generateAIDraft = useCallback(async (): Promise<{ panels: PanelRect[]; wireframeImageUrl: string | null }> => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください')
      return { panels: [], wireframeImageUrl: null }
    }
    if (!prompt.trim()) {
      setError('プロンプトを入力してください')
      return { panels: [], wireframeImageUrl: null }
    }

    setIsGeneratingLayouts(true)
    setError(null)
    setPhase('generating-layouts')

    try {
      const result = await generateStructuredWireframe({
        apiKey, modelId: selectedModel, userPrompt: prompt,
        productImages, aspectRatio, customWidth, customHeight,
      })

      setAiDraftPanels(result.panels)
      setAiDraftImage(result.wireframeImageUrl)
      setPhase('editing-panels')
      return result
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'AIドラフト生成中にエラーが発生しました')
      setPhase('idle')
      return { panels: [], wireframeImageUrl: null }
    } finally {
      setIsGeneratingLayouts(false)
    }
  }, [apiKey, selectedModel, prompt, productImages, aspectRatio, customWidth, customHeight])

  const resetLayouts = useCallback(() => {
    setPhase('idle')
    setWireframes([])
    setSelectedIndex(0)
    setError(null)
    setIsGeneratingLayouts(false)
    setAiDraftPanels([])
    setAiDraftImage(null)
  }, [])

  return {
    autoMode,
    setAutoMode,
    phase,
    wireframes,
    selectedIndex,
    setSelectedIndex,
    isGeneratingLayouts,
    error,
    generateLayouts,
    getSelectedWireframeDataUrl,
    resetLayouts,
    startFromScratch,
    generateAIDraft,
    aiDraftPanels,
    aiDraftImage,
  }
}
