<template>
  <v-container>
    <!-- <v-skeleton-loader
      v-if="status !== 'success'"
      type="card"
    /> -->
    <!-- v-else -->
    <v-form
      ref="form"
      v-model="model"
    >
      <v-row>
        <v-col cols="8">
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
                v-model="childrenUnder12"
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
                v-model="teenUnder18"
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

const model = defineModel()
const isAdvance = ref(true)
const { deal, dealId, fetchDeal, createDeal, updateDeal } = useDeal()

// await fetchDeal(7126)
// const { status, data: deal } = await useFetch('/api/v1/ac/deals/' + 11269)

const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

const nbAdults = ref(1)
const childrenUnder12 = ref(0)
const teenUnder18 = ref(0)
const firstName = ref('Yuzu')
const lastName = ref('& Alex')
const email = ref('ottmann.alex@gmail.com')
const phoneCode = ref('+33')
const phoneNumber = ref('631870876')

// if (deal.value) {
//   lastName.value = deal.value.title
// }

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
//     console.log(storedData)
//     firstName.value = storedData.firstname
//     lastName.value = storedData.lastname
//     email.value = storedData.email
//     phone.value = storedData.phone
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

const changeAttr = (dataAttribute) => {
  const EVENTS = {
    lastname: { eventLabel: 'Groupe Info - Indique prénom' },
    firstname: { eventLabel: 'Groupe Info - Indique nom' },
    email: { eventLabel: 'Groupe Info - Indique nom' },
    phone: { eventLabel: 'Groupe Info - Indique numéro de téléphone' },
  }
  // #TODO: Uncomment this when the dataAttribute is not empty and google analytics enabled
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

const submitStepData = async () => {
  // Validate form
  if (!model.value) return false
  try {
    const flattenedDeal = {
      value: 85000,
      title: 'Découverte du Népal',
      currency: 'eur',
      group: '1',
      owner: '1',
      stage: '2',
      departureDate: '2025-05-15',
      returnDate: '2025-05-30',
      travelType: 'Voyage de Groupe',
      nbTravelers: 4,
      nbChildren: 1,
      nbAdults: 3,
      country: 'Nepal',
      iso: 'NP',
      zoneChapka: 2,
      pricePerTraveler: 2125,
      image: 'https://example.com/nepal.jpg',
      currentStep: 'Création du Deal',
      alreadyPaid: 0,
      restTravelersToPay: nbAdults.value + childrenUnder12.value + teenUnder18.value,
      utm: '',
      slug: 'decouverte-nepal',
      depositPrice: 25500,
      basePricePerTraveler: 85000,
      totalTravelPrice: 85000,
      promoChildren: 8000,
      maxChildrenAge: 12,
      promoTeen: 8000,
      maxTeenAge: 18,
      nbTeen: 0,
      nbUnderAge: 1,
      source: 'Devis',
      forcedIndivRoom: 'Non',
      indivRoomPrice: 15000,
      promoEarlybird: 5000,
      gotEarlybird: 'Non',
      promoLastMinute: 0,
      gotLastMinute: 'Non',
      email: email.value,
      phone: `${phoneCode.value}${phoneNumber.value}`,
      firstname: firstName.value,
      lastname: lastName.value,
    }
    // Submit form data
    if (dealId.value) {
      await updateDeal(flattenedDeal)
    }
    else {
      await createDeal(flattenedDeal)
    }
    return true
  }
  catch (error) {
    // Handle errors
    console.log('error', error)
    return false
  }
}

defineExpose({
  submitStepData,
})
</script>
