<template>
  <v-container>
    <v-row
      justify="center"
      align="center"
      no-gutters
    >
      <v-col
        class="text-dark font-weight-black text-h2 my-4"
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
