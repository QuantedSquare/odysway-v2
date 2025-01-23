<template>
  <v-container class="pa-10">
    <v-row
      justify="center"
      class="my-6"
    >
      <v-col
        v-for="headline in headlines"
        :key="headline.heading"
        cols="10"
        :md="headlines.length + 1"
      >
        <div>
          <h5 class="my-6 pb-6 text-h5 font-weight-black">
            {{ headline.title }}
          </h5>
          <p class="text-body-1">
            {{ headline.text }}
          </p>
        </div>

        <!-- <v-card variant="text">
          <v-card-item>
            <v-card-title class="my-6 pb-6 text-no-wrap">
              {{ headline.title }}
            </v-card-title>
            <v-card-text class="px-0">
              {{ headline.text }}
            </v-card-text>
          </v-card-item>
        </v-card> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const headlines = [
  {
    title: 'Des séjours immersifs pour voyager autrement',
    text: 'Des voyages conçus avec soin et passion pour vous faire découvrir l’intimité d’une région ou d\'un pays, au- delà des clichés, de la manière la plus durable possible.',
  },
  {
    title: 'Des séjours immersifs pour voyager autrement',
    text: 'Des voyages conçus avec soin et passion pour vous faire découvrir l’intimité d’une région ou d\'un pays, au- delà des clichés, de la manière la plus durable possible.',
  },
  {
    title: 'Des séjours immersifs pour voyager autrement',
    text: 'Des voyages conçus avec soin et passion pour vous faire découvrir l’intimité d’une région ou d\'un pays, au- delà des clichés, de la manière la plus durable possible.',
  },
]
</script>
