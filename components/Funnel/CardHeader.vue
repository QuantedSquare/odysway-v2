<template>
  <v-container
    class="height-title bg-primary"
    fluid
    :class="currentStep === 0 ? 'd-none' : 'd-none d-md-block'"
  >
    <div class="d-flex align-center justify-start  flex-md-row ">
      <v-avatar
        :image="image || 'https://odysway.com/logos/logo_noir.png'"
        size="100"
        rounded="lg"
      />
      <!-- Always render the teleport target to avoid hydration issues -->
      <div
        id="card-header"
        class="text-white text-h6 text-md-h5  w-100"
      />
    </div>
  </v-container>
  <v-img
    v-if="currentStep > 0"
    :src="image || 'https://odysway.com/logos/logo_noir.png'"
    :alt="`Paysage de destination pour le voyage ${titre}`"
    height="120"
    width="100%"
    cover
    class="d-block d-md-none text-white d-flex text-shadow"
  >
    <v-container class="h-100 d-flex flex-column justify-center">
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
      </v-row>
    </v-container>
  </v-img>
</template>

<script setup>
defineProps(['titre', 'image', 'travelType', 'date', 'price', 'currentStep'])
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  }
</style>
