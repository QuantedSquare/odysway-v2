<template>
  <v-list-item
    class="text-subtitle-1"
    :prepend-icon="mdiCheck"
  >
    <span><slot mdc-unwrap="p" /></span>
  </v-list-item>
</template>

<script setup>
import { mdiCheck } from '@mdi/js'
</script>
