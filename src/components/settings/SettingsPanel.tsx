import { type DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UploadedImage, PromptTemplate, AspectRatioOption, StylePreset, HistoryItem } from '@/types'
import { EDIT_SUGGESTIONS } from '@/constants/editSuggestions'
import { ApiKeySection } from './ApiKeySection'
import { ModelSelector } from './ModelSelector'
import { SystemPromptEditor } from './SystemPromptEditor'
import { ImageUploader } from './ImageUploader'
import { TemplateSelector } from './TemplateSelector'
import { PromptEditor } from './PromptEditor'
import { AspectRatioSelector } from './AspectRatioSelector'
import { StylePresetSelector } from './StylePresetSelector'

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 }

type Props = {
  // API Key
  apiKey: string
  onApiKeyChange: (v: string) => void
  saveApiKey: boolean
  onSaveApiKeyChange: (v: boolean) => void
  // Model
  selectedModel: string
  onModelChange: (id: string) => void
  // System prompt
  systemPrompt: string
  onSystemPromptChange: (v: string) => void
  // Image upload
  productImages: UploadedImage[]
  referenceImages: UploadedImage[]
  isDraggingProduct: boolean
  isDraggingReference: boolean
  productInputRef: React.RefObject<HTMLInputElement | null>
  referenceInputRef: React.RefObject<HTMLInputElement | null>
  productFolderInputRef: React.RefObject<HTMLInputElement | null>
  referenceFolderInputRef: React.RefObject<HTMLInputElement | null>
  onProductUpload: (files: FileList | null) => void
  onReferenceUpload: (files: FileList | null) => void
  onRemoveProduct: (id: string) => void
  onRemoveReference: (id: string) => void
  onClearAllProduct: () => void
  onClearAllReference: () => void
  onDragOver: (e: DragEvent, setDragging: (v: boolean) => void) => void
  onDragLeave: (e: DragEvent, setDragging: (v: boolean) => void) => void
  onDropProduct: (e: DragEvent) => void
  onDropReference: (e: DragEvent) => void
  setIsDraggingProduct: (v: boolean) => void
  setIsDraggingReference: (v: boolean) => void
  // Template
  selectedTemplate: PromptTemplate | null
  onTemplateSelect: (template: PromptTemplate) => void
  // Prompt
  prompt: string
  onPromptChange: (v: string) => void
  onManualPromptEdit: () => void
  // Aspect ratio
  selectedAspectRatio: AspectRatioOption
  customWidth: number
  customHeight: number
  onAspectRatioChange: (ratio: AspectRatioOption) => void
  onCustomWidthChange: (w: number) => void
  onCustomHeightChange: (h: number) => void
  // Style preset
  selectedStylePreset: StylePreset
  onStylePresetChange: (preset: StylePreset) => void
  // Edit mode
  isEditMode: boolean
  editPrompt: string
  onEditPromptChange: (v: string) => void
  isLoading: boolean
  onEdit: () => void
  editHistory: HistoryItem[]
  generatedImage: string | null
  onRevertToHistoryItem: (item: HistoryItem) => void
  // Error
  error: string | null
}

export function SettingsPanel(props: Props) {
  const {
    apiKey, onApiKeyChange, saveApiKey, onSaveApiKeyChange,
    selectedModel, onModelChange,
    systemPrompt, onSystemPromptChange,
    productImages, referenceImages,
    isDraggingProduct, isDraggingReference,
    productInputRef, referenceInputRef,
    productFolderInputRef, referenceFolderInputRef,
    onProductUpload, onReferenceUpload,
    onRemoveProduct, onRemoveReference,
    onClearAllProduct, onClearAllReference,
    onDragOver, onDragLeave,
    onDropProduct, onDropReference,
    setIsDraggingProduct, setIsDraggingReference,
    selectedTemplate, onTemplateSelect,
    prompt, onPromptChange, onManualPromptEdit,
    selectedAspectRatio, customWidth, customHeight,
    onAspectRatioChange, onCustomWidthChange, onCustomHeightChange,
    selectedStylePreset, onStylePresetChange,
    isEditMode, editPrompt, onEditPromptChange, isLoading, onEdit,
    editHistory, generatedImage, onRevertToHistoryItem,
    error,
  } = props

  const renderGenerateMode = () => (
    <motion.div
      key="generate-mode"
      className="mode-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={springTransition}
    >
      <ApiKeySection
        apiKey={apiKey}
        onApiKeyChange={onApiKeyChange}
        saveApiKey={saveApiKey}
        onSaveApiKeyChange={onSaveApiKeyChange}
      />
      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      <SystemPromptEditor
        systemPrompt={systemPrompt}
        onSystemPromptChange={onSystemPromptChange}
      />
      <ImageUploader
        productImages={productImages}
        referenceImages={referenceImages}
        isDraggingProduct={isDraggingProduct}
        isDraggingReference={isDraggingReference}
        productInputRef={productInputRef}
        referenceInputRef={referenceInputRef}
        productFolderInputRef={productFolderInputRef}
        referenceFolderInputRef={referenceFolderInputRef}
        onProductUpload={onProductUpload}
        onReferenceUpload={onReferenceUpload}
        onRemoveProduct={onRemoveProduct}
        onRemoveReference={onRemoveReference}
        onClearAllProduct={onClearAllProduct}
        onClearAllReference={onClearAllReference}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDropProduct={onDropProduct}
        onDropReference={onDropReference}
        setIsDraggingProduct={setIsDraggingProduct}
        setIsDraggingReference={setIsDraggingReference}
      />
      <TemplateSelector
        selectedTemplate={selectedTemplate}
        onTemplateSelect={onTemplateSelect}
      />
      <AspectRatioSelector
        selectedRatio={selectedAspectRatio}
        customWidth={customWidth}
        customHeight={customHeight}
        onRatioChange={onAspectRatioChange}
        onCustomWidthChange={onCustomWidthChange}
        onCustomHeightChange={onCustomHeightChange}
      />
      <StylePresetSelector
        selectedPreset={selectedStylePreset}
        onPresetChange={onStylePresetChange}
      />
      <PromptEditor
        prompt={prompt}
        onPromptChange={onPromptChange}
        onManualEdit={onManualPromptEdit}
      />
    </motion.div>
  )

  const renderEditMode = () => (
    <motion.div
      key="edit-mode"
      className="mode-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={springTransition}
    >
      <section className="edit-section section-card">
        <span className="section-label">Edit</span>
        <h2>画像を編集</h2>
        <p className="edit-hint">追加の指示を入力して画像を編集できます</p>

        <div className="edit-suggestions">
          {EDIT_SUGGESTIONS.map((suggestion, index) => (
            <motion.button
              key={index}
              className="suggestion-button"
              onClick={() => onEditPromptChange(suggestion)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>

        <textarea
          value={editPrompt}
          onChange={(e) => onEditPromptChange(e.target.value)}
          placeholder="例: 背景をもっと暗くして、右上にセールバッジを追加"
          className="textarea"
          rows={3}
        />
        <motion.button
          onClick={onEdit}
          disabled={isLoading || !editPrompt.trim()}
          className="edit-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? '編集中...' : '編集を適用'}
        </motion.button>
      </section>

      <section className="section-card">
        <span className="section-label">Attachments</span>
        <ImageUploader
          productImages={productImages}
          referenceImages={referenceImages}
          isDraggingProduct={isDraggingProduct}
          isDraggingReference={isDraggingReference}
          productInputRef={productInputRef}
          referenceInputRef={referenceInputRef}
          productFolderInputRef={productFolderInputRef}
          referenceFolderInputRef={referenceFolderInputRef}
          onProductUpload={onProductUpload}
          onReferenceUpload={onReferenceUpload}
          onRemoveProduct={onRemoveProduct}
          onRemoveReference={onRemoveReference}
          onClearAllProduct={onClearAllProduct}
          onClearAllReference={onClearAllReference}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDropProduct={onDropProduct}
          onDropReference={onDropReference}
          setIsDraggingProduct={setIsDraggingProduct}
          setIsDraggingReference={setIsDraggingReference}
        />
      </section>

      {editHistory.length > 1 && (
        <section className="history-section section-card">
          <h3>編集履歴</h3>
          <div className="history-list">
            {editHistory.map((item, index) => (
              <div
                key={item.id}
                className={`history-item ${item.imageData === generatedImage ? 'current' : ''}`}
                onClick={() => onRevertToHistoryItem(item)}
              >
                <img src={item.imageData} alt={`Version ${index + 1}`} />
                <div className="history-info">
                  <span className="history-version">
                    {index === 0 ? 'オリジナル' : `編集 ${index}`}
                  </span>
                  <span className="history-prompt">{item.prompt}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  )

  return (
    <div className="settings-panel">
      <AnimatePresence mode="wait">
        {isEditMode ? renderEditMode() : renderGenerateMode()}
      </AnimatePresence>

      {error && (
        <div className="error">
          <span className="error-icon">!</span>
          {error}
        </div>
      )}
    </div>
  )
}
