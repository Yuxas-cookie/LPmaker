import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SystemPromptEditor.css'

type Props = {
  systemPrompt: string
  onSystemPromptChange: (value: string) => void
}

export function SystemPromptEditor({ systemPrompt, onSystemPromptChange }: Props) {
  const [isOpen, setIsOpen] = useState(systemPrompt.length > 0)

  return (
    <section className="system-prompt-section section-card">
      <span className="section-label">System</span>
      <button
        className="system-prompt-toggle"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="system-prompt-toggle-title">システムプロンプト</span>
        <span className="system-prompt-toggle-hint">
          {systemPrompt ? '設定済み' : '未設定'}
        </span>
        <svg
          className={`system-prompt-chevron ${isOpen ? 'open' : ''}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M4 5.5L7 8.5L10 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="system-prompt-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <p className="system-prompt-description">
              全ての画像生成に共通で適用されるベース指示です。ブランドトーン、禁止事項、品質基準などを記述してください。
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              placeholder="例: あなたはプロのグラフィックデザイナーです。生成する画像は必ず日本市場向けの美的感覚に合わせてください。テキストは一切含めないでください。解像度は最大限高く、商用品質で仕上げてください。"
              className="textarea system-prompt-textarea"
              rows={4}
            />
            {systemPrompt && (
              <button
                className="system-prompt-clear"
                onClick={() => onSystemPromptChange('')}
              >
                クリア
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
