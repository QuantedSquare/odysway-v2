<template>
  <v-container
    class="height-title bg-primary  mb-10"
    fluid
  >
    <v-row justify="center">
      <v-col
        cols="12"
        md="10"
        class="d-flex align-center justify-start flex-md-row px-10"
      >
        <SanityImage
          v-if="isSanityImage"
          :asset-id="image"
          auto="format"
          class="d-none d-md-block"
        >
          <template #default="{ src }">
            <v-avatar
              :image="src"
              size="50"
              rounded="lg"
            />
          </template>
        </SanityImage>
        <v-avatar
          v-else
          class="d-none d-md-block"
          :image="image || 'https://odysway.com/logos/logo_noir.png'"
          size="70"
          rounded="md"
        />
        <div
          v-if="stepDefinitions && skipperMode !== 'summary'"
          class="d-flex align-center w-100 px-4"
        >
          <template
            v-for="(step, index) in stepDefinitions"
            :key="step.number"
          >
            <div class="d-flex flex-column align-center">
              <div
                class="step-circle d-flex align-center justify-center rounded-circle text-caption font-weight-bold "
                :class="{
                  'step-complete': currentStep > step.number,
                  'step-active': currentStep === step.number,
                  'step-pending': currentStep < step.number,
                }"
              >
                <v-icon
                  v-if="currentStep > step.number"
                  size="14"
                >
                  {{ mdiCheck }}
                </v-icon>
                <span
                  v-else
                  class="text-subtitle-2 font-weight-bold"
                >{{ index + 1 }}</span>
              </div>
              <span class="text-caption text-white mt-2 text-center step-label">{{ step.label }}</span>
            </div>
            <div
              v-if="index < stepDefinitions.length - 1"
              class="step-line flex-grow-1 mx-2"
            />
          </template>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiCheck } from '@mdi/js'

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
  isSanityImage: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  max-height:50px!important;
}
.step-circle {
  width: 34px;
  height: 34px;
  color:rgba(255,255,255,0.35);
  background-color: rgba(255,255,255,0.3)!important;
  box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
  flex-shrink: 0;
}
.step-active {
  background-color: white!important;
  color: rgb(var(--v-theme-primary));
  border-color: white;
}
.step-complete {
  background-color: white!important;
  color: rgb(51, 150, 168);
  box-shadow: none!important;
  border-color: white;
}
.step-pending {
  background-color: transparent;
  opacity: 0.6;
}
.step-line {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.4);
  min-width: 16px;
}
.step-label {
  max-width: 72px;
  white-space: normal;
  line-height: 1.2;
}
</style>
