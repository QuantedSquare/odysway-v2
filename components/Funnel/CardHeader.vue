<template>
  <v-container
    class="height-title bg-primary"
    fluid
    :class="currentStep === 0 ? 'd-none' : 'd-none d-md-block'"
  >
    <div class="d-flex align-center justify-start  flex-md-row ">
      <v-avatar
        :image="props.image || 'https://odysway.com/logos/logo_noir.png'"
        size="100"
        rounded="lg"
      />
      <!-- //Teleport location of the stepper header -->
      <div
        id="card-header"
        class="text-white text-h6 text-md-h5  w-100"
      />
    </div>
  </v-container>
  <v-img
    v-if="currentStep > 0"
    :src="props.image || 'https://odysway.com/logos/logo_noir.png'"
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
const props = defineProps(['titre', 'image', 'travelType', 'date', 'price', 'currentStep'])
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  }
</style>
