import { motion } from 'framer-motion'
import type { AspectRatioOption } from '@/types'
import { ASPECT_RATIOS } from '@/constants/aspectRatios'
import './AspectRatioSelector.css'

type Props = {
  selectedRatio: AspectRatioOption
  customWidth: number
  customHeight: number
  onRatioChange: (ratio: AspectRatioOption) => void
  onCustomWidthChange: (w: number) => void
  onCustomHeightChange: (h: number) => void
}

export function AspectRatioSelector({
  selectedRatio, customWidth, customHeight,
  onRatioChange, onCustomWidthChange, onCustomHeightChange,
}: Props) {
  return (
    <section className="aspect-ratio-section section-card">
      <span className="section-label">Aspect Ratio</span>
      <label>アスペクト比</label>

      <div className="aspect-ratio-options">
        {ASPECT_RATIOS.map((ratio) => (
          <motion.button
            key={ratio.id}
            className={`aspect-ratio-button ${selectedRatio.id === ratio.id ? 'selected' : ''}`}
            onClick={() => onRatioChange(ratio)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="ratio-preview-box" style={{
              aspectRatio: ratio.id === 'custom'
                ? `${customWidth} / ${customHeight}`
                : `${ratio.width} / ${ratio.height}`
            }} />
            <span className="ratio-label">{ratio.label}</span>
            <span className="ratio-desc">{ratio.description}</span>
          </motion.button>
        ))}
      </div>

      {selectedRatio.id === 'custom' && (
        <div className="custom-size-inputs">
          <div className="size-input-group">
            <label htmlFor="custom-width">幅</label>
            <input
              id="custom-width"
              type="number"
              min={100}
              max={4096}
              value={customWidth}
              onChange={(e) => onCustomWidthChange(Number(e.target.value))}
              className="input size-input"
            />
          </div>
          <span className="size-separator">×</span>
          <div className="size-input-group">
            <label htmlFor="custom-height">高さ</label>
            <input
              id="custom-height"
              type="number"
              min={100}
              max={4096}
              value={customHeight}
              onChange={(e) => onCustomHeightChange(Number(e.target.value))}
              className="input size-input"
            />
          </div>
        </div>
      )}
    </section>
  )
}
