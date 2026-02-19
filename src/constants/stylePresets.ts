import type { StylePreset } from '@/types'

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'none',
    name: 'なし',
    description: 'スタイル指定なし',
    promptSuffix: '',
    accentColor: '#71717A',
    keywords: [],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: '余白を活かしたクリーンなデザイン。色数を抑え、タイポグラフィと余白で魅せる。',
    promptSuffix: 'ミニマルでクリーンなデザインにしてください。余白を十分に取り、色数は最小限に抑え、洗練された印象に仕上げてください。フラットで無駄のない構成を心がけてください。',
    accentColor: '#F8FAFC',
    keywords: ['クリーン', '余白', 'シンプル'],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: '高級感のあるゴールド基調のエレガントなデザイン。',
    promptSuffix: '高級感とエレガンスを最大限に表現してください。ゴールドやシャンパンカラーを基調とし、上品な光沢感とリッチなテクスチャを取り入れてください。プレミアムブランドにふさわしい重厚感のある仕上がりにしてください。',
    accentColor: '#FACC15',
    keywords: ['高級感', 'ゴールド', 'エレガント'],
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'ビビッドで大胆、カラフルなデザイン。目を引く鮮やかさ。',
    promptSuffix: 'ビビッドでカラフルなポップデザインにしてください。大胆な色使い、ダイナミックな構図、遊び心のあるグラフィック要素を取り入れ、見る人の目を引く鮮やかな画像に仕上げてください。',
    accentColor: '#F472B6',
    keywords: ['ビビッド', 'カラフル', '大胆'],
  },
  {
    id: 'natural',
    name: 'Natural',
    description: 'アースカラーと柔らかい光。温かみのあるナチュラルなトーン。',
    promptSuffix: 'ナチュラルで温かみのあるデザインにしてください。アースカラー（ベージュ、グリーン、ブラウン）を基調に、柔らかい自然光を活かした優しい雰囲気に仕上げてください。オーガニックで心地よい印象を大切にしてください。',
    accentColor: '#86EFAC',
    keywords: ['ナチュラル', 'アースカラー', '柔らかい光'],
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'ダーク+ネオン、幾何学パターンの未来的デザイン。',
    promptSuffix: '未来的でテクノロジー感のあるデザインにしてください。ダークな背景にネオンカラーのアクセント、幾何学的なパターンやグリッドラインを取り入れ、先進的でスタイリッシュな画像に仕上げてください。',
    accentColor: '#22D3EE',
    keywords: ['ダーク', 'ネオン', '未来的'],
  },
]

export const DEFAULT_STYLE_PRESET = STYLE_PRESETS[0]
