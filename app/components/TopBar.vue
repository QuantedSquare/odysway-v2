<template>
  <HeaderOdysway
    v-model="drawer"
    :header="header"
  />
  <HeaderDrawer
    v-if="header"
    v-model="drawer"
    class="d-block d-md-none"
    :header="header"
  />
</template>

<script setup>
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
