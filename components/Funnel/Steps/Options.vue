<template>
  <v-container>
    <v-row v-if="voyage.gotIndivRoomAvailable && voyage.indivRoomPrice > 0">
      <v-col cols="12">
        <h2>{{ page.options.indiv_room_title }}</h2>
      </v-col>
      <v-col
        cols="8"
        :class="model.indivRoom ? 'text-primary' : 'text-grey'"
      >
        <v-switch
          v-model="model.indivRoom"
          :label="page.options.indiv_room_label"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="page.room_indiv_accroche"
          :dialog-text="page.room_indiv_text"
          :page="page"
        />
      </v-col>
      <v-col
        class="d-flex justify-end align-start text-body-1 "
        :class="model.indivRoom ? 'text-primary' : 'text-grey'"
      >
        + {{ formatNumber(voyage.indivRoomPrice, 'currency', '€') }} / pers.
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h2 class="h2-option">
          {{ page.options.food_details_title }}
        </h2>
      </v-col>

      <v-col
        cols="12"
      >
        <v-textarea
          v-model="model.specialRequest"
          variant="outlined"

          :label="page.options.special_request_label"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        class="d-flex ga-3"
      >
        <v-btn
          class="bg-grey-light font-weight-regular"
          @click="emit('previous')"
        >
          Précédent
        </v-btn>
        <v-btn
          color="secondary"
          class="font-weight-bold"
          @click="submitStepData"
        >
          Suivant
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const { voyage, currentStep, ownStep, page } = defineProps(['voyage', 'currentStep', 'ownStep', 'page'])
const { updateDeal } = useStepperDeal(ownStep)

const model = defineModel()

// New: Local validation state
const emit = defineEmits(['next', 'previous'])

const submitStepData = () => {
  // Validate form
  const dealData = {
    specialRequest: model.value.specialRequest,
    indivRoom: model.value.indivRoom ? ['Oui'] : ['Non'],
    currentStep: 'A choisi ses options',
  }

  try {
    updateDeal(dealData)
    emit('next')
  }
  catch (error) {
    console.log('error updating Options', error)
  }
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

:deep(.v-field-label) {
  font-weight: regular !important;
  color: rgb(118, 118, 118, 0.6) !important;
}
</style>
