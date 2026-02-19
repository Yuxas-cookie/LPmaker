import { useState, useRef, useCallback, type DragEvent } from 'react'
import type { UploadedImage } from '@/types'
import { processFileUpload, revokeImagePreview, revokeAllPreviews, collectFilesFromDataTransfer, processFiles } from '@/services/imageUtils'

export function useImageUpload() {
  const [productImages, setProductImages] = useState<UploadedImage[]>([])
  const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([])
  const [isDraggingProduct, setIsDraggingProduct] = useState(false)
  const [isDraggingReference, setIsDraggingReference] = useState(false)

  const productInputRef = useRef<HTMLInputElement>(null)
  const referenceInputRef = useRef<HTMLInputElement>(null)
  const productFolderInputRef = useRef<HTMLInputElement>(null)
  const referenceFolderInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback(async (
    files: FileList | null,
    setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>
  ) => {
    const newImages = await processFileUpload(files)
    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages])
    }
  }, [])

  const removeImage = useCallback((
    id: string,
    images: UploadedImage[],
    setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>
  ) => {
    revokeImagePreview(images, id)
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  const clearAllImages = useCallback((
    images: UploadedImage[],
    setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>
  ) => {
    revokeAllPreviews(images)
    setImages([])
  }, [])

  const handleDragOver = useCallback((e: DragEvent, setDragging: (v: boolean) => void) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent, setDragging: (v: boolean) => void) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }, [])

  /** D&D handler — supports both files and folders */
  const handleDrop = useCallback(async (
    e: DragEvent,
    setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
    setDragging: (v: boolean) => void
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)

    // Try folder-aware extraction first (webkitGetAsEntry)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const files = await collectFilesFromDataTransfer(e.dataTransfer.items)
      if (files.length > 0) {
        const newImages = await processFiles(files)
        if (newImages.length > 0) {
          setImages(prev => [...prev, ...newImages])
        }
        return
      }
    }

    // Fallback to plain FileList
    const newImages = await processFileUpload(e.dataTransfer.files)
    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages])
    }
  }, [])

  return {
    productImages, setProductImages,
    referenceImages, setReferenceImages,
    isDraggingProduct, setIsDraggingProduct,
    isDraggingReference, setIsDraggingReference,
    productInputRef, referenceInputRef,
    productFolderInputRef, referenceFolderInputRef,
    handleImageUpload, removeImage, clearAllImages,
    handleDragOver, handleDragLeave, handleDrop,
  }
}
