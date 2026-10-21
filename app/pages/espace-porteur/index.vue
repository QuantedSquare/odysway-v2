<template>
  <v-container class="espace-porteur py-8 px-4">
    <div class="d-flex align-center justify-space-between mb-8">
      <span class="text-h5 font-weight-bold text-primary">odysway<span class="text-secondary">.</span> <span class="text-body-1 font-weight-medium">Espace porteur</span></span>
      <v-btn
        v-if="moi"
        variant="text"
        size="small"
        @click="deconnecter"
      >
        Se déconnecter
      </v-btn>
    </div>

    <div
      v-if="chargement"
      class="d-flex justify-center py-16"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>

    <v-alert
      v-else-if="erreur"
      type="warning"
      variant="tonal"
      class="mx-auto"
      max-width="560"
    >
      <p class="font-weight-bold mb-2">
        {{ erreur }}
      </p>
      <p class="text-body-2">
        L'accès à l'Espace porteur se fait par le lien personnel envoyé par Odysway. Il reste valable 30 jours ; écrivez-nous à
        <a href="mailto:contact@odysway.com">contact@odysway.com</a> pour en recevoir un nouveau.
      </p>
    </v-alert>

    <template v-else-if="moi">
      <h1 class="text-h4 font-weight-bold text-primary mb-2">
        Bonjour {{ moi.porteur.nom }}
      </h1>
      <p class="text-body-1 mb-8 text-grey-darken-2">
        Rédigez ici la page de votre séjour. Tout est enregistré au fil de l'eau ; quand elle vous convient, soumettez-la à Odysway, qui la relit puis la met en ligne. Les dates et les prix définitifs sont fixés avec l'équipe.
      </p>

      <v-card
        v-for="p in moi.pages"
        :key="p.id"
        class="mb-4"
        rounded="lg"
        variant="outlined"
        :to="`/espace-porteur/${p.id}`"
      >
        <v-card-item>
          <v-card-title class="text-wrap">
            {{ p.payload.titre || 'Séjour sans titre' }}
          </v-card-title>
          <v-card-subtitle>
            Modifiée le {{ formaterDate(p.modifieLe) }}
          </v-card-subtitle>
          <template #append>
            <v-chip
              :color="STATUTS[p.statut].couleur"
              size="small"
              variant="tonal"
            >
              {{ STATUTS[p.statut].libelle }}
            </v-chip>
          </template>
        </v-card-item>
      </v-card>

      <v-btn
        color="secondary"
        rounded="pill"
        class="mt-4"
        :loading="creation"
        :prepend-icon="mdiPlus"
        @click="creer"
      >
        {{ moi.pages.length ? 'Créer une autre page' : 'Commencer ma page' }}
      </v-btn>
    </template>
  </v-container>
</template>

<script setup>
import { mdiPlus } from '@mdi/js'

definePageMeta({ layout: 'blank' })
useHead({ title: 'Espace porteur', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const STATUTS = {
  brouillon: { libelle: 'Brouillon', couleur: 'grey' },
  soumis: { libelle: 'En relecture chez Odysway', couleur: 'primary' },
  publie: { libelle: 'En ligne', couleur: 'success' },
}

const route = useRoute()
const router = useRouter()
const { api } = useEspacePorteur()

const chargement = ref(true)
const erreur = ref('')
const moi = ref(null)
const creation = ref(false)

const formaterDate = d => (d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '')

const charger = async () => {
  try {
    moi.value = await api('/moi')
  }
  catch (err) {
    erreur.value = err?.statusCode === 401
      ? 'Ce lien a expiré ou n\'est plus valable.'
      : 'L\'espace est momentanément indisponible. Réessayez dans un instant.'
  }
}

onMounted(async () => {
  // Lien magique : le jeton devient un cookie, puis disparaît de l'adresse
  // (historique, partage d'écran, en-tête Referer).
  const jeton = route.query.t
  if (typeof jeton === 'string' && jeton) {
    try {
      await api('/session', { method: 'POST', body: { jeton } })
    }
    catch {
      // La lecture de /moi dira si une session antérieure tient encore.
    }
    await router.replace({ query: {} })
  }
  await charger()
  chargement.value = false
})

const creer = async () => {
  creation.value = true
  try {
    const page = await api('/pages', { method: 'POST' })
    await navigateTo(`/espace-porteur/${page.id}`)
  }
  catch {
    erreur.value = 'La page n\'a pas pu être créée. Réessayez dans un instant.'
  }
  finally {
    creation.value = false
  }
}

const deconnecter = async () => {
  await api('/deconnexion', { method: 'POST' }).catch(() => {})
  moi.value = null
  erreur.value = 'Vous êtes déconnecté.'
}
</script>

<style scoped>
.espace-porteur {
  max-width: 760px;
}
</style>
