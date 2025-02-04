<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        <NuxtLink to="/">
          <v-img
            width="150px"
            max-height="48px"
            src="/logos/logo_couleur.png"
            contain
          />
        </NuxtLink>
      </v-app-bar-title>
      <v-spacer />
      <v-btn icon>
        <v-icon>{{ mdiMagnify }}</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>{{ mdiDotsVertical }}</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
    <v-footer>
      Footer
    </v-footer>
  </v-app>
</template>

<script setup>
import { mdiMagnify, mdiDotsVertical } from '@mdi/js'
</script>
