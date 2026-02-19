import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PromptTemplate } from '@/types'
import { TEMPLATE_CATEGORIES, getTemplatesByCategory, type TemplateCategory } from '@/constants/templates'
import './TemplateSelector.css'

type Props = {
  selectedTemplate: PromptTemplate | null
  onTemplateSelect: (template: PromptTemplate) => void
}

export function TemplateSelector({ selectedTemplate, onTemplateSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('基本')

  const templates = getTemplatesByCategory(activeCategory)

  return (
    <section className="template-section section-card">
      <span className="section-label">Template</span>
      <label>テンプレート</label>

      <div className="template-category-tabs">
        {TEMPLATE_CATEGORIES.map((category) => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="template-options">
        {templates.map((template) => (
          <motion.button
            key={`${activeCategory}-${template.name}`}
            className={`template-button ${selectedTemplate?.name === template.name && selectedTemplate?.category === template.category ? 'selected' : ''}`}
            onClick={() => onTemplateSelect(template)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {template.name}
          </motion.button>
        ))}
      </div>
    </section>
  )
}
