<template>
  <div class="d-flex flex-column ga-5">
    <div>
      <h1 class="text-h5 text-md-h4 font-weight-bold">
        Mon profil voyageur
      </h1>
      <p class="text-body-2 text-primary-light-2 mt-1">
        Pièce d'identité, régime alimentaire et contact d'urgence, pour vous et pour les voyageurs que vous accompagnez.
      </p>
    </div>

    <v-skeleton-loader
      v-if="chargement"
      type="list-item-two-line@3"
    />
    <v-alert
      v-else-if="erreur"
      type="error"
      variant="tonal"
    >
      {{ erreur }}
    </v-alert>
    <v-card
      v-else-if="!profils.length"
      class="pa-6"
    >
      <p class="text-body-2 mb-0">
        Aucun voyage à venir : votre profil se remplit voyage par voyage, à partir de votre réservation.
      </p>
    </v-card>
    <v-card
      v-else
      class="pa-2"
    >
      <v-list lines="two">
        <v-list-item
          v-for="p in profils"
          :key="`${p.dossier.id}-${p.slot}`"
          :to="`/mon-espace/voyages/${p.dossier.id}/voyageurs/${p.slot}`"
          rounded="lg"
        >
          <template #prepend>
            <v-avatar
              color="sky"
              variant="tonal"
              class="font-weight-bold text-body-2"
            >
              {{ (p.prenom?.[0] || '?').toUpperCase() }}{{ (p.nom?.[0] || '').toUpperCase() }}
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ [p.prenom, p.nom].filter(Boolean).join(' ') }}<span
              v-if="p.moi"
              class="text-caption text-primary-light-2"
            > (vous)</span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ titre(p.dossier) }}<span v-if="p.dossier.depart"> · départ le {{ formatDate(p.dossier.depart, 'D MMMM YYYY') }}</span>
          </v-list-item-subtitle>
          <template #append>
            <EspaceStatutProfil :completude="p.completude" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Mon profil voyageur — Odysway', robots: 'noindex, nofollow' })

const { api, chargerMoi } = useEspace()
const { charger, titre } = useEspaceVoyages()
const profils = ref([])
const chargement = ref(true)
const erreur = ref(null)

onMounted(async () => {
  try {
    await chargerMoi()
    profils.value = (await api('profils')).profils
    await charger(profils.value.map(p => p.dossier.slug))
  }
  catch (err) {
    if (err?.statusCode !== 401) erreur.value = 'Impossible de charger vos profils pour le moment.'
  }
  finally {
    chargement.value = false
  }
})
</script>
