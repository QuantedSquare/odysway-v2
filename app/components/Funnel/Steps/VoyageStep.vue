<template>
  <FunnelStepsTravelersInfosOptions
    v-if="subStep === 'travelers'"
    v-model="model"
    :voyage="voyage"
    :current-step="currentStep"
    :own-step="ownStep"
    :page="page"
    @next="onTravelersNext"
    @previous="emit('previous')"
  />
  <FunnelStepsInsurances
    v-else-if="subStep === 'insurance'"
    v-model="model"
    :voyage="voyage"
    :current-step="currentStep"
    :insurances="insurancesPrice"
    :page="page"
    :own-step="ownStep"
    @next="emit('next')"
    @previous="subStep = 'travelers'"
  />
</template>

<script setup>
const props = defineProps(['voyage', 'insurancesPrice', 'showInsurance', 'currentStep', 'ownStep', 'page'])
const model = defineModel()
const emit = defineEmits(['next', 'previous'])

const subStep = ref('travelers')

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
