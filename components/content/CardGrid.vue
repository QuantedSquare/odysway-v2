<template>
  <v-container
    :fluid="width < 1440"
  >
    <v-row>
      <v-col
        cols="12"
        class="text-center text-h2 font-weight-bold mt-4 mb-12"
      >
        <slot name="title" />
      </v-col>
      <slot name="cards" />
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
console.log('CardGrid')
</script>
