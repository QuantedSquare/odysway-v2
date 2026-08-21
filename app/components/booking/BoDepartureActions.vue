<template>
  <div class="d-flex justify-end ga-2">
    <v-btn
      :href="prospectsHref"
      target="_blank"
      rel="noopener"
      @click.stop
    >
      Prospects
    </v-btn>
    <v-btn
      color="primary"
      variant="flat"
      @click.stop="$emit('open')"
    >
      Ouvrir
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Les deux gestes possibles sur un départ : aller chercher de la demande
// (prospects) ou aller travailler le départ lui-même.
//
// « Prospects » pointe pour l'instant sur une recherche ActiveCampaign par
// titre de voyage. Le rapprochement réel — compteurs par type, déduplication,
// liste filtrée sur le départ — fait l'objet de la spéc « Prospects
// ActiveCampaign », qui n'est pas encore implémentée : ce lien est un
// dépannage assumé, à remplacer quand l'endpoint existera.
const AC_SEARCH_BASE = 'https://odysway.activehosted.com/app/contacts/'

const props = defineProps({
  query: { type: String, default: '' }
})

defineEmits(['open'])

const prospectsHref = computed(() => `${AC_SEARCH_BASE}?q=${encodeURIComponent(props.query)}`)
</script>
