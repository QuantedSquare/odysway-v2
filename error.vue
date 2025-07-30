<template>
  <NuxtLayout name="default">
    <v-container
      id="error"
      fluid
      class="d-flex flex-column align-center justify-center fill-height ga-5"
    >
      <h1>{{ error.statusCode }}</h1>
      <h1>:'(</h1>
      <h3>
        {{ error.statusCode === 404 ? "Nous n'avons pas trouvé cette page ..." : 'Une erreur est survenue' }}
      </h3>
      <v-btn
        to="/"
        x-large
      >
        Retour à l'accueil
      </v-btn>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: Object as () => NuxtError,
})
</script>

<style scoped>
#error {
  color: #3e3e3e;
  background-size: cover;
  background-image: url('/images/error page/404.jpg');
  background-color: rgba(255, 255, 255, 0.8);
  background-blend-mode: screen;
}
</style>
