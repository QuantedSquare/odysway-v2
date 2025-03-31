<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="text-body-2">
          {{ page.title }}
        </h2>
      </v-col>
    </v-row>
    <v-divider class="my-3" />
    <v-row>
      <v-col cols="12">
        <h3>
          {{ page.sub_1 }}
        </h3>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="model.nbAdults"
          label="Nombre d'adultes"
          :items="selectOptions(0, 9)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="model.nbChildren"
          label="Nombre d'enfants (0-18ans)"
          :items="selectOptions(0, 9)"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>
          {{ page.sub_2 }}
        </h3>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-radio-group v-model="gotDates">
          <v-radio
            :label="page.option_1"
            :value="false"
          />
          <v-radio
            :label="page.option_2"
            :value="true"
          />
        </v-radio-group>
      </v-col>
      <Transition name="slide">
        <v-col
          v-if="gotDates"
          cols="12"
          md="6"
        >
          <VDateInput
            v-model="selectedDates"
            label="Séléctionnez une période"
            multiple="range"
            :format-display="displayFormat"
            :min="dayjs().add(1, 'day').toDate()"
            placeholder="DD/MM/YYYY - DD/MM/YYYY"
          />
        </v-col>
      </Transition>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>
          {{ page.sub_3 }}
        </h3>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-radio-group
          v-model="includeFlight"
        >
          <v-radio
            label="Oui"
            :value="true"
          />
          <v-radio
            label="Non"
            :value="false"
          />
        </v-radio-group>
      </v-col>
      <Transition name="slide">
        <v-col
          v-if="includeFlight"
          cols="12"
          md="6"
        >
          <div class="text-caption">
            Depuis quel aéroport souhaitez-vous partir ?
          </div>
          <v-text-field
            v-model="model.departureAirport"
            label="Aéroport de départ"
          />
        </v-col>
      </Transition>
      <v-divider />
      <v-col cols="12">
        <v-textarea
          v-model="model.comment"
          :label="page.comment_title"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { VDateInput } from 'vuetify/labs/VDateInput'

const { page } = defineProps({
  page: {
    type: Object,
    required: true,
  },
})
const model = defineModel()

const gotDates = ref(true)
const selectedDates = ref([])
const includeFlight = ref(false)

const selectOptions = (min, max) => {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

const displayFormat = (date) => {
  // Waiting for workaround, vuetify to fix this
  return dayjs(date).format('DD/MM/YYYY')
}
watch([selectedDates, includeFlight], () => {
  if (selectedDates.value.length > 0) {
    model.value.departureDate = dayjs(selectedDates.value[0]).format('YYYY-MM-DD')
    model.value.returnDate = dayjs(selectedDates.value[selectedDates.value.length - 1]).format('YYYY-MM-DD')
  }
  model.value.includeFlight = includeFlight.value
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
