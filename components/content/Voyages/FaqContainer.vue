<template>
  <v-container
    id="faq-container"
    fluid
    class="rounded-xl py-8 mt-8"
    :style="`background-image: linear-gradient(rgba(43, 76, 82, 0), rgba(43, 76, 82, 0.8)), url(${backgroundImage});`"
  >
    <h2 class="text-center">
      <slot name="section-title" />
    </h2>
    <v-container max-width="900px">
      <v-row>
        <v-col>
          <v-expansion-panels
            multiple
          >
            <slot name="faq" />
          </v-expansion-panels>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div
            v-if="!route.path.includes('faq')"
            class="text-center text-h5 text-white font-weight-bold"
          >
            <span> D’autres questions? </span>
            <NuxtLink
              to="/faq"
              class="text-secondary font-weight-bold"
            >Consulter notre FAQ</NuxtLink>
          </div>
          <div class="text-center text-subtitle-1 text-white font-weight-bold d-flex flex-column mt-6">
            <span>Si vous ne trouvez pas la réponse que vous cherchez</span>
            <span>n’hésitez pas à <NuxtLink
              to="/calendly"
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
})

const route = useRoute()
console.log(route.path)
</script>
