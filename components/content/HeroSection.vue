<template>
  <div class="d-flex flex-column">
    <v-row no-gutters>
      <v-col>
        <v-img
          :src="heroContent.imgSrc"
          cover
          height="100vh"
        >
          <span class="position-absolute font-weight-bold text-h3 text-white ">{{ heroContent.text }}</span>
        </v-img>
      </v-col>
    </v-row>
    <HeadlinesList />
  </div>
</template>

<script setup>
const heroContent
  = {
    imgSrc: 'https://media.istockphoto.com/id/1199079041/fr/photo/luge-de-chien-de-husky-en-laponie-finlande.jpg?s=1024x1024&w=is&k=20&c=2SGbd1yNgEONdG68o5KwiDIsdfHO_SlMfUmNpShmeoc=',
    text: 'Banner text',
  }
</script>

<style scoped>
.position-absolute {
  position: absolute;
  bottom: 20%;
  left: 10%;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, .3);
}
</style>
