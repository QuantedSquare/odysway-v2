<template>
  <v-container
    fluid
    class="relative"
  >
    <v-img
      class="footer-bg-img absolute"
      :src="img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 1024, height: 400 })"
      :lazy-src="img('/logos/odysway-text.png', { format: 'webp', quality: 10, width: 1024, height: 400 })"
      :srcset="`${img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 1024, height: 400 })} 1024w, ${img('/logos/odysway-text.png', { format: 'webp', quality: 70, width: 640, height: 400 })} 640w`"
      sizes="(max-width: 600px) 480px, 1024px"
      cover
      loading="lazy"
      alt="Odysway texte en fond, en bas de page"
      width="100%"
      height="400"
    />
    <v-row
      justify="center"
      align="center"
    >
      <ClientOnly>
        <FunnelCheckoutStepper
          v-if="page"
          :page-texts="page"
        />
      </ClientOnly>
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const query = groq`*[_type == "checkout"][0]{
  ...
}`

const { data: page } = await useAsyncData(
  'checkout-texts',
  async () => {
    const { data } = await useSanityQuery(query, {})
    return data.value
  },
  {
    server: true,
    getCachedData: (key) => {
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    },
  },
)


definePageMeta({
  layout: 'funnel',
})
useSeoMeta({
  htmlAttrs: {
    lang: 'fr',
  },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})

const img = useImage()
</script>

<style scoped>
.relative {
  position: relative;
}
.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
