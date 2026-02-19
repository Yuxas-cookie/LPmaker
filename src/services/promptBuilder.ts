import type { AspectRatioOption, StylePreset } from '@/types'

type PromptBuildParams = {
  systemPrompt: string
  basePrompt: string
  aspectRatio: AspectRatioOption | null
  customWidth?: number
  customHeight?: number
  stylePreset: StylePreset | null
}

export function buildPrompt(params: PromptBuildParams): string {
  const { systemPrompt, basePrompt, aspectRatio, customWidth, customHeight, stylePreset } = params

  let prompt = ''

  if (systemPrompt.trim()) {
    prompt += `【システム指示】\n${systemPrompt.trim()}\n\n【ユーザー指示】\n`
  }

  prompt += basePrompt

  if (aspectRatio && aspectRatio.id !== 'custom') {
    prompt += `\n\n【画像のアスペクト比は${aspectRatio.label}（${aspectRatio.width}x${aspectRatio.height}）で生成してください】`
  } else if (aspectRatio && aspectRatio.id === 'custom' && customWidth && customHeight) {
    prompt += `\n\n【画像のアスペクト比は${customWidth}x${customHeight}で生成してください】`
  }

  if (stylePreset && stylePreset.id !== 'none' && stylePreset.promptSuffix) {
    prompt += `\n\n【スタイル指示：${stylePreset.promptSuffix}】`
  }

  return prompt
}
