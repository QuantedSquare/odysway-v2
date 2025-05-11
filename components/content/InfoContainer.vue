<template>
  <v-container class="text-center d-flex flex-column ga-5">
    <slot name="top" />
    <v-row justify="center">
      <v-col cols="12">
        <h4
          class="text-h1"
          :class="whiteText ? 'text-white' : 'text-primary'"
        >
          <slot name="title" />
        </h4>
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <h5
          class="text-body-2"
          :class="whiteText ? 'text-white' : 'text-grey'"
        >
          <slot name="description" />
        </h5>
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
