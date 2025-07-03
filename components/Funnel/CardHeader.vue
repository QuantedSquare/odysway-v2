<template>
  <v-container
    class="height-title bg-primary-light px-6 d-none d-md-block"
    fluid
  >
    <div class="d-flex align-center justify-start ga-4 flex-md-row ">
      <v-avatar
        :image="props.image || 'https://odysway.com/logos/logo_noir.png'"
        size="100"
        rounded="lg"
      />
      <div class="text-white text-h6 text-md-h5 d-flex flex-column w-100">
        <span class="font-weight-bold">
          {{ titre }}
        </span>
        <v-row
          v-if="travelType"
          class="text-body-1 mt-2 text-no-wrap"
          no-gutters
        >
          <v-col>
            {{ travelType }} -  <span
              v-if="date"
              class="text-caption"
            >
              {{ date }}
            </span>
          </v-col>

          <v-col

            class="text-no-wrap text-left text-md-right "
          >
            {{ formatNumber(price, 'currency', '€') }}/pers.
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
  <v-img
    :src="props.image || 'https://odysway.com/logos/logo_noir.png'"
    :alt="`Paysage de destination pour le voyage ${titre}`"
    height="120"
    width="100%"
    cover
    class="d-block d-md-none text-white d-flex text-shadow"
  >
    <v-container class="h-100 d-flex flex-column justify-center h-100">
      <span class="font-weight-bold text-body-1">
        {{ titre }}
      </span>
      <v-row
        v-if="travelType"
        class="text-body-2 align-end"
        no-gutters
      >
        <v-col cols="8">
          <span
            v-if="date"
            class="text-caption"
          >
            {{ date }}
          </span>
        </v-col>

        <v-col class="text-no-wrap text-right font-weight-bold text-body-1">
          {{ formatNumber(price, 'currency', '€') }}/pers.
        </v-col>
      </v-row>
    </v-container>
  </v-img>
</template>

<script setup>
const props = defineProps(['titre', 'image', 'travelType', 'date', 'price'])
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  }
</style>
