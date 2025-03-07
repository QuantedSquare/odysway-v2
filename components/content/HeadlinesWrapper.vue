<template>
  <div class="bg-cream">
    <v-container>
      <v-row class="d-flex flex-column flex-md-row pt-4 row-height">
        <v-col
          cols="12"
          md="3"
          class="z-2 will-change  d-none d-md-flex  flex-column justify-center  ga-4 text-start text-white mt-10"
        >
          <h1 class="text-h4 text-md-h2 font-weight-light mb-4 text-no-wrap text-shadow">
            Ce<br>
            que nous<br>
            <span class="text-secondary">proposons</span>
          </h1>
        </v-col>

        <DraggingContainer
          ref="draggingContainerRef"
          class="card-container"
        >
          <slot />
        </DraggingContainer>
      </v-row>
      <ScrollToBtnList class="text-white" />
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
.z-2{
  z-index: 2;
}
.will-change {
  will-change: transform;
}
.row-height{
  min-height: 500px;
  position: relative;
}
.card-container{
  position: absolute;
  height: 100%;
  top:10%;
  max-width:100%;
}
@media screen and (max-width: 1024px) {
  .row-height{
    height: 100%;
  }
  .card-container{
    position:relative;
    margin-top: 2em;
  }

}
</style>
