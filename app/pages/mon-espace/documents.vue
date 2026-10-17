<template>
  <div class="d-flex flex-column ga-5">
    <div>
      <h1 class="text-h5 text-md-h4 font-weight-bold">
        Mes documents
      </h1>
      <p class="text-body-2 text-primary-light-2 mt-1">
        Tous vos documents de voyage sont réunis ici.
      </p>
    </div>

    <v-skeleton-loader
      v-if="chargement"
      type="card@2"
    />
    <v-alert
      v-else-if="erreur"
      type="error"
      variant="tonal"
    >
      {{ erreur }}
    </v-alert>
    <v-card
      v-else-if="!dossiers.length"
      class="pa-6"
    >
      <p class="text-body-2 mb-0">
        Aucun voyage rattaché à votre compte pour le moment.
      </p>
    </v-card>
    <template v-else>
      <v-card
        v-for="d in dossiers"
        :key="d.id"
        class="pa-5"
      >
        <div class="d-flex flex-wrap align-center ga-2 mb-2">
          <h2 class="text-subtitle-1 font-weight-bold">
            {{ titre(d) }}<span
              v-if="d.depart"
              class="font-weight-regular text-primary-light-2"
            > — {{ formatDate(d.depart, 'MMMM YYYY') }}</span>
          </h2>
          <v-spacer />
          <span class="text-caption text-primary-light-2">Dossier n° {{ d.id }}</span>
        </div>
        <EspaceDocuments :documents="d.documents" />
        <div class="d-flex flex-wrap ga-2 mt-3">
          <v-btn
            :to="`/voyages/${d.slug}`"
            variant="text"
            size="small"
            :prepend-icon="mdiMapOutline"
          >
            Programme sur odysway.com
          </v-btn>
          <v-btn
            to="/conditions-generales-de-vente"
            variant="text"
            size="small"
            :prepend-icon="mdiFileDocumentOutline"
          >
            Conditions générales de vente
          </v-btn>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { mdiFileDocumentOutline, mdiMapOutline } from '@mdi/js'

definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Mes documents — Odysway', robots: 'noindex, nofollow' })

const { api, chargerMoi } = useEspace()
const { charger, titre } = useEspaceVoyages()
const dossiers = ref([])
const chargement = ref(true)
const erreur = ref(null)

onMounted(async () => {
  try {
    await chargerMoi()
    dossiers.value = (await api('documents')).dossiers
    await charger(dossiers.value.map(d => d.slug))
  }
  catch (err) {
    if (err?.statusCode !== 401) erreur.value = 'Impossible de charger vos documents pour le moment.'
  }
  finally {
    chargement.value = false
  }
})
</script>
