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

// Mobile-friendly input handler
const handleInput = (event) => {
  const input = event.target
  const value = input.value

  // Remove all non-digits first
  let digits = value.replace(/\D/g, '')

  // Limit to 8 digits maximum
  digits = digits.substring(0, 8)

  // Format progressively based on length
  let formatted = ''
  if (digits.length <= 2) {
    formatted = digits
  }
  else if (digits.length <= 4) {
    formatted = digits.substring(0, 2) + '/' + digits.substring(2)
  }
  else {
    formatted = digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4)
  }

  // Only update if the value actually changed
  if (formatted !== value) {
    date.value = formatted

    // Simple cursor positioning for mobile compatibility
    nextTick(() => {
      try {
        // Just put cursor at the end - simpler and more mobile-friendly
        input.setSelectionRange(formatted.length, formatted.length)
      }
      catch {
        // Mobile browsers sometimes don't support this - that's okay
      }
    })
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
