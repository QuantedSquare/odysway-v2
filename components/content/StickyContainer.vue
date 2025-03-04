<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        :md="Number(leftSpace)"
      >
        <slot name="left-side" />
      </v-col>
      <v-col
        class="d-none d-md-block"
        :md="Number(rightSpace)"
      >
        <slot name="right-side" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  leftSpace: {
    type: String,
    default: '8',
  },
  rightSpace: {
    type: String,
    default: '4',
  },
})
</script>
