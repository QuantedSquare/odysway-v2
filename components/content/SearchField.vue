<template>
  <div class="d-flex flex-column max-width">
    <v-text-field
      v-model="search"
      label="Saisir votre prochaine destination"
      hide-details
      class="mt-5 inner-textfield"
      :append-inner-icon="mdiMagnify"
    />
    <div class="d-none d-md-flex justify-center ga-6 mt-5">
      <v-btn
        variant="outlined"
        color="white"
      >
        Laponie
      </v-btn>
      <v-btn
        variant="outlined"
        color="white"
      >
        Japon
      </v-btn>
      <v-btn
        variant="outlined"
        color="white"
      >
        France
      </v-btn>
      <v-btn
        variant="outlined"
        color="white"
      >
        Laos
      </v-btn>
    </div>
  </div>
</template>

<script setup>
// @Alex J'ai retirer ce composant du hero.
// On doit prendre la rigueur de faire des composants super simple et réutilisable pour exploité nuxt studio au max.

import { mdiMagnify } from '@mdi/js'

const search = ref('')
</script>

<style lang="css" scoped>
.inner-textfield:deep(.v-field__overlay) {
  background-color: rgba(255, 255, 255, 0.214)!important;
  backdrop-filter: blur(8px);
  box-shadow: 2px 2px 5px  rgba(255, 255, 255, 0.3);
}
.inner-textfield:deep(.v-field__field){
  text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.554);
}
</style>
