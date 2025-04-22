<template>
  <v-container
    fluid
    class="rounded-xl py-8"
    :class="['bg-' + color, { 'text-white': whiteText }]"
  >
    <slot />
  </v-container>
</template>

<script setup>
defineProps({
  color: { type: String, default: 'primary' },
  whiteText: { type: Boolean, default: false },
})
</script>

<style scoped>
.text-white {
  color: white!important;
}
</style>
