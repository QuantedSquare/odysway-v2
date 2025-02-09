<template>
  <div class="bg-cream min-height d-flex align-center">
    <v-container
      fluid
      class="pa-0"
    >
      <div class="d-flex">
        <div
          class="px-16 pt-16 title-wrapper will-change d-flex flex-column justify-center"
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
        <div class="scroll-container mt-16">
          <div
            ref="scrollContainer"
            class="d-flex justify-start relative"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
          >
            <div
              class="cards-wrapper will-change"
              :style="cardsTransform"
            >
              <div
                v-for="(card, index) in cards"
                :key="index"
                class="product-card pa-"
                :class="{ 'card-unfocused': currentSection !== index }"
                :style="{
                  transform: `scale(${currentSection === index ? 1 : 0.95})`,
                  opacity: currentSection === index ? 1 : 0.6,
                }"
              >
                <p class="text-secondary text-h5 ">
                  {{ String(index + 1).padStart(2, '0') }}.
                </p>
                <h3 class="text-h5 mb-10">
                  {{ card.title }}
                </h3>
                <p class="text-body-2">
                  {{ card.description }}
                </p>
                <div
                  class="card-overlay"
                  :style="{
                    opacity: currentSection === index ? 0 : 1,
                  }"
                />
              </div>
            </div>
            <div class="blur-gradient-left" />
            <div class="blur-gradient-right" />
          </div>
        </div>
      </div>

      <div class="py-16 d-flex justify-center align-center mt-6">
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
                @click="scrollToSection(index)"
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
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { mdiFileDocumentOutline, mdiAirplane, mdiBed, mdiFood, mdiCar, mdiDotsHorizontal } from '@mdi/js'

const scrollContainer = ref(null)
const currentSection = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const dragStartX = ref(0)

const cards = [
  {
    title: 'Des séjours immersifs pour voyager autrement',
    description: 'Des voyages conçus avec soin et passion pour vous faire découvrir l’intimité d’une région ou d\'un pays, au- delà des clichés, de la manière la plus durable possible.',
  },
  {
    title: 'Des départs en petits groupes ou privatifs',
    description: 'Chez Odysway, voyagez comme vous le souhaitez : rejoignez un petit groupe pour partager ou privatisez votre séjour. Le choix est entre vos mains !',
  },
  {
    title: 'Une agence proche de vous',
    description: 'Votre conseiller(ère) voyage vous accompagne à chaque étape, avec écoute et disponibilité. En restant en contact direct via WhatsApp, nous veillons à ce que votre voyage soit fluide et serein, du premier échange jusqu’à votre retour.',
  },
  {
    title: 'Activities',
    description: 'Our smart flight inventory system offers the best prices and options fast. For each Travel Plan, the dates and time of flights determine all transfer details to ensure a seamless experience.',
  },
]

const icons = [
  mdiFileDocumentOutline,
  mdiAirplane,
  mdiBed,
  mdiFood,
  // mdiCar,
  // mdiDotsHorizontal,
]

const minXPosition = computed(() => {
  const cardWidth = 322 // card width + margin
  return -((cards.length - 1) * cardWidth)
})

const startDrag = (e) => {
  isDragging.value = true
  startX.value = e.clientX - currentX.value
  dragStartX.value = currentX.value
  document.body.style.cursor = 'grabbing'
}

const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()

  // Calculate the new position
  const newX = e.clientX - startX.value

  // Clamp the position between the minimum (rightmost) and maximum (leftmost) bounds
  currentX.value = Math.min(0, Math.max(minXPosition.value, newX))
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.body.style.cursor = ''

  // Calculate snap position
  const cardWidth = 322 // card width + margin
  const nearestSection = Math.round(currentX.value / cardWidth)
  const targetX = nearestSection * cardWidth

  // Ensure the target position is within bounds
  currentX.value = Math.min(0, Math.max(minXPosition.value, targetX))
  currentSection.value = Math.abs(Math.round(currentX.value / cardWidth))
}

const cardsTransform = computed(() => ({
  transform: `translateX(${currentX.value}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
}))

const scrollToSection = (index) => {
  isDragging.value = false
  const cardWidth = 322
  currentX.value = -index * cardWidth
  currentSection.value = index
}
</script>

<style scoped>
.min-height{
  min-height: 50vh;
}

.scroll-container {
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
  user-select: none;
  position: relative;
  position: relative;
  width: 100%;
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
  z-index: 2;
}

/* .blur-gradient-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 150px;
  background: linear-gradient(to left, #f5f5f0 0%, rgba(245, 245, 240, 0) 100%);
  mask: linear-gradient(0.25turn, transparent, black, black);
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 2;
} */

.scroll-container:active {
  cursor: grabbing;
}

.title-wrapper {
  width: 3.9em;
  font-size: 72px;
  will-change: transform;
  margin: 0 1.2em;
}

.cards-wrapper {
  display: inline-flex;
  will-change: transform;
  pointer-events: none;
  white-space:normal;
  padding: 0 150px;

}

.product-card {
  min-width: 20em;
  min-height:25em;
  border: 2px solid rgba(var(--v-theme-grey-lighten-2));
  border-radius: 16px;
  margin-right: 24px;
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

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.card-unfocused {
  transform: scale(0.95);
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
  .title-wrapper {
    margin: 0 0.6em 0 0;
  }

}

.nav-dot.text-secondary {
  border: 2px solid rgba(var(--v-theme-secondary));
  transform: scale(1.1);
}

.will-change {
  will-change: transform;
}

.ga-10 {
  gap: 10px;
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
