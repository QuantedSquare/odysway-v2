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
      <div class="funnel-stepper d-flex justify-center">
        <v-card
          class="border-width w-fit-content "
          elevation="2"
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
              v-if="currentStep !== 0 && currentStep !== 6"
              :titre="voyage.title"
              :image="voyage.imgSrc"
            />
          </Transition>
          <v-row class="ma-0 pa-0">
            <v-col
              cols="12"
              :md="currentStep === 6 ? 6 : 12"
              class="pa-0"
            >
              <v-stepper-window>
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
                  :disabled="!enablingNextButton"
                  color="secondary"
                  :loading="loading"
                  @click="nextStep"
                >
                  Suivant
                </v-btn>
              </template>
            </v-stepper-actions>
          </v-card-actions>
        </v-card>
      </div>
    </FunnelStepsStepperHeader>
  </v-col>
  <v-skeleton-loader
    v-else
    type="card"
  />
</template>

<script setup>
const route = useRoute()
const slug = route.params.slug
const { data: page, status: asyncDataStatus } = await useFetch('/api/v1/pages/' + slug)
const { data: voyage, status } = await useAsyncData(`voyage-${slug}`, () => {
  return queryCollection('voyages').where('slug', '=', slug).first()
})
const validForm = ref(true)
const stepComponents = reactive(new Map())
const loading = ref(false)
const currentStep = ref(4)
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
</style>
