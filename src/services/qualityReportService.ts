import { GoogleGenerativeAI } from '@google/generative-ai'
import type { QualityReport, ChatMessage } from '@/types'
import { REPORT_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from '@/constants/qualityReport'
import { dataUrlToBase64 } from './imageUtils'

function createTextModel(apiKey: string, modelId: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseModalities: ['Text'],
    } as any,
  })
}

export async function analyzeImage(params: {
  apiKey: string
  modelId: string
  imageDataUrl: string
}): Promise<QualityReport> {
  const { apiKey, modelId, imageDataUrl } = params
  const model = createTextModel(apiKey, modelId)
  const { base64, mimeType } = dataUrlToBase64(imageDataUrl)

  const result = await model.generateContent([
    { text: REPORT_SYSTEM_PROMPT },
    { inlineData: { mimeType, data: base64 } },
  ])

  const responseText = result.response.text()

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('レポートの解析に失敗しました')
  }

  const parsed = JSON.parse(jsonMatch[0]) as QualityReport

  if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
    throw new Error('レポートのフォーマットが不正です')
  }

  return parsed
}

export async function chatAboutImage(params: {
  apiKey: string
  modelId: string
  imageDataUrl: string
  messages: ChatMessage[]
  userMessage: string
}): Promise<{ content: string; suggestion?: string }> {
  const { apiKey, modelId, imageDataUrl, messages, userMessage } = params
  const model = createTextModel(apiKey, modelId)
  const { base64, mimeType } = dataUrlToBase64(imageDataUrl)

  const historyParts: any[] = [
    { text: CHAT_SYSTEM_PROMPT },
    { inlineData: { mimeType, data: base64 } },
  ]

  for (const msg of messages) {
    historyParts.push({ text: `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}` })
  }

  historyParts.push({ text: `ユーザー: ${userMessage}` })

  const result = await model.generateContent(historyParts)
  const content = result.response.text()

  let suggestion: string | undefined
  const suggestionMatch = content.match(/【編集提案】([\s\S]*?)【\/編集提案】/)
  if (suggestionMatch) {
    suggestion = suggestionMatch[1].trim()
  }

  return { content, suggestion }
}
