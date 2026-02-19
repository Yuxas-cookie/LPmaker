import type { UploadedImage } from '@/types'

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve({ base64, mimeType: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function dataUrlToBase64(dataUrl: string): { base64: string; mimeType: string } {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid data URL')
  }
  return { mimeType: matches[1], base64: matches[2] }
}

export function downloadImage(dataUrl: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `lp-image-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function processFileUpload(files: FileList | null): Promise<UploadedImage[]> {
  if (!files) return []

  const newImages: UploadedImage[] = []
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue

    const { base64, mimeType } = await fileToBase64(file)
    const preview = URL.createObjectURL(file)

    newImages.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview,
      base64,
      mimeType
    })
  }

  return newImages
}

export function revokeImagePreview(images: UploadedImage[], id: string) {
  const image = images.find(img => img.id === id)
  if (image) {
    URL.revokeObjectURL(image.preview)
  }
}

export function revokeAllPreviews(images: UploadedImage[]) {
  for (const img of images) {
    URL.revokeObjectURL(img.preview)
  }
}

/** Recursively collect all image Files from a DataTransferItemList (supports folder D&D) */
export async function collectFilesFromDataTransfer(items: DataTransferItemList): Promise<File[]> {
  const files: File[] = []

  const readEntry = (entry: FileSystemEntry): Promise<void> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        (entry as FileSystemFileEntry).file((file) => {
          if (file.type.startsWith('image/')) {
            files.push(file)
          }
          resolve()
        }, () => resolve())
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader()
        const readBatch = () => {
          reader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve()
              return
            }
            for (const e of entries) {
              await readEntry(e)
            }
            readBatch() // continue reading (readEntries returns max 100 at a time)
          }, () => resolve())
        }
        readBatch()
      } else {
        resolve()
      }
    })
  }

  const entries: FileSystemEntry[] = []
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry?.()
    if (entry) entries.push(entry)
  }

  for (const entry of entries) {
    await readEntry(entry)
  }

  return files
}

/** Convert an array of File objects to UploadedImage[] */
export async function processFiles(files: File[]): Promise<UploadedImage[]> {
  const images: UploadedImage[] = []
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const { base64, mimeType } = await fileToBase64(file)
    const preview = URL.createObjectURL(file)
    images.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview,
      base64,
      mimeType,
    })
  }
  return images
}
