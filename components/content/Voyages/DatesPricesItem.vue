<template>
  <v-container
    class="subtle-shadow rounded-lg text-primary d-flex align-center"
    :height="xs ? 275 : 190"
    fluid
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
        class="d-flex flex-column align-start ga-4"
      >
        <div class="d-flex align-center ga-2">
          <v-badge
            inline
            color="primary"
            text-color="white"
            :content="+enrichedDate.index +1"
          />
          <span class="text-body-2 d-flex align-center">
            {{ capitalize(dayjs(enrichedDate.departureDate).format('dddd')) }}&nbsp;
            <span class=" font-weight-bold">
              {{ dayjs(enrichedDate.departureDate).format('DD MMM YYYY') }}
            </span>
            <v-icon
              size="x-small"
              class="mx-1"
            >
              {{ mdiArrowRight }}
            </v-icon>
            {{ dayjs(enrichedDate.returnDate).format('dddd') }}&nbsp;
            <span class=" font-weight-bold ">
              {{ dayjs(enrichedDate.returnDate).format('DD MMM YYYY') }}
            </span>
          </span>
        </div>
        <BookingStatus
          :status="enrichedDate.status"
          :booked-places="enrichedDate.bookedTravelers"
          :max-travellers="enrichedDate.maxTravelers"
        />
        <div class="d-none d-md-flex align-center ga-3">
          <v-chip
            color="primary"
          >
            <span class="d-flex align-center ga-1">
              <v-icon>
                {{ mdiAccountGroupOutline }}
              </v-icon>
              Groupe de <strong>3 à 8 personnes</strong>
            </span>
          </v-chip>
          <v-chip
            color="primary"
          >
            <span class="d-flex align-center ga-1">
              <v-icon>
                {{ mdiCalendarOutline }}
              </v-icon>
              <strong>7 nuits</strong> sur place
            </span>
          </v-chip>
          <v-chip
            color="primary"
          >
            <span class="d-flex align-center ga-1">
              <v-icon>
                {{ mdiAirplane }}
              </v-icon>
              <strong>Vol</strong> compris
            </span>
          </v-chip>
        </div>
      </v-col>
      <v-col
        cols="5"
        md="2"
        class="d-flex flex-column align-start ga-1"
      >
        <span class="text-body-2 text-grey">
          À partir de
        </span>
        <span class="text-h2 font-weight-black ">
          {{ enrichedDate.startingPrice }}€<span class="text-body-2 font-weight-bold">/pers</span>
        </span>
      </v-col>
      <v-col
        cols="7"
        md="4"
      >
        <v-row
          justify-md="center"
          class="text-center"
        >
          <v-col
            cols="12"
          >
            <v-btn-secondary
              height="60"
              block
              :disabled="enrichedDate.status.status === 'full'"
              rounded="md"
              @click="goTo('#dates-container', { offset: -200 })"
            >
              <span class="text-body-2 font-weight-bold text-decoration-none">
                Réserver
              </span>
            </v-btn-secondary>
          </v-col>
        </v-row>
        <v-row class="text-size-14 text-grey d-none d-md-block">
          <v-col
            cols="12"
            class="d-flex align-start flex-column "
          >
            <div class="d-flex align-center ga-2">
              <v-icon size="small">
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span>
                <strong>15 jours</strong> pour changer d'avis
              </span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon size="small">
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span>
                Paiement en <strong>trois fois</strong> (Alma)
              </span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon size="small">
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span>
                Paiement par <strong>chèque vacances</strong> (ANCV)
              </span>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { capitalize } from 'lodash'
import { mdiArrowRight, mdiAccountGroupOutline, mdiAirplane, mdiCalendarOutline, mdiCheckCircleOutline } from '@mdi/js'
import { useDisplay } from 'vuetify'
import BookingStatus from './BookingStatus.vue'

const { xs } = useDisplay()
const { date } = defineProps({
  date: {
    type: Object,
    required: true,
  },
})

const enrichedDate = computed(() => {
  return {
    ...date,
    status: getStatus(date),
  }
})
const getStatus = (date) => {
  if (date.bookedTravelers < 2) {
    return {
      status: 'pending',
      text: `Bientôt confirmé`,
      color: 'yellow',
    }
  }
  else {
    if (date.bookedTravelers === date.maxTravelers) {
      return {
        status: 'full',
        text: 'Complet',
        color: 'secondary',
      }
    }
    else {
      return {
        status: 'confirmed',
        text: 'Départ Garanti',
        color: 'green',
      }
    }
  }
}
</script>

<style scoped>
  .text-size-11 {
  font-size: 11px!important;
  }
  .text-size-14 {
  font-size: 14px!important;
  }
</style>
