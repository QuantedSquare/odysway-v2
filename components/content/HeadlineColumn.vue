<template>
  <v-col
    cols="10"
    md="3"
  >
    <h5 class="my-6 pb-6 text-h5 font-weight-black">
      {{ headline?.title || 'Loading ... ' }}
    </h5>
    <p class="text-body-1">
      {{ headline?.text || 'Loading ... ' }}
    </p>
  </v-col>
</template>

<script setup>
const props = defineProps({
  headlineSlug: {
    type: String,
    required: true,
  },
})

const { data: headline } = await useAsyncData(`headline-${props.headlineSlug}`, () => {
  return queryCollection('headlines').where('slug', '=', props.headlineSlug).first()
})
</script>
