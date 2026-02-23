import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'
import * as brainstormService from '@/services/brainstormService'

type UseBrainstormParams = {
  apiKey: string
  selectedModel: string
}

export function useBrainstorm(params: UseBrainstormParams) {
  const { apiKey, selectedModel } = params

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (message: string) => {
    if (!apiKey.trim() || !message.trim()) return

    const userMsg: ChatMessage = {
      id: `bs-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsLoading(true)
    setError(null)

    try {
      const result = await brainstormService.brainstormChat({
        apiKey,
        modelId: selectedModel,
        messages: [...messages, userMsg],
        userMessage: message.trim(),
      })

      const assistantMsg: ChatMessage = {
        id: `bs-${Date.now()}-resp`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
        suggestion: result.promptSuggestion,
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'ブレインストーミング中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, selectedModel, messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setChatInput('')
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    chatInput,
    setChatInput,
    error,
    sendMessage,
    clearChat,
  }
}
