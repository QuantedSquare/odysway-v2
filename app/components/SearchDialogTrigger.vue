<template>
  <v-btn
    :size="36"
    icon
    variant="outlined"
    class="search-trigger-btn"
    :class="btnClass"
    @click="openDialog"
  >
    <v-img
      :src="img('/icons/Search.svg', { format: 'webp', quality: 100, width: 20, height: 20 })"
      alt="Search icon"
      width="20"
      height="20"
      fetchpriority="high"
    />
  </v-btn>
</template>

<script setup>
import { useImage } from '#imports'
import { useSearchDialog } from '~/composables/useSearchDialog'

defineProps({
  btnClass: {
    type: String,
    default: null,
  },
})

const img = useImage()
const { openDialog } = useSearchDialog()
</script>

<style scoped>
.search-trigger-btn {
  border-radius: 50% !important;
  transition: all 0.2s ease;
}

.search-trigger-btn:hover {
  background-color: rgb(var(--v-theme-primary-light-4), 0.1);
  transform: scale(1.05);
}
</style>
