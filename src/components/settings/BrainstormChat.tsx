import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage, QuickQuestion } from '@/types'
import { BRAINSTORM_TOPICS } from '@/constants/brainstorm'
import { ChatInterface } from '@/components/report/ChatInterface'
import './BrainstormChat.css'

type Props = {
  apiKey: string
  messages: ChatMessage[]
  isLoading: boolean
  chatInput: string
  error: string | null
  onChatInputChange: (value: string) => void
  onSend: (message: string) => void
  onClearChat: () => void
  onApplyPrompt: (prompt: string) => void
}

const SUGGESTION_MARKER = /【プロンプト提案】[\s\S]*?【\/プロンプト提案】/g

export function BrainstormChat({
  apiKey, messages, isLoading, chatInput, error,
  onChatInputChange, onSend, onClearChat, onApplyPrompt,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTopicClick = (topic: QuickQuestion) => {
    onSend(topic.prompt)
  }

  return (
    <section className="brainstorm-section section-card">
      <span className="section-label">Brainstorm</span>
      <button
        className="brainstorm-toggle"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="brainstorm-toggle-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5C4.96 1.5 2.5 3.96 2.5 7c0 1.8.86 3.4 2.2 4.4V13a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5v-1.6A5.48 5.48 0 0013.5 7c0-3.04-2.46-5.5-5.5-5.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 14.5h4M7 11v2.5M9 11v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="brainstorm-toggle-title">AIブレインストーミング</span>
        <span className="brainstorm-toggle-hint">
          {messages.length > 0 ? `${messages.length}件の会話` : 'AIと壁打ち'}
        </span>
        <svg
          className={`brainstorm-chevron ${isOpen ? 'open' : ''}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M4 5.5L7 8.5L10 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="brainstorm-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {!apiKey.trim() ? (
              <div className="brainstorm-no-key">
                <p>APIキーを設定するとAIブレインストーミングが利用できます</p>
              </div>
            ) : (
              <>
                <p className="brainstorm-description">
                  AIとLP画像のコンセプトを壁打ちして、そのままプロンプトを生成できます
                </p>

                <div className="brainstorm-topics">
                  {BRAINSTORM_TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      className="brainstorm-topic-chip"
                      onClick={() => handleTopicClick(topic)}
                      disabled={isLoading}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="brainstorm-error">
                    <span className="error-icon">!</span>
                    {error}
                  </div>
                )}

                <div className="brainstorm-chat-container">
                  <ChatInterface
                    messages={messages}
                    isLoading={isLoading}
                    inputValue={chatInput}
                    onInputChange={onChatInputChange}
                    onSend={onSend}
                    onApplySuggestion={onApplyPrompt}
                    applySuggestionLabel="プロンプトに適用"
                    emptyMessage="トピックを選択するか、自由にAIと壁打ちしてください"
                    placeholder="LP画像について相談..."
                    suggestionMarkerPattern={SUGGESTION_MARKER}
                  />
                </div>

                {messages.length > 0 && (
                  <button
                    className="brainstorm-clear"
                    onClick={onClearChat}
                    disabled={isLoading}
                  >
                    会話をクリア
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
