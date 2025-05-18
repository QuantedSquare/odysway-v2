<template>
  <v-container
    class="subtle-shadow rounded-lg text-primary d-flex align-center"
    :height="xs ? 275 : 190"
    fluid
  >
    <v-row>
      <v-col
        cols="12"
        md="5"
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
            {{ capitalize(dayjs(enrichedDate.departure_date).format('dddd')) }}&nbsp;
            <span class=" font-weight-bold">
              {{ dayjs(enrichedDate.departure_date).format('DD MMM YYYY') }}
            </span>
            <v-icon
              size="x-small"
              class="mx-1"
            >
              {{ mdiArrowRight }}
            </v-icon>
            {{ capitalize(dayjs(enrichedDate.return_date).format('dddd')) }}&nbsp;
            <span class=" font-weight-bold ">
              {{ dayjs(enrichedDate.return_date).format('DD MMM YYYY') }}
            </span>
          </span>
        </div>
        <BookingStatus
          :status="enrichedDate.status"
          :booked-places="enrichedDate.status.status === 'full' ? enrichedDate.max_travelers : enrichedDate.booked_seat"
          :max-travellers="enrichedDate.max_travelers"
        />
        <v-row class="d-none d-md-flex align-center ga-2 mx-1">
          <v-chip
            color="primary"
          >
            <span class="d-flex align-center ga-1 mb-1">
              <v-icon>
                {{ mdiAccountGroupOutline }}
              </v-icon>
              Groupe de <strong>{{ enrichedDate.min_travelers }} à {{ enrichedDate.max_travelers }} personnes</strong>
            </span>
          </v-chip>
          <v-chip
            v-if="enrichedDate.include_flight"
            color="primary"
          >
            <span class="d-flex align-center ga-1 mb-1">
              <v-icon>
                {{ mdiAirplane }}
              </v-icon>
              <strong>Vol</strong> compris
            </span>
          </v-chip>
          <v-chip
            v-if="enrichedDate.early_bird"
            color="blue"
          >
            <span class="d-flex align-center ga-1 mb-1">
              <v-icon>
                {{ mdiBird }}
              </v-icon>
              <strong>Early Bird</strong>
            </span>
          </v-chip>
          <v-chip
            v-if="enrichedDate.last_minute"
            color="yellow"
          >
            <span class="d-flex align-center ga-1 mb-1">
              <v-icon>
                {{ mdiClockStarFourPointsOutline }}
              </v-icon>
              <strong>Last Minute</strong>
            </span>
          </v-chip>
          <v-chip
            v-if="enrichedDate.badges.length > 0"
            color="green-light"
          >
            <span class="d-flex align-center ga-1 mb-1">
              <v-icon>
                {{ mdiCalendarHeart }}
              </v-icon>
              <strong>{{ enrichedDate.badges }}</strong>
            </span>
          </v-chip>
        </v-row>
      </v-col>
      <v-col
        cols="5"
        md="3"
        class="d-flex flex-column align-center"
      >
        <span class="text-h2 font-weight-black">
          {{ formatNumber(enrichedDate.starting_price * 100) }}€<span class="text-body-2 font-weight-bold">/pers</span>
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
              :to="formatLink(enrichedDate)"
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
import { mdiArrowRight, mdiAccountGroupOutline, mdiAirplane, mdiCalendarHeart, mdiCheckCircleOutline, mdiBird, mdiClockStarFourPointsOutline } from '@mdi/js'
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
  if (date.displayed_status === 'soon_confirmed') {
    return {
      status: 'soon_confirmed',
      text: `Bientôt confirmé`,
      color: 'yellow',
    }
  }
  else {
    if (date.displayed_status === 'guaranteed') {
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
const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const formatLink = (date) => {
  const in30days = dayjs().add(30, 'day')
  const checkoutType = dayjs(date.departure_date).isBefore(in30days) ? 'full' : 'deposit'
  return `/checkout?slug=${date.travel_slug}&date_id=${date.id}&departure_date=${dayjs(date.departure_date).format('YYYY-MM-DD')}&return_date=${dayjs(date.return_date).format('YYYY-MM-DD')}&type=${checkoutType}`
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
