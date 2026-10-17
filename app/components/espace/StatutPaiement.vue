<template>
  <v-chip
    v-if="libelle"
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
  paiement: { type: Object, required: true },
  etat: { type: String, default: null },
})

const statut = computed(() => props.paiement?.statut)
const libelle = computed(() => ({
  solde: 'Voyage réglé',
  a_regler: props.etat === 'passe' ? null : 'Solde à régler',
  en_retard: 'Solde en retard',
}[statut.value] || null))
const couleur = computed(() => ({ solde: 'green', a_regler: 'orange-darken-4', en_retard: 'secondary' }[statut.value]))
const icone = computed(() => ({ solde: mdiCheckCircleOutline, a_regler: mdiClockOutline, en_retard: mdiAlertCircleOutline }[statut.value]))
</script>
