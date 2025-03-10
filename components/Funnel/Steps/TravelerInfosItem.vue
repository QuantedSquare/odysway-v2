<template>
  <v-row
    class="rounded-xl"
  >
    <v-col
      cols="12"
      class="d-flex  justify-center  align-center  justify-md-start align-md-start"
    >
      <v-avatar
        size="40"
        class="d-md-none"
        :icon="mdiBagPersonal"
      />
      <h3>Voyageur {{ id }}</h3>
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <v-text-field
        v-model="i_firstname"
        outlined
        label="Prénom *"
        placeholder="Ex: Indiana"
        :rules="[rules.required]"
        @change="dataUpdated"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <v-text-field
        v-model="i_lastname"
        label="Nom *"
        outlined
        placeholder="Ex: Jones"
        :rules="[rules.required]"
        @change="dataUpdated"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <v-text-field
        v-model="displayedDate"
        label="Date de naissance *"
        placeholder="JJ/MM/AAAA"
        :rules="[rules.required, rules.dateFormat]"
        type="date"
        @change="dataUpdated"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

import { mdiBagPersonal } from '@mdi/js'

dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

const props = defineProps({
  id: { type: [String, Number], required: true },
  firstname: { type: String, default: '' },
  lastname: { type: String, default: '' },
  birthdate: { type: String, default: '' },
  bgColor: { type: String, default: 'primary' },
})
// Refs
const i_firstname = ref(props.firstname)
const i_lastname = ref(props.lastname)
const displayedDate = ref(dayjs().format('DD/MM/YYYY'))
const modelDate = ref(new Date())

const emit = defineEmits(['change'])

// Initialize birthdate
onMounted(() => {
  if (props.birthdate) {
    console.log('props.birthdate', props.birthdate)
    const parsedDate = dayjs(props.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD')
    displayedDate.value = parsedDate
    const jsDate = dayjs(props.birthdate, 'DD/MM/YYYY').toDate()
    modelDate.value = jsDate
  }
  else {
    displayedDate.value = dayjs().format('DD/MM/YYYY')
  }
})

// Rules
const rules = {
  required: v => !!v || 'Cette information est requise.',
  dateFormat: (v) => {
    console.log('v', v)
    if (!v) return true

    // Check format DD/MM/YYYY
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/
    if (!dateRegex.test(v)) return 'Format invalide. Utilisez JJ/MM/AAAA'

    const matches = v.match(dateRegex)
    const day = parseInt(matches[3])
    const month = parseInt(matches[2])
    const year = parseInt(matches[1])
    // Basic validation
    if (month < 1 || month > 12) return 'Mois invalide'
    if (day < 1 || day > 31) return 'Jour invalide'
    if (year < 1910 || year > new Date().getFullYear()) return 'Année invalide'

    if (month === 2 && day > 29) return 'Février ne peut pas avoir plus de 29 jours'
    if ([4, 6, 9, 11].includes(month) && day > 30) return 'Ce mois ne peut pas avoir plus de 30 jours'

    // Check if date is valid using dayjs
    const dateObj = dayjs(`${year}-${month}-${day}`, 'YYYY-M-D')
    if (!dateObj.isValid() || dateObj.format('DD-MM-YYYY') !== dayjs(v).format('DD-MM-YYYY'))
      return 'Date invalide'

    return true
  },
}

const dataUpdated = () => {
  if (!modelDate.value) return
  emit('change', {
    id: props.id,
    firstname: i_firstname.value,
    lastname: i_lastname.value,
    birthdate: dayjs(displayedDate.value).format('DD/MM/YYYY'),
  })
}

// const formatDateInput = (event) => {
//   // Get only digits from input
//   const value = displayedDate.value.replace(/\D/g, '')

//   // Auto add slashes
//   if (value.length > 0) {
//     let formattedDate = ''

//     for (let i = 0; i < value.length && i < 8; i++) {
//       if (i === 2 || i === 4) {
//         formattedDate += '/'
//       }
//       formattedDate += value[i]
//     }

//     displayedDate.value = formattedDate
//   }
// }

// Watch for prop changes
watch(() => props.firstname, (newVal) => {
  i_firstname.value = newVal
})

watch(() => props.lastname, (newVal) => {
  i_lastname.value = newVal
})

// Watch for birthdate prop changes and update displayed date to match the format
watch(() => props.birthdate, (newVal) => {
  if (newVal) {
    const parsedDate = dayjs(newVal, 'DD/MM/YYYY')
    if (parsedDate.isValid()) {
      displayedDate.value = parsedDate.format('YYYY-MM-DD')
    }
  }
})
</script>
