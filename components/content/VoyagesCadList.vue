<template>
  <v-container fluid>
    <v-row
      dense
      justify="center"
    >
      <v-col
        v-for="voyage, index in voyages"
        :key="index"
        cols="10"
        sm="6"
        md="4"
      >
        <VoyageCard :voyage="voyage" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  voyagesSlugs: {
    type: Array,
    required: true,
  },
})

// const { data: voyages } = await useAsyncData('voyages', () => {
//   return queryCollection('voyages').where('slug', 'IN', props.voyagesSlugs)
// })

const voyages = [
  {
    slug: 'japon-fleurs',
    country: 'Japon',
    imgSrc: 'https://cdn.vuetifyjs.com/docs/images/cards/purple-flowers.jpg',
    title: 'Voyage au japon',
    duration: '14 jours / 13 nuits',
    startingPrice: 2000,
    rating: 5,
    comments: 37,
  },
  {
    slug: 'japon-fleurs',
    country: 'Japon',
    imgSrc: 'https://cdn.vuetifyjs.com/docs/images/cards/purple-flowers.jpg',
    title: 'Voyage au japon',
    duration: '14 jours / 13 nuits',
    startingPrice: 2000,
    rating: 5,
    comments: 37,
  },
  {
    slug: 'japon-fleurs',
    country: 'Japon',
    imgSrc: 'https://cdn.vuetifyjs.com/docs/images/cards/purple-flowers.jpg',
    title: 'Voyage au japon',
    duration: '14 jours / 13 nuits',
    startingPrice: 2000,
    rating: 5,
    comments: 37,
  },
  {
    slug: 'japon-fleurs',
    country: 'Japon',
    imgSrc: 'https://cdn.vuetifyjs.com/docs/images/cards/purple-flowers.jpg',
    title: 'Voyage au japon',
    duration: '14 jours / 13 nuits',
    startingPrice: 2000,
    rating: 5,
    comments: 37,
  },
]
</script>
