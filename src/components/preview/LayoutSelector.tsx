import { motion } from 'framer-motion'
import type { WireframeCandidate } from '@/types'
import { LAYOUT_DIRECTIONS } from '@/constants/layoutDirections'
import './LayoutSelector.css'

type Props = {
  wireframes: WireframeCandidate[]
  selectedIndex: number
  onSelect: (index: number) => void
  onConfirm: () => void
  onCancel: () => void
}

export function LayoutSelector({ wireframes, selectedIndex, onSelect, onConfirm, onCancel }: Props) {
  return (
    <div className="layout-selector">
      <h2 className="layout-selector-title">レイアウトを選択</h2>
      <p className="layout-selector-subtitle">候補から1つ選んで最終画像を生成します</p>

      <div className="layout-cards">
        {wireframes.map((wf, index) => {
          const direction = LAYOUT_DIRECTIONS.find((d) => d.id === wf.directionId)
          const isSelected = index === selectedIndex
          return (
            <motion.div
              key={wf.id}
              className={`layout-card ${isSelected ? 'layout-card-selected' : ''}`}
              onClick={() => onSelect(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="layout-card-label">{wf.directionName}</div>
              <div className="layout-card-image">
                <img src={wf.imageDataUrl} alt={wf.directionName} />
              </div>
              {direction && (
                <div className="layout-card-description">{direction.description}</div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="layout-actions">
        <motion.button
          className="layout-confirm-button"
          onClick={onConfirm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          この構成で生成
        </motion.button>
        <motion.button
          className="layout-cancel-button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          キャンセル
        </motion.button>
      </div>
    </div>
  )
}
