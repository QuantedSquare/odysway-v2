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
        class="mr-2 d-md-none"
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
      <v-menu
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
      </v-menu>
    </v-col>
  </v-row>
</template>

<script setup>
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'

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
    i_birthdate.value = parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null
  }
})
watch(modelDate, () => {
  displayedDate.value = dayjs(modelDate.value).format('DD/MM/YYYY')
  handleDateSelection()
})
</script>
