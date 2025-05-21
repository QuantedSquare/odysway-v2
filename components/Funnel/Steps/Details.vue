<template>
  <v-container>
    <v-form
      ref="form"
      v-model="model"
    >
      <v-row>
        <v-col cols="12">
          <h2 v-if="!isAdvance">
            <!-- {{ $t('stepperDevisPerso.nbTravellersSold') }} -->
            Sélectionnez le nombre de voyageurs à régler
          </h2>
          <h2 v-else>
            <!-- {{ $t('stepperDevisPerso.nbTravellers') }} -->
            Nombre de voyageurs
          </h2>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <div class="text-caption">
                Nombre d'adultes
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
                Nombre d'enfants (0-12 ans)
              </div>
              <v-select
                v-model="nbChildren"
                :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
                :menu-props="{ offsetY: true }"
                :items="selectOptions(0, 9)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <div class="text-caption text-truncate">
                Nombre d'adolescents (12-18 ans)
              </div>
              <v-select
                v-model="nbTeen"
                :disabled="route.query.type === 'balance' || route.query.type === 'custom'"
                :menu-props="{ offsetY: true }"
                :items="selectOptions(0, 9)"
              />
            </v-col>
          </v-row>
          <!--  Contact Details -->
          <v-row>
            <v-col cols="12">
              <!-- <h2>{{ $t('stepperDevisGroup.contactDetails') }}</h2> -->
              <h2>
                Vos coordonnées
              </h2>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="firstName"
                label="Prénom *"
                placeholder="Ex: Indiana"
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
                :label="'Nom *'"
                placeholder="Ex: Jones"
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
                label="Email *"
                placeholder="Ex: indiana@jones.com"
                :rules="[rules.email]"
                @change="saveToLocalStorage()"
              />
              <v-checkbox
                v-model="optinNewsletter"
                :class="optinNewsletter ? 'text-primary' : ''"
              >
                <template #label>
                  <div class="text-caption text-no-wrap">
                    Je souhaite recevoir des inspirations et des idées pour voyager autrement
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
</template>

<script setup>
import { z } from 'zod'

const { currentStep, ownStep, voyage } = defineProps(['currentStep', 'ownStep', 'voyage'])
const config = useRuntimeConfig()

const { deal, dealId, createDeal, updateDeal, checkoutType } = useStepperDeal(ownStep)
const { addSingleParam } = useParams()
const model = defineModel()
const route = useRoute()
const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

const isAdvance = ref(true)
const optinNewsletter = ref(false)
const nbAdults = ref(1)
const nbChildren = ref(0)
const nbTeen = ref(0)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')

watch(() => currentStep, (value) => {
  if (value === ownStep) {
    addSingleParam('step', ownStep)
  }
}, { immediate: true })

watch(deal, () => {
  if (deal.value) {
    console.log('got value in details', deal.value)

    nbTeen.value = +deal.value.nbTeen || 0
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
  }
  localStorage.setItem('detailsData', JSON.stringify(dataToStore))
}
const loadFromLocalStorage = () => {
  const storedData = JSON.parse(localStorage.getItem('detailsData'))
  if (storedData) {
    firstName.value = storedData.firstname
    lastName.value = storedData.lastname
    email.value = storedData.email
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

const nbTravelers = computed(() => nbAdults.value + nbChildren.value + nbTeen.value)

const submitStepData = async () => {
  // Validate form
  if (!model.value) return false
  //  #todo soustraire la réduction s'il y en a une

  try {
    // Submit form data
    if (dealId.value) {
      // Update deal with this values only after creation.
      // So only when checkout type is deposit or full
      if (checkoutType.value === 'deposit' || checkoutType.value === 'full') {
        await updateDeal({
          nbTravelers: nbAdults.value + nbChildren.value + nbTeen.value,
          nbChildren: nbChildren.value + nbTeen.value,
          nbAdults: nbAdults.value,
          nbTeen: nbTeen.value,
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
    // else we update basics
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
        nbTravelers: nbAdults.value + nbChildren.value + nbTeen.value,
        nbChildren: nbChildren.value + nbTeen.value,
        nbAdults: nbAdults.value,
        nbTeen: nbTeen.value,
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
        promoTeen: voyage.promoTeen,
        maxTeenAge: voyage.maxTeenAge,
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
const changeAttr = (dataAttribute) => {
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
