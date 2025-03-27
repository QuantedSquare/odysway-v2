<template>
  <div class="h-100 d-flex justify-center align-center ga-4 ">
    <v-card
      v-for="item of items"
      :key="item.title"
      :image="item.image"
      :href="item.slug"
      height="150"
      width="150"
    >
      <v-card-title class="position-absolute bottom-0 text-white no-white-space text-shadow">
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
