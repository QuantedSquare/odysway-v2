<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="10"
        md="8"
      >
        <NuxtLink
          class="mr-4"
        >
          <slot />
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>
