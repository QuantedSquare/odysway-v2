<template>
  <div>
    <h1>coucou</h1>
  </div>
</template>

<script setup>
const query = groq`*[_type == "checkout"][0]{
  ...
}`

const { data: page } = await useAsyncData(
  'test-checkout',
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

</script>
