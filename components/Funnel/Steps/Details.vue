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
                :menu-props="{ offsetY: true }"
                :items="selectOptions(0, 9)"
              />
            </v-col>
          </v-row>
          <!--  Contact Deatails -->
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
                label="Email *"
                placeholder="Ex: indiana@jones.com"
                :rules="[rules.email]"
                @change="saveToLocalStorage()"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-row>
                <v-col cols="4">
                  <v-select
                    v-model="phoneCode"
                    :items="phonesSelect"
                    :rules="[rules.name]"
                    label="Indicatif *"
                    hide-details
                  >
                    <template #item="{ props }">
                      <v-list-item
                        v-bind="props"
                        :title="props.title"
                        :prepend-avatar="props.flagSrc"
                        slim
                      />
                    </template>

                    <template #selection="{ item }">
                      <v-img
                        :src="item.props.flagSrc"
                        height="20px"
                        width="30px"
                      />
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    v-model="phoneNumber"
                    :label="'Téléphone *'"
                    placeholder="Ex: 6 00 00 00 01"
                    :rules="[rules.phone]"
                    @change="changeAttr('phone'); saveToLocalStorage()"
                  />
                </v-col>
              </v-row>
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

const { deal, dealId, createDeal, updateDeal, checkoutType } = useStepperDeal(ownStep)
const model = defineModel()
const route = useRoute()

const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

const isAdvance = ref(true)
const nbAdults = ref(1)
const nbChildren = ref(0)
const nbTeen = ref(0)
const firstName = ref('Alex')
const lastName = ref('& Yuzu')
const email = ref('ottmann.alex@gmail.com')
const phoneCode = ref('+33')
const phoneNumber = ref('631870876')

watch(() => currentStep, (value) => {
  if (value === ownStep) {
    addAnotherQuery('step', ownStep)
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

    const { code, number } = extractPhoneDetails(deal.value.contact.phone, phonesSelect)
    phoneCode.value = code
    phoneNumber.value = number
  }
})

const saveToLocalStorage = () => {
  const dataToStore = {
    firstname: firstName.value,
    lastname: lastName.value,
    email: email.value,
    phone: phoneNumber.value,
    phoneCode: phoneCode.value,
  }
  localStorage.setItem('detailsData', JSON.stringify(dataToStore))
}
// const loadFromLocalStorage = () => {

//   const storedData = JSON.parse(localStorage.getItem('detailsData'))
//   if (storedData) {
//     firstName.value = storedData.firstname
//     lastName.value = storedData.lastname
//     email.value = storedData.email
//     phoneNumber.value = storedData.phone
//     phoneCode.value = storedData.phoneCode
//   }
// }
// loadFromLocalStorage()

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const emailSchema = z.string().email({ message: 'Adresse email invalide' })
const phoneSchema = z.string().min(9, { message: 'Numéro de téléphone invalide' })

const rules = {
  name: schemaToRule(nameSchema),
  email: schemaToRule(emailSchema),
  phone: schemaToRule(phoneSchema),
}

const nbTravelers = computed(() => nbAdults.value + nbChildren.value + nbTeen.value)

const totalValue = computed(() => {
  const baseVoyage = 85000 // Récupérer de voyage
  const reduction_enfant = 8000
  const reduction_ado = 8000
  return baseVoyage * nbAdults.value
    + (baseVoyage - reduction_enfant) * nbChildren.value
    + (baseVoyage - reduction_ado) * nbTeen.value
})
const submitStepData = async () => {
  // Validate form
  if (!model.value) return false
  const totalTravelPrice = 80000 // voyage.startingPrice * (nbAdults.value + nbChildren.value + nbTeen.value)
  //  #todo soustraire la réduction s'il y en a une

  try {
    const flattenedDeal = {
      value: totalValue.value, // # A retravailler avec toutes les valeurs
      title: 'Découverte du Népal',
      currency: 'eur',
      group: '1',
      owner: '1',
      stage: '2',
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
      pricePerTraveler: voyage.startingPrice, // #todo trouver comment faire sauter
      image: 'https://cdn.buttercms.com/gzdJu2fbQDi9Pl3h80Jn' || voyage.imgSrc,
      currentStep: 'Création du Deal',
      alreadyPaid: 0, //
      restTravelersToPay: nbAdults.value + nbChildren.value + nbTeen.value,
      utm: route.query.utm || '',
      slug: voyage.slug,
      depositPrice: voyage.depositPrice,
      basePricePerTraveler: voyage.startingPrice,
      totalTravelPrice: totalTravelPrice, // #todo checker si *100 ou non
      promoChildren: voyage.promoChildren,
      maxChildrenAge: voyage.maxChildrenAge,
      promoTeen: voyage.promoTeen,
      maxTeenAge: voyage.maxTeenAge,
      source: 'Devis',
      forcedIndivRoom: nbTravelers.value === 1 && voyage.forcedIndivRoom,
      indivRoomPrice: voyage.indivRoomPrice,
      promoEarlybird: voyage.promoEarlybird,
      gotEarlybird: voyage.gotEarlybird,
      promoLastMinute: voyage.promoLastMinute,
      gotLastMinute: voyage.gotLastMinute,
      // Contacts
      email: email.value,
      phone: `${phoneCode.value}${phoneNumber.value}`,
      firstname: firstName.value,
      lastname: lastName.value,
    }
    // Submit form data
    if (dealId.value) {
      // Update deal with this values only after creation.
      // So only when checkout type is deposit or full
      await updateDeal({
        nbTravelers: nbAdults.value + nbChildren.value + nbTeen.value,
        nbChildren: nbChildren.value + nbTeen.value,
        nbAdults: nbAdults.value,
        nbTeen: nbTeen.value,
        nbUnderAge: nbChildren.value,
        email: email.value,
        phone: `${phoneCode.value}${phoneNumber.value}`,
        firstname: firstName.value,
        lastname: lastName.value,
      })
      // else we update basics
      // else{
      //   await updateDeal({
      //   email: email.value,
      //   phone: `${phoneCode.value}${phoneNumber.value}`,
      //   firstname: firstName.value,
      //   lastname: lastName.value,
      // })
      // #TODO we can push here in query the selected travelers to pay.
      // addAnotherQuery('sa', nbAdults.value)
      // addAnotherQuery('sc', nbChildren.value)
      // addAnotherQuery('st', nbTeen.value)
    }
    else {
      console.log('submitting', flattenedDeal)

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
// STATICS DATA
const phonesSelect = [
  {
    title: '+33',
    props: {
      flagSrc: '/images/flags/FlagFr4x3.svg',
    },
  },
  {
    title: '+32',
    props: {
      flagSrc: '/images/flags/FlagBe4x3.svg',
    },
  },
  {
    title: '+1',
    props: {
      flagSrc: '/images/flags/FlagCa4x3.svg',
    },
  },
  {
    title: '+41',
    props: {
      flagSrc: '/images/flags/FlagCh4x3.svg',
    },
  },
  {
    title: '+44',
    props: {
      flagSrc: '/images/flags/FlagGb4x3.svg',
    },
  },
  {
    title: '+39',
    props: {
      flagSrc: '/images/flags/FlagIt4x3.svg',
    },
  },
  {
    title: '+34',
    props: {
      flagSrc: '/images/flags/FlagEs4x3.svg',
    },
  },
  {
    title: '+49',
    props: {
      flagSrc: '/images/flags/FlagDe4x3.svg',
    },
  },
  {
    title: '+352',
    props: {
      flagSrc: '/images/flags/FlagLu4x3.svg',
    },
  },
  {
    title: '+31',
    props: {
      flagSrc: '/images/flags/FlagNl4x3.svg',
    },
  },
]
const extractPhoneDetails = (fullPhone, phonesList) => {
  const foundCode = phonesList.find(({ title }) =>
    fullPhone.startsWith(title),
  )

  if (foundCode) {
    return {
      code: foundCode.title,
      number: fullPhone.replace(foundCode.title, ''),
    }
  }

  return {
    code: '+33', // Default code
    number: fullPhone,
  }
}

defineExpose({
  submitStepData,
})
</script>
