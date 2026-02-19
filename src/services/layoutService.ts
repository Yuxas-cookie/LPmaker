import { GoogleGenerativeAI } from '@google/generative-ai'
import type { UploadedImage, LayoutDirection, WireframeCandidate, AspectRatioOption, PanelRect } from '@/types'
import { WIREFRAME_GENERATION_PROMPT_PREFIX, STRUCTURED_WIREFRAME_PROMPT } from '@/constants/layoutDirections'

type GenerateWireframeParams = {
  apiKey: string
  modelId: string
  userPrompt: string
  direction: LayoutDirection
  productImages: UploadedImage[]
  aspectRatio: AspectRatioOption | null
  customWidth?: number
  customHeight?: number
}

function createModel(apiKey: string, modelId: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseModalities: ['Text', 'Image'],
    } as any,
  })
}

function extractImageFromResponse(candidates: any[]): string | null {
  if (!candidates || candidates.length === 0) return null
  const parts = candidates[0].content.parts
  for (const part of parts) {
    if ('inlineData' in part && part.inlineData) {
      const base64Data = part.inlineData.data
      const mimeType = part.inlineData.mimeType
      return `data:${mimeType};base64,${base64Data}`
    }
  }
  return null
}

export async function generateWireframe(params: GenerateWireframeParams): Promise<WireframeCandidate> {
  const { apiKey, modelId, userPrompt, direction, productImages, aspectRatio, customWidth, customHeight } = params
  const model = createModel(apiKey, modelId)

  let prompt = WIREFRAME_GENERATION_PROMPT_PREFIX
  prompt += `【ユーザーのLP要件】\n${userPrompt}\n\n`
  prompt += `【${direction.promptSuffix}】\n\n`

  if (aspectRatio && aspectRatio.id !== 'custom') {
    prompt += `【アスペクト比：${aspectRatio.label}（${aspectRatio.width}x${aspectRatio.height}）】\n`
  } else if (aspectRatio && aspectRatio.id === 'custom' && customWidth && customHeight) {
    prompt += `【アスペクト比：${customWidth}x${customHeight}】\n`
  }

  const contentParts: any[] = []

  if (productImages.length > 0) {
    prompt += `\n【商品画像が${productImages.length}枚添付されています。商品画像の配置場所をプレースホルダーで示してください】`
  }

  contentParts.push({ text: prompt })

  for (const img of productImages) {
    contentParts.push({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    })
  }

  const result = await model.generateContent(contentParts)
  const response = result.response
  const imageDataUrl = extractImageFromResponse(response.candidates ?? [])

  if (!imageDataUrl) {
    throw new Error(`ワイヤーフレーム生成に失敗しました（${direction.name}）`)
  }

  return {
    id: `wf-${direction.id}-${Date.now()}`,
    directionId: direction.id,
    directionName: direction.name,
    imageDataUrl,
    generatedAt: new Date(),
  }
}

export async function generateAllWireframes(
  params: Omit<GenerateWireframeParams, 'direction'>,
  directions: LayoutDirection[],
): Promise<{ wireframes: WireframeCandidate[]; errors: string[] }> {
  const results = await Promise.allSettled(
    directions.map((direction) => generateWireframe({ ...params, direction })),
  )

  const wireframes: WireframeCandidate[] = []
  const errors: string[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      wireframes.push(result.value)
    } else {
      errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
    }
  }

  return { wireframes, errors }
}

// ---------- Structured wireframe (image + JSON panels) ----------

type StructuredWireframeParams = {
  apiKey: string
  modelId: string
  userPrompt: string
  productImages: UploadedImage[]
  aspectRatio: AspectRatioOption | null
  customWidth?: number
  customHeight?: number
}

function extractTextFromResponse(candidates: any[]): string {
  if (!candidates || candidates.length === 0) return ''
  const parts = candidates[0].content.parts
  for (const part of parts) {
    if ('text' in part && part.text) return part.text
  }
  return ''
}

function parsePanelsFromText(text: string): PanelRect[] {
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/)
  const rawJson = jsonBlockMatch ? jsonBlockMatch[1].trim() : null

  const jsonStr = rawJson ?? (() => {
    const arrayMatch = text.match(/\[[\s\S]*?\]/)
    return arrayMatch ? arrayMatch[0] : null
  })()

  if (!jsonStr) return []

  try {
    const arr = JSON.parse(jsonStr)
    if (!Array.isArray(arr)) return []

    return arr
      .filter((item: any) =>
        typeof item.x === 'number' &&
        typeof item.y === 'number' &&
        typeof item.width === 'number' &&
        typeof item.height === 'number'
      )
      .map((item: any, i: number) => ({
        id: `ai-panel-${Date.now()}-${i}`,
        x: Math.max(0, Math.min(90, item.x)),
        y: Math.max(0, Math.min(90, item.y)),
        width: Math.max(10, Math.min(100, item.width)),
        height: Math.max(10, Math.min(100, item.height)),
        borderWidth: 4,
        label: item.label || `パネル ${i + 1}`,
      }))
  } catch {
    return []
  }
}

export async function generateStructuredWireframe(params: StructuredWireframeParams): Promise<{
  panels: PanelRect[]
  wireframeImageUrl: string | null
}> {
  const { apiKey, modelId, userPrompt, productImages, aspectRatio, customWidth, customHeight } = params
  const model = createModel(apiKey, modelId)

  let prompt = STRUCTURED_WIREFRAME_PROMPT
  prompt += `\n【ユーザーのLP要件】\n${userPrompt}\n\n`

  if (aspectRatio && aspectRatio.id !== 'custom') {
    prompt += `【アスペクト比：${aspectRatio.label}（${aspectRatio.width}x${aspectRatio.height}）】\n`
  } else if (aspectRatio && aspectRatio.id === 'custom' && customWidth && customHeight) {
    prompt += `【アスペクト比：${customWidth}x${customHeight}】\n`
  }

  const contentParts: any[] = []

  if (productImages.length > 0) {
    prompt += `\n【商品画像が${productImages.length}枚添付されています。商品画像の配置場所をプレースホルダーで示してください】`
  }

  contentParts.push({ text: prompt })

  for (const img of productImages) {
    contentParts.push({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    })
  }

  const result = await model.generateContent(contentParts)
  const response = result.response
  const imageUrl = extractImageFromResponse(response.candidates ?? [])
  const text = extractTextFromResponse(response.candidates ?? [])
  const panels = parsePanelsFromText(text)

  return { panels, wireframeImageUrl: imageUrl }
}
