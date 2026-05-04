<template>
  <div class="relative w-100 px-0 pt-0 bg-warm">
    <ClientOnly>
      <FunnelCardHeader
        v-if="voyage"
        class="d-block d-md-none"
        :titre="voyage.title"
        :travel-type="travelTypeLabel"
        :image="headerImage"
        :date="null"
        :current-step="currentStep"
        :step-definitions="stepperHeaderRef?.stepDefinitions"
        skipper-mode="devis"
        :voyage="voyage"
        :page-texts="pageTexts"
      />
      <template #fallback>
        <div class="w-100 h-50 bg-primary" />
      </template>
    </ClientOnly>
    <v-container class="mt-md-10">
      <v-row
        justify="center"
        align="start"
      >
        <ClientOnly>
          <v-col
            v-if="pageStatus === 'success' && voyage"
            cols="12"
            class="py-0 px-0"
          >
            <FunnelStepsStepperHeader
              ref="stepperHeaderRef"
              v-model="currentStep"
              :page="pageTexts"
              skipper-mode="devis"
            >
              <v-row
                class="funnel-stepper justify-center bg-warm"
                justify="center"
              >
                <v-col
                  cols="12"
                  md="7"
                  class="d-flex justify-center"
                >
                  <v-card
                    class="border-width relative no-margin-window mb-4 w-100"
                    :elevation="currentStep === 1 ? 2 : 0"
                  >
                    <v-stepper-window
                      :model-value="currentStep"
                      class="px-md-6 px-0 mt-4"
                    >
                      <v-stepper-window-item :value="1">
                        <DevisForm
                          v-model="formData"
                          :page="pageTexts"
                          @submit="submit"
                        />
                      </v-stepper-window-item>
                      <v-stepper-window-item
                        :value="2"
                        class="d-flex justify-center flex-column align-center"
                      >
                        <v-container class="text-center pt-6 pb-0">
                          <v-icon
                            color="success"
                            size="48"
                            class="mb-3"
                          >
                            {{ mdiCheckCircleOutline }}
                          </v-icon>
                          <h2 class="text-h5 font-weight-bold mb-2">
                            {{ pageTexts?.calendly?.title || "Nous avons bien reçu votre demande de devis !" }}
                          </h2>
                          <p class="text-subtitle-2 font-weight-regular">
                            {{ pageTexts?.calendly?.text }}
                          </p>
                        </v-container>
                        <CalContainer
                          :travel-title="voyage.title"
                          :is-funnel="false"
                          :voyage="voyage"
                          funnel-type="devis"
                        />
                        <v-btn
                          variant="outlined"
                          height="50"
                          class=""
                          rounded="md"
                          @click="returnToTravelPage"
                        >
                          {{ pageTexts?.buttons?.return_to_voyages || "Retourner aux voyages" }}
                        </v-btn>
                      </v-stepper-window-item>
                    </v-stepper-window>
                  </v-card>
                </v-col>

                <v-col
                  cols="4"
                  class="d-none d-md-block"
                >
                  <DevisSummary
                    :voyage="voyage"
                    :details="formData"
                    :page-texts="pageTexts"
                  />
                  <ContactUsCard
                    v-if="currentStep < 2"
                    variant="card"
                    btn-variant="outlined"
                    :avatars="pageTexts?.stickyBlock?.ctaCall?.avatars"
                    :rdv-link="`/rdv-projet-voyage?travelTitle=${voyage.title}`"
                    :show-privatisation="false"
                    :privatisation-text="pageTexts?.stickyBlock?.privatisationText"
                    :title="pageTexts?.stickyBlock?.ctaCall?.text"
                    :subtitle="pageTexts?.stickyBlock?.ctaCall?.subtitle"
                    :rdv-button-text="pageTexts?.stickyBlock?.ctaCall?.rdvButtonText"
                    :contact-preference-text="pageTexts?.stickyBlock?.contactPreferenceText"
                    :whatsapp-label="pageTexts?.stickyBlock?.whatsappLabel"
                    :whatsapp-url="pageTexts?.stickyBlock?.whatsappUrl"
                    :phone-number="pageTexts?.stickyBlock?.phoneNumber"
                    :phone-href="pageTexts?.stickyBlock?.phoneHref"
                    :business-hours="pageTexts?.stickyBlock?.businessHours"
                    :private-group-text="pageTexts?.stickyBlock?.privateGroupText"
                  />
                </v-col>
              </v-row>
            </FunnelStepsStepperHeader>
          </v-col>
        </ClientOnly>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { mdiCheckCircleOutline } from '@mdi/js'

definePageMeta({ layout: 'funnel' })

useSeo({
  seoData: {
    robotsIndex: false,
    robotsFollow: false,
  },
})

const { trackDevisStep, getCountryFromPhone } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()
const { travelTitle } = useFunnelHeader()
const route = useRoute()
const sanity = useSanity()

const currentStep = ref(1)
const stepperHeaderRef = useTemplateRef('stepperHeaderRef')

const initialTravelers = (+route.query.nbAdults || 0) + (+route.query.nbChildren || 0) || 1

const formData = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  validatePhone: false,
  nbTravelers: initialTravelers,
  departureMonth: null,
  departureYear: 2026,
  includeFlight: false,
  departureCity: '',
  message: '',
  loading: false,
})

const voyageQuery = groq`*[_type == "voyage" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  image,
  travelType,
  pricing {
    startingPrice,
    pricePerPerson,
    childrenAge,
    childrenPromo
  },
  "destinations": destinations[]-> {
    _id,
    title,
    iso,
    chapka
  },
  "experienceType": experienceType-> {
    _id,
    title
  },
  "categories": categories[]-> {
    _id,
    title
  },
  monthlyAvailability,
  availabilityTypes
}`

const devisQuery = groq`*[_type == "devis"][0]{
  fil_dariane_devis,
  calendly,
  buttons,
  form_labels,
  options
}`

const stickyQuery = groq`*[_type == "page_voyage"][0]{
  stickyBlock{
    ...,
    ctaCall{
      ...,
      avatars[]->{
        _id,
        name,
        image
      }
    }
  }
}`

const [
  { data: voyage },
  { data: pageTexts, status: pageStatus },
  { data: voyagePage },
] = await Promise.all([
  useAsyncData(`devis-voyage-${route.query.slug}`, () => sanity.fetch(voyageQuery, { slug: route.query.slug })),
  useAsyncData('devis-texts', () => sanity.fetch(devisQuery)),
  useAsyncData('devis-sticky', () => sanity.fetch(stickyQuery)),
])

watchEffect(() => {
  if (pageTexts.value && voyagePage.value) {
    pageTexts.value.stickyBlock = voyagePage.value.stickyBlock
  }
  if (voyage.value?.title) {
    travelTitle.value = voyage.value.title
  }
})

const headerImage = computed(() => {
  return getImageUrl(voyage.value?.image?.asset?._ref) || '/images/default/Odysway-couverture-mongolie.jpeg'
})

const travelTypeLabel = computed(() => {
  const types = voyage.value?.availabilityTypes || []
  const parts = []
  if (types.includes('privatisation')) parts.push('Voyage privatif')
  else if (types.includes('groupe')) parts.push('Voyage en groupe')
  else parts.push(voyage.value?.travelType || 'Voyage individuel')
  if (types.includes('custom')) parts.push('sur mesure')
  return parts.join(' · ')
})

const destinations = computed(() => voyage.value?.destinations || [])

onMounted(() => {
  if (voyage.value) {
    trackDevisStep('classic', 0, formatVoyageForGtm(voyage.value))
  }
})

const submit = async () => {
  formData.value.loading = true
  try {
    const stage = (formData.value.email === 'test@test.com' || formData.value.email === 'ottmann.alex@gmail.com') ? '75' : '2'
    const utmSource = localStorage.getItem('utmSource')
    const departureDate = formData.value.departureMonth && formData.value.departureYear
      ? `01/${String(formData.value.departureMonth).padStart(2, '0')}/${formData.value.departureYear}`
      : ''

    const voyageBody = {
      value: voyage.value.pricing.startingPrice * 100,
      title: voyage.value.title,
      currency: 'eur',
      group: '1',
      owner: '1',
      stage,
      specialRequest: (formData.value.message || '') + (formData.value.includeFlight && formData.value.departureCity ? ` - Aéroport de départ : ${formData.value.departureCity}` : ''),
      departureDate,
      returnDate: '',
      travelType: voyage.value.travelType || 'Individuel',
      nbTravelers: +formData.value.nbTravelers,
      nbChildren: 0,
      nbAdults: +formData.value.nbTravelers,
      nbTeen: 0,
      nbUnderAge: 0,
      country: destinations.value.map(d => d.iso).join(','),
      iso: destinations.value.map(d => d.iso).join(','),
      zoneChapka: +destinations.value[0]?.chapka || 0,
      image: getImageUrl(voyage.value?.image?.asset?._ref) || '/images/default/Odysway-couverture-mongolie.jpeg',
      currentStep: 'Souhaite réserver/planifier un voyage individuel',
      alreadyPaid: 0,
      restToPay: 0,
      utm: utmSource || '',
      slug: voyage.value.slug,
      basePricePerTraveler: voyage.value.pricing.startingPrice * 100,
      includeFlight: formData.value.includeFlight ? 'Oui' : 'Non',
      depositPrice: voyage.value.pricing.startingPrice * 100 * 0.3,
      maxChildrenAge: voyage.value.pricing.childrenAge || 12,
      promoChildren: voyage.value.pricing.childrenPromo || 0,
      source: 'Demande d\'infos',
      email: formData.value.email,
      phone: formData.value.phone,
      firstname: formData.value.firstname,
      lastname: formData.value.lastname,
    }
    const formattedVoyage = formatVoyageForGtm(voyage.value)
    trackDevisStep('classic', 1, formattedVoyage)
    await apiRequest('/ac/deals', 'post', voyageBody)
    trackDevisStep('classic', 'confirmation', formattedVoyage, {
      optin_newsletter: 'false',
      user_data: {
        user_id: formData.value.email,
        user_mail: formData.value.email,
        user_phone: formData.value.phone,
        user_country: getCountryFromPhone(formData.value.phone) || 'Unknown',
      },
    })
    currentStep.value = 2
  }
  finally {
    formData.value.loading = false
  }
}
function returnToTravelPage() {
  // GTM tracking: voyage/recherche redirect
  const formattedVoyage = formatVoyageForGtm(voyage.value)
  trackDevisStep('classic', 'retour_voyages', formattedVoyage, {
    user_data: {
      user_id: formData.value.email,
      user_mail: formData.value.email,
      user_phone: formData.value.phone,
      user_country: getCountryFromPhone(formData.value.phone) || 'Unknown',
    },
  })

  navigateTo('/voyages')
}
</script>

<style scoped>
.relative {
  position: relative;
}
.no-margin-window {
  max-width: 1440px;
}
@media screen and (min-width: 768px) {
  .border-width {
    border-radius: 30px !important;
    height: fit-content !important;
  }
  .funnel-stepper {
    min-height: 50vh !important;
  }
  .no-margin-window :deep(.v-stepper-window) {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
@media screen and (max-width: 768px) {
  .no-margin-window :deep(.v-stepper-window) {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style>
