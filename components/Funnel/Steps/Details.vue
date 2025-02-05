<template>
  <v-container>
    <v-form
      ref="form"
      v-model="validInfos"
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

const validInfos = ref(false)
const isAdvance = ref(true)
const { deal, fetchDeal } = useDeal()
await fetchDeal(7126)

console.log('deal', deal.value)
const selectOptions = function (start, end) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

const nbAdults = ref(1)
const childrenUnder12 = ref(0)
const teenUnder18 = ref(0)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phoneCode = ref('+33')
const phoneNumber = ref('')

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

// const schemaToRule = useZodSchema()
const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const emailSchema = z.string().email({ message: 'Adresse email invalide' })
const phoneSchema = z.string().min(10, { message: 'Numéro de téléphone invalide' })

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
  // if (!validateForm()) return false
  return await 'coucou'
  // try {
  //   // Submit form data
  //   await $fetch('/api/submit-details', {
  //     method: 'POST',
  //     body: formData.value
  //   })
  //   return true
  // } catch (error) {
  //   // Handle errors
  //   return false
  // }
}

defineExpose({
  submitStepData,
})
</script>
