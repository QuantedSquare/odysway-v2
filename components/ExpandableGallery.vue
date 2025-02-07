<template>
  <div class="image-gallery">
    <div
      v-for="image in images || imagesPlaceholder"
      :key="image"
      class="image-wrapper"
    >
      <img
        :src="image"
        :alt="image"
      >
    </div>
  </div>
</template>

<script setup>
defineProps({
  images: {
    type: Array,
    required: false,
  },
})

const imagesPlaceholder = [
  'https://images.unsplash.com/photo-1709884735646-897b57461d61?q=80&w=3628&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1502085671122-2d218cd434e6?q=80&w=3626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
]
</script>

<style scoped>
.image-gallery {
  display: flex;
  height: 24rem;
  width: 100%;
  gap: 0.5rem;
}

.image-wrapper {
  position: relative;
  display: flex;
  height: 100%;
  flex: 1;
  cursor: pointer;
  overflow: hidden;
  border-radius: 0.75rem;
  transition: all 0.5s ease-in-out;
}

.image-wrapper:hover {
  flex: 3;
}

.image-wrapper img {
  position: relative;
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
