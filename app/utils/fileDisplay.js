import { mdiFile, mdiFilePdfBox, mdiFileImage, mdiFileWord, mdiFileExcel } from '@mdi/js'

// Shared helpers for displaying uploaded files (attachments, invoices).
// Extracted from DateAttachments.vue and DateInvoices.vue to keep them in sync.

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB — server-side cap
export const MAX_FILE_SIZE_MB = 10

export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || bytes === '') return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function mimeIcon(mime, fallback = mdiFile) {
  if (!mime) return fallback
  if (mime === 'application/pdf') return mdiFilePdfBox
  if (mime.startsWith('image/')) return mdiFileImage
  if (mime.includes('word') || mime.includes('document')) return mdiFileWord
  if (mime.includes('excel') || mime.includes('spreadsheet')) return mdiFileExcel
  return fallback
}

export function mimeIconColor(mime, fallback = 'grey') {
  if (!mime) return fallback
  if (mime === 'application/pdf') return 'red'
  if (mime.startsWith('image/')) return 'blue'
  if (mime.includes('word') || mime.includes('document')) return 'indigo'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'green'
  return fallback
}

// Vuetify v-file-input rule matching the server-side MAX_FILE_SIZE_BYTES cap.
export const maxFileSizeRule = v =>
  !v || v.size <= MAX_FILE_SIZE_BYTES || `Taille maximale : ${MAX_FILE_SIZE_MB} Mo`
