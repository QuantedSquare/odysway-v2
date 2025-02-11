<template>
  <v-row
    justify="space-between"
    align="center"
  >
    <v-col>
      <span :class="left.classes">{{ left.text }}</span>
    </v-col>
    <v-col cols="auto">
      <span :class="right.classes">{{ right.text }}</span>
    </v-col>
  </v-row>
  <slot />
</template>

<script setup>
const props = defineProps(['left', 'right'])
</script>
