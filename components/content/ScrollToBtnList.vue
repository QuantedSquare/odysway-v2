<template>
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
</template>

<script setup>
import { mdiFileDocumentOutline, mdiAirplane, mdiBed, mdiCar } from '@mdi/js'

const iconsList = [
  mdiFileDocumentOutline,
  mdiAirplane,
  mdiBed,
  mdiCar,
]
const { currentSection } = inject('current', 0)
const cardsList = inject('cardsList', [])
const scrollToSection = inject('scrollToSection', indexToRecover => console.log('Don\t forget to provide a function', indexToRecover))

const icons = computed(() => {
  return Array.from(cardsList?.value).map((card, index) => {
    return iconsList[index]
  })
})
</script>

<style scoped>
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
  }
.nav-dot.text-secondary {
  border: 2px solid rgba(var(--v-theme-secondary));
  transform: scale(1.1);
}
</style>
