<template>
  <v-container>
    <v-row
      justify="center"
      align="center"
      no-gutters
    >
      <v-col
        class=" font-weight-black text-h2 mt-md-3"
      >
        <slot name="title" />
      </v-col>
      <v-col
        v-if="id"
        cols="auto"
      >
        <div :id="id" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    default: '',
  },
})
</script>
