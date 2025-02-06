<template>
  <v-container>
    <v-row>
      <v-col
        class="d-flex align-center"
        cols="12"
      >
        <!-- <h2>{{ $t('stepperDevisGroup.insurances') }}</h2> -->
        <h2>Garanties <span class="text-body-1">avec</span></h2>

        <img
          width="90"
          class="ml-2"
          :src="page.fields.assurance_img"
        >
      </v-col>
      <v-col
        v-if="insurances.rapatriement"
        cols="12"
      >
        <v-switch
          v-model="switch_insurance_global"
          :label="page.fields.preference_assurance"
          @change="handleInsuranceChoice('switch_insurance_global')"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="dealData.iso === 'NP' || dealData.iso === 'PE' ? page.fields.accroche_assurance_perou_nepal:page.fields.accroche_assurance_medicale "
          :dialog-text="dealData.iso === 'NP' || dealData.iso === 'PE' ? page.fields.details_assurance_medicale_perou_nepal:page.fields.details_assurance_medicale "
        />
      </v-col>
      <v-col
        v-if="insurances.cancel"
        cols="12"
      >
        <v-switch
          v-model="switch_insurance_cancelled"
          :label="page.fields.preference_assurance_annulation"
          @change="handleInsuranceChoice('switch_insurance_cancelled')"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="page.fields.accroche_assurance_annulation"
          :dialog-text="page.fields.details_assurance_annulation"
        />
      </v-col>
      <v-col
        v-if="insurances.cancel || insurances.rapatriement"
        cols="12"
      >
        <!-- :label="$t('stepperDevisGroup.noInsurance')" -->
        <v-switch
          v-model="switch_no_insurance"
          label="Je ne souhaite pas d'assurance"
          @change="handleInsuranceChoice('switch_no_insurance')"
        />
      </v-col>
      <v-col v-else>
        <div v-html="page.fields.insurances_unavailable " />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import dayjs from 'dayjs'

const props = defineProps(['page'])

const handleInsuranceChoice = () => {
  return
}
const dealData = {
  iso: 'NP',
}
const insurance = await $fetch('/api/v1/chapka/quote',
  {
    method: 'POST',
    body: {
      pricePerTraveler: 1800, // pricePerPerson,
      countries: 'FR',
      chapkaZone: 2, // iso || pays.map(p => p.iso).join(','),
      departureDate: '25/09/2025', // startDate,
      returnDate: '13/10/2025', // endDate
      nbTravelers: 5,
    },
  },
)
console.log('FETCH INSURANCE QUOTE', insurance)
const insurances = ref({
  rapatriement: true,
  cancel: true,
})
// Values
const switch_insurance_global = ref()// this.value?.global || false,
const switch_insurance_cancelled = ref()// this.value?.cancellation || false,
const switch_no_insurance = ref()// !(this.insurances.cancel || this.insurances.rapatriement),
// Dialogs
const medicalInsuranceModal = ref()// false,
const cancelInsuranceModal = ref()// false

const insuranceChoice = computed(() => {
  if (switch_insurance_global.value) {
    return { type: 'rapatriement', name: 'Multirisque' }
  }
  else if (switch_insurance_cancelled.value) {
    return { type: 'cancel', name: 'Annulation' }
  }
  else {
    return { type: 'no_insurance', name: 'Aucune Assurance' }
  }
})
</script>
