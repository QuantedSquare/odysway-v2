<template>
  <div class="avatar-list">
    <v-avatar
      v-for="(item, index) in items"
      :key="item.id"
      v-bind="getAvatarProps(index)"
      @click="model = index"
    >
      <v-img
        v-if="item.photo"
        :src="formatImage(item.photo)"
        :alt="`Photo de ${item.author}`"
        cover
      />
      <span v-else>{{ getInitial(item.author) }}</span>
    </v-avatar>
  </div>

  <div
    v-if="selectedItem"
    class="text-dark d-flex flex-column align-center"
  >
    <span class="text-h6 font-weight-bold">{{ selectedItem.author }}</span>
    <span>{{ selectedItem.authorAge }} ans</span>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})
const model = defineModel()

const img = useImage()

const selectedItem = computed(() => props.items[model.value])

const getAvatarProps = index => ({
  class: [
    'avatar-wrapper',
    { 'opacity-100': model.value === index, 'opacity-50': model.value !== index },
  ],
  border: model.value === index ? 'lg' : '',
  size: model.value === index ? '70' : '60',
  color: model.value === index ? 'primary' : '',
})

// Helper functions
const formatImage = photo => img(photo, {
  format: 'webp',
  quality: 70,
  height: 100,
  width: 320,
})

const getInitial = name => name[0]
</script>

<style scoped>
.avatar-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.avatar-wrapper {
  position: relative;
  margin: 0.5rem 0.75rem;
  display: inline-block;
  transition: all 0.2s ease-in-out;
}

.avatar-wrapper:hover {
  z-index: 30;
  transform: scale(1.1);
}
</style>
