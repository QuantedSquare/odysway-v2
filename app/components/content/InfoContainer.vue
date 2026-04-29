<template>
  <v-container class="text-center d-flex flex-column ga-5">
    <slot name="top" />
    <v-row justify="center">
      <v-col cols="12">
        <h2
          class="text-h1"
          :class="whiteText ? 'text-white' : 'text-primary'"
        >
          <slot name="title" />
        </h2>
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <p
          class="text-body-2 mb-0"
          :class="whiteText ? 'text-white' : 'text-grey-darken-2'"
        >
          <slot name="description" />
        </p>
      </v-col>
    </v-row>
    <v-row justify="center">
      <slot name="bottom" />
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  whiteText: { type: Boolean, default: false },
})
</script>
