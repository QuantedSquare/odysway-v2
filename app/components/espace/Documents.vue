<template>
  <div>
    <v-alert
      v-if="erreur"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-3"
      @click:close="erreur = null"
    >
      {{ erreur }}
    </v-alert>
    <div
      v-for="d in affiches"
      :key="d.id"
      class="doc d-flex align-center ga-3 py-3"
      :class="{ verrouille: d.etat === 'bientot' }"
    >
      <v-avatar
        rounded="lg"
        size="38"
        :color="d.etat === 'bientot' ? 'grey-lighten-3' : 'sky'"
        variant="tonal"
      >
        <v-icon
          :icon="d.etat === 'bientot' ? mdiLockOutline : (ICONES[d.type] || mdiFileDocumentOutline)"
          size="19"
        />
      </v-avatar>
      <div class="flex-grow-1 min-w-0">
        <div
          class="text-body-2"
          :class="d.etat === 'bientot' ? 'text-primary-light-2' : 'font-weight-medium'"
        >
          {{ d.titre }}
        </div>
        <div class="text-caption text-primary-light-2">
          <template v-if="d.etat === 'bientot'">
            Disponible le {{ formatDate(d.disponibleLe, 'D MMMM YYYY') }}
          </template>
          <template v-else>
            {{ d.description || d.libelleType }} · {{ d.format }} {{ taille(d.taille) }}
          </template>
        </div>
      </div>
      <v-chip
        v-if="d.nouveau && !vusIci.has(d.id)"
        size="x-small"
        color="secondary"
        variant="flat"
        class="text-uppercase font-weight-bold"
      >
        Nouveau
      </v-chip>
      <v-chip
        v-else-if="d.etat === 'bientot'"
        size="x-small"
        variant="outlined"
        class="text-uppercase"
      >
        Bientôt
      </v-chip>
      <v-btn
        v-if="d.etat === 'disponible'"
        :icon="mdiDownload"
        variant="outlined"
        size="small"
        rounded="lg"
        :loading="enCours === d.id"
        :aria-label="`Télécharger ${d.titre}`"
        @click="telecharger(d)"
      />
    </div>
    <p
      v-if="!documents.length"
      class="text-body-2 text-primary-light-2 py-2 mb-0"
    >
      {{ vide }}
    </p>
  </div>
</template>

<script setup>
import { mdiAirplane, mdiBookOpenVariant, mdiDownload, mdiFileDocumentOutline, mdiLockOutline, mdiMapOutline, mdiReceiptTextOutline, mdiShieldCheckOutline } from '@mdi/js'

const props = defineProps({
  documents: { type: Array, required: true },
  // Nombre de lignes affichées (tableau de bord) ; tout par défaut.
  limite: { type: Number, default: 0 },
  vide: { type: String, default: 'Aucun document pour le moment : nous vous prévenons dès qu\'un document est disponible.' },
})

const ICONES = {
  fiche_voyage: mdiMapOutline,
  carnet: mdiBookOpenVariant,
  billet: mdiAirplane,
  assurance: mdiShieldCheckOutline,
  facture: mdiReceiptTextOutline,
}

const { api } = useEspace()
const enCours = ref(null)
const erreur = ref(null)
// Ouverts pendant cette visite : le badge « Nouveau » tombe aussitôt.
const vusIci = reactive(new Set())

const affiches = computed(() => (props.limite ? props.documents.slice(0, props.limite) : props.documents))

const taille = (octets) => {
  if (!octets) return ''
  return octets < 1024 * 1024 ? `${Math.max(1, Math.round(octets / 1024))} Ko` : `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`
}

const telecharger = async (d) => {
  enCours.value = d.id
  erreur.value = null
  try {
    const { url } = await api(`documents/${d.id}/lien`)
    vusIci.add(d.id)
    window.location.assign(url)
  }
  catch {
    erreur.value = 'Ce document n\'a pas pu être téléchargé. Réessayez dans un instant.'
  }
  finally {
    enCours.value = null
  }
}
</script>

<style scoped>
.doc + .doc {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.08);
}
.min-w-0 {
  min-width: 0;
}
</style>
