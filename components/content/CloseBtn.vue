<template>
  <v-btn
    variant="outlined"
    :prepend-icon="mdiClose"
    color="grey-darken-3"
    class="ma-4 on-hover"
    @click="$emit(dialog = false)"
  >
    Fermer
  </v-btn>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
</script>
