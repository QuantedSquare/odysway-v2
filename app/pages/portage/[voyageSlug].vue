<template>
  <div>
    <PortagePageContent
      v-if="isPublished"
      :voyage="voyage"
      :page="page"
    />

    <ColorContainer
      v-else
      color="white"
    >
      <v-row
        justify="center"
        align="center"
      >
        <v-col
          cols="12"
          md="8"
        >
          <p class="text-center text-primary text-h3">
            {{ page.pageNotFound.description }}
          </p>
        </v-col>
        <v-col
          cols="12"
          class="d-flex justify-center"
        >
          <v-btn-secondary
            :to="page.pageNotFound.buttonTo"
            class="mt-8 mx-auto text-decoration-none"
          >
            {{ page.pageNotFound.buttonText }}
          </v-btn-secondary>
        </v-col>
      </v-row>
    </ColorContainer>
  </div>
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'

definePageMeta({
  layout: 'voyage',
})

const route = useRoute()
const config = useRuntimeConfig()
const { trackViewItem } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

const voyageSlugRef = computed(() => route.params.voyageSlug)
const [{ data: page }, { data: voyage }] = await Promise.all([
  useSanityQuery(VOYAGE_PAGE_QUERY),
  useSanityQuery(VOYAGE_QUERY, { slug: voyageSlugRef }),
])

// Page d'un voyage en portage (séjour d'un accompagnateur externe porté par
// Odysway) : servie seulement si le voyage est « sur-mesure » seul, marqué
// portage et publié dans Sanity. Comme /sur-mesure/<slug>, on n'y arrive que
// par le lien que l'accompagnateur partage à sa communauté ; mais ici les dates
// sont réservables en ligne, et les inscrits vont dans la pipeline AC 7.
const isPublished = computed(() => estPagePortage(voyage.value))

if (!isPublished.value && import.meta.server) {
  setResponseStatus(useRequestEvent(), 404)
}

onMounted(() => {
  // GTM: Track view_item event
  if (isPublished.value) {
    const formattedVoyage = formatVoyageForGtm(voyage.value)
    trackViewItem(formattedVoyage, voyage.value.pricing?.startingPrice)
  }
})

const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const buildMainImageUrl = (image, width, height, quality = 90) => {
  if (!image) return ''
  return builder
    .image(image)
    .width(width)
    .height(height)
    .auto('format')
    .quality(quality)
    .fit('crop')
    .url()
}

// Page hors listing : jamais indexée, whatever the voyage's SEO settings say.
// Ni données structurées ni fil d'Ariane : rien ne doit la signaler.
if (isPublished.value) {
  useSeo({
    seoData: { ...voyage.value.seo, canonicalUrl: null, robotsIndex: false, robotsFollow: false },
    content: voyage.value,
    pageType: 'website',
    slug: voyage.value.slug?.current,
    baseUrl: `/portage/${voyage.value.slug.current}`,
  })
}
if (import.meta.server) {
  useResponseHeader('X-Robots-Tag').value = 'noindex, nofollow'
}

// Image preload — reactive to handle lazy data
watchEffect(() => {
  if (!isPublished.value) return

  const image = voyage.value.image
  const link = []

  if (image) {
    // Must mirror the rendered <NuxtImg> srcset/sizes exactly, otherwise
    // the browser downloads a different URL than the preload (waste).
    const srcset = [
      `${buildMainImageUrl(image, 400, 225, 80)} 400w`,
      `${buildMainImageUrl(image, 600, 338, 80)} 600w`,
      `${buildMainImageUrl(image, 800, 450, 80)} 800w`,
      `${buildMainImageUrl(image, 1000, 563, 80)} 1000w`,
      `${buildMainImageUrl(image, 1400, 788, 80)} 1400w`,
    ].join(', ')

    link.push({
      rel: 'preload',
      as: 'image',
      imagesrcset: srcset,
      imagesizes: '(max-width: 600px) 92vw, (max-width: 960px) 60vw, 70vw',
      fetchpriority: 'high',
    })
  }

  useHead({
    link,
  })
})
</script>

<style scoped>
@media (min-width: 1000px) {
  .text-custom-size {
    font-size: 2.5rem !important;
  }
}
</style>
