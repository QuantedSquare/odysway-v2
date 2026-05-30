<template>
  <v-card
    rounded="lg"
    elevation="0"
    class="bo-card"
  >
    <v-card-title class="pb-0 d-flex align-center ga-2">
      <v-icon
        size="18"
        color="secondary"
      >
        {{ mdiReceiptText }}
      </v-icon>
      Factures fournisseurs
      <v-spacer />
      <span
        class="text-body-2 font-weight-bold"
      >
        {{ formatEur(totalAmount) }}
      </span>
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
          v-if="!invoices.length"
          class="text-body-2 text-medium-emphasis py-2"
        >
          Aucune facture enregistrée.
        </div>

        <div
          v-for="(invoice, idx) in invoices"
          :key="invoice.id"
          class="d-flex align-center py-2 px-2 rounded"
          :class="idx % 2 === 0 ? 'bg-surface-variant' : ''"
        >
          <v-icon
            size="20"
            class="mr-2"
            :color="mimeIconColor(invoice.mime_type)"
          >
            {{ mimeIcon(invoice.mime_type) }}
          </v-icon>
          <div class="flex-grow-1 text-truncate">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ invoice.file_name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              <span v-if="invoice.label">{{ invoice.label }} — </span>
              {{ formatFileSize(invoice.file_size) }} · {{ dayjs(invoice.created_at).format('DD/MM/YYYY') }}
            </div>
          </div>
          <v-text-field
            :model-value="invoice.amount"
            type="number"
            density="compact"
            hide-details
            variant="outlined"
            suffix="€"
            class="mr-2"
            style="max-width: 120px;"
            @blur="onAmountBlur(invoice, $event)"
          />
          <v-btn
            icon
            size="x-small"
            color="primary"
            variant="text"
            :loading="downloadingId === invoice.id"
            @click="downloadFile(invoice)"
          >
            <v-icon>{{ mdiDownload }}</v-icon>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            color="error"
            variant="text"
            @click="deleteFile(invoice)"
          >
            <v-icon>{{ mdiDelete }}</v-icon>
          </v-btn>
        </div>
      </template>

      <v-divider class="my-3" />

      <v-file-input
        v-model="selectedFile"
        label="Ajouter une facture"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
        density="compact"
        :rules="[fileSizeRule]"
        prepend-icon=""
        :prepend-inner-icon="mdiPaperclip"
        hide-details="auto"
        class="mb-2"
      />
      <v-text-field
        v-model.number="uploadAmount"
        label="Montant (€)"
        type="number"
        density="compact"
        variant="outlined"
        hide-details="auto"
        class="mb-2"
      />
      <v-text-field
        v-model="uploadLabel"
        label="Description (optionnel)"
        density="compact"
        variant="outlined"
        hide-details="auto"
        placeholder="Ex: Hôtel J1-J3"
        class="mb-2"
      />
      <v-btn
        color="primary"
        size="small"
        variant="tonal"
        :loading="uploading"
        :disabled="!selectedFile || uploadAmount === null || uploadAmount === '' || uploading"
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
import { ref, computed, onMounted } from 'vue'
import { mdiDelete, mdiDownload, mdiPaperclip, mdiReceiptText, mdiFilePdfBox, mdiFileImage, mdiFileWord, mdiFileExcel, mdiFile } from '@mdi/js'
import dayjs from 'dayjs'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const props = defineProps({
  slug: { type: String, required: true },
  dateId: { type: String, required: true },
})

const invoices = ref([])
const loading = ref(true)
const selectedFile = ref(null)
const uploadAmount = ref(null)
const uploadLabel = ref('')
const uploading = ref(false)
const uploadError = ref('')
const downloadingId = ref(null)

const fileSizeRule = v => !v || v.size <= 10 * 1024 * 1024 || 'Taille maximale : 10 Mo'

const totalAmount = computed(() =>
  invoices.value.reduce((acc, inv) => acc + Number(inv.amount || 0), 0),
)

function formatEur(amount) {
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(amount)) return '0 €'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

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

async function fetchInvoices() {
  try {
    invoices.value = await bookingApi.getInvoices(props.slug, props.dateId)
  }
  catch (err) {
    console.error('Error fetching invoices:', err)
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
    const { uploadUrl, token } = await bookingApi.getInvoiceUploadUrl(props.slug, props.dateId, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      amount: Number(uploadAmount.value),
      label: uploadLabel.value || null,
    })
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Authorization': `Bearer ${token}`,
      },
      body: file,
    })
    if (!res.ok) {
      throw new Error('Erreur lors de l\'envoi de la facture')
    }
    selectedFile.value = null
    uploadAmount.value = null
    uploadLabel.value = ''
    await fetchInvoices()
  }
  catch (err) {
    uploadError.value = getApiErrorMessage(err, 'Erreur lors de l\'envoi.')
  }
  finally {
    uploading.value = false
  }
}

async function onAmountBlur(invoice, event) {
  const newValue = Number(event.target.value)
  if (Number.isNaN(newValue) || newValue === Number(invoice.amount)) return
  try {
    await bookingApi.updateInvoice(props.slug, props.dateId, invoice.id, { amount: newValue })
    invoice.amount = newValue
  }
  catch (err) {
    alert(getApiErrorMessage(err, 'Erreur lors de la mise à jour du montant.'))
    await fetchInvoices()
  }
}

async function downloadFile(invoice) {
  downloadingId.value = invoice.id
  try {
    const { url } = await bookingApi.getInvoiceDownloadUrl(props.slug, props.dateId, invoice.id)
    window.open(url, '_blank')
  }
  catch (err) {
    console.error('Error downloading file:', err)
  }
  finally {
    downloadingId.value = null
  }
}

async function deleteFile(invoice) {
  if (!confirm(`Supprimer la facture "${invoice.file_name}" ?`)) return
  try {
    await bookingApi.deleteInvoice(props.slug, props.dateId, invoice.id)
    await fetchInvoices()
  }
  catch (err) {
    console.error('Error deleting invoice:', err)
  }
}

onMounted(fetchInvoices)
</script>
