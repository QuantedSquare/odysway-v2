<template>
  <v-container
    class="rounded-lg pa-10 mt-8 bg-color "
  >
    <v-row>
      <v-col>
        <h2 class="text-primary text-h2">
          {{ whySection.title }}
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-for="item in whySection.list"
        :key="item.id"
        cols="6"
        md="3"
      >
        <div class="d-flex flex-column align-start ga-2 justify-start rounded-lg item-bg-color pa-4 py-10">
          <v-img
            :src="item.icon"
            :height="40"
            :width="40"
            class="mr-3 text-primary"
          />
          <p class="font-weight-bold text-h5">
            {{ item.text }}
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const { whySection } = inject('page')
</script>

<style scoped>
.bg-color {
  background-color: #DB66441A!important;
}
.item-bg-color {
  background-color: #f9e2db!important;
}
</style>
