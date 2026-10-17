<template>
  <div class="d-flex flex-column ga-5">
    <v-btn
      to="/mon-espace/voyages"
      variant="text"
      :prepend-icon="mdiArrowLeft"
      class="align-self-start px-0"
    >
      Mes voyages
    </v-btn>

    <template v-if="chargement">
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="list-item-two-line@3" />
    </template>
    <v-alert
      v-else-if="erreur"
      type="error"
      variant="tonal"
    >
      {{ erreur }}
    </v-alert>

    <template v-else-if="detail">
      <EspaceTripCard
        :dossier="detail"
        :kicker="kicker"
        sur-la-fiche
      />

      <v-alert
        v-if="detail.option"
        type="info"
        variant="tonal"
      >
        Une option est posée sur ce départ<span v-if="detail.option.expire"> jusqu'au {{ formatDate(detail.option.expire, 'D MMMM YYYY') }}</span>. Notre équipe vous recontacte pour la confirmer.
      </v-alert>

      <EspacePaiement
        v-if="detail.paiement"
        :detail="detail"
      />

      <EspaceVoyageurs
        :detail="detail"
        @maj="recharger"
      />

      <v-card class="pa-5">
        <h2 class="text-subtitle-1 font-weight-bold mb-3">
          Votre groupe
        </h2>
        <EspaceGroupe :detail="detail" />
      </v-card>

      <v-card class="pa-5">
        <h2 class="text-subtitle-1 font-weight-bold mb-3">
          Documents
        </h2>
        <v-list class="pa-0">
          <v-list-item
            v-if="carnet"
            :href="carnet"
            target="_blank"
            rel="noopener"
            :prepend-icon="mdiFileDocumentOutline"
            title="Carnet de voyage"
            subtitle="Hébergements, contacts sur place, informations pratiques"
            class="px-0"
          />
          <v-list-item
            v-if="voyageSanity"
            :to="`/voyages/${detail.slug}`"
            :prepend-icon="mdiMapOutline"
            title="Fiche du voyage"
            subtitle="Programme jour par jour sur odysway.com"
            class="px-0"
          />
          <v-list-item
            to="/conditions-generales-de-vente"
            :prepend-icon="mdiFileDocumentOutline"
            title="Conditions générales de vente"
            class="px-0"
          />
        </v-list>
        <p class="text-caption text-primary-light-2 mt-2 mb-0">
          Billets, contrat d'assurance et factures arriveront ici prochainement.
        </p>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { mdiArrowLeft, mdiFileDocumentOutline, mdiMapOutline } from '@mdi/js'

definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Mon dossier — Odysway', robots: 'noindex, nofollow' })

const route = useRoute()
const { api, chargerMoi } = useEspace()
const { charger, voyage } = useEspaceVoyages()

const detail = ref(null)
const chargement = ref(true)
const erreur = ref(null)

const voyageSanity = computed(() => voyage(detail.value?.slug))
const carnet = computed(() => (/^https:\/\//.test(detail.value?.carnet || '') ? detail.value.carnet : null))
const kicker = computed(() => ({ en_cours: 'Voyage en cours', a_venir: 'À venir', passe: 'Voyage passé' }[detail.value?.etat] || null))

const recharger = async () => {
  detail.value = await api(`dossiers/${route.params.dealId}`)
}

onMounted(async () => {
  try {
    // Le compte d'abord : il rejoue le rattachement et nourrit le menu.
    await chargerMoi()
    await recharger()
    await charger([detail.value.slug])
    if (route.hash) nextTick(() => document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  catch (err) {
    if (err?.statusCode === 404) erreur.value = 'Ce dossier n\'est pas rattaché à votre compte.'
    else if (err?.statusCode !== 401) erreur.value = 'Impossible de charger ce dossier pour le moment.'
  }
  finally {
    chargement.value = false
  }
})
</script>
