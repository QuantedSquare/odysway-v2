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
      <h3 class="text-body-1 text-md-body-2 font-weight-bold">
        Voyageur {{ id }}
      </h3>
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <v-text-field
        v-model="i_firstname"
        role="textbox"
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
        role="textbox"
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
        v-model="date"
        role="textbox"
        label="Date de naissance *"
        type="text"
        inputmode="numeric"
        placeholder="JJ/MM/AAAA"
        :rules="[rules.required, rules.dateFormat]"
        @blur="formatOnBlur"
        @input="handleInput"
        @change="dataUpdated"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { mdiBagPersonal } from '@mdi/js'

dayjs.extend(customParseFormat)

const props = defineProps({
  id: { type: [String, Number], required: true },
  firstname: { type: String, default: '' },
  lastname: { type: String, default: '' },
  birthdate: { type: String, default: '' },
  bgColor: { type: String, default: 'primary' },
})

const i_firstname = ref(props.firstname)
const i_lastname = ref(props.lastname)
const date = ref(props.birthdate || '')
const emit = defineEmits(['change'])

onMounted(() => {
  if (props.birthdate) {
    date.value = props.birthdate
  }
})

const rules = {
  required: v => !!v || 'Cette information est requise.',
  dateFormat: (v) => {
    if (!v) return true

    // Parse with specific format DD/MM/YYYY
    const dateObj = dayjs(v, 'DD/MM/YYYY', true)
    if (!dateObj.isValid()) return 'Date invalide'

    const year = dateObj.year()
    if (year < 1925 || year > new Date().getFullYear()) return 'Année invalide'

    return true
  },
}

// Format date string helper
const formatDate = (inputValue) => {
  const digits = inputValue.replace(/\D/g, '').substring(0, 8)

  if (digits.length <= 2) {
    return digits
  }
  else if (digits.length <= 4) {
    return digits.substring(0, 2) + '/' + digits.substring(2)
  }
  else {
    return digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4)
  }
}

// Handle input - minimal interference for mobile
const handleInput = (event) => {
  const value = event.target.value
  const digits = value.replace(/\D/g, '')

  // Only prevent too many digits
  if (digits.length > 8) {
    date.value = formatDate(value)
  }
}

// Format when user finishes (more reliable on mobile)
const formatOnBlur = () => {
  if (date.value) {
    date.value = formatDate(date.value)
  }
}

const dataUpdated = () => {
  emit('change', {
    id: props.id,
    firstname: i_firstname.value,
    lastname: i_lastname.value,
    birthdate: date.value,
  })
}

// Watch for prop changes
watch(() => props.firstname, (newVal) => {
  i_firstname.value = newVal
})

watch(() => props.lastname, (newVal) => {
  i_lastname.value = newVal
})

// Watch for birthdate prop changes
// watch(() => props.birthdate, (newVal) => {
//   if (newVal) {
//     const parsed = dayjs(newVal, 'DD/MM/YYYY', true)
//     date.value = parsed.isValid() ? parsed : null
//   }
//   else {
//     date.value = null
//   }
// })
</script>

<style scoped>
:deep(.v-icon__svg) {
  color: rgb(var(--v-theme-primary)) !important;
}
:deep(.v-field__input) {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
