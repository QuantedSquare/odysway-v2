<template>
  <div class="mt-16">
    <v-container>
      <v-row class="bg-primary d-flex flex-column align-center flex-md-row row-height  rounded-xl">
        <div class="coma-absolute bg-primary-light rounded-circle pa-6 z-2  ">
          <v-img
            src="/images/ancv.png"
            height="100"
            width="100"
          />
        </div>
        <v-col
          cols="12"
          md="4"
          class="z-2 d-flex flex-column justify-center text-center ga-4 align-center text-white mt-10"
        >
          <h2 class="text-h4 text-md-h3 text-shadow mt-6 ">
            Les mots de nos voyageurs
          </h2>
          <div class=" text-body-1">
            Ce que les personnes ayant voyagé avec Odysway disent de nous
          </div>
          <NuxtLink
            to="https://fr.trustpilot.com/review/odysway.com"
            target="blank"
          >
            <span class="text-white">
              Lire d'autres avis
            </span>
            <v-btn
              :icon="mdiChevronRight"
            />
          </NuxtLink>
        </v-col>

        <DraggingContainer
          ref="draggingContainerRef2"
          class="card-container"
        >
          <slot />
        </DraggingContainer>
        <v-col
          cols="12"
          class="d-flex justify-center align-center ga-4 mt-10"
        >
          <v-btn
            variant="outlined"
            color="white"
            :disabled="currentSection === 0"
            :icon="mdiChevronLeft"
            @click="scrollToSection(currentSection - 1)"
          />
          <v-btn
            variant="outlined"
            color="white"
            :disabled="currentSection === cardsList.length - 1"
            :icon="mdiChevronRight"
            @click="scrollToSection(currentSection + 1), console.log('currentSection', currentSection)"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { mdiChevronRight, mdiChevronLeft } from '@mdi/js'

const scrollToSection = ref(null)
const cardsList = ref([])
const draggingContainerRef = useTemplateRef('draggingContainerRef2')

const currentSection = computed(() => {
  return draggingContainerRef.value?.currentSection || 0
})

onMounted(() => {
  setTimeout(async () => {
    await nextTick()
    if (draggingContainerRef.value) {
      scrollToSection.value = draggingContainerRef.value.scrollToSection
      cardsList.value = draggingContainerRef.value.cardsList
      // Force an initial centering
      if (typeof draggingContainerRef.value.scrollToSection === 'function') {
        draggingContainerRef.value.scrollToSection(0)
        console.log('scrollToSection', scrollToSection.value)
      }
    }
  }, 200)
  draggingContainerRef.value.scrollToSection(0)
})
</script>

<style scoped>
.z-2{
  z-index: 2;
}
.coma-absolute{
  position: absolute;
  top: -15%;
  left:15%;
}

.card-container{
  position: absolute;
  height: 100%;
  top:-20%;
  max-width:100%;

}
.row-height{
  min-height: 500px;
  position: relative;
}

.relative{
  position: relative;
}
.will-change {
  will-change: transform;
}

@media screen and (max-width: 1024px) {
  .row-height{
    height: 100%;
  }
  .card-container{
    position:relative;
    margin-top: 2em;
  }
  .coma-absolute{
    top:-10%;
    left:40%;
  }

}
</style>
