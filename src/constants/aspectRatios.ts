import type { AspectRatioOption } from '@/types'

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080, description: 'ワイドバナー' },
  { id: '1:1', label: '1:1', width: 1080, height: 1080, description: 'SNS正方形' },
  { id: '9:16', label: '9:16', width: 1080, height: 1920, description: 'ストーリーズ' },
  { id: '4:3', label: '4:3', width: 1440, height: 1080, description: 'スタンダード' },
  { id: 'custom', label: 'カスタム', width: 1920, height: 1080, description: 'サイズ自由指定' },
]

export const DEFAULT_ASPECT_RATIO = ASPECT_RATIOS[0]
