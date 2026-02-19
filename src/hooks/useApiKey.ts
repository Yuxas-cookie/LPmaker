import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nano-banana-api-key'

export function useApiKey() {
  const [apiKey, setApiKey] = useState('')
  const [saveApiKey, setSaveApiKey] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY)
    if (savedKey) {
      setApiKey(savedKey)
      setSaveApiKey(true)
    }
  }, [])

  useEffect(() => {
    if (saveApiKey && apiKey) {
      localStorage.setItem(STORAGE_KEY, apiKey)
    } else if (!saveApiKey) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [saveApiKey, apiKey])

  return { apiKey, setApiKey, saveApiKey, setSaveApiKey }
}
