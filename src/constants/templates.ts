import type { PromptTemplate } from '@/types'

export const BASE_TEMPLATES: PromptTemplate[] = [
  {
    name: 'ヒーローバナー',
    prompt: 'この商品画像を使って、LP用のヒーローバナー画像を作成してください。商品を中心に配置し、高級感のある背景で、プロフェッショナルな印象に仕上げてください。',
    category: '基本',
  },
  {
    name: '使用シーン',
    prompt: 'この商品を実際に使用しているシーンの画像を作成してください。自然な環境で、商品の魅力が伝わるようにしてください。',
    category: '基本',
  },
  {
    name: 'Before/After',
    prompt: 'この商品のBefore/After比較画像を作成してください。左側にBefore、右側にAfterを配置し、効果が視覚的にわかるようにしてください。',
    category: '基本',
  },
  {
    name: 'SNS投稿用',
    prompt: 'この商品をSNS投稿用の正方形画像にしてください。目を引くデザインで、シェアしたくなるような魅力的な画像に仕上げてください。',
    category: '基本',
  },
  {
    name: 'カスタム',
    prompt: '',
    category: '基本',
  }
]

export const INDUSTRY_TEMPLATES: PromptTemplate[] = [
  {
    name: '美容ヒーロー',
    prompt: 'この商品を使って、美容・コスメブランド向けのラグジュアリーなヒーローバナー画像を作成してください。柔らかい光とエレガントな背景で、上品さと高級感を演出してください。肌や素材のテクスチャが美しく映えるよう、ライティングにこだわってください。',
    category: '美容',
    recommendedStyle: 'luxury',
    recommendedAspectRatio: '16:9',
  },
  {
    name: 'フード撮影風',
    prompt: 'この商品を使って、フード・飲食業界向けの撮影風画像を作成してください。自然光が差し込む温かみのある環境で、食欲をそそるシズル感のある画像に仕上げてください。木目やリネンなど自然素材の小物を添えてください。',
    category: 'フード',
    recommendedStyle: 'natural',
    recommendedAspectRatio: '4:3',
  },
  {
    name: '物件インテリア',
    prompt: 'この商品を使って、不動産・インテリア業界向けのスタイリッシュな画像を作成してください。ミニマルで洗練された空間に商品を配置し、清潔感と居住空間の心地よさを表現してください。自然光と白を基調としたクリーンな仕上がりにしてください。',
    category: '不動産',
    recommendedStyle: 'minimal',
    recommendedAspectRatio: '16:9',
  },
  {
    name: 'SaaSプロダクト',
    prompt: 'この商品を使って、SaaS・テクノロジー企業向けのプロダクト紹介画像を作成してください。ダークな背景にネオンカラーのアクセントで未来的な雰囲気を演出し、デバイスモックアップやUIスクリーンと組み合わせてプロフェッショナルに仕上げてください。',
    category: 'SaaS',
    recommendedStyle: 'tech',
    recommendedAspectRatio: '16:9',
  },
  {
    name: 'ファッションルック',
    prompt: 'この商品を使って、ファッション・アパレルブランド向けのルックブック風画像を作成してください。ビビッドでカラフルな背景と大胆な構図で、トレンド感とスタイリッシュさを表現してください。SNS映えするポップな仕上がりにしてください。',
    category: 'ファッション',
    recommendedStyle: 'pop',
    recommendedAspectRatio: '9:16',
  },
]

export const TEMPLATE_CATEGORIES = ['基本', '美容', 'フード', '不動産', 'SaaS', 'ファッション'] as const

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]

export function getTemplatesByCategory(category: TemplateCategory): PromptTemplate[] {
  if (category === '基本') {
    return BASE_TEMPLATES
  }
  const industryTemplates = INDUSTRY_TEMPLATES.filter(t => t.category === category)
  // Always include "カスタム" in every category
  const customTemplate = BASE_TEMPLATES.find(t => t.name === 'カスタム')!
  return [...industryTemplates, customTemplate]
}

export function getAllTemplates(): PromptTemplate[] {
  return [...BASE_TEMPLATES, ...INDUSTRY_TEMPLATES]
}
