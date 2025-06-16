<template>
  <v-container
    id="faq-container"
    fluid
    class="rounded-lg px-2 px-md-9 py-0 mt-4 mt-md-8 max-container-width"
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
        <h2 class="text-center text-white">
          <TitleContainer>
            <template #title>
              <slot name="section-title" />
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
              <slot name="faq" />
            </v-col>
          </v-row>
          <v-row
            class="mb-10 text-shadow"
            justify="center"
          >
            <v-col cols="7">
              <div
                v-if="route.path !== '/faq'"
                class="text-center text-h5 text-white font-weight-bold"
              >
                <span> {{ faqTextes?.faqSection?.faqHomeSubText?.question }} &nbsp; </span>
                <NuxtLink
                  to="/faq"
                  class="text-secondary font-weight-bold"
                > {{ faqTextes?.faqSection?.faqHomeSubText?.text }} </NuxtLink>
              </div>
              <div class="text-center text-h5 text-white font-weight-regular d-flex flex-column mt-6">
                <span> {{ faqTextes?.faqSection?.faqHomeSubText?.subtitle }}
                  <NuxtLink
                    :to="faqTextes?.faqSection?.faqHomeSubText?.linkOnText2"
                    class="text-secondary"
                  >{{ faqTextes?.faqSection?.faqHomeSubText?.text2 }}</NuxtLink>
                </span>
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

const { data: faqTextes } = await useAsyncData('faq-textes', () => {
  return queryCollection('ctas').select('faqSection').first()
})
</script>

<style scoped>
.max-container-width{
  max-width: 1440px;
}

.max-height-with-overflow {
  max-height: 500px;
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
</style>
