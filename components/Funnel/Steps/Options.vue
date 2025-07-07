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
        md="6"
        class="d-flex justify-start align-center"
      >
        <v-switch
          v-model="vegeOption"
          :sub-label="page.options.vege_sub_label"
        >
          <template #label>
            <div class="d-flex flex-column align-start">
              <span>{{ page.options.food_prefs_label }}</span>
              <span class="text-caption">{{ page.options.vege_sub_label }}</span>
            </div>
          </template>
        </v-switch>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-switch
          v-model="otherFoodOption"
          :label="page.options.other_food_label"
        />
      </v-col>
      <v-col
        cols="12"
      >
        <Transition name="slide-fade">
          <v-textarea
            v-if="otherFoodOption"
            v-model="specialRequest"
            variant="outlined"
            :label="page.options.special_request_label"
          />
        </Transition>
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
const { addSingleParam } = useParams()

const model = defineModel()

// New: Local validation state
const emit = defineEmits(['next', 'previous'])

const specialRequest = ref('')
const indivRoom = ref(false)
const indivRoomPrice = ref(0) // Checker si on veut afficher ce prix

const vegeOption = ref(false)
const otherFoodOption = ref(false)

watch([model, () => currentStep], ([dealVal, currentStep]) => {
  if (model.value) {
    indivRoomPrice.value = +dealVal.indivRoomPrice
    indivRoom.value = dealVal.indivRoom
    vegeOption.value = dealVal.specialRequest?.includes('Régimes alimentaires spécifiques')
    otherFoodOption.value = dealVal.specialRequest?.includes('Autres demandes particulières')
    specialRequest.value = dealVal.specialRequest?.match(/Autres demandes particulières :(.*)/)?.[1].trim() || ''
  }
  if (currentStep === ownStep) {
    addSingleParam('step', ownStep)
  }
}, { immediate: true })

const foodPreferences = computed(() => {
  const foodPreferences = [
    vegeOption.value ? 'Régimes alimentaires spécifiques' : '',
    otherFoodOption.value ? 'Autres demandes particulières' : '',
  ]
  return `${foodPreferences.join(', ')} : ${specialRequest.value}`
})

const submitStepData = () => {
  // Validate form
  const dealData = {
    specialRequest: `Préférence alimentaire: ${foodPreferences.value}`,
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
</style>
