import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChatMessage } from '@/types'
import { BRAINSTORM_SYSTEM_PROMPT } from '@/constants/brainstorm'

function createTextModel(apiKey: string, modelId: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseModalities: ['Text'],
    } as any,
  })
}

export async function brainstormChat(params: {
  apiKey: string
  modelId: string
  messages: ChatMessage[]
  userMessage: string
}): Promise<{ content: string; promptSuggestion?: string }> {
  const { apiKey, modelId, messages, userMessage } = params
  const model = createTextModel(apiKey, modelId)

  const historyParts: any[] = [
    { text: BRAINSTORM_SYSTEM_PROMPT },
  ]

  for (const msg of messages) {
    historyParts.push({ text: `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}` })
  }

  historyParts.push({ text: `ユーザー: ${userMessage}` })

  const result = await model.generateContent(historyParts)
  const content = result.response.text()

  let promptSuggestion: string | undefined
  const suggestionMatch = content.match(/【プロンプト提案】([\s\S]*?)【\/プロンプト提案】/)
  if (suggestionMatch) {
    promptSuggestion = suggestionMatch[1].trim()
  }

  return { content, promptSuggestion }
}
