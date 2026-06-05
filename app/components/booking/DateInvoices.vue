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
      <span class="text-body-2 font-weight-bold">
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
            :color="iconColorFor(invoice)"
          >
            {{ iconFor(invoice) }}
          </v-icon>
          <div class="flex-grow-1 text-truncate">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ invoice.file_name || invoice.label || 'Sans titre' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              <span v-if="invoice.file_name && invoice.label">{{ invoice.label }} — </span>
              <span v-if="invoice.file_size">{{ formatFileSize(invoice.file_size) }} · </span>
              <span v-else-if="!invoice.file_name">Sans pièce jointe · </span>
              {{ dayjs(invoice.created_at).format('DD/MM/YYYY') }}
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
            v-if="invoice.file_name"
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
            @click="deleteInvoice(invoice)"
          >
            <v-icon>{{ mdiDelete }}</v-icon>
          </v-btn>
        </div>
      </template>

      <v-divider class="my-3" />

      <!-- Tabs: with file vs without file -->
      <v-tabs
        v-model="addTab"
        density="compact"
        color="primary"
        class="mb-2"
      >
        <v-tab value="with-file">
          <v-icon
            start
            size="16"
          >
            {{ mdiPaperclip }}
          </v-icon>
          Avec facture
        </v-tab>
        <v-tab value="without-file">
          <v-icon
            start
            size="16"
          >
            {{ mdiReceiptTextOutline }}
          </v-icon>
          Sans facture (exception)
        </v-tab>
      </v-tabs>

      <v-window v-model="addTab">
        <!-- WITH FILE -->
        <v-window-item value="with-file">
          <v-file-input
            v-model="selectedFile"
            label="Fichier facture"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
            density="compact"
            :rules="[maxFileSizeRule]"
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
            :disabled="!canUploadFile || uploading"
            @click="uploadFile"
          >
            Envoyer
          </v-btn>
        </v-window-item>

        <!-- WITHOUT FILE -->
        <v-window-item value="without-file">
          <p class="text-caption text-medium-emphasis mb-2">
            Cas exceptionnel (pourboire cash, dépense sans facture papier, etc.). Une description identifiante est requise.
          </p>
          <v-text-field
            v-model.number="noFileAmount"
            label="Montant (€)"
            type="number"
            density="compact"
            variant="outlined"
            hide-details="auto"
            class="mb-2"
          />
          <v-text-field
            v-model="noFileLabel"
            label="Description"
            density="compact"
            variant="outlined"
            hide-details="auto"
            placeholder="Ex: Pourboire guide local"
            class="mb-2"
          />
          <v-btn
            color="primary"
            size="small"
            variant="tonal"
            :loading="creatingNoFile"
            :disabled="!canCreateNoFile || creatingNoFile"
            @click="createWithoutFile"
          >
            Ajouter la dépense
          </v-btn>
        </v-window-item>
      </v-window>

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
import { mdiDelete, mdiDownload, mdiPaperclip, mdiReceiptText, mdiReceiptTextOutline } from '@mdi/js'
import dayjs from 'dayjs'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'
import { formatEur } from '~/utils/formatNumber'
import { formatFileSize, maxFileSizeRule, mimeIcon, mimeIconColor } from '~/utils/fileDisplay'

const props = defineProps({
  slug: { type: String, required: true },
  dateId: { type: String, required: true },
})

const emit = defineEmits(['invoices-changed'])

const invoices = ref([])
const loading = ref(true)
const addTab = ref('with-file')

// With file
const selectedFile = ref(null)
const uploadAmount = ref(null)
const uploadLabel = ref('')
const uploading = ref(false)

// Without file
const noFileAmount = ref(null)
const noFileLabel = ref('')
const creatingNoFile = ref(false)

const uploadError = ref('')
const downloadingId = ref(null)

const canUploadFile = computed(() =>
  selectedFile.value && uploadAmount.value !== null && uploadAmount.value !== '',
)
const canCreateNoFile = computed(() =>
  noFileAmount.value !== null && noFileAmount.value !== '' && noFileLabel.value && noFileLabel.value.trim(),
)

const totalAmount = computed(() =>
  invoices.value.reduce((acc, inv) => acc + Number(inv.amount || 0), 0),
)

// Invoices without an attached file fall back to the receipt-outline icon.
const iconFor = invoice => mimeIcon(invoice.mime_type, mdiReceiptTextOutline)
const iconColorFor = invoice => mimeIconColor(invoice.mime_type, 'grey')

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
  if (!canUploadFile.value) return
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
    if (!res.ok) throw new Error('Erreur lors de l\'envoi de la facture')
    selectedFile.value = null
    uploadAmount.value = null
    uploadLabel.value = ''
    await fetchInvoices()
    emit('invoices-changed')
  }
  catch (err) {
    uploadError.value = getApiErrorMessage(err, 'Erreur lors de l\'envoi.')
  }
  finally {
    uploading.value = false
  }
}

async function createWithoutFile() {
  if (!canCreateNoFile.value) return
  creatingNoFile.value = true
  uploadError.value = ''
  try {
    await bookingApi.createInvoiceWithoutFile(props.slug, props.dateId, {
      amount: Number(noFileAmount.value),
      label: noFileLabel.value.trim(),
    })
    noFileAmount.value = null
    noFileLabel.value = ''
    await fetchInvoices()
    emit('invoices-changed')
  }
  catch (err) {
    uploadError.value = getApiErrorMessage(err, 'Erreur lors de la création.')
  }
  finally {
    creatingNoFile.value = false
  }
}

async function onAmountBlur(invoice, event) {
  const newValue = Number(event.target.value)
  if (Number.isNaN(newValue) || newValue === Number(invoice.amount)) return
  try {
    await bookingApi.updateInvoice(props.slug, props.dateId, invoice.id, { amount: newValue })
    invoice.amount = newValue
    emit('invoices-changed')
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

async function deleteInvoice(invoice) {
  const name = invoice.file_name || invoice.label || 'cette ligne'
  if (!confirm(`Supprimer "${name}" ?`)) return
  try {
    await bookingApi.deleteInvoice(props.slug, props.dateId, invoice.id)
    await fetchInvoices()
    emit('invoices-changed')
  }
  catch (err) {
    console.error('Error deleting invoice:', err)
  }
}

onMounted(fetchInvoices)
</script>
