<template>
  <div class="d-flex flex-column ga-4 espace-rail">
    <v-card class="pa-5 text-center d-none d-md-block">
      <v-avatar
        size="72"
        color="sky"
        class="text-h6 font-weight-bold mb-3"
      >
        {{ initiales }}
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold">
        {{ nomComplet || 'Mon espace' }}
      </div>
      <div class="text-caption text-primary-light-2 text-break">
        {{ moi?.compte?.email }}
      </div>
    </v-card>

    <v-card class="pa-2">
      <!-- Mobile : la navigation devient une rangée défilante. -->
      <div class="d-flex d-md-none overflow-x-auto ga-1">
        <v-btn
          v-for="item in liens"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :variant="estActif(item) ? 'tonal' : 'text'"
          rounded="pill"
          size="small"
          class="flex-shrink-0"
        >
          {{ item.label }}
        </v-btn>
      </div>
      <v-list
        nav
        density="comfortable"
        class="d-none d-md-block pa-0"
        aria-label="Espace voyageur"
      >
        <v-list-item
          v-for="item in liens"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :active="estActif(item)"
          rounded="lg"
          color="primary"
          :title="item.label"
        >
          <template
            v-if="item.badge"
            #append
          >
            <v-badge
              :content="item.badge"
              color="secondary"
              inline
            />
          </template>
        </v-list-item>
        <v-divider class="my-2" />
        <v-list-item
          :prepend-icon="mdiLogout"
          rounded="lg"
          title="Se déconnecter"
          @click="deconnexion"
        />
      </v-list>
    </v-card>

    <v-card
      v-if="conseiller"
      color="cream"
      class="pa-4 d-none d-md-block"
    >
      <div class="text-body-2 font-weight-bold mb-1">
        Votre contact chez Odysway
      </div>
      <p class="text-caption text-primary-light-2 mb-2">
        {{ conseiller }} suit votre dossier du départ au retour.
      </p>
      <a
        href="tel:+33184807975"
        class="text-caption font-weight-bold text-secondary"
      >+33 1 84 80 79 75</a>
    </v-card>
  </div>
</template>

<script setup>
import { mdiAccountMultiplePlusOutline, mdiHomeOutline, mdiLogout, mdiMapOutline, mdiShieldLockOutline } from '@mdi/js'

const route = useRoute()
const { moi, deconnexion } = useEspace()

const nomComplet = computed(() => [moi.value?.compte?.prenom, moi.value?.compte?.nom].filter(Boolean).join(' '))
const initiales = computed(() => {
  const c = moi.value?.compte
  const i = `${c?.prenom?.[0] || ''}${c?.nom?.[0] || ''}`.toUpperCase()
  return i || (c?.email?.[0] || '?').toUpperCase()
})

const aRegler = computed(() => (moi.value?.dossiers || [])
  .filter(d => d.etat === 'a_venir' && ['a_regler', 'en_retard'].includes(d.paiement?.statut)).length)

const conseiller = computed(() => (moi.value?.dossiers || []).find(d => d.etat !== 'passe' && d.conseiller)?.conseiller || null)

const liens = computed(() => [
  { to: '/mon-espace', label: 'Tableau de bord', icon: mdiHomeOutline, exact: true },
  { to: '/mon-espace/voyages', label: 'Mes voyages', icon: mdiMapOutline, badge: aRegler.value || null },
  { to: '/mon-espace/rattacher', label: 'Retrouver un dossier', icon: mdiAccountMultiplePlusOutline },
  { to: '/mon-espace/securite', label: 'Connexion et sécurité', icon: mdiShieldLockOutline },
])

const estActif = item => (item.exact ? route.path === item.to : route.path.startsWith(item.to))
</script>

<style scoped>
@media (min-width: 960px) {
  .espace-rail {
    position: sticky;
    top: 110px;
  }
}
</style>
