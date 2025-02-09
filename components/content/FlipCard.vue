<template>
  <div
    :class="props.class"
    class="flip-card"
  >
    <div
      class="flip-card-inner"
      :class="rotation[0]"
    >
      <!-- Front -->
      <div class="flip-card-front">
        <img
          :src="props.image"
          alt="image"
          class="card-image"
        >
        <div class="card-title">
          {{ props.title }}
        </div>
      </div>

      <!-- Back -->
      <div
        class="flip-card-back"
        :class="rotation[1]"
      >
        <div class="card-content">
          <h1 class="card-subtitle">
            {{ props.subtitle }}
          </h1>
          <p class="card-description">
            {{ props.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FlipCardProps {
  image: string
  title: string
  subtitle?: string
  description: string
  rotate?: 'x' | 'y'
  class?: string
}

const props = withDefaults(defineProps<FlipCardProps>(), {
  rotate: 'y',
})

const rotationClass = {
  x: ['flip-x-front', 'flip-x-back'],
  y: ['flip-y-front', 'flip-y-back'],
}

const rotation = computed(() => rotationClass[props.rotate])
</script>

<style scoped>
.flip-card {
  height: 20rem;
  width: 40rem;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  height: 100%;
  border-radius: 1rem;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner.flip-x-front {
  transform: rotateX(180deg);
}

.flip-card:hover .flip-card-inner.flip-y-front {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
}

.flip-card-front {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.card-image {
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  object-fit: cover;
}

.card-title {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
}

.flip-card-back {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  color: #cbd5e1;
  transform: rotateY(180deg);
}

.flip-x-back {
  transform: rotateX(180deg);
}

.flip-y-back {
  transform: rotateY(180deg);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100%;
}

.card-subtitle {
  font-size: 1.25rem;
  font-weight: bold;
  color: rgb(0, 0, 0);
}

.card-description {
  margin-top: 0.25rem;
  padding-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  color: #000000;
}
</style>
