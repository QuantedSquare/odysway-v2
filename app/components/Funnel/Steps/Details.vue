<template>
  <v-container
    v-if="!loadingDeal"
    class="pa-0 pa-sm-4"
  >
    <v-form ref="form">
      <v-row>
        <v-col
          cols="12"
          class="d-flex ga-2 pb-0"
        >
          <v-divider
            variant="solid"
            opacity="1"
            thickness="3"
            class="rounded-lg"
            color="secondary"
            vertical
          />
          <h2>
            {{ page.details.nb_travelers_title }}
          </h2>
        </v-col>

        <v-col
          cols="6"
          md="6"
          class="pb-0"
        >
          <div class="text-caption">
            {{ page.details.nb_adults_label }}
          </div>
          <v-select
            v-model="model.nbAdults"
            class="remove-message-display"
            :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
            :menu-props="{ offsetY: true }"
            :items="selectOptions(isAdvance ? 1 : 0, 9)"
            :item-props="adultItemPropsFn"
          />
        </v-col>
        <!-- children -->
        <v-col
          cols="6"
          md="6"
          class="pb-0"
        >
          <div class="text-caption text-truncate">
            {{ childrenLabel }}
          </div>
          <v-select
            v-model="model.nbChildren"
            class="remove-message-display"
            :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
            :menu-props="{ offsetY: true }"
            :items="selectOptions(0, 9)"
            :item-props="childrenItemPropsFn"
          />
        </v-col>
        <v-col
          cols="12"
          class="pt-1"
        >
          <div
            v-if="capacityMessage"
            class="text-caption font-italic text-grey"
          >
            {{ capacityMessage }}
          </div>
        </v-col>
      </v-row>

      <v-divider
        class="my-4"
        variant="solid"
        opactiy="1"
      />
      <!--  Contact Details -->
      <v-row>
        <v-col
          cols="12"
          class="d-flex ga-2 pb-0"
        >
          <v-divider
            variant="solid"
            opacity="1"
            thickness="3"
            class="rounded-lg"
            color="secondary"
            vertical
          />
          <h2>
            {{ page.details.contact_title }}
          </h2>
        </v-col>
        <v-col
          cols="12"
        >
          <div>
            ✉️ {{ page.details.email_label }} <span class="text-green-light ml-2">(sauvegardé automatiquement)</span>
          </div>
          <v-text-field
            v-model="model.email"
            :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
            :placeholder="page.details.email_placeholder"
            :rules="[rules.email]"
            hide-details
            @change="saveToLocalStorage()"
          />
        </v-col>
        <v-col
          cols="6"
        >
          <div>
            {{ page.details.firstname_label }}
          </div>
          <v-text-field
            v-model="model.firstName"
            :placeholder="page.details.firstname_placeholder"
            :rules="[rules.name]"
            hide-details
            @change="changeAttr('firstname'); saveToLocalStorage()"
          />
        </v-col>
        <v-col
          cols="6"
        >
          <div>
            {{ page.details.lastname_label }}
          </div>
          <v-text-field
            v-model="model.lastName"
            :placeholder="page.details.lastname_placeholder"
            :rules="[rules.name]"
            hide-details
            @change="changeAttr('lastname'); saveToLocalStorage()"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="pb-0"
        >
          <div>
            {{ 'Téléphone *' }}
          </div>
          <PhoneTextField
            v-model="model.phone"
            @validity-changed="isPhoneValid = $event"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="pb-md-5 "
        >
          <div>
            {{ page.details.country_label || 'Pays de résidence' }}
          </div>
          <v-autocomplete
            v-model="model.isoContact"
            :items="countries"
            :placeholder="page.details.country_placeholder || 'Sélectionnez votre pays'"
            :rules="[rules.name]"
            item-title="title"
            item-value="value"
            hide-details
            @change="saveToLocalStorage()"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          class="text-center pt-0"
        >
          <div class="d-flex align-center text-left ga-1 text-caption text-grey">
            <span>En renseignant votre email, vous acceptez que nous puissions vous contacter pour finaliser votre réservation.
              <NuxtLink
                class="text-grey text-decoration-underline"
                to="/politique-de-confidentialite"
                target="_blank"
              >Politique de confidentialité</NuxtLink>
            </span>
          </div>
        </v-col>
      </v-row>
    </v-form>
    <v-row v-if="!route.query.booked_id && route.query.date_id">
      <v-col cols="12">
        <div class="option-block">
          <div class="d-flex ga-4">
            <v-checkbox
              v-model="isOptionMode"
              hide-details
              density="compact"
            />
            <span class="title-2">
              <strong>⏳ Pas encore prêt</strong> ? Bloquez ce voyage <strong>gratuitement pendant 7 jours</strong>, sans engagement ni paiement.
            </span>
          </div>
          <v-divider class="my-2 d-block d-md-none" />
          <div class="d-block d-md-none">
            Vous préférez poser une question ?
            💬
            <a
              href="https://wa.me/+33780919540"
              class="text-decoration-underline text-primary"
              @click="handleWhatsappClick"
            >Écrivez-nous sur WhatsApp </a>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        class="d-flex ga-3 align-center justify-center"
        cols="12"
      >
        <Transition
          name="fade"
          mode="out-in"
        >
          <v-btn
            v-if="route.query.booked_id"
            key="next-btn-one"
            :disabled="!isValid"
            color="secondary"
            height="50"
            block
            class="font-weight-bold custom-btn-shadow"
            @click="submitStepData"
          >
            Continuer ma réservation
            <v-icon>{{ mdiArrowRight }}</v-icon>
          </v-btn>
          <template v-else-if="!showProgress">
            <v-btn
              v-if="isOptionMode"
              key="option-btn"
              block
              height="50"
              :disabled="!isValid"
              color="primary"
              class="font-weight-bold text-decoration-none"
              @click="submitStepData"
            >
              <span class="text-body-1 font-weight-bold">
                {{ 'Confirmer mon option' }}
                <v-icon>{{ mdiArrowRight }}</v-icon>
              </span>
            </v-btn>
            <v-btn
              v-else
              key="next-btn"
              block
              height="50"
              :disabled="!isValid"
              color="secondary"
              class="font-weight-bold text-decoration-none custom-btn-shadow"
              @click="submitStepData"
            >
              <span class="text-body-1 font-weight-bold">
                {{ 'Continuer ma réservation' }}
                <v-icon>{{ mdiArrowRight }}</v-icon>
              </span>
            </v-btn>
          </template>
          <FunnelFlightProgress
            v-else
            key="next-progress"
            :loading="buttonLoading"
            @finished="onProgressFinished"
          />
        </Transition>
      </v-col>
      <v-col
        cols="12"
        class="text-grey text-center d-flex align-center justify-center ga-1 py-0"
      >
        <template v-if="!isOptionMode">
          <div class="pt-1">
            🔒 Aucun paiement à cette étape · 🔄 Remboursable J-60 · ⭐ 4,8/5
          </div>
        </template>
        <div v-else>
          🔒 Aucun paiement · 🔄 Remboursable J-60 · ⭐ 4,8/5
        </div>
      </v-col>
      <v-col v-if="route.query.voyage">
        <v-btn
          key="previous-page-btn"
          block
          color="grey-light"
          @click="redirectToTravelPage"
        >
          <div class="text-primary">
            <v-icon>{{ mdiArrowLeft }}</v-icon>
            Retour au voyage
          </div>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <v-skeleton-loader
    v-else
    type="card"
  />
</template>

<script setup>
import { z } from 'zod'
import { computed } from 'vue'
import { mdiArrowRight, mdiArrowLeft, mdiLock } from '@mdi/js'
import { countries } from '~/utils/countries'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const { trackReservationStep, trackCtaClick } = useGtmTracking()

const { voyage, page, checkoutType, dateId } = defineProps(['ownStep', 'voyage', 'page', 'initialDealValues', 'checkoutType', 'dateId'])

const emit = defineEmits(['next', 'previous', 'validity-changed'])
const config = useRuntimeConfig()

const model = defineModel()

const loadingDeal = ref(false)
const buttonLoading = ref(false)
const showProgress = ref(false)
const shouldAdvance = ref(false)

const onProgressFinished = () => {
  showProgress.value = false
  if (shouldAdvance.value) {
    shouldAdvance.value = false
    emit('next')
  }
}

const { createDeal, updateDeal, bookedId } = useStepperDeal()
const isOptionMode = ref(false)
const route = useRoute()

// New: Local validation state

const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

const maxSelectableTravelers = computed(() => {
  const remainingSeats = voyage?.remainingSeats
  if (typeof remainingSeats === 'number' && remainingSeats >= 0) return remainingSeats
  return null
})

const capacityMessage = computed(() => {
  if (maxSelectableTravelers.value === null) return null
  if (maxSelectableTravelers.value === 0) return 'Ce départ est complet : impossible d’ajouter des voyageurs.'
  return `Ce départ ne permet plus que ${maxSelectableTravelers.value} voyageur(s). Les options au‑delà sont désactivées.`
})

const adultItemPropsFn = function (item) {
  const adults = Number(item)
  const children = Number(model.value.nbChildren || 0)
  const limit = maxSelectableTravelers.value
  const disabledByCapacity = typeof limit === 'number' ? (adults + children) > limit : false

  return {
    value: item,
    title: item,
    disabled: disabledByCapacity,
  }
}

const childrenItemPropsFn = function (item) {
  const children = Number(item)
  const adults = Number(model.value.nbAdults || 0)
  const limit = maxSelectableTravelers.value
  const disabledByCapacity = typeof limit === 'number' ? (adults + children) > limit : false

  return {
    value: item,
    title: item,
    disabled: disabledByCapacity,
  }
}

const isAdvance = ref(true)

const childrenLabel = computed(() => {
  if (page?.details?.nb_children_label && voyage?.maxChildrenAge) {
    return page.details.nb_children_label.replace('{{maxAge}}', Number(voyage.maxChildrenAge))
  }
  return 'Enfants'
})
const isPhoneValid = ref(false)
// New: Form validation logic
const isValid = computed(() => {
  const hasValidName = model.value.firstName && model.value.lastName
  const hasValidEmail = rules.email(model.value.email) === true
  const hasValidTravelers = model.value.nbAdults > 0 && model.value.nbAdults + model.value.nbChildren > 0
  const hasValidCountry = model.value.isoContact && model.value.isoContact.length > 0

  return hasValidName && hasValidEmail && hasValidTravelers && isPhoneValid.value && hasValidCountry
})

const saveToLocalStorage = () => {
  const dataToStore = {
    firstname: model.value.firstName,
    lastname: model.value.lastName,
    email: model.value.email,
    phone: model.value.phone,
    isoContact: model.value.isoContact,
  }
  localStorage.setItem('detailsData', JSON.stringify(dataToStore))
}
const loadFromLocalStorage = () => {
  const storedData = JSON.parse(localStorage.getItem('detailsData'))
  if (storedData) {
    model.value.firstName = storedData.firstname
    model.value.lastName = storedData.lastname
    model.value.email = storedData.email
    model.value.phone = storedData.phone
    model.value.isoContact = storedData.isoContact
  }
}
onMounted(() => {
  if (!route.query.booked_id) {
    loadFromLocalStorage()
  }
})

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const emailSchema = z.string().email({ message: 'Adresse email invalide' })
const phoneSchema = z.string().min(9, { message: 'Numéro de téléphone invalide' })
const requiredSchema = z.string().min(1, { message: 'Cette information est requise.' })

const rules = {
  name: schemaToRule(nameSchema),
  email: schemaToRule(emailSchema),
  phone: schemaToRule(phoneSchema),
  required: schemaToRule(requiredSchema),
}

const nbTravelers = computed(() => +model.value.nbAdults + +model.value.nbChildren)

const submitStepData = async () => {
  // Validate form
  if (!isValid.value) {
    return false
  }
  //  #todo soustraire la réduction s'il y en a une
  shouldAdvance.value = true
  // Only show the flight progress animation for the create-deal flow.
  // The update-deal flow (when booked_id is in the URL) advances instantly.
  if (!route.query.booked_id) {
    showProgress.value = true
    buttonLoading.value = true
    console.log('[Details] showProgress + buttonLoading set true')
  }
  try {
    // Submit form data
    if (route.query.booked_id) {
      // Update deal with this values only after creation.
      // So only when checkout type is deposit or full`

      if (checkoutType === 'deposit' || checkoutType === 'full') {
        const utmSource = localStorage.getItem('utmSource')
        console.log('===========MODEL IN UPDATE DEAL===========', model.value)
        updateDeal({
          nbTravelers: model.value.nbAdults + model.value.nbChildren,
          nbChildren: model.value.nbChildren,
          nbAdults: model.value.nbAdults,
          // nbTeen: nbTeen.value,
          nbUnderAge: model.value.nbChildren,
          email: model.value.email,
          phone: model.value.phone,
          firstname: model.value.firstName,
          lastname: model.value.lastName,
          isoContact: model.value.isoContact,
          utm: utmSource || '',
        })
      }
      else {
        updateDeal({
          email: model.value.email,
          phone: model.value.phone,
          firstname: model.value.firstName,
          lastname: model.value.lastName,
          isoContact: model.value.isoContact,
        })
      }
      emit('next')
      buttonLoading.value = false
      // console.log('deal updated')
    }
    // else we update basics and create a deal with it
    else {
      const origin = config.public.siteURL
      const linkBms = `${origin}/booking-management/${voyage.slug}/${dateId}`

      // #TODO: Add a dev column/stage  in ActiveCampaign
      const stage = (model.value.email === 'test@test.com' || model.value.email === 'ottmann.alex@gmail.com') || config.public.environment === 'development' ? '80' : '2'
      const utmSource = localStorage.getItem('utmSource')
      const flattenedDeal = {
        value: voyage.startingPrice, // Don't care about this value, we Calculate it in back
        title: voyage.title,
        currency: 'eur',
        group: '1',
        owner: '1',
        stage: stage,
        // CustomFields
        departureDate: voyage.departureDate,
        returnDate: voyage.returnDate,
        travelType: voyage.travelType, // voyage.plan, // #todo à checker
        nbTravelers: +model.value.nbAdults + +model.value.nbChildren,
        nbChildren: +model.value.nbChildren,
        nbAdults: +model.value.nbAdults,
        // nbTeen: nbTeen.value,
        nbUnderAge: +model.value.nbChildren,
        country: voyage.country,
        iso: voyage.iso,
        zoneChapka: voyage.zoneChapka,
        image: voyage.imgSrc || '/images/default/Odysway-couverture-mongolie.jpeg',
        currentStep: 'Création du Deal',
        alreadyPaid: 0,
        restToPay: 0, // Don't care about this value, we Calculate it in back
        utm: utmSource || '',
        slug: voyage.slug,
        basePricePerTraveler: voyage.startingPrice,
        promoChildren: voyage.promoChildren,
        maxChildrenAge: voyage.maxChildrenAge,
        promoTeen: voyage.promoChildren,
        includeFlight: voyage.includeFlight ? 'Oui' : 'Non',
        flightPrice: voyage.flightPrice,
        source: 'Devis',
        indivRoom: voyage.indivRoom && voyage.indivRoomPrice > 0 ? ['Oui'] : ['Non'],
        forcedIndivRoom: nbTravelers.value === 1 && voyage.forcedIndivRoom ? 'Oui' : 'Non',
        indivRoomPrice: voyage.indivRoomPrice,
        promoEarlybird: voyage.promoEarlybird,
        gotEarlybird: voyage.gotEarlybird ? 'Oui' : 'Non',
        promoLastMinute: voyage.promoLastMinute,
        gotLastMinute: voyage.gotLastMinute ? 'Oui' : 'Non',
        linkBms,
        isCapExploraction: voyage.isCapExploraction ? 'Oui' : 'Non',
        // Contacts
        email: model.value.email,
        phone: model.value.phone,
        firstname: model.value.firstName,
        lastname: model.value.lastName,
        optinNewsletter: model.value.optinNewsletter,
        isoContact: model.value.isoContact,
      }

      // GTM: Track reservation_step2 (contact details submitted)
      const { getCountryFromPhone } = useGtmTracking()
      const additionalData = {
        optin_newsletter: model.value.optinNewsletter,
        user_data: {
          user_id: model.value.email,
          user_mail: model.value.email,
          user_phone: model.value.phone,
          user_country: getCountryFromPhone(model.value.phone),
        },
      }
      trackReservationStep(1, voyage, model.value, additionalData)

      console.log('[Details] calling createDeal...')
      await createDeal(flattenedDeal)
      console.log('[Details] createDeal resolved -> buttonLoading = false')
      buttonLoading.value = false
      showProgress.value = false
      shouldAdvance.value = false

      if (isOptionMode.value && bookedId.value) {
        try {
          await bookingApi.placeOption({ id: bookedId.value, booked_places: +model.value.nbAdults + +model.value.nbChildren })
        }
        catch (err) {
          console.error('[Details] placeOption error', getApiErrorMessage(err))
        }
        updateDeal({
          stage: '27',
          currentStep: 'A posé une option',
          title: voyage.title,
          nbTravelers: +model.value.nbAdults + +model.value.nbChildren,
          firstName: model.value.firstName,
          lastName: model.value.lastName,
        })
        if (config.public.environment === 'production') {
          $fetch('/api/v1/slack/notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: voyage.title, nbTravelers: +model.value.nbAdults + +model.value.nbChildren }),
          }).catch(console.error)
        }
        await navigateTo(`/confirmation?voyage=${voyage.slug}&isoption=true`)
        return
      }

      emit('next')
    }
  }
  catch (error) {
    // Handle errors
    console.log('[Details] error updating or creating deal', error)
    shouldAdvance.value = false
    buttonLoading.value = false
    showProgress.value = false
    return false
  }
}

watch(model, () => {
  saveToLocalStorage()
})
const redirectToTravelPage = async () => {
  trackCtaClick({ ctaId: 'return-travel-page', ctaLabel: 'Retour au voyage', ctaUrl: `/voyages/${voyage.slug}` })
  await navigateTo(`/voyages/${voyage.slug}`)
}
const changeAttr = (_dataAttribute) => {
  // #TODO: Uncomment this when the dataAttribute is not empty and google analytics enabled
  // const EVENTS = {
  //   lastname: { eventLabel: 'Groupe Info - Indique prénom' },
  //   firstname: { eventLabel: 'Groupe Info - Indique nom' },
  //   email: { eventLabel: 'Groupe Info - Indique nom' },
  //   phone: { eventLabel: 'Groupe Info - Indique numéro de téléphone' },
  // }
  // if (this[dataAttribute] !== '') {
  //   this.$ga.event({
  //     eventCategory: 'Devis',
  //     eventAction: 'Click',
  //     eventLabel: EVENTS[dataAttribute].eventLabel
  //   })
  // }
}
</script>

<style scoped>
.remove-message-display:deep(.v-input__details){
display:none;
}
.option-block {
  background-color: rgba(43,76,82,0.04);
  border: 1.5px dashed rgba(43,76,82,0.2);
  border-radius:10px!important;
  padding: 14px 16px;
  font-size: 13px!important;
}
.custom-btn-shadow{
 box-shadow: 0 4px 14px rgba(219,102,68,0.35)!important;
}
</style>
