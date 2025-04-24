<template>
  <v-container
    id="faq-container"
    fluid
    class="rounded-xl py-8 mt-8 position-relative"
  >
    <div
      class="bg-cover-image rounded-xl position-absolute"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    >
      <div class="gradient-overlay rounded-xl" />
    </div>
    <h2 class="text-center position-relative">
      <slot name="section-title" />
    </h2>
    <v-container
      max-width="900px"
      class="position-relative"
    >
      <v-row>
        <v-col>
          <slot name="faq" />
        </v-col>
      </v-row>
      <v-row class="mb-10">
        <v-col>
          <div
            v-if="!route.path.includes('faq')"
            class="text-center text-h5 text-white font-weight-bold"
          >
            <span> D'autres questions? </span>
            <NuxtLink
              to="/faq"
              class="text-secondary font-weight-bold"
            >Consulter notre FAQ</NuxtLink>
          </div>
          <div class="text-center text-subtitle-1 text-white font-weight-bold d-flex flex-column mt-6">
            <span>Si vous ne trouvez pas la réponse que vous cherchez</span>
            <span>n'hésitez pas à <NuxtLink
              to="/calendry"
              class="text-secondary font-weight-bold"
            >nous contacter.</NuxtLink></span>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { NuxtLink } from '#components'

defineProps({
  backgroundImage: {
    type: String,
    default: '/images/b27a23f333a8c96567d46c123d1efb15.jpeg',
  },
  primaryColor: {
    type: String,
    default: 'rgba(43, 76, 82, 0)',
  },
  secondaryColor: {
    type: String,
    default: 'rgba(43, 76, 82, 0.8)',
  },
})

const route = useRoute()
</script>

<style scoped>
.bg-cover-image{
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  inset: 0;
}
.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, v-bind(secondaryColor) 0%, v-bind(primaryColor) 100%);
  pointer-events: none;
}
</style>
