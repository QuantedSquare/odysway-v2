<template>
  <v-container v-if="!loadingDeal">
    <v-form
      ref="form"
    >
      <v-row>
        <v-col cols="12">
          <h2 v-if="!isAdvance">
            {{ page.details.select_travelers_title }}
          </h2>
          <h2 v-else>
            {{ page.details.nb_travelers_title }}
          </h2>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col
              cols="6"
              md="4"
            >
              <div class="text-caption">
                {{ page.details.nb_adults_label }}
              </div>
              <v-select
                v-model="model.nbAdults"
                :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
                :menu-props="{ offsetY: true }"
                :items="selectOptions(isAdvance ? 1 : 0, 9)"
              />
            </v-col>
            <!-- children -->
            <v-col
              cols="6"
              md="4"
            >
              <div class="text-caption text-truncate">
                {{ childrenLabel }}
              </div>
              <v-select
                v-model="model.nbChildren"
                :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
                :menu-props="{ offsetY: true }"
                :items="selectOptions(0, 9)"
              />
            </v-col>
          </v-row>
          <!--  Contact Details -->
          <v-row>
            <v-col cols="12">
              <h2>
                {{ page.details.contact_title }}
              </h2>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="model.firstName"
                :label="page.details.firstname_label"
                :placeholder="page.details.firstname_placeholder"
                :rules="[rules.name]"
                @change="changeAttr('firstname'); saveToLocalStorage()"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="model.lastName"
                :label="page.details.lastname_label"
                :placeholder="page.details.lastname_placeholder"
                :rules="[rules.name]"
                @change="changeAttr('lastname'); saveToLocalStorage()"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="model.email"
                :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
                :label="page.details.email_label"
                :placeholder="page.details.email_placeholder"
                :rules="[rules.email]"
                @change="saveToLocalStorage()"
              />
              <v-checkbox
                v-model="model.optinNewsletter"
                :class="model.optinNewsletter ? 'text-primary' : ''"
              >
                <template #label>
                  <div class="text-caption text-no-wrap">
                    {{ page.details.newsletter_text }}
                    <br> {{ page.details.newsletter_label }}
                  </div>
                </template>
              </v-checkbox>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <PhoneTextField
                v-model="model.phone"
                @validity-changed="isPhoneValid = $event"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
    <v-row>
      <v-col
        class="d-flex ga-3"
      >
        <v-btn
          class="
        bg-grey-light font-weight-regular"
          @click="emit('previous')"
        >
          Précédent
        </v-btn>
        <v-btn
          :disabled="!isValid"
          :loading="buttonLoading"
          color="secondary"
          class="font-weight-bold"
          @click="submitStepData"
        >
          Suivant
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

const { ownStep, voyage, page, checkoutType } = defineProps(['ownStep', 'voyage', 'page', 'initialDealValues', 'checkoutType'])
const emit = defineEmits(['next', 'previous', 'validity-changed'])
const config = useRuntimeConfig()

const model = defineModel()

const loadingDeal = ref(false)
const buttonLoading = ref(false)

const { createDeal, updateDeal } = useStepperDeal(ownStep)
const route = useRoute()

// New: Local validation state

const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

const isAdvance = ref(true)

const childrenLabel = computed(() => {
  if (page?.details?.nb_children_label && voyage?.maxChildrenAge) {
    return page.details.nb_children_label.replace('{{maxAge}}', Number(voyage.maxChildrenAge))
  }
  return 'Nombre d\'enfants'
})
const isPhoneValid = ref(false)
// New: Form validation logic
const isValid = computed(() => {
  const hasValidName = model.value.firstName && model.value.lastName
  const hasValidEmail = rules.email(model.value.email) === true
  const hasValidTravelers = model.value.nbAdults > 0 && model.value.nbAdults + model.value.nbChildren > 0

  return hasValidName && hasValidEmail && hasValidTravelers && isPhoneValid.value
})

const saveToLocalStorage = () => {
  const dataToStore = {
    firstname: model.value.firstName,
    lastname: model.value.lastName,
    email: model.value.email,
    phone: model.value.phone,
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

const rules = {
  name: schemaToRule(nameSchema),
  email: schemaToRule(emailSchema),
  phone: schemaToRule(phoneSchema),
}

const nbTravelers = computed(() => +model.value.nbAdults + +model.value.nbChildren)
const submitStepData = async () => {
  // Validate form
  if (!isValid.value) return false
  //  #todo soustraire la réduction s'il y en a une

  try {
    // Submit form data
    if (route.query.booked_id) {
      // Update deal with this values only after creation.
      // So only when checkout type is deposit or full`

      if (checkoutType === 'deposit' || checkoutType === 'full') {
        buttonLoading.value = true
        const utmSource = localStorage.getItem('utmSource')
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
          utm: utmSource || '',
        })
        buttonLoading.value = false
      }
      else {
        updateDeal({
          email: model.value.email,
          phone: model.value.phone,
          firstname: model.value.firstName,
          lastname: model.value.lastName,
        })
        buttonLoading.value = false
      }
      emit('next')
      // console.log('deal updated')
    }
    // else we update basics and create a deal with it
    else {
      // const origin = config.public.siteURL
      // const bmsLink = `${origin}/booking-management/${voyage.slug}/${route.query.date_id}`
      // console.log('bmsLink', bmsLink) // #TODO To Add to schema
      const stage = (model.value.email === 'test@test.com' || model.value.email === 'ottmann.alex@gmail.com') || config.public.environment === 'development' ? '48' : '2'
      buttonLoading.value = true
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
        image: voyage.imgSrc || 'https://cdn.buttercms.com/gzdJu2fbQDi9Pl3h80Jn',
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
        // Contacts
        email: model.value.email,
        phone: model.value.phone,
        firstname: model.value.firstName,
        lastname: model.value.lastName,
        optinNewsletter: model.value.optinNewsletter,
        // BMSLink:
      }
      trackPixel('track', 'AddToCart')
      emit('next')
      console.log('===========flattenedDeal in Details.vue===========', flattenedDeal)
      await createDeal(flattenedDeal)
      buttonLoading.value = false
    }
  }
  catch (error) {
    // Handle errors
    console.log('error updating or creating deal', error)
    return false
  }
}

watch(model, () => {
  saveToLocalStorage()
})

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
