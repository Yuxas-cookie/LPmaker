type Props = {
  apiKey: string
  onApiKeyChange: (value: string) => void
  saveApiKey: boolean
  onSaveApiKeyChange: (value: boolean) => void
}

export function ApiKeySection({ apiKey, onApiKeyChange, saveApiKey, onSaveApiKeyChange }: Props) {
  return (
    <section className="api-section section-card">
      <span className="section-label">API Key</span>
      <label htmlFor="api-key">Google AI API Key</label>
      <div className="api-input-wrapper">
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="AIzaSy..."
          className="input"
        />
      </div>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          id="save-key"
          checked={saveApiKey}
          onChange={(e) => onSaveApiKeyChange(e.target.checked)}
        />
        <label htmlFor="save-key">APIキーを保存する</label>
      </div>
      <a
        href="https://aistudio.google.com/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="api-link"
      >
        APIキーを取得 →
      </a>
    </section>
  )
}
