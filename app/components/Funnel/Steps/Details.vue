<template>
  <v-container v-if="!loadingDeal">
    <v-form ref="form">
      <v-row>
        <v-col cols="12">
          <div class="text-body-2 text-grey mb-4">
            Reservation pour <strong>{{ model.firstName }} {{ model.lastName }}</strong> ({{ model.email }})
          </div>
        </v-col>

        <!-- Phone & Country for lead contact -->
        <v-col
          cols="12"
          md="6"
        >
          <v-autocomplete
            v-model="model.isoContact"
            :items="countries"
            :label="page.details.country_label || 'Pays de residence'"
            :placeholder="page.details.country_placeholder || 'Selectionnez votre pays'"
            :rules="[rules.name]"
            item-title="title"
            item-value="value"
            aria-label="Pays de residence"
            @change="saveToLocalStorage()"
          />
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

      <!-- Dynamic Traveler List -->
      <v-row>
        <v-col cols="12">
          <h2>Qui voyage ?</h2>
        </v-col>
        <v-col cols="12">
          <v-card
            v-for="(traveler, index) in travelers"
            :key="'traveler_' + traveler.id"
            variant="outlined"
            class="mb-3 pa-3"
            rounded="lg"
          >
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center ga-2">
                <v-avatar
                  :color="colorMap[index] || 'primary'"
                  size="32"
                >
                  <span class="text-white text-body-2 font-weight-bold">{{ index + 1 }}</span>
                </v-avatar>
                <span
                  v-if="traveler.firstname && traveler.lastname"
                  class="text-body-2 font-weight-bold"
                >
                  {{ traveler.firstname }} {{ traveler.lastname }}
                </span>
                <span
                  v-else
                  class="text-body-2 text-grey"
                >
                  Voyageur {{ index + 1 }}
                </span>
                <v-icon
                  v-if="isTravelerComplete(traveler)"
                  :icon="mdiCheckCircle"
                  color="success"
                  size="small"
                />
              </div>
              <v-btn
                v-if="index > 0"
                :icon="mdiTrashCanOutline"
                variant="text"
                size="small"
                color="error"
                aria-label="Supprimer le voyageur"
                @click="removeTraveler(index)"
              />
            </div>

            <FunnelStepsTravelerInfosItem
              v-bind="traveler"
              :iso-contact="traveler.isoContact"
              @change="travelerInfosChanged"
            />
          </v-card>

          <v-btn
            variant="text"
            color="secondary"
            :prepend-icon="mdiPlus"
            class="mt-2"
            aria-label="Ajouter un voyageur"
            @click="addTraveler"
          >
            Ajouter un voyageur
          </v-btn>

          <!-- Auto-computed adult/child summary -->
          <div class="text-caption text-grey mt-3">
            {{ nbAdults }} adulte{{ nbAdults > 1 ? 's' : '' }}
            <template v-if="nbChildren > 0">
              &middot; {{ nbChildren }} enfant{{ nbChildren > 1 ? 's' : '' }}
            </template>
          </div>

          <!-- Validation errors -->
          <div
            v-if="validationErrors.length > 0"
            class="text-error text-right mt-3"
            aria-live="polite"
          >
            <p
              v-for="(err, i) in validationErrors"
              :key="i"
            >
              - {{ err }}
            </p>
          </div>
        </v-col>
      </v-row>

      <!-- Couple preference -->
      <v-row v-if="travelers.length > 1">
        <v-col
          cols="12"
          class="py-2"
        >
          <v-switch
            v-model="model.isCouple"
            :label="page.travelers_infos?.preference_couple || 'Preference de couple'"
          />
        </v-col>
      </v-row>
    </v-form>

    <v-row>
      <v-col class="d-flex ga-3">
        <v-btn
          class="bg-grey-light font-weight-regular"
          aria-label="Etape precedente"
          @click="emit('previous')"
        >
          Precedent
        </v-btn>
        <v-btn
          :disabled="!isValid"
          :loading="buttonLoading"
          color="secondary"
          class="font-weight-bold"
          aria-label="Etape suivante"
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
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { mdiPlus, mdiTrashCanOutline, mdiCheckCircle } from '@mdi/js'
import { countries } from '~/utils/countries'

dayjs.extend(customParseFormat)

const { trackReservationStep } = useGtmTracking()

const { ownStep, voyage, page, checkoutType, dateId } = defineProps(['ownStep', 'voyage', 'page', 'initialDealValues', 'checkoutType', 'dateId'])

const emit = defineEmits(['next', 'previous', 'validity-changed'])
const config = useRuntimeConfig()

const model = defineModel()

const loadingDeal = ref(false)
const buttonLoading = ref(false)

const { updateDeal } = useStepperDeal(ownStep)
const route = useRoute()

const isPhoneValid = ref(false)

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })

const rules = {
  name: schemaToRule(nameSchema),
}

// ============= Dynamic Traveler List =============

const travelers = ref([])

const colorMap = {
  0: 'green',
  1: 'blue',
  2: 'red',
  3: 'yellow',
  4: 'purple',
  5: 'orange',
  6: 'cyan',
  7: 'teal',
  8: 'pink',
}

const initializeTravelers = () => {
  if (!model.value) return

  const existingCount = +model.value.nbAdults + +model.value.nbChildren || 1
  const mainContactIso = model.value.isoContact || ''

  travelers.value = Array.from({ length: existingCount }, (_, index) => {
    const storedTraveler = model.value?.[`traveler${index + 1}`]

    if (storedTraveler) {
      const parts = storedTraveler.split('_')
      const [firstname, lastname, birthdate, isoContact = ''] = parts
      return {
        id: index + 1,
        firstname: firstname || (index === 0 ? model.value.firstName : null),
        lastname: lastname || (index === 0 ? model.value.lastName : null),
        birthdate: birthdate || null,
        isoContact: isoContact && isoContact.trim() !== '' ? isoContact : mainContactIso,
      }
    }

    return {
      id: index + 1,
      firstname: index === 0 ? model.value.firstName : null,
      lastname: index === 0 ? model.value.lastName : null,
      birthdate: null,
      isoContact: mainContactIso,
    }
  })
}

onMounted(() => {
  initializeTravelers()
})

const addTraveler = () => {
  const newId = travelers.value.length + 1
  travelers.value.push({
    id: newId,
    firstname: null,
    lastname: null,
    birthdate: null,
    isoContact: model.value.isoContact || '',
  })
}

const removeTraveler = (index) => {
  if (index === 0) return
  travelers.value.splice(index, 1)
  // Re-index IDs
  travelers.value.forEach((t, i) => {
    t.id = i + 1
  })
  // Clean up model traveler keys
  syncTravelersToModel()
}

const isTravelerComplete = (traveler) => {
  return traveler.firstname && traveler.lastname && traveler.birthdate && traveler.isoContact
}

const travelerInfosChanged = (updatedTraveler) => {
  const index = travelers.value.findIndex(t => t.id === updatedTraveler.id)
  if (index !== -1) {
    travelers.value[index] = { ...updatedTraveler }
    model.value[`traveler${updatedTraveler.id}`] = `${updatedTraveler.firstname}_${updatedTraveler.lastname}_${updatedTraveler.birthdate}_${updatedTraveler.isoContact || ''}`
  }
}

const syncTravelersToModel = () => {
  // Clear old traveler keys
  for (let i = 1; i <= 11; i++) {
    delete model.value[`traveler${i}`]
  }
  travelers.value.forEach((t, i) => {
    model.value[`traveler${i + 1}`] = `${t.firstname || ''}_${t.lastname || ''}_${t.birthdate || ''}_${t.isoContact || ''}`
  })
}

// ============= Auto-compute adult/child from birthdates =============

const nbAdults = computed(() => travelers.value.filter(t => {
  if (!t.birthdate) return true // assume adult if no birthdate yet
  const birthdate = dayjs(t.birthdate, 'DD/MM/YYYY', true)
  if (!birthdate.isValid()) return true
  const age = dayjs(voyage.departureDate).diff(birthdate, 'year')
  return age > (+voyage.maxChildrenAge || 12)
}).length)

const nbChildren = computed(() => travelers.value.filter(t => {
  if (!t.birthdate) return false
  const birthdate = dayjs(t.birthdate, 'DD/MM/YYYY', true)
  if (!birthdate.isValid()) return false
  const age = dayjs(voyage.departureDate).diff(birthdate, 'year')
  return age <= (+voyage.maxChildrenAge || 12)
}).length)

// Sync computed counts back to model for Summary/pricing compatibility
watch([nbAdults, nbChildren], ([adults, children]) => {
  model.value.nbAdults = adults
  model.value.nbChildren = children
  model.value.nbTravelers = adults + children
  model.value.nbUnderAge = children
}, { immediate: true })

// ============= Validation =============

const allFieldsFilled = computed(() => {
  return travelers.value.every(
    t => t.firstname && t.lastname && t.birthdate && t.isoContact
  )
})

const hasAtLeastOneAdult = computed(() => nbAdults.value > 0)

const validationErrors = computed(() => {
  const errors = []
  if (!allFieldsFilled.value) {
    errors.push(page.travelers_infos?.all_fields_required || 'Veuillez remplir tous les champs de chaque voyageur')
  }
  if (!hasAtLeastOneAdult.value && allFieldsFilled.value) {
    errors.push('Au moins un voyageur adulte est requis')
  }
  return errors
})

const isValid = computed(() => {
  const hasValidCountry = model.value.isoContact && model.value.isoContact.length > 0
  return allFieldsFilled.value
    && hasAtLeastOneAdult.value
    && isPhoneValid.value
    && hasValidCountry
    && travelers.value.length > 0
})

// ============= localStorage =============

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

// ============= Submit =============

const submitStepData = async () => {
  if (!isValid.value) return false

  syncTravelersToModel()

  try {
    buttonLoading.value = true
    const utmSource = localStorage.getItem('utmSource')

    const dealData = {
      nbTravelers: nbAdults.value + nbChildren.value,
      nbChildren: nbChildren.value,
      nbAdults: nbAdults.value,
      nbUnderAge: nbChildren.value,
      phone: model.value.phone,
      isoContact: model.value.isoContact,
      utm: utmSource || '',
      isCouple: model.value.isCouple ? 'Oui' : 'Non',
      currentStep: 'A rempli les details voyageurs',
      ...travelers.value.reduce((acc, traveler, index) => {
        acc[`traveler${index + 1}`] = `${traveler.firstname}_${traveler.lastname}_${traveler.birthdate}_${traveler.isoContact}`
        return acc
      }, {}),
    }

    updateDeal(dealData)

    // GTM: Track reservation_step2 (voyageurs details submitted)
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
    trackReservationStep(2, voyage, model.value, additionalData)

    buttonLoading.value = false
    emit('next')
  }
  catch (error) {
    console.log('error updating deal in Details', error)
    buttonLoading.value = false
    return false
  }
}
</script>
