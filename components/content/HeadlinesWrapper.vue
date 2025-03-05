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
          <!-- <div class="text-caption text-grey text-no-wrap">
            DRAG AND DROP
          </div> -->
        </div>
        <DraggingContainer ref="draggingContainerRef">
          <slot />
        </DraggingContainer>
      </v-row>
      <ScrollToBtnList />
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
import { ref } from 'vue'

const scrollToSection = ref(null)
const cardsList = ref([])
const updateCurrentSection = ref(null)
const draggingContainerRef = useTemplateRef('draggingContainerRef')

const currentSection = computed(() => {
  return draggingContainerRef.value?.currentSection || 0
})

onMounted(() => {
  nextTick(() => {
    // Reattributing the values to provide it to another children
    scrollToSection.value = draggingContainerRef.value.scrollToSection
    cardsList.value = draggingContainerRef.value?.cardsList
    updateCurrentSection.value = draggingContainerRef.value?.updateCurrentSection
  })
})

provide('current', { currentSection, updateCurrentSection })
provide('scrollToSection', scrollToSection)
provide('cardsList', cardsList)
</script>

<style scoped>
.will-change {
  will-change: transform;
}
</style>
