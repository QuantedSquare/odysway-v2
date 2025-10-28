<template>
  <v-container
    id="faq-container"
    fluid
    class="rounded-lg px-1 py-0 mt-4 mt-md-8 max-container-width"
  >
    <v-img
      v-if="faqBackgroundURL"
      :src="img(faqBackgroundURL, { format: 'webp', quality: 55, height: 400, width: 600 })"
      :lazy-src="img(faqBackgroundURL, { format: 'webp', quality: 10, height: 400, width: 600 })"
      sizes="(max-width: 600px) 100vw, (max-width: 960px) 960px, 1536px"
      :srcset="`${img(faqBackgroundURL, { format: 'webp', quality: 50, width: 400 })} 400w, ${img(faqBackgroundURL, { format: 'webp', quality: 55, width: 600 })} 600w, ${img(faqBackgroundURL, { format: 'webp', quality: 60, width: 960 })} 960w, ${img(faqBackgroundURL, { format: 'webp', quality: 70, width: 1536 })} 1536w`"
      loading="lazy"
      :alt="faqSanity?.backgroundImage?.alt"
      cover
      width="100%"
      class="rounded-lg max-img-height"
      :gradient="imageGradient"
    >
      <h2 class="text-center text-white">
        <TitleContainerH1>
          <template #title>
            {{ faqSanity?.title }}
          </template>
        </TitleContainerH1>
      </h2>
      <v-container
        max-width="900px"
        class="position-relative px-4 pt-0"
      >
        <v-row>
          <v-col
            class="max-height-with-overflow pt-2 pt-md-3"
          >
            <QuestionPanel
              v-for="item in faqSanity?.faqItems"
              :key="item._key"
              :hide="item.hide && route.path !== '/faq'"
              :item="item"
            />
          </v-col>
        </v-row>
        <v-row
          class="mb-4 mb-md-10 text-shadow"
          justify="center"
        >
          <v-col cols="7">
            <div
              v-if="route.path !== '/faq'"
              class="text-center text-h6 text-md-h5 text-white font-weight-bold"
            >
              <span> {{ faqTextes?.faqSection?.faqHomeSubText?.question }} &nbsp; </span>
              <SmartLink
                to="/faq"
                :link-class="'text-secondary font-weight-bold'"
              >
                {{ faqTextes?.faqSection?.faqHomeSubText?.text }}
              </SmartLink>
            </div>
            <div class="text-center text-h6 text-md-h5 text-white font-weight-regular d-flex flex-column mt-md-6 mt-3">
              <span> {{ faqTextes?.faqSection?.faqHomeSubText?.subtitle }}
                <SmartLink
                  :to="faqTextes?.faqSection?.faqHomeSubText?.linkOnText2"
                  :link-class="'text-secondary font-weight-medium'"
                >
                  {{ faqTextes?.faqSection?.faqHomeSubText?.text2 }}
                </SmartLink>
              </span>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-img>
    <v-skeleton-loader
      v-else
      type="card"
    />
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useImage } from '#imports'

const img = useImage()

const primaryColor = 'rgba(43, 76, 82, 0)'
const secondaryColor = 'rgba(43, 76, 82, 0.8)'
const route = useRoute()

// Compute gradient to avoid reactivity issues during hydration
const imageGradient = computed(() => `to top, ${secondaryColor}, ${primaryColor}`)

const faqSanityQuery = `
  *[_type == "faq"][0]{
    ...
  }
`
const faqTextesQuery = `
  *[_type == "ctas"][0]{
    faqSection
  }
`
const sanity = useSanity()
const { data: faqSanity } = await useAsyncData(
  'faq-content',
  async () => {
    try {
      const result = await sanity.fetch(faqSanityQuery)
      return result || null
    }
    catch (e) {
      console.error('Error fetching FAQ content:', e)
      return null
    }
  },
  {
    server: true,
  },
)

const faqBackgroundURL = computed(() => {
  return getImageUrl(faqSanity?.value?.backgroundImage?.asset._ref)
})

const { data: faqTextes } = await useAsyncData(
  'faq-texts',
  async () => {
    try {
      const result = await sanity.fetch(faqTextesQuery)
      return result || null
    }
    catch (e) {
      console.error('Error fetching FAQ texts:', e)
      return null
    }
  },
  {
    server: true,
  },
)
</script>

<style scoped>
.max-height-with-overflow {
  height: 100%;
  max-height: 500px;
  overflow: auto;
}
.max-img-height {
  height: 100%;
  max-height: 800px;
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
