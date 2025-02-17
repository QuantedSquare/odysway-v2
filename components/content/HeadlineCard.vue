<template>
  <div
    ref="sectionRef"
    class="product-card"
    :class="{ 'card-unfocused': +currentSection !== +index }"
    :style="{
      transform: `scale(${+currentSection === +index ? 1 : 0.95})`,
      opacity: +currentSection === +index ? 1 : 0.6,
    }"
    @click="updateCurrentSection(index)"
  >
    <p class="text-secondary text-h6 text-mh-h5 ">
      {{ String(+index + 1).padStart(2, '0') }}.
    </p>
    <h3 class="text-h6 text-mh-h5 mb-10 ">
      <slot name="title" />
    </h3>
    <p
      class="text-body-2 fade-in-text"
      :class="{ 'is-visible': isVisible }"
    >
      <slot name="text" />
    </p>
    <div
      class="card-overlay"
      :style="{
        opacity: +currentSection === +index ? 0 : 1,
      }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  index: {
    type: String,
    default: '0',
  },
})
const { currentSection, updateCurrentSection } = inject('current')

const isVisible = ref(false)
const sectionRef = ref(null)

let observer

onMounted(async () => {
  await nextTick()

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            const delay = Number(el.dataset.index) * 100

            setTimeout(() => {
              el.querySelector('.fade-in-text').classList.add('is-visible')
            }, delay)
          }
          else {
            const el = entry.target
            el.querySelector('.fade-in-text').classList.remove('is-visible')
          }
        })
      },
      { threshold: 0.3 },
    )
  }

  if (sectionRef.value) {
    const el = sectionRef.value.$el ?? sectionRef.value
    el.dataset.index = props.index
    observer.observe(el)
  }
})

onUnmounted(() => {
  if (sectionRef.value && observer) {
    observer.unobserve(sectionRef.value.$el ?? sectionRef.value)
  }
})
</script>

<style scoped>
.fade-in-text {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.product-card {
  min-width: 320px;
  max-width: 320px;
  min-height:25em;
  border: 2px solid rgba(var(--v-theme-secondary));
  border-radius: 16px;
  position: relative;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
  will-change: transform, opacity;
  display:flex;
  flex-direction:column;
  justify-content:start;
  align-content: center;
  padding:5em 2em;
  gap:1em;
}

@media screen and (max-width: 600px) {
  .product-card {
  min-width: 250px;
  max-width: 250;
  min-height:20em;
  padding: 3em 1em;
  gap:0.2em;
  }
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
}

.card-unfocused {
  transform: scale(0.95);
  border: 2px solid rgba(var(--v-theme-grey-lighten-2));
}
@keyframes cardFocus {
  from {
    transform: scale(0.95);
    opacity: 0.6;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes cardUnfocus {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0.6;
  }
}
</style>
