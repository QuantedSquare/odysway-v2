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
      <!-- <v-text-field
        v-model="displayedDate"
        label="Date de naissance *"
        placeholder="JJ/MM/AAAA"
        :rules="[rules.required, rules.dateFormat]"
        type="date"
        @change="dataUpdated"
      /> -->
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
      >
        <template #activator="{ props }">
          <v-text-field
            v-bind="props"
            :value="formattedDate"
            class="font-weight-bold text-primary"
            hide-details
            :append-inner-icon="mdiCalendarBlankOutline"
            @change="dataUpdated"
          />
        </template>

        <v-card
          min-width="300"
          elevation="6"
        >
          <v-locale-provider locale="fr">
            <v-date-picker
              v-model="date"
              width="100%"
              format="dd/mm/YYYY"
              :max="new Date()"
              show-adjacent-months
              @update:model-value="dataUpdated"
            />
          </v-locale-provider>
        </v-card>
      </v-menu>
    </v-col>
  </v-row>
</template>

<script setup>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { mdiBagPersonal, mdiCalendarBlankOutline } from '@mdi/js'

const dateMenu = ref(false)

dayjs.extend(customParseFormat)

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
const date = ref(props.birthdate ? dayjs(props.birthdate, 'DD/MM/YYYY', true) : dayjs())
const emit = defineEmits(['change'])

const formattedDate = computed(() => {
  return date.value ? date.value.format('DD/MM/YYYY') : ''
})

// Initialize birthdate
onMounted(() => {
  if (props.birthdate) {
    const parsed = dayjs(props.birthdate, 'DD/MM/YYYY', true)
    date.value = parsed.isValid() ? parsed : null
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
  if (!date.value) return

  // Convert from YYYY-MM-DD to DD/MM/YYYY for emission

  emit('change', {
    id: props.id,
    firstname: i_firstname.value,
    lastname: i_lastname.value,
    birthdate: date.value.format('DD/MM/YYYY'),
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
watch(() => props.birthdate, (newVal) => {
  if (newVal) {
    const parsed = dayjs(newVal, 'DD/MM/YYYY', true)
    date.value = parsed.isValid() ? parsed : null
  }
  else {
    date.value = null
  }
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
