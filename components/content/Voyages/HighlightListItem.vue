<template>
  <v-list-item
    class="text-subtitle-1 text-grey-darken-3 pl-0"
    :prepend-icon="mdiChevronRight"
  >
    <slot mdc-unwrap="p" />
    <!-- add expanding on list length height > image height -->
  </v-list-item>
</template>

<script setup>
import { mdiChevronRight } from '@mdi/js'
</script>
