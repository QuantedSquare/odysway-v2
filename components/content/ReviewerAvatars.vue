<template>
  <v-col
    cols="12"
    class="d-flex flex-column align-center"
  >
    <div class="avatar-list">
      <v-avatar
        v-for="(item, index) in items"
        :key="item.id"
        v-bind="getAvatarProps(index)"
        @mouseenter="handleMouseEnter($event, index)"
        @click="handleAvatarClick(index)"
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
  </v-col>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['change-index'])
const img = useImage()

const selectedIndex = ref(0)
const selectedItem = computed(() => props.items[selectedIndex.value])

const getAvatarProps = index => ({
  class: [
    'avatar-wrapper',
    { 'opacity-100': selectedIndex.value === index, 'opacity-50': selectedIndex.value !== index },
  ],
  border: selectedIndex.value === index ? 'lg' : '',
  size: selectedIndex.value === index ? '70' : '60',
  color: selectedIndex.value === index ? 'primary' : '',
})

// Helper functions
const formatImage = photo => img(photo, {
  format: 'webp',
  quality: 70,
  height: 100,
  width: 100,
})

const getInitial = name => name[0]

// Event handlers
const handleMouseEnter = (event, index) => {
  selectedIndex.value = index
  emit('change-index', index)
}

const handleAvatarClick = (index) => {
  selectedIndex.value = index
}
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
