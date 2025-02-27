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
            class="border-width  w-md-50 w-lg-50"
            :elevation=" skipperMode !== 'summary' && currentStep < 5 ? 2 : 0"
          >
            <Transition name="fade">
              <v-img
                v-if=" skipperMode !== 'summary' && voyage.imgSrc && currentStep === 0"
                color="surface-variant"
                height="100"
                :src="voyage.imgSrc"
                cover
              />
            </Transition>
            <Transition name="fade">
              <FunnelCardHeader
                v-if=" currentStep !== 0 && currentStep < 5 "
                :titre="voyage.title"
                :image="voyage.imgSrc"
              />
            </Transition>
            <v-row>
              <v-col
                cols="12"
              >
                <v-stepper-window :model-value="currentStep">
                  <v-stepper-window-item>
                    <template v-if="skipperMode === 'summary'">
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
                    </template>
                    <FunnelStepsSkipper
                      v-else
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
                  <v-stepper-window-item
                    :value="5"
                  >
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
                :prev-text="skipperMode !== 'summary' ?'Précédent' : ''"
                @click:next="nextStep()"
                @click:prev="previousStep()"
              >
                <template #next>
                  <div>
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
import dayjs from 'dayjs'

const route = useRoute()
const { step, dealId, slug, departure_date, return_date, plan } = route.query

// ================== Page ==================
const { data: page, status: pageStatus } = await useFetch('/api/v1/pages/' + route.name)
console.log('page', page.value)

// ================== Voyage ==================
// If slug, you're coming from travel page, otherwise, coming from custom link
// Voyage are all the statics data of the travel
// Only deal manage the dynamic values
// We generate dealId after first step and don't need statics values from voyage anymore
const { data: voyage, status: voyageStatus } = useAsyncData(`voyage-${step}`, async () => {
  if (slug) {
    console.log('slug', slug)
    const query = await queryCollection('voyages').where('slug', '=', slug).first()
    Object.assign(query, {
      departureDate: dayjs(departure_date).format('YYYY-MM-YY'),
      returnDate: dayjs(return_date).format('YYYY-MM-YY'),
      // ===== Temporary values below until it is replaced in nuxt studio =====
      // ===== Or travel manager =====
      zoneChapka: 1,
      depositPrice: query.startingPrice * 0.3 || 500,
      promoChildren: 80,
      promoTeen: 80,
      maxChildrenAge: 12,
      maxTeenAge: 18,
      source: 'Devis',
      forcedIndivRoom: 'Non',
      indivRoomPrice: 300,
      promoEarlybird: 50,
      promoLastMinute: 0,
      gotLastMinute: 'Non',
      gotEarlybird: 'Oui',
      travelType: 'Group',
    })
    console.log('query', query)

    return query
  }
  else {
    // Voyage = Toutes les valeurs fixes
    const deal = await apiRequest(`/ac/deals/${dealId}`)
    return { title: deal.title,
      startingPrice: deal.basePricePerTraveler,
      imgSrc: deal.image || 'https://cdn.buttercms.com/gzdJu2fbQDi9Pl3h80Jn',
      country: deal.country,
      iso: deal.iso,
      zoneChapka: +deal.zoneChapka,
      slug: deal.slug,
      depositPrice: deal.depositPrice, // #Todo faire sauter
      promoChildren: deal.promoChildren / 100,
      promoTeen: deal.promoTeen / 100,
      maxChildrenAge: 12,
      maxTeenAge: 18,
      source: 'Devis', // Possible que ça change
      forcedIndivRoom: deal.forcedIndivRoom,
      indivRoomPrice: deal.indivRoomPrice,
      promoEarlybird: deal.promoEarlybird / 100,
      promoLastMinute: deal.promoLastMinute / 100,
      gotLastMinute: deal.gotLastMinute === 'Oui',
      gotEarlybid: deal.gotEarlybid === 'Oui',
      departureDate: deal.departureDate,
      returnDate: deal.returnDate,
      travelType: 'Group',
      // {... COMPLETER}
    }
  }
})
console.log('voyage', voyage.value)

// ================== Stepper Management ==================
const validForm = ref(true)
const stepComponents = reactive(new Map())
const loading = ref(false)
const currentStep = ref(step ? parseInt(step) : 1)
const skipperMode = ref('normal')
if (route.query.type === 'custom' || route.query.type === 'balance') {
  currentStep.value = 5
  skipperMode.value = 'summary'
}
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
