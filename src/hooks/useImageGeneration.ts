import { useState, useEffect, useCallback } from 'react'
import type { UploadedImage, AspectRatioOption, StylePreset } from '@/types'
import * as gemini from '@/services/geminiService'
import { buildPrompt } from '@/services/promptBuilder'
import { LOADING_MESSAGES } from '@/constants/loading'

type UseImageGenerationParams = {
  apiKey: string
  selectedModel: string
  prompt: string
  systemPrompt: string
  productImages: UploadedImage[]
  referenceImages: UploadedImage[]
  aspectRatio: AspectRatioOption | null
  customWidth?: number
  customHeight?: number
  stylePreset: StylePreset | null
  onGenerated: (imageDataUrl: string, prompt: string, replace: boolean) => void
}

export function useImageGeneration(params: UseImageGenerationParams) {
  const {
    apiKey, selectedModel, prompt, systemPrompt,
    productImages, referenceImages,
    aspectRatio, customWidth, customHeight, stylePreset,
    onGenerated,
  } = params

  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [imageRevealed, setImageRevealed] = useState(false)
  const [showSuccessFlash, setShowSuccessFlash] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setLoadingStage(0)
      return
    }
    const interval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [isLoading])

  const triggerImageReveal = useCallback(() => {
    setImageRevealed(false)
    setShowSuccessFlash(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setImageRevealed(true)
      })
    })
    setTimeout(() => setShowSuccessFlash(false), 400)
  }, [])

  const generateImage = useCallback(async (options?: {
    extraReferenceImages?: UploadedImage[]
    additionalPromptSuffix?: string
  }) => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください')
      return
    }
    if (!prompt.trim()) {
      setError('プロンプトを入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let basePrompt = prompt
      if (options?.additionalPromptSuffix) {
        basePrompt += `\n\n${options.additionalPromptSuffix}`
      }

      const fullPrompt = buildPrompt({
        systemPrompt,
        basePrompt,
        aspectRatio,
        customWidth,
        customHeight,
        stylePreset,
      })

      const allRefs = options?.extraReferenceImages
        ? [...options.extraReferenceImages, ...referenceImages]
        : referenceImages

      const result = await gemini.generateImage({
        apiKey,
        modelId: selectedModel,
        prompt: fullPrompt,
        productImages,
        referenceImages: allRefs,
      })

      setGeneratedImage(result.imageDataUrl)
      setIsEditMode(true)
      onGenerated(result.imageDataUrl, prompt, true)
      triggerImageReveal()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '画像生成中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, prompt, systemPrompt, selectedModel, productImages, referenceImages, aspectRatio, customWidth, customHeight, stylePreset, onGenerated, triggerImageReveal])

  const editImage = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください')
      return
    }
    if (!editPrompt.trim()) {
      setError('編集内容を入力してください')
      return
    }
    if (!generatedImage) {
      setError('編集する画像がありません')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await gemini.editImage({
        apiKey,
        modelId: selectedModel,
        editPrompt,
        currentImageDataUrl: generatedImage,
        productImages,
        referenceImages,
      })

      setGeneratedImage(result.imageDataUrl)
      onGenerated(result.imageDataUrl, editPrompt, false)
      setEditPrompt('')
      triggerImageReveal()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '画像編集中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, editPrompt, generatedImage, selectedModel, productImages, referenceImages, onGenerated, triggerImageReveal])

  const resetToNew = useCallback(() => {
    setGeneratedImage(null)
    setIsEditMode(false)
    setEditPrompt('')
    setError(null)
    setImageRevealed(false)
  }, [])

  const setGeneratedImageFromHistory = useCallback((imageDataUrl: string) => {
    setGeneratedImage(imageDataUrl)
    triggerImageReveal()
  }, [triggerImageReveal])

  return {
    generatedImage, isLoading, error, editPrompt, setEditPrompt,
    isEditMode, loadingStage, imageRevealed, showSuccessFlash,
    generateImage, editImage, resetToNew, setGeneratedImageFromHistory,
  }
}
