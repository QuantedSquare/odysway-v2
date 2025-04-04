<template>
  <v-stepper
    id="stepper"
    v-model="model"
    alt-labels
    show-actions
    class="text-caption "
  >
    <v-stepper-header
      v-if="props.skipperMode !== 'summary'"
      class="elevation-0 d-flex justify-center text-shadow"
    >
      <template
        v-for="(step, index) in stepDefinitions"
        :key="step.number"
      >
        <v-stepper-item
          :complete="model + 1 > step.number"
          :step="step.number"
          color="primary"
          :value="index + 1"
        >
          <span class="d-none d-md-block font-weight-bold bg-white rounded-lg pa-2 text-no-wrap">
            {{ index + 1 }}.
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
        label: props.page.fil_dariane_devis.step_2,
      },
      {
        number: 3,
        label: props.page.fil_dariane_devis.step_3,
      },
    ]
  }
  else if (props.skipperMode === 'tally') {
    return [
      {
        number: 1,
        label: props.page.fil_dariane_devis.step_1,
      },
      {
        number: 2,
        label: props.page.fil_dariane_devis.step_4,
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
    baseSteps.push({
      number: 3,
      label: props.page.fil_dariane_devis.step_3,
    })
  }

  // Final step
  baseSteps.push({
    number: props.skipperMode === 'normal'
      ? 4
      : props.skipperMode === 'quick' ? 2 : 3,
    label: props.skipperMode === 'normal'
      ? 'Option / Réservation'
      : props.page.fil_dariane_devis.step_final_rdv,
  })

  if (props.skipperMode === 'normal') {
    baseSteps.push({
      number: 5,
      label: 'Assurances',
    })
  }
  if (props.skipperMode === 'normal') {
    baseSteps.push({
      number: baseSteps.length + 1,
      label: 'Récapitulatif',
    })
  }
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
#stepper:deep(.v-stepper-item) {
  opacity:1;
}
</style>
