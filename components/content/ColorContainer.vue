<template>
  <v-container
    class="rounded-lg py-md-8 px-0  px-md-8 mt-4 mt-md-8 max-container-width"
    :class="['bg-' + color, { 'text-white': whiteText }]"
    fluid
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
