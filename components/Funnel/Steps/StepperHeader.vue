<template>
  <v-stepper
    id="stepper"
    v-model="model"
    hide-actions
    mobile-breakpoint="md"
    alt-labels
    class="text-caption"
  >
    <ClientOnly>
      <Teleport
        to="#card-header"
        defer
      >
        <v-stepper-header
          v-if="props.skipperMode !== 'summary'"
          class="elevation-0 text-white d-flex justify-space-between"
        >
          <template
            v-for="(step, index) in stepDefinitions"
            :key="step.number"
          >
            <v-stepper-item
              :complete="model + 1 > step.number"
              :step="step.number"
              color="white"
              :value="index + 1"
            >
              <span class="d-none d-md-block font-weight-bold  text-white text-caption">
                <!-- {{ index + 1 }}. -->
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
      </Teleport>
    </ClientOnly>
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
      ? (props.showInsurance ? 4 : 4)
      : props.skipperMode === 'quick' ? 2 : 3,
    label: props.skipperMode === 'normal'
      ? 'Options'
      : props.page.fil_dariane_devis.step_final_rdv,
  })

  if (props.skipperMode === 'normal' && props.showInsurance) {
    baseSteps.push({
      number: 5,
      label: 'Assurances',
    })
  }
  if (props.skipperMode === 'normal') {
    baseSteps.push({
      number: props.showInsurance ? 6 : 5,
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
#stepper:deep(.v-stepper-header) {
  justify-items:stretch!important;
}
</style>
