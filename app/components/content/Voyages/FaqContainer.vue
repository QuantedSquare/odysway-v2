<template>
  <v-container
    id="faq-container"
    fluid
    class="rounded-lg px-1 py-0 mt-4 mt-md-8 max-container-width"
  >
    <v-img
      v-if="faqBackgroundURL"
      :src="faqBackgroundURL"
      :lazy-src="faqBackgroundLazy"
      sizes="(max-width: 600px) 100vw, (max-width: 960px) 960px, 1536px"
      :srcset="faqBackgroundSrcset"
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
import imageUrlBuilder from '@sanity/image-url'

const config = useRuntimeConfig()
const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

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

// Build optimized Sanity URLs with proper sizes for FAQ background
const buildSanityImageUrl = (width, quality = 60) => {
  if (!faqSanity?.value?.backgroundImage?.asset?._ref) return ''
  return builder
    .image(faqSanity.value.backgroundImage.asset._ref)
    .width(width)
    .format('webp')
    .quality(quality)
    .fit('max')
    .url()
}

const faqBackgroundURL = computed(() => {
  return buildSanityImageUrl(600, 55)
})

const faqBackgroundSrcset = computed(() => {
  if (!faqSanity?.value?.backgroundImage?.asset?._ref) return ''
  return [
    `${buildSanityImageUrl(400, 50)} 400w`,
    `${buildSanityImageUrl(600, 55)} 600w`,
    `${buildSanityImageUrl(960, 60)} 960w`,
    `${buildSanityImageUrl(1536, 70)} 1536w`,
  ].join(', ')
})

const faqBackgroundLazy = computed(() => {
  return buildSanityImageUrl(600, 10)
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
