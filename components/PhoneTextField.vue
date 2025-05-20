<template>
  <v-row>
    <v-col cols="4">
      <v-select
        v-model="phoneCode"
        :items="phonesSelect"
        :rules="[rules.name]"
        label="Indicatif *"
        hide-details
        @change="changeAttr('phone'); saveToLocalStorage(phoneCode)"
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
</template>

<script setup>
import { z } from 'zod'

const schemaToRule = useZodSchema()
const nameSchema = z.string().min(1, { message: 'Cette information est requise.' })
const phoneSchema = z.string().min(9, { message: 'Numéro de téléphone invalide' })

const rules = {
  name: schemaToRule(nameSchema),
  phone: schemaToRule(phoneSchema),
}
const model = defineModel()

const phoneCode = ref('+33')
const phoneNumber = ref('')

watch([phoneCode, phoneNumber], () => {
  model.value = `${phoneCode.value}${phoneNumber.value}`
})
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
const loadFromLocalStorage = () => {
  if (model.value.length > 0) {
    const { code, number } = extractPhoneDetails(model.value, phonesSelect)
    phoneCode.value = code
    phoneNumber.value = number
  }
  const storedData = JSON.parse(localStorage.getItem('detailsData'))
  if (storedData) {
    console.log('storedData', storedData)
    phoneCode.value = storedData.phoneCode
    phoneNumber.value = storedData.phoneNumber
    model.value = `${phoneCode.value}${phoneNumber.value}`
    console.log('model', model.value, phoneCode.value, phoneNumber.value)
  }
}
const saveToLocalStorage = () => {
  console.log('saveToLocalStorage', phoneCode.value, phoneNumber.value)
  const dataToStore = {
    phoneCode: phoneCode.value,
    phoneNumber: phoneNumber.value,
  }
  localStorage.setItem('detailsData', JSON.stringify(dataToStore))
}

onMounted(() => {
  loadFromLocalStorage()
})
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
watch(phoneCode, () => {
  saveToLocalStorage()
})

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
</script>
