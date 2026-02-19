import type { QuickQuestion } from '@/types'

export const QUALITY_CATEGORIES = [
  { id: 'composition', name: '構図・レイアウト' },
  { id: 'color', name: '配色・カラーバランス' },
  { id: 'lp-fit', name: 'LP適合性' },
  { id: 'appeal', name: '商品の訴求力' },
  { id: 'improvement', name: '改善提案' },
] as const

export const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: 'cta',
    label: 'CTA改善',
    prompt: 'このLP画像のCTA（コールトゥアクション）をより効果的にするには、どのような改善が考えられますか？具体的な編集指示も含めてください。',
  },
  {
    id: 'target',
    label: 'ターゲット適合',
    prompt: 'このLP画像はターゲットユーザーに適切に訴求できていますか？ペルソナを想定した上で改善点を教えてください。',
  },
  {
    id: 'cvr',
    label: 'CVR向上',
    prompt: 'このLP画像のCVR（コンバージョン率）を向上させるために、デザイン面でどのような改善が有効ですか？',
  },
  {
    id: 'brand',
    label: 'ブランド感',
    prompt: 'このLP画像のブランドイメージや統一感について評価してください。高級感や信頼性を高めるにはどうすればよいですか？',
  },
  {
    id: 'firstview',
    label: 'ファーストビュー',
    prompt: 'ファーストビューとしてのインパクトは十分ですか？ユーザーの注目を引き、スクロールを促すための改善提案をしてください。',
  },
]

export const REPORT_SYSTEM_PROMPT = `あなたはLP（ランディングページ）デザインの専門家です。
提供された画像を分析し、以下の5カテゴリでそれぞれ1〜5のスコアとコメントを付けてください。

カテゴリ:
1. composition（構図・レイアウト）: 視覚的な配置、余白の使い方、視線誘導
2. color（配色・カラーバランス）: 色の調和、コントラスト、ブランドとの整合性
3. lp-fit（LP適合性）: LPとしての効果、CTAの配置、情報の優先順位
4. appeal（商品の訴求力）: 商品の見せ方、訴求ポイントの明確さ
5. improvement（改善提案）: 全体的な改善余地の評価（5=改善不要、1=大幅改善必要）

必ず以下のJSON形式のみで回答してください。余計なテキストは不要です:
{
  "categories": [
    { "id": "composition", "name": "構図・レイアウト", "score": 4, "comment": "..." },
    { "id": "color", "name": "配色・カラーバランス", "score": 3, "comment": "..." },
    { "id": "lp-fit", "name": "LP適合性", "score": 4, "comment": "..." },
    { "id": "appeal", "name": "商品の訴求力", "score": 3, "comment": "..." },
    { "id": "improvement", "name": "改善提案", "score": 3, "comment": "..." }
  ],
  "overallScore": 3.4,
  "summary": "全体的な評価サマリー..."
}`

export const CHAT_SYSTEM_PROMPT = `あなたはLP（ランディングページ）デザインの専門家であり、クリエイティブディレクターです。
ユーザーが提供した画像について、品質改善や戦略についてアドバイスしてください。

回答のルール:
- 具体的で実行可能なアドバイスを提供する
- LP制作の観点から回答する
- 具体的な画像編集の指示がある場合、以下のマーカーで囲んでください:
  【編集提案】ここに具体的な編集プロンプトを記載【/編集提案】
- 編集提案は、画像生成AIへの指示として使えるよう、簡潔かつ具体的にしてください
- 日本語で回答してください`
