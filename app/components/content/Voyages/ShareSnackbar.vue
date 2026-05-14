<template>
  <v-snackbar
    v-model="model"
    location="top"
    timeout="2000"
    color="primary"
  >
    Le lien de ce voyage a été copié avec succès !
  </v-snackbar>
</template>

<script setup>
const model = defineModel({ type: Boolean, default: false })
</script>
