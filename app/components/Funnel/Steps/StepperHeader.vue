<template>
  <v-stepper
    id="stepper"
    v-model="model"
    hide-actions
    mobile-breakpoint="md"
    alt-labels
    class="text-caption"
  >
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
  showInsurance: {
    type: Boolean,
    default: true,
  },
})

const stepDefinitions = computed(() => {
  if (props.skipperMode === 'devis') {
    return [
      {
        number: 1,
        label: props.page.fil_dariane_devis.step_1,
      },
      {
        number: 2,
        label: props.page.fil_dariane_devis.step_2,
      },
      {
        number: 3,
        label: props.page.fil_dariane_devis.step_3,
      },
    ]
  }
  else if (props.skipperMode === 'call') {
    return [
      {
        number: 1,
        label: props.page.fil_dariane_devis.step_1,
      },
      {
        number: 2,
        label: props.page.fil_dariane_devis.step_2,
      },
      {
        number: 3,
        label: props.page.fil_dariane_devis.step_final_rdv,
      },
    ]
  }
  if (props.skipperMode === 'summary') {
    return [
      {
        number: 5,
        label: 'Récapitulatif',
      },
    ]
  }
  const baseSteps = [
    {
      number: 1,
      label: props.page.fil_dariane_devis.step_1,
    },
  ]

  if (props.skipperMode !== 'quick') {
    baseSteps.push({
      number: 2,
      label: props.page.fil_dariane_devis.step_2,
    })
  }

  if (props.skipperMode === 'normal') {
    if (props.showInsurance) {
      baseSteps.push({ number: 3, label: 'Assurances' })
      baseSteps.push({ number: 4, label: 'Récapitulatif' })
    }
    else {
      baseSteps.push({ number: 3, label: 'Récapitulatif' })
    }
  }
  else {
    baseSteps.push({
      number: props.skipperMode === 'quick' ? 2 : 3,
      label: props.page.fil_dariane_devis.step_final_rdv,
    })
  }
  return baseSteps
})

// Expose stepDefinitions to parent component
defineExpose({
  stepDefinitions,
})
</script>

<style scoped>
#stepper, .funnel-stepper {
  box-shadow: none !important;
}

#stepper {
  box-shadow: none;
}
#stepper:deep(.v-stepper-item) {
  opacity:1;
}
#stepper:deep(.v-stepper-header) {
  justify-items:stretch!important;
}
</style>
