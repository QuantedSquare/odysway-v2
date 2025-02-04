<template>
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
      <v-icon>{{ mdiAccountCircle }}</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>{{ mdiDotsVertical }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { mdiMagnify, mdiDotsVertical, mdiAccountCircle } from '@mdi/js'
</script>
