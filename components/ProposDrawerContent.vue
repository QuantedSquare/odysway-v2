<template>
  <div class="h-100 d-flex justify-center align-center ga-4 ">
    <v-card
      v-for="item of items"
      :key="item.title"
      :image="item.image"
      :href="item.slug"
      height="120"
      width="120"
    >
      <v-card-title class="position-absolute bottom-0 text-white text-subtitle-1 font-weight-bold no-white-space text-shadow">
        {{ item.title }}
      </v-card-title>
    </v-card>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>
