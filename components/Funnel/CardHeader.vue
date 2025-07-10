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
      <!-- Stepper header directly in the card header -->
      <v-stepper-header
        v-if="stepDefinitions && skipperMode !== 'summary'"
        class="elevation-0 text-white d-flex justify-space-between w-100"
      >
        <template
          v-for="(step, index) in stepDefinitions"
          :key="step.number"
        >
          <v-stepper-item
            :complete="currentStep + 1 > step.number"
            :step="step.number"
            color="white"
            :value="index + 1"
          >
            <span class="d-none d-md-block font-weight-bold text-white text-caption">
              {{ step.label }}
            </span>
          </v-stepper-item>
          <v-divider
            v-if="step.number !== stepDefinitions[stepDefinitions.length - 1].number"
            class="text-shadow text-white"
            opacity="0.6"
          />
        </template>
      </v-stepper-header>
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
defineProps({
  titre: String,
  image: String,
  travelType: String,
  date: String,
  price: [String, Number],
  currentStep: Number,
  stepDefinitions: Array,
  skipperMode: {
    type: String,
    default: 'quick',
  },
})
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
}
</style>
