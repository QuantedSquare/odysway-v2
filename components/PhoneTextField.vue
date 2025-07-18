<template>
  <v-row>
    <v-col cols="5">
      <v-select
        v-model="phoneCode"
        :items="phonesSelect"
        :rules="[rules.name]"
        hide-details
        aria-label="Code téléphonique du pays"
        @change="changeAttr('phone')"
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
            :alt="`Drapeau du pays ${item.props.title}`"
            width="30px"
          />
        </template>
      </v-select>
    </v-col>
    <v-col cols="">
      <v-text-field
        v-model="phoneNumber"
        :label="'Téléphone *'"
        placeholder="Ex: 6 00 00 00 01"
        inputmode="numeric"
        :rules="[rules.phone]"
        @change="changeAttr('phone')"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { z } from 'zod'

const { required } = defineProps({
  required: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['validity-changed'])
const schemaToRule = useZodSchema()
const nameSchema = z.string().min(required ? 1 : 0, { message: 'Cette information est requise.' })
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
  emit('validity-changed', rules.phone(phoneNumber.value) === true)
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
watchEffect(() => {
  if (model.value) {
    const { code, number } = extractPhoneDetails(model.value, phonesSelect)
    phoneCode.value = code
    phoneNumber.value = number
  }
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
