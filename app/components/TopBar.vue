<template>
  <HeaderOdysway
    v-model="drawer"
    :header="header"
  />
  <ClientOnly>
    <Drawer
      v-if="width < 960 && header"
      v-model="drawer"
      :header="header"
    />
  </ClientOnly>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()

const drawer = shallowRef(false)

const headerQuery = groq`*[_type == "header"][0]{
  logo,
  search,
  button1,
  button2,
  button3,
  button4,
  button5
}`

// Fetch header data with lazy option to not block rendering
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
    // Add default fallback to prevent blocking
    default: () => ({
      logo: { alt: 'Logo Odysway' },
      search: true,
      button1: { visible: false, text: '', link: '' },
      button2: { visible: false, text: '', link: '' },
      button3: { visible: false, text: '', link: '' },
      button4: { visible: false, text: '', link: '' },
      button5: { visible: false, text: '', link: '' },
    }),
  },
)
</script>
