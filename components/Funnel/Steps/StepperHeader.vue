<template>
  <v-stepper
    v-show="model !== 11"
    id="stepper"
    v-model="model"
    alt-labels
    editable
    show-actions
  >
    <v-stepper-header class="elevation-0">
      <template
        v-for="(step) in stepDefinitions"
        :key="step.number"
      >
        <v-stepper-item
          :complete="model + 1 > step.number"
          :step="step.number"
        >
          {{ step.label }}
        </v-stepper-item>
      </template>
    </v-stepper-header>
    <slot />
  </v-stepper>
</template>

<script setup>
const model = defineModel()
const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
  skipperMode: {
    type: String,
    default: 'quick',
  },
})
const stepDefinitions = computed(() => {
  const baseSteps = [
    {
      number: 1,
      label: props.page.fields.fil_dariane_devis.step_1,
    },
  ]

  if (props.skipperMode !== 'quick') {
    baseSteps.push({
      number: 2,
      label: props.page.fields.fil_dariane_devis.step_2,
    })
  }

  if (props.skipperMode === 'normal') {
    baseSteps.push({
      number: 3,
      label: props.page.fields.fil_dariane_devis.step_3,
    })
  }

  // Final step
  baseSteps.push({
    number: props.skipperMode === 'normal'
      ? 4
      : props.skipperMode === 'quick' ? 2 : 3,
    label: props.skipperMode === 'normal'
      ? 'Option / Réservation'
      : props.page.fields.fil_dariane_devis.step_final_rdv,
  })

  return baseSteps
})
</script>

<style scoped>
#stepper, .funnel-stepper {
  box-shadow: none !important;
}

#stepper {
  box-shadow: none;
}
</style>
