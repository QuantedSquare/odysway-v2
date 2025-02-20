<template>
  <v-col
    v-if="pageStatus === 'success' && voyageStatus === 'success'"
    cols="12"
  >
    <FunnelStepsStepperHeader
      v-model="currentStep"
      :page="page"
      :skipper-mode="skipperMode"
    >
      <v-row class="funnel-stepper d-flex justify-center">
        <v-col
          cols="12"
          class="d-flex justify-center"
        >
          <v-card
            class="border-width w-fit-content"
            :elevation="currentStep < 5 ? 2 : 0"
          >
            <Transition name="fade">
              <v-img
                v-if="voyage.imgSrc && currentStep === 0"
                color="surface-variant"
                height="100"
                :src="voyage.imgSrc"
                cover
              />
            </Transition>
            <Transition name="fade">
              <FunnelCardHeader
                v-if="currentStep !== 0 && currentStep < 5"
                :titre="voyage.title"
                :image="voyage.imgSrc"
              />
            </Transition>
            <v-row>
              <v-col
                cols="12"
                class="pa-0"
              >
                <v-stepper-window :model-value="currentStep">
                  <v-stepper-window-item>
                    <FunnelStepsSkipper
                      v-model="skipperMode"
                      :page="page"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item>
                    <FunnelStepsDetails
                      v-if="skipperMode === 'normal'"
                      :ref="(component) => registerStepComponent(component, 1)"
                      v-model="validForm"
                      :current-step="currentStep"
                      :voyage="voyage"
                      :own-step="1"
                    />
                    <FunnelStepsCalendly
                      v-else
                      :titre="voyage.title"
                      :page="page"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item>
                    <FunnelStepsTravelersInfos
                      :ref="(component) => registerStepComponent(component, 2)"
                      v-model="validForm"
                      :current-step="currentStep"
                      :page="page"
                      :own-step="2"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item>
                    <FunnelStepsOptions
                      :ref="(component) => registerStepComponent(component, 3)"
                      v-model="validForm"
                      :current-step="currentStep"
                      :page="page"
                      :own-step="3"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item>
                    <FunnelStepsInsurances
                      :ref="(component) => registerStepComponent(component, 4)"
                      v-model="validForm"
                      :current-step="currentStep"
                      :page="page"
                      :own-step="4"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item :value="5">
                    <FunnelStepsSummary
                      :current-step="currentStep"
                      :page="page"
                      :voyage="voyage"
                    />

                    <FunnelStepsPaymentRedirect
                      :ref="(component) => registerStepComponent(component, 5)"
                      v-model="validForm"
                      :page="page"
                      :current-step="currentStep"
                      :own-step="5"
                      :voyage="voyage"
                    />
                  </v-stepper-window-item>
                </v-stepper-window>
              </v-col>
            </v-row>
            <v-card-actions>
              <v-stepper-actions
                next-text="Suivant"
                prev-text="Précédent"
                @click:next="nextStep()"
                @click:prev="previousStep()"
              >
                <template #next>
                  <div>
                    <!-- Wrapper div to ensure consistent structure -->
                    <v-btn
                      v-if="currentStep < 5"
                      :disabled="!enablingNextButton"
                      color="secondary"
                      :loading="loading"
                      @click="nextStep"
                    >
                      Suivant
                    </v-btn>
                    <div
                      v-if="currentStep === 5"
                      id="next-btn"
                    />
                  </div>
                </template>
              </v-stepper-actions>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </FunnelStepsStepperHeader>
  </v-col>
  <v-col
    v-else
    cols="12"
  >
    <v-skeleton-loader
      type="card"
    />
  </v-col>
</template>

<script setup>
const route = useRoute()

const { step, dealId, slug, departure_date, return_date, plan } = route.query

const { data: page, status: pageStatus } = await useFetch('/api/v1/pages/' + route.name)
console.log('page', page.value)

// If slug, coming from travel page, otherwise, coming from custom link
// Voyage are all the statics data of the travel
// Only deal manage the dynamic values
const { data: voyage, status: voyageStatus } = useAsyncData(`voyage-${step}`, async () => {
  console.log('slug', slug)
  if (slug) {
    const query = queryCollection('voyages').where('slug', '=', slug).first()
    Object.assign(query, { departureDate: departure_date, returnDate: return_date })
    return query
  }
  else {
    const deal = await apiRequest(`/ac/deals/${dealId}`)
    return { title: deal.title,
      startingPrice: deal.pricePerTraveler,
      imgSrc: deal.image || 'https://cdn.buttercms.com/gzdJu2fbQDi9Pl3h80Jn',
      country: deal.country,
      iso: deal.iso,
      zoneChapka: +deal.zoneChapka,
      slug: deal.slug,
      depositPrice: deal.depositPrice,
      promoChildren: deal.promoChildren,
      promoTeen: deal.promoTeen,
      maxChildrenAge: 12,
      maxTeenAge: 18,
      source: 'Devis', // Possible que ça change
      forcedIndivRoom: deal.forcedIndivRoom,
      indivRoomPrice: deal.indivRoomPrice,
      promoEarlybird: deal.promoEarlybird,
      promoLastMinute: deal.promoLastMinute,
      gotLastMinute: deal.gotLastMinute === 'Oui',
      gotEarlybid: deal.gotEarlybid === 'Oui',
      // {... COMPLETER}
      departureDate: deal.departureDate,
      returnDate: deal.returnDate,
    }
  }
})
console.log('voyage', voyage.value)
const validForm = ref(true)
const stepComponents = reactive(new Map())
const loading = ref(false)
const currentStep = ref(step ? parseInt(step) : 1)
const skipperMode = ref('normal')

const enablingNextButton = computed(() => {
  return currentStep.value === 0 || validForm.value
})

const registerStepComponent = (component, step) => {
  stepComponents.set(step, component)
}
const nextStep = async () => {
  const currentComponent = stepComponents.get(currentStep.value)

  if (currentComponent && currentComponent.submitStepData) {
    loading.value = true
    const isValid = await currentComponent.submitStepData()
    if (isValid) {
      currentStep.value++
      loading.value = false
      validForm.value = false
    }
  }
  else {
    currentStep.value++
  }
}
const previousStep = () => {
  currentStep.value--
  validForm.value = true
}
</script>

<style scoped>
@media screen and (min-width: 768px) {
  .border-width {
    border-radius: 30px!important;
    height: fit-content!important;
  }
  .funnel-stepper{
    min-height: 50vh!important;
    padding: 2em;

  }
}
.fade-enter-active {
  transition: all 0.3s ease-out;
}

.fade-enter-from {
  transform: translateY(-40px);
}

.fade-leave-active {
  position: absolute;
}
.bg-img-filter{
  filter: brightness(0.5);
}
</style>
