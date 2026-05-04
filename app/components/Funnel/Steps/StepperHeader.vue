<template>
  <v-stepper
    id="stepper"
    v-model="model"
    hide-actions
    mobile-breakpoint="md"
    alt-labels
    class="text-caption bg-warm"
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
        label: props.page.fil_dariane_devis.step_final_rdv,
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
        number: 3,
        label: props.page?.navigation?.step_label_summary || 'Récapitulatif',
      },
    ]
  }
  const baseSteps = [
    {
      number: 1,
      label: props.page?.navigation?.step_label_1 || 'Vos infos',
    },
  ]

  if (props.skipperMode !== 'quick') {
    baseSteps.push({
      number: 2,
      label: props.page?.navigation?.step_label_2 || 'Votre voyage',
    })
  }

  if (props.skipperMode === 'normal') {
    baseSteps.push({ number: 3, label: props.page?.navigation?.step_label_3 || 'Paiement' })
  }
  else {
    baseSteps.push({
      number: props.skipperMode === 'quick' ? 1 : 3,
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
#stepper:deep(.active-step > .v-avatar){
  color: white!important;
}
</style>
