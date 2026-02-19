import { useState, useCallback } from 'react'
import type { HistoryItem } from '@/types'

export function useEditHistory() {
  const [editHistory, setEditHistory] = useState<HistoryItem[]>([])

  const addToHistory = useCallback((prompt: string, imageData: string, replace = false) => {
    const newItem: HistoryItem = {
      id: `${Date.now()}`,
      prompt,
      imageData,
      timestamp: new Date()
    }
    if (replace) {
      setEditHistory([newItem])
    } else {
      setEditHistory(prev => [...prev, newItem])
    }
  }, [])

  // Select an item without truncating history
  const selectItem = useCallback((item: HistoryItem): string => {
    return item.imageData
  }, [])

  const clearHistory = useCallback(() => {
    setEditHistory([])
  }, [])

  return { editHistory, addToHistory, selectItem, clearHistory }
}
