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
    <v-divider v-if="showDivider" />
  </v-row>
</template>

<script setup>
defineProps(['left', 'right', 'showDivider'])
</script>
