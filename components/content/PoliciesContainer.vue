<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        class="text-center text-h3"
      >
        <slot name="title" />
      </v-col>
      <v-col cols="12">
        <slot name="text" />
      </v-col>
    </v-row>
  </v-container>
</template>
