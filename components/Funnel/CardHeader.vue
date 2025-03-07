<template>
  <v-container
    class="height-title bg-primary px-6"
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
            À partir de : {{ formatNumber(total, 'currency', '€') }}/pers.
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script setup>
const props = defineProps(['titre', 'image', 'travelType', 'date'])

const total = 100000
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  }
</style>
