import { motion } from 'framer-motion'
import { MODELS } from '@/constants/models'

type Props = {
  selectedModel: string
  onModelChange: (modelId: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: Props) {
  return (
    <section className="model-section section-card">
      <span className="section-label">Model</span>
      <label>モデル選択</label>
      <div className="model-options">
        {MODELS.map((model) => (
          <motion.label
            key={model.id}
            className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="radio"
              name="model"
              value={model.id}
              checked={selectedModel === model.id}
              onChange={(e) => onModelChange(e.target.value)}
            />
            <div className="model-info">
              <span className="model-name">{model.name}</span>
              <span className="model-desc">{model.description}</span>
            </div>
          </motion.label>
        ))}
      </div>
    </section>
  )
}
