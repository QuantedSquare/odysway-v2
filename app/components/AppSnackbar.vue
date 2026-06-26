<template>
  <v-snackbar
    v-model="state.show"
    :color="state.color"
    :timeout="state.timeout"
    location="top"
  >
    {{ state.text }}
    <template #actions>
      <v-btn
        variant="text"
        icon
        @click="close"
      >
        <v-icon>{{ mdiClose }}</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { mdiClose } from '@mdi/js'

const { state, close } = useSnackbar()
</script>
