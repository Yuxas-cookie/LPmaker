import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nano-banana-system-prompt'

export function useSystemPrompt() {
  const [systemPrompt, setSystemPrompt] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setSystemPrompt(saved)
  }, [])

  useEffect(() => {
    if (systemPrompt) {
      localStorage.setItem(STORAGE_KEY, systemPrompt)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [systemPrompt])

  return { systemPrompt, setSystemPrompt }
}
