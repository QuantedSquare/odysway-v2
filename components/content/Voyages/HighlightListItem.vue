<template>
  <v-list-item
    class="text-body-1 text-grey-darken-3 px-0"
    :prepend-icon="mdiChevronRight"
  >
    <slot mdc-unwrap="p" />
  </v-list-item>
</template>

<script setup>
import { mdiChevronRight } from '@mdi/js'
</script>
