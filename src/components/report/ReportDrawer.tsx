import { motion, AnimatePresence } from 'framer-motion'
import type { QualityReport, ChatMessage } from '@/types'
import { QUICK_QUESTIONS } from '@/constants/qualityReport'
import { ChatInterface } from './ChatInterface'
import './ReportDrawer.css'

type Props = {
  isOpen: boolean
  report: QualityReport | null
  chatMessages: ChatMessage[]
  isAnalyzing: boolean
  isChatLoading: boolean
  chatInput: string
  autoAnalyzeEnabled: boolean
  error: string | null
  onClose: () => void
  onAnalyze: () => void
  onChatInputChange: (value: string) => void
  onChatSend: (message: string) => void
  onAutoAnalyzeChange: (enabled: boolean) => void
  onApplySuggestion: (suggestion: string) => void
}

function ScoreStars({ score }: { score: number }) {
  return (
    <span className="score-stars" aria-label={`${score}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`star ${i < score ? 'star-filled' : 'star-empty'}`}>
          ★
        </span>
      ))}
    </span>
  )
}

export function ReportDrawer({
  isOpen, report, chatMessages, isAnalyzing, isChatLoading,
  chatInput, autoAnalyzeEnabled, error,
  onClose, onAnalyze, onChatInputChange, onChatSend,
  onAutoAnalyzeChange, onApplySuggestion,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className="report-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'auto', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="report-panel-inner">
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-header-left">
                <h2 className="drawer-title">品質レポート</h2>
                <label className="auto-toggle">
                  <input
                    type="checkbox"
                    checked={autoAnalyzeEnabled}
                    onChange={e => onAutoAnalyzeChange(e.target.checked)}
                  />
                  <span className="toggle-label">自動分析</span>
                </label>
              </div>
              <button className="drawer-close" onClick={onClose} aria-label="閉じる">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="drawer-error">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            {/* Report Section */}
            <div className="drawer-report">
              {isAnalyzing && (
                <div className="report-loading">
                  <div className="report-spinner" />
                  <span>画像を分析中...</span>
                </div>
              )}

              {!isAnalyzing && !report && (
                <div className="report-empty">
                  <p>画像の品質を分析してスコアとフィードバックを表示します</p>
                  <button className="analyze-inline-button" onClick={onAnalyze}>
                    分析する
                  </button>
                </div>
              )}

              {report && (
                <>
                  {/* Overall Score */}
                  <div className="overall-score-card">
                    <span className="overall-score-value">{report.overallScore.toFixed(1)}</span>
                    <span className="overall-score-label">/ 5.0</span>
                  </div>

                  {/* Categories */}
                  <div className="score-cards">
                    {report.categories.map(cat => (
                      <div key={cat.id} className="score-card">
                        <div className="score-card-header">
                          <span className="score-card-name">{cat.name}</span>
                          <ScoreStars score={cat.score} />
                        </div>
                        <p className="score-card-comment">{cat.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="report-summary">
                    <p>{report.summary}</p>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="drawer-divider" />

            {/* Quick Questions */}
            <div className="quick-questions">
              <span className="quick-questions-label">クイック質問</span>
              <div className="quick-questions-chips">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q.id}
                    className="quick-chip"
                    onClick={() => onChatSend(q.prompt)}
                    disabled={isChatLoading}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat */}
            <ChatInterface
              messages={chatMessages}
              isLoading={isChatLoading}
              inputValue={chatInput}
              onInputChange={onChatInputChange}
              onSend={onChatSend}
              onApplySuggestion={onApplySuggestion}
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
