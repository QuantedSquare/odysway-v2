<template>
  <v-btn
    variant="text"
    class="btn-bouncing"
    :icon="isExpanded ? mdiChevronDoubleUp : mdiChevronDoubleDown"
    @click="showHide"
  />
</template>

<script setup>
import { mdiChevronDoubleDown, mdiChevronDoubleUp } from '@mdi/js'

const isExpanded = defineModel()

function showHide() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.btn-bouncing {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 50%, 100% {
    transform: translateY(0);
  }
  25%, 75% {
    transform: translateY(-10px);
  }
}
</style>
