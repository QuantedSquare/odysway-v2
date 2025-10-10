<template>
  <v-container
    class="rounded-lg px-0 my-5 bg-color "
    fluid
  >
    <div class="pa-md-10">
      <v-row>
        <v-col>
          <h2 class="text-primary text-center text-custom-size mb-md-3">
            {{ whySection.title }}
          </h2>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col
          v-for="item in whySection.list"
          :key="item.id"
          cols="11"
          sm="6"
          md="3"
        >
          <div class="d-flex flex-column align-center align-md-start ga-2 justify-start rounded-lg item-bg-color pa-4 py-10 fill-height">
            <SanityImage
              :asset-id="item.icon.asset._ref"
              auto="format"
            >
              <template #default="{ src }">
                <v-img
                  :src="src"
                  :height="40"
                  :width="40"
                  class="mr-3 text-primary"
                  alt="icon de la section Pourquoi"
                />
              </template>
            </SanityImage>
            <p class="font-weight-bold text-h5 text-center text-md-start">
              {{ item.text }}
            </p>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
defineProps({
  whySection: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.bg-color {
  background-color: #DB66441A!important;
}
.item-bg-color {
  background-color: #f9e2db!important;
}
@media (min-width: 1000px) {
.text-custom-size{
    font-size: 2.5rem!important;
  }
}
</style>
