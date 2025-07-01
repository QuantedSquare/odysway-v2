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
              cols="12"
              md="4"
            >
              <div class="text-caption">
                {{ page.details.nb_adults_label }}
              </div>
              <v-select
                v-model="nbAdults"
                :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
                :menu-props="{ offsetY: true }"
                :items="selectOptions(isAdvance ? 1 : 0, 9)"
              />
            </v-col>
            <!-- children -->
            <v-col
              cols="12"
              md="4"
            >
              <div class="text-caption text-truncate">
                {{ childrenLabel }}
              </div>
              <v-select
                v-model="nbChildren"
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
                v-model="firstName"
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
                v-model="lastName"
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
                v-model="email"
                :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
                :label="page.details.email_label"
                :placeholder="page.details.email_placeholder"
                :rules="[rules.email]"
                @change="saveToLocalStorage()"
              />
              <v-checkbox
                v-model="optinNewsletter"
                :class="optinNewsletter ? 'text-primary' : ''"
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
                v-model="phone"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
  <v-skeleton-loader
    v-else
    type="card"
  />
</template>

<script setup>
import { z } from 'zod'
import { computed } from 'vue'

const { currentStep, ownStep, voyage, page } = defineProps(['currentStep', 'ownStep', 'voyage', 'page'])
const config = useRuntimeConfig()

const { deal, dealId, createDeal, updateDeal, checkoutType, loadingDeal } = useStepperDeal(ownStep)
const { addSingleParam } = useParams()
const route = useRoute()

// New: Local validation state
const isValid = ref(false)
const emit = defineEmits(['validity-changed'])

const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

const isAdvance = ref(true)
const optinNewsletter = ref(false)
const nbAdults = ref(1)
const nbChildren = ref(0)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')

const childrenLabel = computed(() => {
  if (page?.details?.nb_children_label && voyage?.maxChildrenAge) {
    return page.details.nb_children_label.replace('{{maxAge}}', Number(voyage.maxChildrenAge))
  }
  return 'Nombre d\'enfants'
})

// New: Form validation logic
const formValidation = computed(() => {
  const hasValidName = firstName.value && lastName.value
  const hasValidEmail = email.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  const hasValidTravelers = nbAdults.value > 0 && nbAdults.value + nbChildren.value > 0

  return hasValidName && hasValidEmail && hasValidTravelers
})

// New: Watch validation and emit changes
watch(formValidation, (isFormValid) => {
  isValid.value = isFormValid
  emit('validity-changed', ownStep, isFormValid)
}, { immediate: true })

watch(() => currentStep, (value) => {
  if (value === ownStep) {
    addSingleParam('step', ownStep)
  }
}, { immediate: true })

watch(deal, () => {
  if (deal.value) {
    nbAdults.value = +deal.value.nbAdults
    nbChildren.value = +deal.value.nbUnderAge || 0
    email.value = deal.value.contact.email
    firstName.value = deal.value.contact.firstName
    lastName.value = deal.value.contact.lastName
  }
})

const saveToLocalStorage = () => {
  const dataToStore = {
    firstname: firstName.value,
    lastname: lastName.value,
    email: email.value,
    phone: phone.value,
  }
  localStorage.setItem('detailsData', JSON.stringify(dataToStore))
}
const loadFromLocalStorage = () => {
  const storedData = JSON.parse(localStorage.getItem('detailsData'))
  if (storedData) {
    firstName.value = storedData.firstname
    lastName.value = storedData.lastname
    email.value = storedData.email
    phone.value = storedData.phone
  }
}
onMounted(() => {
  loadFromLocalStorage()
})

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const emailSchema = z.string().email({ message: 'Adresse email invalide' })

const rules = {
  name: schemaToRule(nameSchema),
  email: schemaToRule(emailSchema),
}

const nbTravelers = computed(() => nbAdults.value + nbChildren.value)

const submitStepData = async () => {
  // Validate form
  if (!isValid.value) return false
  //  #todo soustraire la réduction s'il y en a une

  try {
    // Submit form data
    if (dealId.value) {
      // Update deal with this values only after creation.
      // So only when checkout type is deposit or full
      if (checkoutType.value === 'deposit' || checkoutType.value === 'full') {
        await updateDeal({
          nbTravelers: nbAdults.value + nbChildren.value,
          nbChildren: nbChildren.value,
          nbAdults: nbAdults.value,
          // nbTeen: nbTeen.value,
          nbUnderAge: nbChildren.value,
          email: email.value,
          phone: phone.value,
          firstname: firstName.value,
          lastname: lastName.value,
        })
      }
      else {
        await updateDeal({
          email: email.value,
          phone: phone.value,
          firstname: firstName.value,
          lastname: lastName.value,
        })
      }
    }
    // else we update basics and create a deal with it
    else {
      const flattenedDeal = {
        value: voyage.startingPrice, // Don't care about this value, we Calculate it in back
        title: voyage.title,
        currency: 'eur',
        group: '1',
        owner: '1',
        stage: config.public.environment === 'development' ? '48' : '2',
        // CustomFields
        departureDate: voyage.departureDate,
        returnDate: voyage.returnDate,
        travelType: voyage.travelType, // voyage.plan, // #todo à checker
        nbTravelers: nbAdults.value + nbChildren.value,
        nbChildren: nbChildren.value,
        nbAdults: nbAdults.value,
        // nbTeen: nbTeen.value,
        nbUnderAge: nbChildren.value,
        country: voyage.country,
        iso: voyage.iso,
        zoneChapka: voyage.zoneChapka,
        image: voyage.imgSrc || 'https://cdn.buttercms.com/gzdJu2fbQDi9Pl3h80Jn',
        currentStep: 'Création du Deal',
        alreadyPaid: 0,
        restToPay: 0, // Don't care about this value, we Calculate it in back
        utm: route.query.utm || '',
        slug: voyage.slug,
        basePricePerTraveler: voyage.startingPrice,
        promoChildren: voyage.promoChildren,
        maxChildrenAge: voyage.maxChildrenAge,
        // promoTeen: voyage.promoTeen,
        // maxTeenAge: voyage.maxTeenAge,
        source: 'Devis',
        forcedIndivRoom: nbTravelers.value === 1 && voyage.forcedIndivRoom ? 'Oui' : 'Non',
        indivRoomPrice: voyage.indivRoomPrice,
        promoEarlybird: voyage.promoEarlybird,
        gotEarlybird: voyage.gotEarlybird,
        promoLastMinute: voyage.promoLastMinute,
        gotLastMinute: voyage.gotLastMinute,
        // Contacts
        email: email.value,
        phone: phone.value,
        firstname: firstName.value,
        lastname: lastName.value,
        optinNewsletter: optinNewsletter.value,
      }
      trackPixel('track', 'AddToCart')
      return await createDeal(flattenedDeal)
    }
    return true
  }
  catch (error) {
    // Handle errors
    console.log('error updating or creating deal', error)
    return false
  }
}

watch(phone, () => {
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

defineExpose({
  submitStepData,
})
</script>
