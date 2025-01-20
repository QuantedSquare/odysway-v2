<template>
  <v-card
    class="mx-auto"
    max-width="400"
    elevation="0"
  >
    <v-img
      height="220"
      src="https://cdn.vuetifyjs.com/docs/images/cards/purple-flowers.jpg"
      rounded="lg"
      cover
    />
    <v-card-text>
      <div>
        <span><NuxtLink :to="`/destinations/${destination.slug}`">{{ destination.title }}</NuxtLink> - </span><span>{{ voyage.duration }}</span>
      </div>
    </v-card-text>
    <v-card-title>
      {{ voyage.title }}
    </v-card-title>
    <v-card-text>
      <span>A partir de </span>
      <span>{{ voyage.startingPrice }}</span>
    </v-card-text>
    <v-card-text class="d-flex align-center">
      <v-rating
        :size="24"
        :model-value="voyage.rating"
        readonly
        color="orange-lighten-1"
      /> ({{ voyage.comments }})
    </v-card-text>
  </v-card>
</template>

<script setup>
const voyage = {
  slug: 'japon-fleurs',
  title: 'Voyage au japon',
  duration: '14 jours / 13 nuits',
  startingPrice: 2000,
  rating: 5,
  comments: 37,
}

const destination = {
  slug: 'japon',
  title: 'Japon',
}
</script>
