<template>
  <v-row justify="center">
    <v-col
      cols="10"
      md="8"
      class="d-flex overflow-auto"
    >
      <NuxtLink
        class="mr-4"
      >
        <slot />
      </NuxtLink>
    </v-col>
  </v-row>
</template>
