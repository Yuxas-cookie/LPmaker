type Props = {
  prompt: string
  onPromptChange: (value: string) => void
  onManualEdit: () => void
}

export function PromptEditor({ prompt, onPromptChange, onManualEdit }: Props) {
  return (
    <section className="prompt-section section-card">
      <span className="section-label">Prompt</span>
      <label htmlFor="prompt">プロンプト</label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e) => {
          onPromptChange(e.target.value)
          onManualEdit()
        }}
        placeholder="生成したい画像の説明を入力してください..."
        className="textarea"
        rows={4}
      />
    </section>
  )
}
