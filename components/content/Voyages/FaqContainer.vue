<template>
  <v-container
    id="faq-container"
    fluid
    class="rounded-lg px-4 px-md-0 py-0 px-md-8 mt-4 mt-md-8 position-relative"
  >
    <v-lazy
      :min-height="415"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    >
      <v-img
        :src="img(backgroundImage, { format: 'webp', quality: 70, height: 900, width: 1536 })"
        :lazy-src="img(backgroundImage, { format: 'webp', quality: 10, height: 900, width: 1536 })"
        :srcset="`${img(backgroundImage, { format: 'webp', quality: 70, width: 1536 })} 1536w, ${img(backgroundImage, { format: 'webp', quality: 70, width: 1536 })} 1536w`"
        sizes="(max-width: 600px) 480px, 1536px"
        loading="lazy"
        alt="Image de fond de la section FAQ"
        cover
        class="rounded-lg"
        :gradient="`to top, ${secondaryColor}, ${primaryColor}`"
      >
        <h2 class="text-center text-white my-6">
          <TitleContainer>
            <template #title>
              Questions fréquentes
            </template>
          </TitleContainer>
        </h2>
        <v-container
          max-width="900px"
          class="position-relative px-4 pt-0"
        >
          <v-row>
            <v-col
              class="max-height-with-overflow pt-2 pt-md-3"
            >
              <template
                v-for="faq in faqDefault.content"
                :key="faq"
              >
                <QuestionPanel>
                  <template #question>
                    {{ faq.question }}
                  </template>
                  <template #answer>
                    {{ faq.answer }}
                  </template>
                </QuestionPanel>
              </template>
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
                  to="/calendly"
                  class="text-secondary font-weight-bold"
                >nous contacter.</NuxtLink></span>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-img>
    </v-lazy>
  </v-container>
</template>

<script setup>
import { NuxtLink } from '#components'
import { useImage } from '#imports'

const img = useImage()
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

const { data: faqDefault } = await useAsyncData('faq-default', () => {
  return queryCollection('faqDefault').first()
})
</script>

<style scoped>
/* .custom-title-position{
  padding-top: 15px;
} */

@media screen and (max-width: 600px) {
  /* .custom-title-position{
  padding-top: 12px;
} */
}

.max-height-with-overflow {
  max-height: 800px;
  overflow: auto;
}
::-webkit-scrollbar {
  width: 5px;

}
/* Track */
::-webkit-scrollbar-track {
  border: 7px solid white;
  background: #C5C7C9;
  height:10px;
  border-radius: 9px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background-color: #0808b6;
  border: 6px solid lightgrey;
  border-radius: 9px;
  background-clip: content-box;
  height:10px;
  width:10px;
  }
  /* @media (max-width: 960px) {
  .custom-rounded {
    border-radius: 0px!important;
  }
} */
</style>
