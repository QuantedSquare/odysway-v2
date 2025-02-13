<template>
  <v-container>
    <v-row
      justify="center"
      align="center"
      no-gutters
    >
      <v-col
        class="text-dark font-weight-black text-h5 text-md-h4 my-6"
      >
        <slot />
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
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})
</script>
