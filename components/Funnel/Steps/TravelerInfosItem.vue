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
      class="py-0 my-0"
    >
      <v-text-field
        id="firstname"
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
      class="py-0 my-0"
    >
      <v-text-field
        id="lastname"
        v-model="i_lastname"
        type="textbox"
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
      class="py-0 my-0"
    >
      <v-text-field
        id="birthdate"
        v-model="date"
        label="Date de naissance *"
        type="text"
        inputmode="numeric"
        placeholder="JJ/MM/AAAA"
        :rules="[rules.required, rules.dateFormat]"
        :append-inner-icon="mdiCalendarOutline"
        @input="handleInput"
        @keydown="handleKeydown"
        @change="dataUpdated"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { mdiBagPersonal, mdiCalendarOutline } from '@mdi/js'

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

// TODO: use different approach to build the date input with computed get() and set(). Ex. mui date field

// Format date string helper
const formatDate = (inputValue) => {
  const digits = inputValue.replace(/\D/g, '').substring(0, 8)
  const day = digits.substring(0, 2) > 31 ? '31' : digits.substring(0, 2)
  const month = digits.substring(2, 4) > 12 ? '12' : digits.substring(2, 4)
  const year = digits.substring(4) > new Date().getFullYear() ? new Date().getFullYear() : digits.substring(4)

  switch (digits.length) {
    case 0:
      return ''
    case 1:
      return day
    case 2:
      return `${day}/`
    case 3:
      return `${day}/${month}`
    case 4:
      return `${day}/${month}/`
    default:
      return `${day}/${month}/${year}`
  }
}

// Handle input - format in real time for all devices
const handleInput = (event) => {
  const input = event.target
  const value = input.value
  const cursorPosition = input.selectionStart
  // Format the value
  const formatted = formatDate(value)

  // Update if different
  if (formatted !== value) {
    date.value = formatted

    // Try to maintain cursor position
    nextTick(() => {
      try {
        // Calculate new cursor position based on added slashes
        let newPosition = cursorPosition

        // Count slashes before cursor in original vs formatted
        const originalSlashes = (value.substring(0, cursorPosition).match(/\//g) || []).length
        const formattedSlashes = (formatted.substring(0, cursorPosition).match(/\//g) || []).length
        newPosition += (formattedSlashes - originalSlashes)

        // Ensure cursor doesn't land on a slash
        if (formatted[newPosition] === '/') {
          newPosition += 1
        }

        // Keep position within bounds
        newPosition = Math.min(newPosition, formatted.length)

        input.setSelectionRange(newPosition, newPosition)
      }
      catch {
        // Fallback for mobile browsers
        console.log('mobile browser')
      }
    })
  }
}

// Handle deletion keys for better UX
const handleKeydown = (event) => {
  const input = event.target
  const value = input.value
  const cursorPosition = input.selectionStart
  const selectionEnd = input.selectionEnd

  // Handle backspace and delete
  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()

    let newValue = ''

    if (cursorPosition !== selectionEnd) {
      // Text is selected - delete selection
      newValue = value.substring(0, cursorPosition) + value.substring(selectionEnd)

      // If all text is selected, clear everything
      if (cursorPosition === 0 && selectionEnd === value.length) {
        newValue = ''
      }
    }
    else if (event.key === 'Backspace' && cursorPosition > 0) {
      // Backspace - delete character before cursor
      let deletePos = cursorPosition - 1

      // If cursor is after a slash, delete the digit before the slash
      if (value[deletePos] === '/') {
        deletePos = cursorPosition - 2
      }

      if (deletePos >= 0) {
        newValue = value.substring(0, deletePos) + value.substring(cursorPosition)
      }
    }
    else if (event.key === 'Delete' && cursorPosition < value.length) {
      // Delete - delete character after cursor
      let deletePos = cursorPosition + 1

      // If cursor is before a slash, delete the digit after the slash
      if (value[cursorPosition] === '/') {
        deletePos = cursorPosition + 2
      }

      if (deletePos <= value.length) {
        newValue = value.substring(0, cursorPosition) + value.substring(deletePos)
      }
    }

    // Format the new value and update
    const formatted = formatDate(newValue)
    date.value = formatted

    // Position cursor
    nextTick(() => {
      try {
        const newPos = Math.min(cursorPosition, formatted.length)
        input.setSelectionRange(newPos, newPos)
      }
      catch {
        // Mobile browsers sometimes don't support setSelectionRange
        // This is okay - the field will still work, just cursor might not be perfectly positioned
        console.log('mobile browser')
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
</script>

<style scoped>
:deep(.v-icon__svg) {
  color: rgb(var(--v-theme-primary)) !important;
}
:deep(.v-field__input) {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
