import { useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types'
import './ChatInterface.css'

type Props = {
  messages: ChatMessage[]
  isLoading: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSend: (message: string) => void
  onApplySuggestion: (suggestion: string) => void
}

export function ChatInterface({
  messages, isLoading, inputValue,
  onInputChange, onSend, onApplySuggestion,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isLoading) {
        onSend(inputValue)
      }
    }
  }

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue)
    }
  }

  // Strip suggestion markers for display
  const formatContent = (content: string) => {
    return content.replace(/【編集提案】[\s\S]*?【\/編集提案】/g, '').trim()
  }

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty">
            <p>クイック質問を選択するか、自由に質問してください</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`chat-bubble chat-bubble-${msg.role}`}>
            <div className="chat-bubble-label">
              {msg.role === 'user' ? 'あなた' : 'AI アドバイザー'}
            </div>
            <div className="chat-bubble-content">
              {msg.role === 'assistant' ? formatContent(msg.content) : msg.content}
            </div>
            {msg.suggestion && (
              <button
                className="chat-apply-button"
                onClick={() => onApplySuggestion(msg.suggestion!)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h7M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                編集に適用
              </button>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble chat-bubble-assistant">
            <div className="chat-bubble-label">AI アドバイザー</div>
            <div className="chat-typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="質問を入力..."
          rows={1}
          disabled={isLoading}
        />
        <button
          className="chat-send-button"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          aria-label="送信"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 2L7 9M14 2l-4 12-3-5L2 6l12-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
