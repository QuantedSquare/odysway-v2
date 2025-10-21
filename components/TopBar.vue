<template>
  <ClientOnly>
    <HeaderOdysway
      v-if="header"
      v-model="drawer"
      :header="header"
    />
    <LazyDrawer
      v-if="width < 960 && header"
      v-model="drawer"
      :header="header"
    />
  </ClientOnly>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()

const drawer = ref(false)

const headerQuery = groq`*[_type == "header"][0]{
  logo,
  search,
  button1,
  button2,
  button3,
  button4,
  button5
}`

const { data: header } = await useAsyncData(
  'header',
  async () => {
    try {
      const sanity = useSanity()
      const result = await sanity.fetch(headerQuery)
      return result || null
    }
    catch (e) {
      console.error('Error fetching header:', e)
      return null
    }
  },
  {
    server: true,
  },
)
</script>
