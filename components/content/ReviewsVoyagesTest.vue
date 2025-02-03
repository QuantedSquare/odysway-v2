<template>
  <v-container>
    <v-row justify="center">
      <slot />
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <NuxtLink
          to="https://fr.trustpilot.com/review/odysway.com"
          target="blank"
        >
          <VBtnSecondary>
            Lire d'autres avis voyageurs
          </VBtnSecondary>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>
