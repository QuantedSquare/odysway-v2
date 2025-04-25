<template>
  <v-container :fluid="width < 1440">
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="8"
        class="text-center text-h4 font-weight-bold"
      >
        <slot
          name="text"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
</script>
