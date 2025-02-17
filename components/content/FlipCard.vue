<template>
  <div
    :class="props.class"
    class="flip-card"
    @click="toggleFlip"
  >
    <div
      class="flip-card-inner"
      :class="[rotation[0], { 'is-flipped': isFlipped }]"
    >
      <!-- Front -->
      <div class="flip-card-front">
        <v-img
          :src="props.frontImage"
          alt="image"
          class="card-image"
          cover
        />
        <div class="card-title">
          {{ props.title }}
        </div>
      </div>
      <!-- Back -->
      <div
        class="flip-card-back"
        :class="rotation[1]"
      >
        <v-img
          :src="props.backImage"
          alt="image"
          class="card-image"
          cover
        />
        <div class="card-title">
          Placeholder text à remplacer
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  frontImage: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  rotate: {
    type: String,
    default: 'y',
    validator: value => ['x', 'y'].includes(value),
  },
  backImage: {
    type: String,
    default: '',
  },
  class: {
    type: String,
    default: '',
  },
})

const isFlipped = ref(false)

const rotationClass = {
  x: ['flip-x-front', 'flip-x-back'],
  y: ['flip-y-front', 'flip-y-back'],
}

const rotation = computed(() => rotationClass[props.rotate])

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
}
</script>

<style scoped>
.flip-card {
  height: 20rem;
  width: 40rem;
  perspective: 1000px;
  cursor: pointer;
}
.flip-card-inner:hover{
 box-shadow: 5px 5px 7px rgba(0, 0, 0, 0.3);
}

.flip-card-inner {
  position: relative;
  height: 100%;
  border-radius: 1rem;
  transition: all 0.5s;
  transform-style: preserve-3d;
}

/* Remove hover styles and replace with is-flipped class */
.flip-card-inner.flip-x-front.is-flipped {
  transform: rotateX(180deg);
}

.flip-card-inner.flip-y-front.is-flipped {
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
