<template>
  <div
    class="scroll-container mt-md-16 "
  >
    <div
      ref="scrollContainer"
      class=" relative"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @touchstart="startTouchDrag"
      @touchmove="onTouchDrag"
      @touchend="endTouchDrag"
    >
      <div
        ref="cardContainerRef"
        class="cards-wrapper will-change"
        :style="cardsTransform"
      >
        <ClientOnly>
          <slot />
        </ClientOnly>
      </div>
      <div class="d-none d-md-block blur-gradient-left" />
      <div class="blur-gradient-right" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'

const { width } = useDisplay()

const scrollContainer = ref(null)
const currentSection = ref(0)
const updateCurrentSection = (index) => {
  currentSection.value = index
  console.log('index', index)
}

const registeredComponents = ref([])

const registerComponent = (component) => {
  const index = registeredComponents.value.length
  registeredComponents.value.push(component)
  return index
}

const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const cardWidth = ref(0)
const cardContainerRef = useTemplateRef('cardContainerRef')

onMounted(() => {
  nextTick(() => {
    cardWidth.value = cardContainerRef.value?.children[0].getBoundingClientRect().width
    centerCard(currentSection.value)
  })
})

provide('current', { currentSection, updateCurrentSection })
provide('registerComponent', registerComponent)
provide('currentCard', currentSection)

const cardsList = computed(() => {
  return cardContainerRef.value?.children || []
})

const minXPosition = computed(() => {
  return -((cardsList.value?.length - 1) * cardWidth.value)
})

const startDrag = (e) => {
  isDragging.value = true
  startX.value = e.clientX - currentX.value
  document.body.style.cursor = 'grabbing'
}

const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  const newX = e.clientX - startX.value

  // Only allow movement if:
  // 1. Moving right (newX < currentX) when not at right boundary
  // 2. Moving left (newX > currentX) when not at left boundary
  if (
    (newX < (currentX.value + 10) && currentX.value > minXPosition.value)
    || (newX > currentX.value && currentX.value < 0)
  ) {
    currentX.value = Math.min(-minXPosition.value, Math.max(minXPosition.value, newX))
    // console.log('currentX', currentX.value)
  }
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.body.style.cursor = ''
  snapToNearestCard()
}

// Add touch event handlers
const startTouchDrag = (e) => {
  isDragging.value = true
  startX.value = e.touches[0].clientX - currentX.value
}

const onTouchDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()

  const newX = e.touches[0].clientX - startX.value

  if (
    (newX < (currentX.value + 10) && currentX.value > minXPosition.value)
    || (newX > currentX.value && currentX.value < 0)
  ) {
    currentX.value = Math.min(-minXPosition.value, Math.max(minXPosition.value, newX))
    // console.log('currentX', currentX.value)
  }
}

const endTouchDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  snapToNearestCard()
}

// Extract the snapping logic to a separate function to avoid code duplication
const snapToNearestCard = () => {
  const nearestSection = Math.round(currentX.value / cardWidth.value)
  currentSection.value = Math.abs(nearestSection)
  centerCard(currentSection.value)
}
const centerCard = (index) => {
  // Wait for next tick to ensure DOM is updated
  nextTick(() => {
    const viewportWidth = width.value > 0 ? width.value : (document.documentElement.clientWidth || window.innerWidth)
    const card = cardContainerRef.value?.children[index]

    if (!card) return

    // Get the card's current position and dimensions
    const cardRect = card.getBoundingClientRect()
    const cardCenter = cardRect.left + (cardRect.width / 2)
    const screenCenter = viewportWidth / 2

    // Calculate the precise offset needed to center
    const offset = screenCenter - cardCenter

    // Apply the offset with boundaries
    currentX.value = Math.min(-minXPosition.value, Math.max(minXPosition.value, currentX.value + offset))
  })
}
const scrollToSection = (index) => {
  isDragging.value = false
  currentSection.value = index

  // Force a layout recalculation before centering
  requestAnimationFrame(() => {
    centerCard(index)
  })
}
const cardsTransform = computed(() => ({
  transform: `translateX(${currentX.value}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}))

defineExpose({
  scrollToSection,
  currentSection,
  cardsList,
  updateCurrentSection,
})
</script>

<style scoped>
.relative{
  position: relative;
}
.scroll-container {
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  /* cursor: grab; */
  user-select: none;
  position: relative;
  width: 75%;
}
@media screen and (max-width: 1280px) {
  .scroll-container {
    width: 100%;
  }

}
.blur-gradient-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 150px;
  background: linear-gradient(to right, #f5f5f0 0%, rgba(245, 245, 240, 0) 100%);
  mask: linear-gradient(0.25turn, black, black, transparent);
  backdrop-filter: blur(1px);
  pointer-events: none;
  z-index: 2
}
.blur-gradient-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 150px;
  background: linear-gradient(to left, #f5f5f0 0%, rgba(245, 245, 240, 0) 100%);
  mask: linear-gradient(0.25turn, transparent, black, black);
  backdrop-filter: blur(1px);
  pointer-events: none;
  z-index: 2
}

.cards-wrapper {
  display: inline-flex;
  gap:1em;
  will-change: transform;
  pointer-events: auto;
  }

.nav-dot {
  width: 70px;
  height: 70px;
  margin: 0 8px;
  border-radius: 50%;
  border: 2px solid rgba(var(--v-theme-primary));
  background: transparent;
  color: rgba(var(--v-theme-primary));
  transition: all 0.3s ease;
}
.icon-size{
  font-size: 25px;
}
@media screen and (max-width: 600px) {
  .nav-dot {
    width: 40px;
    height: 40px;
  }
  .icon-size{
    font-size: 20px;
  }
  .cards-wrapper {
     transform: none;
  }
    .blur-gradient-right{
      display: none;
    }
  }
.nav-dot.text-secondary {
  border: 2px solid rgba(var(--v-theme-secondary));
  transform: scale(1.1);
}

.will-change {
  will-change: transform;
}
</style>
