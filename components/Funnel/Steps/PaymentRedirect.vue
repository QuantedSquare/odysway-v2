<template>
  <v-container>
    <!-- Prévoir Promo form -->
    <v-card
      v-if="deal && deal.alreadyPaid < deal.value"
      variant="plain"
    >
      <v-card-text>
        <v-row>
          <v-col
            v-if="route.query.type === 'deposit'"
            cols="12"
          >
            <template v-if="isBooking">
              <div class="text-center">
                Souhaitez-vous poser une option gratuitement ? (Celle-ci est valable 7 jours).
              </div>
            </template>
            <template v-else>
              <v-switch
                v-model="checkedOption"
                inset
                hide-details
              >
                <template #label>
                  <div class="text-caption text-md-body-1 pl-1">
                    Souhaitez-vous poser une option gratuitement ? (Celle-ci est valable 7 jours).
                  </div>
                </template>
              </v-switch>
            </template>
          </v-col>
          <template v-if="!isBooking">
            <v-divider
              v-if="route.query.type === 'deposit'"
              horizontal
              class="ma-2"
            />
            <v-col cols="12">
              <v-switch
                v-model="switch_accept_data_privacy"
                inset
                hide-details
              >
                <template #label>
                  <div
                    class="text-caption text-md-body-1 pl-1"
                    @click.stop=""
                    v-html="page.phrase_dacceptation"
                  />
                </template>
              </v-switch>
              <v-switch
                v-model="switch_accept_country"
                inset
                hide-details
              >
                <template #label>
                  <div class="text-caption text-md-body-1 pl-1">
                    Je me suis renseigné sur les conditions d'entrée dans le pays où s'effectue le voyage
                  </div>
                </template>
              </v-switch>
            </v-col>
          </template>
          <!-- Replace btn "Suivant" in parent -->
          <ClientOnly>
            <Teleport
              v-if="currentStep >= 5"
              to="#next-btn"
              defer
            >
              <Transition name="list">
                <v-btn
                  v-if="checkedOption"
                  color="info"
                  class="ml-4"
                  large
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                  :to="`/confirmation?voyage=${voyage.slug}&success=true&isoption=true`"
                  @click="book"
                >
                  Poser une option gratuitement
                </v-btn>
                <v-btn
                  v-else
                  class="ml-md-4"
                  :loading="loadingStripeSession"
                  :disabled="(!switch_accept_data_privacy || !switch_accept_country)"
                  @click="stripePay"
                >
                  Payer
                </v-btn>
              </Transition>
            </Teleport>
          </ClientOnly>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const model = defineModel()
console.log('props', props.voyage)
const route = useRoute()

const { deal, dealId, updateDeal } = useStepperDeal(props.ownStep)
const { addSingleParam } = useParams()

// Data
// IsBooking à définir si une option dans le stepper uniquement pour poser une option
const isBooking = ref(false)
const checkedOption = ref(false)
const switch_accept_data_privacy = ref(false)
const switch_accept_country = ref(false)

const loadingStripeSession = ref(false)

const stripePay = async () => {
  loadingStripeSession.value = true
  const dataForStripeSession = {
    dealId: dealId.value,
    paymentType: route.query.type,
    contact: deal.value.contact,
    currentUrl: route.fullPath,
    insuranceImg: props.page.assurance_img,
  }
  if (route.query.type === 'custom') {
    Object.assign(dataForStripeSession, {
      amout: +route.query.amount * 100,
    })
  }
  console.log('dataForStripeSession', dataForStripeSession)

  const checkoutLink = await $fetch('/api/v1/stripe/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataForStripeSession),
  })
  if (checkoutLink) {
    console.log('checkoutLink', checkoutLink)
    await navigateTo(checkoutLink, {
      external: true,
    })
  }
  loadingStripeSession.value = false
}

const book = async () => {
  // #TODO Add booking redirect to a success page, it only update the ac deal
  console.log('Booking')
}

watch([dealId, () => props.currentStep], () => {
  if (props.currentStep === props.ownStep) {
    addSingleParam('step', props.ownStep)
  }
  model.value = true
  if (dealId.value) {
    return
  }
}, { immediate: true })

// #TODO Add option only on certain travel ?
// const showOptionOrPayment = computed(() => {
//   return checkedOption.value ? 0 : 1
// })
watch(checkedOption, (value) => {
  addSingleParam('isoption', value)
})

const submitStepData = async () => {
  // Validate form
  if (!dealId.value || !model.value) return false
  const dealData = {
    dealId: dealId.value,
    // #TODO Add data
    //
  }
  console.log('dealData', dealData)
  try {
    await updateDeal(dealData)
    return true
  }
  catch (error) {
    console.log('error updating Options', error)
  }
}
defineExpose({
  submitStepData,
})
</script>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(40px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
