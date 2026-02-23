import { useState, useCallback } from 'react'
import type { PromptTemplate, AspectRatioOption, StylePreset, UploadedImage } from '@/types'
import { MODELS } from '@/constants/models'
import { DEFAULT_ASPECT_RATIO } from '@/constants/aspectRatios'
import { DEFAULT_STYLE_PRESET, STYLE_PRESETS } from '@/constants/stylePresets'
import { ASPECT_RATIOS } from '@/constants/aspectRatios'
import { useApiKey } from '@/hooks/useApiKey'
import { useSystemPrompt } from '@/hooks/useSystemPrompt'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useEditHistory } from '@/hooks/useEditHistory'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { useQualityReport } from '@/hooks/useQualityReport'
import { useBrainstorm } from '@/hooks/useBrainstorm'
import { useLayoutGeneration } from '@/hooks/useLayoutGeneration'
import { usePanelEditor } from '@/hooks/usePanelEditor'
import { dataUrlToBase64 } from '@/services/imageUtils'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { ReportDrawer } from '@/components/report/ReportDrawer'
import { LoadingOverlay } from '@/components/common/LoadingOverlay'
import { SuccessFlash } from '@/components/common/SuccessFlash'
import './App.css'

function App() {
  const { apiKey, setApiKey, saveApiKey, setSaveApiKey } = useApiKey()
  const { systemPrompt, setSystemPrompt } = useSystemPrompt()
  const imageUpload = useImageUpload()
  const { editHistory, addToHistory, selectItem, clearHistory } = useEditHistory()

  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption>(DEFAULT_ASPECT_RATIO)
  const [customWidth, setCustomWidth] = useState(1920)
  const [customHeight, setCustomHeight] = useState(1080)
  const [selectedStylePreset, setSelectedStylePreset] = useState<StylePreset>(DEFAULT_STYLE_PRESET)

  const handleGenerated = useCallback((imageDataUrl: string, usedPrompt: string, replace: boolean) => {
    addToHistory(usedPrompt, imageDataUrl, replace)
  }, [addToHistory])

  const generation = useImageGeneration({
    apiKey,
    selectedModel,
    prompt,
    systemPrompt,
    productImages: imageUpload.productImages,
    referenceImages: imageUpload.referenceImages,
    aspectRatio: selectedAspectRatio,
    customWidth,
    customHeight,
    stylePreset: selectedStylePreset,
    onGenerated: handleGenerated,
  })

  const layoutGeneration = useLayoutGeneration({
    apiKey,
    selectedModel,
    prompt,
    productImages: imageUpload.productImages,
    aspectRatio: selectedAspectRatio,
    customWidth,
    customHeight,
  })

  const qualityReport = useQualityReport({
    apiKey,
    selectedModel,
    generatedImage: generation.generatedImage,
    autoAnalyze: false,
  })

  const panelEditor = usePanelEditor()

  const brainstorm = useBrainstorm({
    apiKey,
    selectedModel,
  })

  const handleApplyBrainstormPrompt = useCallback((promptText: string) => {
    setPrompt(promptText)
    setSelectedTemplate(null)
  }, [])

  const handleApplyToEdit = useCallback((suggestion: string) => {
    generation.setEditPrompt(suggestion)
  }, [generation])

  const handleGenerateOrLayout = useCallback(() => {
    if (!layoutGeneration.autoMode && layoutGeneration.phase === 'idle') {
      layoutGeneration.generateLayouts()
    } else {
      generation.generateImage()
    }
  }, [layoutGeneration, generation])

  const handleConfirmLayout = useCallback(() => {
    const wireframeUrl = layoutGeneration.getSelectedWireframeDataUrl()
    if (!wireframeUrl) return

    const { base64, mimeType } = dataUrlToBase64(wireframeUrl)
    const wireframeAsRef: UploadedImage = {
      id: `wireframe-ref-${Date.now()}`,
      file: new File([], 'wireframe.png'),
      preview: wireframeUrl,
      base64,
      mimeType,
    }

    generation.generateImage({
      extraReferenceImages: [wireframeAsRef],
      additionalPromptSuffix: '【参考画像として添付されたワイヤーフレーム（レイアウト構成図）に従って、要素の配置・構成を再現した最終LP画像を生成してください】',
    })
    layoutGeneration.resetLayouts()
  }, [layoutGeneration, generation])

  const handleStartFromScratch = useCallback(() => {
    panelEditor.initEmpty()
    layoutGeneration.startFromScratch()
  }, [panelEditor, layoutGeneration])

  const handleStartAIDraft = useCallback(async () => {
    const result = await layoutGeneration.generateAIDraft()
    panelEditor.initFromAIDraft(result.panels, result.wireframeImageUrl)
  }, [layoutGeneration, panelEditor])

  const handlePanelEditorConfirm = useCallback(() => {
    const aspectW = selectedAspectRatio.width
    const aspectH = selectedAspectRatio.height
    const canvasDataUrl = panelEditor.exportToCanvas(aspectW, aspectH)
    const promptText = panelEditor.exportToPromptText()

    const { base64, mimeType } = dataUrlToBase64(canvasDataUrl)
    const wireframeAsRef: UploadedImage = {
      id: `panel-editor-ref-${Date.now()}`,
      file: new File([], 'panel-layout.png'),
      preview: canvasDataUrl,
      base64,
      mimeType,
    }

    generation.generateImage({
      extraReferenceImages: [wireframeAsRef],
      additionalPromptSuffix: promptText + '\n【参考画像として添付されたコマ割り構成図に従って、要素の配置・構成を再現した最終LP画像を生成してください】',
    })
    panelEditor.reset()
    layoutGeneration.resetLayouts()
  }, [panelEditor, generation, layoutGeneration, selectedAspectRatio])

  const handlePanelEditorCancel = useCallback(() => {
    panelEditor.reset()
    layoutGeneration.resetLayouts()
  }, [panelEditor, layoutGeneration])

  const handleTemplateSelect = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template)
    if (template.prompt) {
      setPrompt(template.prompt)
    }
    // Auto-set recommended style and aspect ratio for industry templates
    if (template.recommendedStyle) {
      const style = STYLE_PRESETS.find(s => s.id === template.recommendedStyle)
      if (style) setSelectedStylePreset(style)
    }
    if (template.recommendedAspectRatio) {
      const ratio = ASPECT_RATIOS.find(r => r.id === template.recommendedAspectRatio)
      if (ratio) setSelectedAspectRatio(ratio)
    }
  }, [])

  const handleManualPromptEdit = useCallback(() => {
    setSelectedTemplate(null)
  }, [])

  const handleSelectHistoryItem = useCallback((item: typeof editHistory[0]) => {
    const imageData = selectItem(item)
    generation.setGeneratedImageFromHistory(imageData)
  }, [selectItem, generation])

  const handleReset = useCallback(() => {
    generation.resetToNew()
    clearHistory()
    layoutGeneration.resetLayouts()
    panelEditor.reset()
    qualityReport.closeDrawer()
    // プロンプト・テンプレート・アスペクト比・スタイル・アップロード画像はすべて保持
  }, [generation, clearHistory, layoutGeneration, panelEditor, qualityReport])

  const handleDropProduct = useCallback((e: React.DragEvent) => {
    imageUpload.handleDrop(e, imageUpload.setProductImages, imageUpload.setIsDraggingProduct)
  }, [imageUpload])

  const handleDropReference = useCallback((e: React.DragEvent) => {
    imageUpload.handleDrop(e, imageUpload.setReferenceImages, imageUpload.setIsDraggingReference)
  }, [imageUpload])

  return (
    <div className="app">
      <AppHeader />

      <div className="app-body">
        <SettingsPanel
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          saveApiKey={saveApiKey}
          onSaveApiKeyChange={setSaveApiKey}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          productImages={imageUpload.productImages}
          referenceImages={imageUpload.referenceImages}
          isDraggingProduct={imageUpload.isDraggingProduct}
          isDraggingReference={imageUpload.isDraggingReference}
          productInputRef={imageUpload.productInputRef}
          referenceInputRef={imageUpload.referenceInputRef}
          productFolderInputRef={imageUpload.productFolderInputRef}
          referenceFolderInputRef={imageUpload.referenceFolderInputRef}
          onProductUpload={(files) => imageUpload.handleImageUpload(files, imageUpload.setProductImages)}
          onReferenceUpload={(files) => imageUpload.handleImageUpload(files, imageUpload.setReferenceImages)}
          onRemoveProduct={(id) => imageUpload.removeImage(id, imageUpload.productImages, imageUpload.setProductImages)}
          onRemoveReference={(id) => imageUpload.removeImage(id, imageUpload.referenceImages, imageUpload.setReferenceImages)}
          onClearAllProduct={() => imageUpload.clearAllImages(imageUpload.productImages, imageUpload.setProductImages)}
          onClearAllReference={() => imageUpload.clearAllImages(imageUpload.referenceImages, imageUpload.setReferenceImages)}
          onDragOver={imageUpload.handleDragOver}
          onDragLeave={imageUpload.handleDragLeave}
          onDropProduct={handleDropProduct}
          onDropReference={handleDropReference}
          setIsDraggingProduct={imageUpload.setIsDraggingProduct}
          setIsDraggingReference={imageUpload.setIsDraggingReference}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          brainstormMessages={brainstorm.messages}
          isBrainstormLoading={brainstorm.isLoading}
          brainstormChatInput={brainstorm.chatInput}
          brainstormError={brainstorm.error}
          onBrainstormChatInputChange={brainstorm.setChatInput}
          onBrainstormSend={brainstorm.sendMessage}
          onBrainstormClear={brainstorm.clearChat}
          onApplyBrainstormPrompt={handleApplyBrainstormPrompt}
          prompt={prompt}
          onPromptChange={setPrompt}
          onManualPromptEdit={handleManualPromptEdit}
          selectedAspectRatio={selectedAspectRatio}
          customWidth={customWidth}
          customHeight={customHeight}
          onAspectRatioChange={setSelectedAspectRatio}
          onCustomWidthChange={setCustomWidth}
          onCustomHeightChange={setCustomHeight}
          selectedStylePreset={selectedStylePreset}
          onStylePresetChange={setSelectedStylePreset}
          isEditMode={generation.isEditMode}
          editPrompt={generation.editPrompt}
          onEditPromptChange={generation.setEditPrompt}
          isLoading={generation.isLoading}
          onEdit={generation.editImage}
          editHistory={editHistory}
          generatedImage={generation.generatedImage}
          onRevertToHistoryItem={handleSelectHistoryItem}
          error={generation.error}
        />

        <PreviewPanel
          isEditMode={generation.isEditMode}
          generatedImage={generation.generatedImage}
          isLoading={generation.isLoading}
          imageRevealed={generation.imageRevealed}
          editHistory={editHistory}
          onGenerate={handleGenerateOrLayout}
          onReset={handleReset}
          onSelectHistoryItem={handleSelectHistoryItem}
          onAnalyze={qualityReport.analyze}
          layoutPhase={layoutGeneration.phase}
          layoutWireframes={layoutGeneration.wireframes}
          layoutSelectedIndex={layoutGeneration.selectedIndex}
          onLayoutSelect={layoutGeneration.setSelectedIndex}
          onLayoutConfirm={handleConfirmLayout}
          onLayoutCancel={layoutGeneration.resetLayouts}
          autoMode={layoutGeneration.autoMode}
          onAutoModeChange={layoutGeneration.setAutoMode}
          isGeneratingLayouts={layoutGeneration.isGeneratingLayouts}
          panelEditorProps={{
            panels: panelEditor.panels,
            selectedPanelId: panelEditor.selectedPanelId,
            globalBorderWidth: panelEditor.globalBorderWidth,
            snapToGrid: panelEditor.snapToGrid,
            showGrid: panelEditor.showGrid,
            backgroundImage: panelEditor.backgroundImage,
            aspectRatio: (selectedAspectRatio.id === 'custom' ? customWidth / customHeight : selectedAspectRatio.width / selectedAspectRatio.height),
            onAddPanel: panelEditor.addPanel,
            onRemovePanel: panelEditor.removePanel,
            onUpdatePanel: panelEditor.updatePanel,
            onSelectPanel: panelEditor.selectPanel,
            onSetGlobalBorderWidth: panelEditor.setGlobalBorderWidth,
            onToggleSnap: () => panelEditor.setSnapToGrid(!panelEditor.snapToGrid),
            onToggleGrid: () => panelEditor.setShowGrid(!panelEditor.showGrid),
            onConfirm: handlePanelEditorConfirm,
            onCancel: handlePanelEditorCancel,
            snapFn: panelEditor.snap,
          }}
          onStartFromScratch={handleStartFromScratch}
          onStartAIDraft={handleStartAIDraft}
        />

        <ReportDrawer
          isOpen={qualityReport.isDrawerOpen}
          report={qualityReport.report}
          chatMessages={qualityReport.chatMessages}
          isAnalyzing={qualityReport.isAnalyzing}
          isChatLoading={qualityReport.isChatLoading}
          chatInput={qualityReport.chatInput}
          autoAnalyzeEnabled={qualityReport.autoAnalyzeEnabled}
          error={qualityReport.error}
          onClose={qualityReport.closeDrawer}
          onAnalyze={qualityReport.analyze}
          onChatInputChange={qualityReport.setChatInput}
          onChatSend={qualityReport.sendChat}
          onAutoAnalyzeChange={qualityReport.setAutoAnalyzeEnabled}
          onApplySuggestion={handleApplyToEdit}
        />
      </div>

      <LoadingOverlay
        isLoading={generation.isLoading}
        loadingStage={generation.loadingStage}
      />

      <SuccessFlash show={generation.showSuccessFlash} />

      <AppFooter />
    </div>
  )
}

export default App
