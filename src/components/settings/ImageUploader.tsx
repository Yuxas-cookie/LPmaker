import { type DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UploadedImage } from '@/types'
import './ImageUploader.css'

type Props = {
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
}

function ImageGrid({ images, onRemove, accentClass }: {
  images: UploadedImage[]
  onRemove: (id: string) => void
  accentClass: string
}) {
  return (
    <div className={`image-grid ${images.length > 8 ? 'image-grid-scrollable' : ''}`}>
      <AnimatePresence>
        {images.map((img) => (
          <motion.div
            key={img.id}
            className={`grid-thumb ${accentClass}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <img src={img.preview} alt="" />
            <button
              className="remove-button"
              onClick={() => onRemove(img.id)}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function ImageUploader({
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
}: Props) {
  return (
    <section className="upload-section section-card">
      {/* ===== 商品画像 ===== */}
      <div
        className={`upload-group ${isDraggingProduct ? 'dragging' : ''}`}
        onDragOver={(e) => onDragOver(e, setIsDraggingProduct)}
        onDragLeave={(e) => onDragLeave(e, setIsDraggingProduct)}
        onDrop={onDropProduct}
      >
        <div className="upload-group-header">
          <label>商品画像</label>
          {productImages.length > 0 && (
            <span className="image-count">{productImages.length}枚</span>
          )}
        </div>
        <p className="upload-hint">ファイル・フォルダをドラッグ&ドロップ、またはボタンで追加</p>

        {/* Hidden file inputs */}
        <input
          ref={productInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => { onProductUpload(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
        />
        <input
          ref={productFolderInputRef}
          type="file"
          accept="image/*"
          multiple
          // @ts-expect-error webkitdirectory is not in React types
          webkitdirectory=""
          onChange={(e) => { onProductUpload(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
        />

        <div className="upload-buttons-row">
          <motion.button
            className={`upload-button compact ${isDraggingProduct ? 'drag-active' : ''}`}
            onClick={() => productInputRef.current?.click()}
            whileHover={!isDraggingProduct ? { scale: 1.02 } : undefined}
            whileTap={!isDraggingProduct ? { scale: 0.98 } : undefined}
            animate={isDraggingProduct ? { scale: 1.04 } : { scale: 1 }}
          >
            <span className="upload-icon">+</span>
            <span>{isDraggingProduct ? 'ここにドロップ' : 'ファイル追加'}</span>
          </motion.button>
          <motion.button
            className="upload-button compact folder-button"
            onClick={() => productFolderInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="folder-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4.5C2 3.67 2.67 3 3.5 3H6l1.5 1.5H12.5C13.33 4.5 14 5.17 14 6V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            <span>フォルダ追加</span>
          </motion.button>
        </div>

        {productImages.length > 0 && (
          <>
            <ImageGrid images={productImages} onRemove={onRemoveProduct} accentClass="thumb-gold" />
            <button className="clear-all-button" onClick={onClearAllProduct}>
              すべて削除
            </button>
          </>
        )}
      </div>

      {/* ===== 参考資料 ===== */}
      <div
        className={`upload-group ${isDraggingReference ? 'dragging' : ''}`}
        onDragOver={(e) => onDragOver(e, setIsDraggingReference)}
        onDragLeave={(e) => onDragLeave(e, setIsDraggingReference)}
        onDrop={onDropReference}
      >
        <div className="upload-group-header">
          <label>参考資料（任意）</label>
          {referenceImages.length > 0 && (
            <span className="image-count cyan">{referenceImages.length}枚</span>
          )}
        </div>
        <p className="upload-hint">参考にしたいデザインやレイアウトの画像</p>

        <input
          ref={referenceInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => { onReferenceUpload(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
        />
        <input
          ref={referenceFolderInputRef}
          type="file"
          accept="image/*"
          multiple
          // @ts-expect-error webkitdirectory is not in React types
          webkitdirectory=""
          onChange={(e) => { onReferenceUpload(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
        />

        <div className="upload-buttons-row">
          <motion.button
            className={`upload-button compact secondary ${isDraggingReference ? 'drag-active-cyan' : ''}`}
            onClick={() => referenceInputRef.current?.click()}
            whileHover={!isDraggingReference ? { scale: 1.02 } : undefined}
            whileTap={!isDraggingReference ? { scale: 0.98 } : undefined}
            animate={isDraggingReference ? { scale: 1.04 } : { scale: 1 }}
          >
            <span className="upload-icon">+</span>
            <span>{isDraggingReference ? 'ここにドロップ' : 'ファイル追加'}</span>
          </motion.button>
          <motion.button
            className="upload-button compact secondary folder-button"
            onClick={() => referenceFolderInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="folder-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4.5C2 3.67 2.67 3 3.5 3H6l1.5 1.5H12.5C13.33 4.5 14 5.17 14 6V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            <span>フォルダ追加</span>
          </motion.button>
        </div>

        {referenceImages.length > 0 && (
          <>
            <ImageGrid images={referenceImages} onRemove={onRemoveReference} accentClass="thumb-cyan" />
            <button className="clear-all-button cyan" onClick={onClearAllReference}>
              すべて削除
            </button>
          </>
        )}
      </div>
    </section>
  )
}
