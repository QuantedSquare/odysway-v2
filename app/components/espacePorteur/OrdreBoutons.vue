<template>
  <div class="d-flex ga-1">
    <v-btn
      :icon="mdiArrowUp"
      size="x-small"
      variant="text"
      :disabled="index === 0"
      aria-label="Monter"
      @click="emit('deplacer', -1)"
    />
    <v-btn
      :icon="mdiArrowDown"
      size="x-small"
      variant="text"
      :disabled="index === total - 1"
      aria-label="Descendre"
      @click="emit('deplacer', 1)"
    />
    <v-btn
      :icon="mdiDeleteOutline"
      size="x-small"
      variant="text"
      color="error"
      aria-label="Supprimer"
      @click="emit('supprimer')"
    />
  </div>
</template>

<script setup>
import { mdiArrowDown, mdiArrowUp, mdiDeleteOutline } from '@mdi/js'

// Monter, descendre, supprimer un élément d'une liste du brouillon (jours,
// hébergements, questions). La page qui tient le brouillon fait le déplacement.
defineProps({
  index: { type: Number, required: true },
  total: { type: Number, required: true },
})
const emit = defineEmits(['deplacer', 'supprimer'])
</script>
