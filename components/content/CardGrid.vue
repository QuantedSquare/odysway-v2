<template>
  <v-container fluid>
    <v-row>
      <v-col
        cols="12"
        class="text-center text-h2 font-weight-bold mt-4 mb-12"
      >
        <slot name="title" />
      </v-col>
      <slot name="cards" />
    </v-row>
  </v-container>
</template>
