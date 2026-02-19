import { useState, useCallback, useEffect, useRef } from 'react'
import type { QualityReport, ChatMessage } from '@/types'
import * as qualityService from '@/services/qualityReportService'

type UseQualityReportParams = {
  apiKey: string
  selectedModel: string
  generatedImage: string | null
  autoAnalyze: boolean
}

export function useQualityReport(params: UseQualityReportParams) {
  const { apiKey, selectedModel, generatedImage, autoAnalyze } = params

  const [isDrawerOpen, setIsDrawerOpen] = useState(autoAnalyze)
  const [report, setReport] = useState<QualityReport | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [autoAnalyzeEnabled, setAutoAnalyzeEnabled] = useState(autoAnalyze)
  const [error, setError] = useState<string | null>(null)

  // Track which image the current report is for
  const analyzedImageRef = useRef<string | null>(null)

  // Reset report and chat when image changes
  useEffect(() => {
    if (generatedImage !== analyzedImageRef.current) {
      setReport(null)
      setChatMessages([])
      setError(null)
    }
  }, [generatedImage])

  // Auto-analyze when new image is generated (delayed to avoid rate limits)
  useEffect(() => {
    if (autoAnalyzeEnabled && generatedImage && generatedImage !== analyzedImageRef.current) {
      const timer = setTimeout(() => {
        analyze()
      }, 5000) // 5秒遅延でレート制限を回避
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedImage, autoAnalyzeEnabled])

  const analyze = useCallback(async () => {
    if (!apiKey.trim() || !generatedImage) return

    setIsAnalyzing(true)
    setError(null)
    setIsDrawerOpen(true)

    try {
      const result = await qualityService.analyzeImage({
        apiKey,
        modelId: selectedModel,
        imageDataUrl: generatedImage,
      })
      setReport(result)
      analyzedImageRef.current = generatedImage
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました')
    } finally {
      setIsAnalyzing(false)
    }
  }, [apiKey, selectedModel, generatedImage])

  const sendChat = useCallback(async (message: string) => {
    if (!apiKey.trim() || !generatedImage || !message.trim()) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    }

    // Optimistic update: show user message immediately
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsChatLoading(true)
    setError(null)

    try {
      const result = await qualityService.chatAboutImage({
        apiKey,
        modelId: selectedModel,
        imageDataUrl: generatedImage,
        messages: [...chatMessages, userMsg],
        userMessage: message.trim(),
      })

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
        suggestion: result.suggestion,
      }

      setChatMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'チャット応答中にエラーが発生しました')
    } finally {
      setIsChatLoading(false)
    }
  }, [apiKey, selectedModel, generatedImage, chatMessages])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  return {
    isDrawerOpen,
    report,
    chatMessages,
    isAnalyzing,
    isChatLoading,
    chatInput,
    setChatInput,
    autoAnalyzeEnabled,
    setAutoAnalyzeEnabled,
    error,
    analyze,
    sendChat,
    openDrawer,
    closeDrawer,
  }
}
