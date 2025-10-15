<template>
  <v-container
    :fluid="width > 600"
    class="py-0 my-0 px-2 px-md-9"
  >
    <FaqContainer />
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

// const route = useRoute()
const { width } = useDisplay()

definePageMeta({
  layout: 'no-faq',
})
</script>
