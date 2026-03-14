<template>
  <v-container>
    <v-form ref="form">
      <v-row class="justify-center">
        <v-col
          cols="12"
          class="text-center"
        >
          <div class="d-flex align-center justify-center ga-2 mb-2">
            <v-icon
              :icon="mdiLock"
              size="small"
              color="primary"
            />
            <h2 class="text-h6 font-weight-bold">
              Reservez votre voyage en toute securite
            </h2>
          </div>
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="localFirstName"
            label="Prenom *"
            placeholder="Ex: Indiana"
            :rules="[rules.name]"
            aria-label="Prenom"
            @update:model-value="saveToLocalStorage()"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="localLastName"
            label="Nom *"
            placeholder="Ex: Jones"
            :rules="[rules.name]"
            aria-label="Nom"
            @update:model-value="saveToLocalStorage()"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="localEmail"
            label="Email *"
            placeholder="Ex: indiana@mail.com"
            type="email"
            :rules="[rules.email]"
            aria-label="Adresse email"
            @update:model-value="saveToLocalStorage()"
          >
            <template
              v-if="isEmailValid"
              #append-inner
            >
              <v-icon
                :icon="mdiCheckCircle"
                color="success"
              />
            </template>
          </v-text-field>
        </v-col>

        <v-col
          cols="12"
          class="pa-0"
        >
          <v-checkbox
            v-model="localOptinNewsletter"
            :class="localOptinNewsletter ? 'text-primary' : ''"
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
          class="text-center"
        >
          <div class="d-flex align-center justify-center ga-1 text-caption text-grey mb-4">
            <v-icon
              :icon="mdiShieldCheckOutline"
              size="x-small"
            />
            <span>Vos donnees sont protegees et ne seront jamais partagees</span>
          </div>
        </v-col>
      </v-row>
    </v-form>

    <v-row>
      <v-col class="d-flex flex-column align-center ga-3">
        <v-btn
          :disabled="!isValid"
          :loading="buttonLoading"
          color="secondary"
          class="font-weight-bold"
          size="large"
          block
          aria-label="Continuer"
          @click="submitStepData"
        >
          Continuer
        </v-btn>
        <span class="text-caption text-grey">
          Vous preferez etre rappele ?
          <a
            href="https://calendly.com/odysway"
            target="_blank"
            class="text-secondary"
          >
            Prendre RDV
          </a>
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { z } from 'zod'
import { mdiLock, mdiCheckCircle, mdiShieldCheckOutline } from '@mdi/js'

const { trackReservationStep } = useGtmTracking()

const { ownStep, voyage, page, checkoutType, dateId } = defineProps(['ownStep', 'voyage', 'page', 'checkoutType', 'dateId'])

const emit = defineEmits(['next', 'previous'])
const config = useRuntimeConfig()

const model = defineModel()

const buttonLoading = ref(false)

const { createDeal, updateDeal } = useStepperDeal(ownStep)
const route = useRoute()

const localFirstName = ref(model.value.firstName || '')
const localLastName = ref(model.value.lastName || '')
const localEmail = ref(model.value.email || '')
const localOptinNewsletter = ref(model.value.optinNewsletter || false)

// Sync local values to model
watch([localFirstName, localLastName, localEmail, localOptinNewsletter], ([fn, ln, em, opt]) => {
  model.value.firstName = fn
  model.value.lastName = ln
  model.value.email = em
  model.value.optinNewsletter = opt
})

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const emailSchema = z.string().email({ message: 'Adresse email invalide' })

const rules = {
  name: schemaToRule(nameSchema),
  email: schemaToRule(emailSchema),
}

const isEmailValid = computed(() => {
  return rules.email(localEmail.value) === true
})

const isValid = computed(() => {
  const hasValidName = localFirstName.value && localLastName.value
  const hasValidEmail = rules.email(localEmail.value) === true
  return hasValidName && hasValidEmail
})

const localStorageKey = computed(() => `odysway_checkout_${dateId || route.query.date_id}`)

const saveToLocalStorage = () => {
  const dataToStore = {
    data: {
      firstname: localFirstName.value,
      lastname: localLastName.value,
      email: localEmail.value,
    },
    savedAt: Date.now(),
  }
  localStorage.setItem(localStorageKey.value, JSON.stringify(dataToStore))
  // Also save to legacy key for backward compat
  localStorage.setItem('detailsData', JSON.stringify({
    firstname: localFirstName.value,
    lastname: localLastName.value,
    email: localEmail.value,
    phone: model.value.phone,
    isoContact: model.value.isoContact,
  }))
}

const loadFromLocalStorage = () => {
  const TTL = 7 * 24 * 60 * 60 * 1000 // 7 days
  // Try namespaced key first
  const stored = localStorage.getItem(localStorageKey.value)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.savedAt && (Date.now() - parsed.savedAt) < TTL) {
        localFirstName.value = parsed.data.firstname || ''
        localLastName.value = parsed.data.lastname || ''
        localEmail.value = parsed.data.email || ''
        return
      }
      else {
        localStorage.removeItem(localStorageKey.value)
      }
    }
    catch {
      // ignore parse errors
    }
  }
  // Fallback to legacy key
  const legacy = localStorage.getItem('detailsData')
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy)
      localFirstName.value = parsed.firstname || ''
      localLastName.value = parsed.lastname || ''
      localEmail.value = parsed.email || ''
    }
    catch {
      // ignore
    }
  }
}

onMounted(() => {
  if (!route.query.booked_id) {
    loadFromLocalStorage()
  }
})

const nbTravelers = computed(() => +model.value.nbAdults + +model.value.nbChildren)

const submitStepData = async () => {
  if (!isValid.value) return false

  try {
    if (route.query.booked_id) {
      // Deal already exists, just update and move on
      buttonLoading.value = true
      updateDeal({
        email: localEmail.value,
        firstname: localFirstName.value,
        lastname: localLastName.value,
        currentStep: 'Email capture',
      })
      buttonLoading.value = false
      emit('next')
    }
    else {
      // Create deal immediately with minimal data
      const origin = config.public.siteURL
      const linkBms = `${origin}/booking-management/${voyage.slug}/${dateId || route.query.date_id}`
      const stage = (localEmail.value === 'test@test.com' || localEmail.value === 'ottmann.alex@gmail.com') || config.public.environment === 'development' ? '2' : '2'

      buttonLoading.value = true
      const utmSource = localStorage.getItem('utmSource')

      const flattenedDeal = {
        value: voyage.startingPrice,
        title: voyage.title,
        currency: 'eur',
        group: '1',
        owner: '1',
        stage: stage,
        departureDate: voyage.departureDate,
        returnDate: voyage.returnDate,
        travelType: voyage.travelType,
        nbTravelers: +model.value.nbAdults + +model.value.nbChildren,
        nbChildren: +model.value.nbChildren,
        nbAdults: +model.value.nbAdults,
        nbUnderAge: +model.value.nbChildren,
        country: voyage.country,
        iso: voyage.iso,
        zoneChapka: voyage.zoneChapka,
        image: voyage.imgSrc || '/images/default/Odysway-couverture-mongolie.jpeg',
        currentStep: 'Email capture',
        alreadyPaid: 0,
        restToPay: 0,
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
        email: localEmail.value,
        phone: '',
        firstname: localFirstName.value,
        lastname: localLastName.value,
        optinNewsletter: localOptinNewsletter.value,
        isoContact: '',
      }

      // GTM: Track reservation_step1 (email captured)
      const { getCountryFromPhone } = useGtmTracking()
      const additionalData = {
        user_data: {
          user_id: localEmail.value,
          user_mail: localEmail.value,
        },
      }
      trackReservationStep(1, voyage, model.value, additionalData)

      emit('next')
      await createDeal(flattenedDeal)
      buttonLoading.value = false
    }
  }
  catch (error) {
    console.log('error creating deal from email capture', error)
    buttonLoading.value = false
    return false
  }
}
</script>
