<template>
  <div class="d-flex flex-column ga-5">
    <div>
      <h1 class="text-h5 text-md-h4 font-weight-bold">
        Mes voyages
      </h1>
      <p class="text-body-2 text-primary-light-2 mt-1">
        Tous les dossiers rattachés à votre compte.
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
    <template v-else>
      <section
        v-for="groupe in groupes"
        :key="groupe.titre"
      >
        <h2 class="text-subtitle-1 font-weight-bold mb-3">
          {{ groupe.titre }}
        </h2>
        <div class="d-flex flex-column ga-3">
          <EspaceTripCard
            v-for="d in groupe.dossiers"
            :key="d.id"
            :dossier="d"
            compact
          />
        </div>
      </section>
      <v-card
        v-if="!groupes.length"
        class="pa-6"
      >
        <p class="text-body-2 mb-4">
          Aucun voyage n'est encore rattaché à votre compte.
        </p>
        <v-btn
          to="/mon-espace/rattacher"
          color="secondary"
          rounded="pill"
        >
          Retrouver un dossier
        </v-btn>
      </v-card>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Mes voyages — Odysway', robots: 'noindex, nofollow' })

const { moi, chargerMoi } = useEspace()
const { charger } = useEspaceVoyages()
const chargement = ref(true)
const erreur = ref(null)

const groupes = computed(() => {
  const d = moi.value?.dossiers || []
  return [
    { titre: 'En cours', dossiers: d.filter(x => x.etat === 'en_cours') },
    { titre: 'À venir', dossiers: d.filter(x => x.etat === 'a_venir' || x.etat === 'sans_date') },
    { titre: 'Voyages passés', dossiers: d.filter(x => x.etat === 'passe').reverse() },
  ].filter(g => g.dossiers.length)
})

onMounted(async () => {
  try {
    await chargerMoi()
    await charger((moi.value?.dossiers || []).map(d => d.slug))
  }
  catch (err) {
    if (err?.statusCode !== 401) erreur.value = 'Impossible de charger vos voyages pour le moment.'
  }
  finally {
    chargement.value = false
  }
})
</script>
