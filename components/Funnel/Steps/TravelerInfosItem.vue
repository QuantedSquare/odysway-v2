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
        @keydown="handleKeydown"
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

const handleKeydown = (event) => {
  const input = event.target
  const key = event.key
  const cursorPosition = input.selectionStart
  const value = input.value

  // Allow navigation and control keys
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key)) {
    return
  }

  // Only allow digits
  if (!/^\d$/.test(key)) {
    event.preventDefault()
    return
  }

  // Count existing digits
  const digitsCount = (value.replace(/\D/g, '')).length

  // Limit to 8 digits
  if (digitsCount >= 8) {
    event.preventDefault()
    return
  }

  // Auto-add slashes after 2nd and 4th digit
  nextTick(() => {
    let newValue = input.value
    const digits = newValue.replace(/\D/g, '')

    if (digits.length === 2 && cursorPosition === 2) {
      newValue = digits.substring(0, 2) + '/' + digits.substring(2)
      date.value = newValue
      nextTick(() => input.setSelectionRange(3, 3))
    }
    else if (digits.length === 4 && cursorPosition === 5) {
      newValue = digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4)
      date.value = newValue
      nextTick(() => input.setSelectionRange(6, 6))
    }
  })
}

// Fallback for mobile devices and other input methods
const handleInput = (event) => {
  const input = event.target
  const value = input.value
  const cursorPosition = input.selectionStart

  // Remove all non-digits
  const digits = value.replace(/\D/g, '')

  // Limit to 8 digits
  const limitedDigits = digits.substring(0, 8)

  // Format with slashes
  let formatted = ''
  for (let i = 0; i < limitedDigits.length; i++) {
    if (i === 2 || i === 4) {
      formatted += '/'
    }
    formatted += limitedDigits[i]
  }

  // Only update if different to avoid infinite loops
  if (formatted !== value) {
    const oldLength = value.length
    const newLength = formatted.length

    date.value = formatted

    // Try to maintain cursor position
    nextTick(() => {
      let newPosition = cursorPosition + (newLength - oldLength)

      // Adjust if cursor is on a slash
      if (formatted[newPosition] === '/') {
        newPosition++
      }

      // Ensure position is valid
      newPosition = Math.max(0, Math.min(newPosition, formatted.length))

      try {
        input.setSelectionRange(newPosition, newPosition)
      }
      catch (e) {
        // Some mobile browsers don't support setSelectionRange
        console.warn('Could not set cursor position:', e)
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
