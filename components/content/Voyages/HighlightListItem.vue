<template>
  <v-list-item
    class="px-0"
  >
    <template #prepend>
      <v-icon
        :icon="mdiCheckboxMarkedCircle"
        color="primary"
        size="20"
      />
    </template>
    <p class="text-body-1 text-primary">
      <slot mdc-unwrap="p" />
    </p>
  </v-list-item>
</template>

<script setup>
import { mdiCheckboxMarkedCircle } from '@mdi/js'
</script>
