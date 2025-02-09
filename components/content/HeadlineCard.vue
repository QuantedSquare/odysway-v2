<template>
  <v-col
    ref="sectionRef"
    cols="12"
    md="4"
    class="text-dark"
  >
    <h2 class="my-6 pb-6 text-h5 font-weight-black">
      <slot name="title" />
    </h2>
    <div
      class="fade-in-text"
      :class="{ 'is-visible': isVisible }"
    >
      <slot name="text" />
    </div>
  </v-col>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  index: {
    type: String,
    default: '0',
  },
})

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
            const delay = Number(el.dataset.index) * 200

            setTimeout(() => {
              el.querySelector('.fade-in-text').classList.add('is-visible')
            }, delay)
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
// const attributedClasses = computed(() => {
//   return props.index === '1' ? 'container1' : ''
// })
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
/* .container1 {
  background-color: white;
  position: absolute;
  top:-100px;
  left:0;
} */
</style>
