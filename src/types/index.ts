export type ModelOption = {
  id: string
  name: string
  description: string
}

export type UploadedImage = {
  id: string
  file: File
  preview: string
  base64: string
  mimeType: string
}

export type HistoryItem = {
  id: string
  prompt: string
  imageData: string
  timestamp: Date
}

export type PromptTemplate = {
  name: string
  prompt: string
  category?: string
  recommendedStyle?: string
  recommendedAspectRatio?: string
}

export type AspectRatioOption = {
  id: string
  label: string
  width: number
  height: number
  description: string
}

export type StylePreset = {
  id: string
  name: string
  description: string
  promptSuffix: string
  accentColor: string
  keywords: string[]
}

export type QualityCategory = {
  id: string
  name: string
  score: number
  comment: string
}

export type QualityReport = {
  categories: QualityCategory[]
  overallScore: number
  summary: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestion?: string
}

export type QuickQuestion = {
  id: string
  label: string
  prompt: string
}

export type LayoutDirection = {
  id: string
  name: string
  description: string
  promptSuffix: string
}

export type WireframeCandidate = {
  id: string
  directionId: string
  directionName: string
  imageDataUrl: string
  generatedAt: Date
}

export type LayoutGenerationPhase = 'idle' | 'generating-layouts' | 'selecting-layout' | 'editing-panels'

export type PanelRect = {
  id: string
  x: number        // 0-100 percentage from left
  y: number        // 0-100 percentage from top
  width: number    // 0-100 percentage
  height: number   // 0-100 percentage
  borderWidth: number  // px (default 4)
  label: string        // editable on double-click
}
