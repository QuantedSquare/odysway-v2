<template>
  <v-chip
    size="small"
    variant="tonal"
    :color="couleur"
    :prepend-icon="icone"
  >
    {{ libelle }}
  </v-chip>
</template>

<script setup>
import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiClockOutline } from '@mdi/js'

const props = defineProps({
  completude: { type: Object, required: true },
})

const MANQUES = { piece: 'pièce d\'identité', regime: 'régime', urgence: 'contact d\'urgence' }

const libelle = computed(() => {
  const c = props.completude
  if (c.expireTropTot) return 'Pièce expirant trop tôt'
  if (c.complet) return 'Profil complet'
  const m = c.manques || []
  return m.length === 1 ? `Manque : ${MANQUES[m[0]]}` : `${m.length} éléments à compléter`
})
const couleur = computed(() => (props.completude.expireTropTot ? 'secondary' : props.completude.complet ? 'green' : 'orange-darken-4'))
const icone = computed(() => (props.completude.expireTropTot ? mdiAlertCircleOutline : props.completude.complet ? mdiCheckCircleOutline : mdiClockOutline))
</script>
