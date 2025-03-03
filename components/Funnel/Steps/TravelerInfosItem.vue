<template>
  <v-row
    class="rounded-xl"
  >
    <!-- :class="`bg-${bgColor}-lighten-4 `" -->
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
      />
      <!-- <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
        location="end"
      >
        <template #activator="{ props }">
          <v-text-field
            v-bind="props"
            v-model="displayedDate"
            label="Date de naissance *"
            readonly
            :rules="[rules.required]"
            :append-inner-icon="mdiCalendar"
            @change="dataUpdated"
          />
        </template>

        <v-card
          min-width="300"
          elevation="6"
        >
          <v-date-picker
            v-model="modelDate"
            :max="maxDate"
            min="1910-01-01"
          />
        </v-card>
      </v-menu> -->
    </v-col>
  </v-row>
</template>

<script setup>
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

import { mdiCalendar, mdiBagPersonal } from '@mdi/js'

const displayedDate = ref(new Date())
const modelDate = ref(new Date())

dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

const props = defineProps({
  id: { type: [String, Number], required: true },
  firstname: { type: String, default: '' },
  lastname: { type: String, default: '' },
  birthdate: { type: String, default: '' },
  bgColor: { type: String, default: 'primary' },
})

const emit = defineEmits(['change'])

// Refs
const i_firstname = ref(props.firstname)
const i_lastname = ref(props.lastname)
const i_birthdate = ref(new Date())
const dateMenu = ref(false)

// const displayedDate = ref('')

// Initialize birthdate
onMounted(() => {
  if (props.birthdate) {
    console.log('props.birthdate', props.birthdate)
    const parsedDate = dayjs(props.birthdate, 'DD/MM/YYYY').format('DD/MM/YYYY')
    displayedDate.value = parsedDate
    const jsDate = dayjs(props.birthdate, 'DD/MM/YYYY').toDate()
    modelDate.value = jsDate
  }
  else {
    displayedDate.value = dayjs().format('DD/MM/YYYY')
  }
})

// Computed
const maxDate = computed(() => dayjs().format('YYYY-MM-DD'))

// Rules
const rules = {
  required: v => !!v || 'Cette information est requise.',
  dateFormat: (v) => {
    console.log('v', v)
    if (!v) return true

    // Check format DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    if (!dateRegex.test(v)) return 'Format invalide. Utilisez JJ/MM/AAAA'

    const matches = v.match(dateRegex)
    const day = parseInt(matches[1])
    const month = parseInt(matches[2])
    const year = parseInt(matches[3])

    // Basic validation
    if (month < 1 || month > 12) return 'Mois invalide'
    if (day < 1 || day > 31) return 'Jour invalide'
    if (year < 1910 || year > new Date().getFullYear()) return 'Année invalide'

    // Check if date is valid using dayjs
    const dateObj = dayjs(`${year}-${month}-${day}`, 'YYYY-M-D')
    if (!dateObj.isValid() || dateObj.format('DD/MM/YYYY') !== v)
      return 'Date invalide'

    return true
  },
}

// Methods
const handleDateSelection = () => {
  dateMenu.value = false
  dataUpdated()
}

const dataUpdated = () => {
  if (!modelDate.value) return

  emit('change', {
    id: props.id,
    firstname: i_firstname.value,
    lastname: i_lastname.value,
    birthdate: displayedDate.value,
  })
}

const formatDateInput = (event) => {
  // Get only digits from input
  const value = displayedDate.value.replace(/\D/g, '')

  // Auto add slashes
  if (value.length > 0) {
    let formattedDate = ''

    for (let i = 0; i < value.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formattedDate += '/'
      }
      formattedDate += value[i]
    }

    displayedDate.value = formattedDate
  }
}

// const dataUpdated = () => {
//   emit('change', {
//     id: props.id,
//     firstname: i_firstname.value,
//     lastname: i_lastname.value,
//     birthdate: displayedDate.value,
//   })
// }

// Watch for prop changes
watch(() => props.firstname, (newVal) => {
  i_firstname.value = newVal
})

watch(() => props.lastname, (newVal) => {
  i_lastname.value = newVal
})

watch(() => props.birthdate, (newVal) => {
  if (newVal) {
    const parsedDate = dayjs(newVal, 'DD/MM/YYYY')
    if (parsedDate.isValid()) {
      displayedDate.value = parsedDate.format('DD/MM/YYYY')
    }
  }
})
// watch(modelDate, () => {
//   displayedDate.value = dayjs(modelDate.value).format('DD/MM/YYYY')
//   handleDateSelection()
// })
</script>
