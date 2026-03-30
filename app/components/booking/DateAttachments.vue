<template>
  <v-card
    rounded="lg"
    variant="outlined"
    class="glass-surface"
    elevation="6"
  >
    <v-card-title class="pb-0">
      Fichiers joints
    </v-card-title>
    <v-card-text>
      <div
        v-if="loading"
        class="d-flex justify-center py-4"
      >
        <v-progress-circular
          indeterminate
          size="24"
          color="primary"
        />
      </div>

      <template v-else>
        <div
          v-if="!attachments.length"
          class="text-body-2 text-medium-emphasis py-2"
        >
          Aucun fichier joint.
        </div>

        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          class="d-flex align-center py-2"
        >
          <v-icon
            size="20"
            class="mr-2"
            :color="mimeIconColor(attachment.mime_type)"
          >
            {{ mimeIcon(attachment.mime_type) }}
          </v-icon>
          <div class="flex-grow-1 text-truncate">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ attachment.file_name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ formatFileSize(attachment.file_size) }} — {{ dayjs(attachment.created_at).format('DD/MM/YYYY HH:mm') }}
            </div>
          </div>
          <v-btn
            icon
            size="x-small"
            color="primary"
            variant="text"
            :loading="downloadingId === attachment.id"
            @click="downloadFile(attachment)"
          >
            <v-icon>{{ mdiDownload }}</v-icon>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            color="error"
            variant="text"
            @click="deleteFile(attachment)"
          >
            <v-icon>{{ mdiDelete }}</v-icon>
          </v-btn>
        </div>
      </template>

      <v-divider class="my-3" />

      <v-file-input
        v-model="selectedFile"
        label="Ajouter un fichier"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
        density="comfortable"
        :rules="[fileSizeRule]"
        prepend-icon=""
        :prepend-inner-icon="mdiPaperclip"
        hide-details="auto"
      />
      <v-btn
        color="primary"
        size="small"
        class="mt-2"
        :loading="uploading"
        :disabled="!selectedFile || uploading"
        @click="uploadFile"
      >
        Envoyer
      </v-btn>

      <v-alert
        v-if="uploadError"
        type="error"
        variant="tonal"
        class="mt-2"
        density="compact"
      >
        {{ uploadError }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { mdiDelete, mdiDownload, mdiPaperclip, mdiFilePdfBox, mdiFileImage, mdiFileWord, mdiFileExcel, mdiFile } from '@mdi/js'
import dayjs from 'dayjs'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const props = defineProps({
  slug: { type: String, required: true },
  dateId: { type: String, required: true },
})

const attachments = ref([])
const loading = ref(true)
const selectedFile = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const downloadingId = ref(null)

const fileSizeRule = v => !v || v.size <= 10 * 1024 * 1024 || 'Taille maximale : 10 Mo'

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function mimeIcon(mime) {
  if (mime === 'application/pdf') return mdiFilePdfBox
  if (mime.startsWith('image/')) return mdiFileImage
  if (mime.includes('word') || mime.includes('document')) return mdiFileWord
  if (mime.includes('excel') || mime.includes('spreadsheet')) return mdiFileExcel
  return mdiFile
}

function mimeIconColor(mime) {
  if (mime === 'application/pdf') return 'red'
  if (mime.startsWith('image/')) return 'blue'
  if (mime.includes('word') || mime.includes('document')) return 'indigo'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'green'
  return 'grey'
}

async function fetchAttachments() {
  try {
    attachments.value = await bookingApi.getAttachments(props.slug, props.dateId)
  }
  catch (err) {
    console.error('Error fetching attachments:', err)
  }
  finally {
    loading.value = false
  }
}

async function uploadFile() {
  if (!selectedFile.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    const file = selectedFile.value
    const { uploadUrl, token } = await bookingApi.getUploadUrl(props.slug, props.dateId, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        Authorization: `Bearer ${token}`,
      },
      body: file,
    })
    if (!res.ok) {
      throw new Error('Erreur lors de l\'envoi du fichier')
    }
    selectedFile.value = null
    await fetchAttachments()
  }
  catch (err) {
    uploadError.value = getApiErrorMessage(err, 'Erreur lors de l\'envoi du fichier.')
  }
  finally {
    uploading.value = false
  }
}

async function downloadFile(attachment) {
  downloadingId.value = attachment.id
  try {
    const { url } = await bookingApi.getAttachmentDownloadUrl(props.slug, props.dateId, attachment.id)
    window.open(url, '_blank')
  }
  catch (err) {
    console.error('Error downloading file:', err)
  }
  finally {
    downloadingId.value = null
  }
}

async function deleteFile(attachment) {
  if (!confirm(`Supprimer le fichier "${attachment.file_name}" ?`)) return
  try {
    await bookingApi.deleteAttachment(props.slug, props.dateId, attachment.id)
    await fetchAttachments()
  }
  catch (err) {
    console.error('Error deleting file:', err)
  }
}

onMounted(fetchAttachments)
</script>
