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
const displayedDate = ref('')

const emit = defineEmits(['change'])

// Initialize birthdate
onMounted(() => {
  if (props.birthdate) {
    // Convert from DD/MM/YYYY to YYYY-MM-DD for the input
    const [day, month, year] = props.birthdate.split('/')
    displayedDate.value = `${year}-${month}-${day}`
  }
})

// Rules
const rules = {
  required: v => !!v || 'Cette information est requise.',
  dateFormat: (v) => {
    if (!v) return true

    // Basic validation using dayjs
    const dateObj = dayjs(v)
    if (!dateObj.isValid()) return 'Date invalide'

    const year = dateObj.year()
    if (year < 1910 || year > new Date().getFullYear()) return 'Année invalide'

    return true
  },
}

const dataUpdated = () => {
  if (!displayedDate.value) return

  // Convert from YYYY-MM-DD to DD/MM/YYYY for emission
  const dateObj = dayjs(displayedDate.value)
  emit('change', {
    id: props.id,
    firstname: i_firstname.value,
    lastname: i_lastname.value,
    birthdate: dateObj.format('DD/MM/YYYY'),
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

// Watch for birthdate prop changes
watch(() => props.birthdate, (newVal) => {
  if (newVal) {
    // Convert from DD/MM/YYYY to YYYY-MM-DD for the input
    const [day, month, year] = newVal.split('/')
    displayedDate.value = `${year}-${month}-${day}`
  }
})
</script>
