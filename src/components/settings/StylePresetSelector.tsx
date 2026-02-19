import { motion } from 'framer-motion'
import type { StylePreset } from '@/types'
import { STYLE_PRESETS } from '@/constants/stylePresets'
import './StylePresetSelector.css'

type Props = {
  selectedPreset: StylePreset
  onPresetChange: (preset: StylePreset) => void
}

export function StylePresetSelector({ selectedPreset, onPresetChange }: Props) {
  return (
    <section className="style-preset-section section-card">
      <span className="section-label">Style</span>
      <label>スタイルプリセット</label>

      <div className="style-preset-grid">
        {STYLE_PRESETS.map((preset) => (
          <motion.button
            key={preset.id}
            className={`style-preset-card ${selectedPreset.id === preset.id ? 'selected' : ''}`}
            onClick={() => onPresetChange(preset)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="preset-header">
              <span
                className="preset-swatch"
                style={{ background: preset.accentColor }}
              />
              <span className="preset-name">{preset.name}</span>
            </div>
            <p className="preset-description">{preset.description}</p>
            {preset.keywords.length > 0 && (
              <div className="preset-keywords">
                {preset.keywords.map((keyword) => (
                  <span key={keyword} className="keyword-chip">{keyword}</span>
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </section>
  )
}
