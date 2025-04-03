<template>
  <v-container>
    <v-row>
      <v-col
        cols="8"
        sm="10"
        class="text-dark font-weight-black text-h5 text-md-h4 my-4"
      >
        <slot name="title" />
      </v-col>
    </v-row>
    <v-row>
      <slot name="voyage-col-card" />
    </v-row>
  </v-container>
</template>
