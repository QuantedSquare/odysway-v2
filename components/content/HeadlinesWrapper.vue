<template>
  <div class="bg-cream">
    <v-container>
      <v-row class="d-flex flex-column flex-md-row pt-4 ">
        <div
          class="pt-md-16 mb-4 mb-md-0  will-change align-center d-none d-md-flex flex-column justify-center"
        >
          <h1 class="text-h4 text-md-h2 font-weight-light mb-4 text-no-wrap">
            Ce<br>
            que nous<br>
            <span class="text-secondary">proposons</span>
          </h1>
          <div class="text-caption text-grey text-no-wrap">
            DRAG AND DROP
          </div>
        </div>
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
      </v-row>

      <div class="pt-12 py-md-16 d-flex justify-center align-center mt-md-6">
        <v-divider />
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <div
              v-for="(icon, index) in icons"
              :key="index"
              class="d-flex align-center"
            >
              <v-btn
                :class="['nav-dot', { 'text-secondary': currentSection === index }]"
                icon
                variant="outlined"
                @click.stop="scrollToSection(index)"
              >
                <v-icon class="icon-size">
                  {{ icon }}
                </v-icon>
              </v-btn>
              <v-divider />
            </div>
          </div>
        </div>
        <v-divider color="primary" />
      </div>
      <h1
        class="d-block d-md-none text-h5 font-weight-light text-no-wrap text-center my-6"
      >
        Ce que nous
        <span class="text-secondary">proposons</span>
      </h1>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { mdiFileDocumentOutline, mdiAirplane, mdiBed, mdiCar } from '@mdi/js'

const scrollContainer = ref(null)
const currentSection = ref(0)
const updateCurrentSection = (index) => {
  console.log('index', index)
  // scrollToSection(index)

  // centerCard(index)
}
provide('current', { currentSection, updateCurrentSection })
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const cardWidth = ref(0)
const cardContainerRef = useTemplateRef('cardContainerRef')
const totalCards = ref(0)
const icons = ref([])
const cardDelta = ref(0)

const iconsList = [
  mdiFileDocumentOutline,
  mdiAirplane,
  mdiBed,
  mdiCar,
]

onMounted(() => {
  nextTick(() => {
    totalCards.value = cardsList.value.length
    // Apply initial button and card position
    Array.from(cardsList.value).forEach((card, index) => {
      icons.value.push(iconsList[index])
    })
    cardWidth.value = cardContainerRef.value?.children[0].getBoundingClientRect().width
    // CardDelta calculate the difference between the first card which is bigger and the others at the first
    // A focused card will be centered in the middle of the screen and bigger than the others
    // Focused get transform: scale(1)
    // Unfocused get transform: scale(0.95)
    cardDelta.value = cardWidth.value - cardContainerRef.value?.children[1].getBoundingClientRect().width
    centerCard(currentSection.value)
  })
})

const cardsList = computed(() => {
  return cardContainerRef.value?.children || []
})

const minXPosition = computed(() => {
  return -((totalCards.value - 1) * cardWidth.value)
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
  console.log('newX', newX, 'currentX.value', currentX.value, 'minXPosition.value', minXPosition.value)

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
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth
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

.scroll-container:active {
  /* cursor: grabbing; */
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
