<template>
  <v-col
    v-if="status === 'success' && page"
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
            class="border-width w-fit-content "
            elevation="2"
            :image="''"
          >
            <template #image>
              <Transition name="fade">
                <!--  Remplacer src -->
                <v-img
                  v-if="voyage.imgSrc && currentStep >= 5"
                  class="d-none d-md-block bg-img-filter"
                  lazy-src="https://cdn.buttercms.com/zvLsa1w8QCaf6WaWc3of"
                  height="400"
                />
              </Transition>
            </template>
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
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item>
                    <FunnelStepsOptions
                      :ref="(component) => registerStepComponent(component, 3)"
                      v-model="validForm"
                      :current-step="currentStep"
                      :page="page"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item>
                    <FunnelStepsInsurances
                      :ref="(component) => registerStepComponent(component, 4)"
                      v-model="validForm"
                      :current-step="currentStep"
                      :page="page"
                    />
                  </v-stepper-window-item>
                  <v-stepper-window-item :value="5">
                    <v-row>
                      <v-col
                        cols="12"
                        md="6"
                        class="d-flex align-end"
                      >
                        <FunnelStepsPaymentRedirect
                          :ref="(component) => registerStepComponent(component, 5)"
                          v-model="validForm"
                          :page="page"
                          :current-step="currentStep"
                          :voyage="voyage"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="6"
                        class="d-flex align-start"
                      >
                        <FunnelStepsSummary
                          v-model="validForm"
                          :current-step="currentStep"
                          :page="page"
                          :voyage="voyage"
                        />
                      </v-col>
                    </v-row>
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
                <template
                  #next
                >
                  <v-btn
                    v-if="currentStep < 5"
                    :disabled="!enablingNextButton"
                    color="secondary"
                    :loading="loading"
                    @click="nextStep"
                  >
                    Suivant
                  </v-btn>
                  <ClientOnly>
                    <div
                      id="next-btn"
                    />
                  </ClientOnly>
                </template>
              </v-stepper-actions>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </FunnelStepsStepperHeader>
  </v-col>
  <v-skeleton-loader
    v-else
    type="card"
  />
</template>

<script setup>
const route = useRoute()
const slug = route.params.voyageSlug
const { data: page, status: asyncDataStatus } = await useFetch('/api/v1/pages/' + slug)
const { data: voyage, status } = await useAsyncData(`voyage-${slug}`, () => {
  return queryCollection('voyages').where('slug', '=', slug).first()
})
const validForm = ref(true)
const stepComponents = reactive(new Map())
const loading = ref(false)
const currentStep = ref(0)
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
