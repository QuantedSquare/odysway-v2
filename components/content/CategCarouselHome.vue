<template>
  <v-container
    fluid
  >
    <v-row justify="center">
      <v-col
        cols="10"
        md="8"
        class="d-flex overflow-hidden"
      >
        <NuxtLink
          v-for="categorie in categories.categories"
          :key="categorie.title"
          class="mr-4"
        >
          <CategorieCard :categorie="categorie" />
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const categories = {
  categories: [
    { title: 'Immersion locales',
      image: 'https://cdn.pixabay.com/photo/2021/02/14/10/42/drum-6014002_1280.jpg',
    },
    {
      title: 'Immersion locales',
      image: 'https://cdn.pixabay.com/photo/2021/02/14/10/42/drum-6014002_1280.jpg',
    },
    {
      title: 'Immersion locales',
      image: 'https://cdn.pixabay.com/photo/2021/02/14/10/42/drum-6014002_1280.jpg',
    },
    {
      title: 'Immersion locales',
      image: 'https://cdn.pixabay.com/photo/2021/02/14/10/42/drum-6014002_1280.jpg',
    },
    {
      title: 'Immersion locales',
      image: 'https://cdn.pixabay.com/photo/2021/02/14/10/42/drum-6014002_1280.jpg',
    },
  ],
}
console.log('categories', categories)
</script>
