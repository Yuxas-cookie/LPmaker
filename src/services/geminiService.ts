import { GoogleGenerativeAI } from '@google/generative-ai'
import type { UploadedImage } from '@/types'
import { dataUrlToBase64 } from './imageUtils'

type GenerateImageParams = {
  apiKey: string
  modelId: string
  prompt: string
  productImages: UploadedImage[]
  referenceImages: UploadedImage[]
}

type EditImageParams = {
  apiKey: string
  modelId: string
  editPrompt: string
  currentImageDataUrl: string
  productImages?: UploadedImage[]
  referenceImages?: UploadedImage[]
}

type GeminiResult = {
  imageDataUrl: string
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

export async function generateImage(params: GenerateImageParams): Promise<GeminiResult> {
  const { apiKey, modelId, prompt, productImages, referenceImages } = params
  const model = createModel(apiKey, modelId)

  const contentParts: any[] = []

  let fullPrompt = prompt
  if (productImages.length > 0) {
    fullPrompt = `【商品画像が${productImages.length}枚添付されています】\n\n${prompt}`
  }
  if (referenceImages.length > 0) {
    fullPrompt += `\n\n【参考資料が${referenceImages.length}枚添付されています。これらのスタイルやレイアウトを参考にしてください】`
  }

  contentParts.push({ text: fullPrompt })

  for (const img of productImages) {
    contentParts.push({
      inlineData: { mimeType: img.mimeType, data: img.base64 }
    })
  }
  for (const img of referenceImages) {
    contentParts.push({
      inlineData: { mimeType: img.mimeType, data: img.base64 }
    })
  }

  const result = await model.generateContent(contentParts)
  const response = result.response
  const imageDataUrl = extractImageFromResponse(response.candidates ?? [])

  if (!imageDataUrl) {
    throw new Error('画像データが見つかりませんでした')
  }

  return { imageDataUrl }
}

export async function editImage(params: EditImageParams): Promise<GeminiResult> {
  const { apiKey, modelId, editPrompt, currentImageDataUrl, productImages = [], referenceImages = [] } = params
  const model = createModel(apiKey, modelId)

  const { base64, mimeType } = dataUrlToBase64(currentImageDataUrl)

  let promptText = `この画像を編集してください：${editPrompt}`
  if (productImages.length > 0) {
    promptText += `\n\n【追加の商品画像が${productImages.length}枚添付されています。これらを参考に編集してください】`
  }
  if (referenceImages.length > 0) {
    promptText += `\n\n【追加の参考資料が${referenceImages.length}枚添付されています。これらのスタイルを参考にしてください】`
  }

  const contentParts: any[] = [
    { text: promptText },
    { inlineData: { mimeType, data: base64 } }
  ]

  for (const img of productImages) {
    contentParts.push({
      inlineData: { mimeType: img.mimeType, data: img.base64 }
    })
  }
  for (const img of referenceImages) {
    contentParts.push({
      inlineData: { mimeType: img.mimeType, data: img.base64 }
    })
  }

  const result = await model.generateContent(contentParts)
  const response = result.response
  const imageDataUrl = extractImageFromResponse(response.candidates ?? [])

  if (!imageDataUrl) {
    throw new Error('編集後の画像データが見つかりませんでした')
  }

  return { imageDataUrl }
}
