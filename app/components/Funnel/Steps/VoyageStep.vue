<template>
  <v-window :model-value="subStepIndex">
    <v-window-item :value="0">
      <FunnelStepsTravelersInfosOptions
        v-model="model"
        :voyage="voyage"
        :current-step="currentStep"
        :own-step="ownStep"
        :page="page"
        @next="onTravelersNext"
        @previous="emit('previous')"
      />
    </v-window-item>
    <v-window-item :value="1">
      <FunnelStepsInsurances
        v-model="model"
        :voyage="voyage"
        :current-step="currentStep"
        :insurances="insurancesPrice"
        :page="page"
        :own-step="ownStep"
        @next="emit('next')"
        @previous="subStep = 'travelers'"
      />
    </v-window-item>
  </v-window>
</template>

<script setup>
const props = defineProps(['voyage', 'insurancesPrice', 'showInsurance', 'currentStep', 'ownStep', 'page'])
const model = defineModel()
const emit = defineEmits(['next', 'previous'])

const subStep = ref('travelers')
const subStepIndex = computed(() => subStep.value === 'travelers' ? 0 : 1)

const onTravelersNext = () => {
  if (props.showInsurance) {
    subStep.value = 'insurance'
  }
  else {
    emit('next')
  }
}

watch(() => props.currentStep, (val, oldVal) => {
  if (val === props.ownStep) {
    const comingBack = oldVal > val
    if (comingBack && props.showInsurance) {
      subStep.value = 'insurance'
    }
    else {
      subStep.value = 'travelers'
    }
  }
})
</script>
