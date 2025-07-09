<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="text-body-2">
          {{ page.second_step.title }}
        </h2>
      </v-col>
    </v-row>
    <v-divider class="my-3" />
    <v-row>
      <v-col cols="12">
        <h3>
          {{ page.second_step.sub_1 }}
        </h3>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="model.nbAdults"
          :label="page.form_labels.nb_adults"
          :items="selectOptions(0, 9)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="model.nbChildren"
          :label="page.form_labels.nb_children"
          :items="selectOptions(0, 9)"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>
          {{ page.second_step.sub_2 }}
        </h3>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-radio-group v-model="model.includeDates">
          <v-radio
            :label="page.second_step.option_1"
            :value="false"
          />
          <v-radio
            :label="page.second_step.option_2"
            :value="true"
          />
        </v-radio-group>
      </v-col>
      <Transition name="slide">
        <v-col
          v-if="model.includeDates"
          cols="12"
          md="6"
        >
          <VDateInput
            v-model="selectedDates"
            :label="page.form_labels.select_period"
            multiple="range"
            :format-display="displayFormat"
            :min="dayjs().add(1, 'day').toDate()"
            :placeholder="page.form_labels.date_placeholder"
            :error-messages="model.includeDates && (!model.departureDate || !model.returnDate) ? 'Veuillez sélectionner une période' : ''"
          />
        </v-col>
      </Transition>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>
          {{ page.second_step.sub_3 }}
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
            :label="page.options.yes"
            :value="true"
          />
          <v-radio
            :label="page.options.no"
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
            {{ page.form_labels.departure_airport_question }}
          </div>
          <v-text-field
            v-model="model.departureAirport"
            :error-messages="model.departureAirport ? '' : 'Veuillez définir un aéroport de départ'"
            :label="page.form_labels.departure_airport_label"
          />
        </v-col>
      </Transition>
      <v-divider />
      <v-col cols="12">
        <v-textarea
          v-model="model.comment"
          :label="page.second_step.comment_title"
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
const { gtag } = useGtag()
const model = defineModel()

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

// TODO: TEST this
watch(() => [model.value.nbAdults, model.value.nbChildren], ([newAdults, newChildren], [oldAdults, oldChildren]) => {
  gtag('event', {
    eventCategory: 'Devis',
    eventAction: 'Select',
    eventLabel: 'Groupe Info - Sélection nombre voyageurs',
  })
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
