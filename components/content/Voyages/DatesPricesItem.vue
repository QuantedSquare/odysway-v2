<template>
  <v-container
    class="subtle-shadow rounded-lg text-primary d-flex align-center pa-3 pa-sm-4 pa-md-8 custom-height-card"
    fluid
  >
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="5"
        class="d-flex flex-column align-start ga-1 ga-md-0 "
      >
        <div class="d-flex align-center ga-2">
          <v-badge
            inline
            color="primary"
            text-color="white"
            :content="+enrichedDate.index +1"
          />
          <span class="text-body-2 d-flex align-center line-height-2 ga-2">
            <div class="d-flex align-center">
              <span class="d-none d-lg-block">
                {{ capitalize(dayjs(enrichedDate.departure_date).format('dddd')) }}&nbsp;
              </span>
              <span class="font-weight-bold">
                {{ dayjs(enrichedDate.departure_date).format('DD MMM YYYY') }}
              </span>
            </div>
            <v-icon
              size="x-small"
            >
              {{ mdiArrowRight }}
            </v-icon>

            <div class="d-flex align-center">
              <span class="d-none d-lg-block">
                {{ capitalize(dayjs(enrichedDate.return_date).format('dddd')) }}&nbsp;
              </span>
              <span class=" font-weight-bold ">
                {{ dayjs(enrichedDate.return_date).format('DD MMM YYYY') }}
              </span>
            </div>

          </span>
        </div>
        <BookingStatus
          :status="enrichedDate.status"
          :booked-places="enrichedDate.status.status === 'full' ? enrichedDate.max_travelers : enrichedDate.booked_seat"
          :max-travellers="enrichedDate.max_travelers"
        />
        <v-row class="d-flex align-start ga-2 mx-1 text-custom  custom-chip-height">
          <v-chip
            color="primary"
          >
            <span class="d-flex align-center ga-1 mb-1 px-1">
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
        <v-row class="pl-5 pl-md-2 pt-1 d-none d-sm-flex d-md-none flex-column justify-center align-start  justify-lg-start">
          <span
            class="text-h2 font-weight-black"
            :class="enrichedDate.last_minute || enrichedDate.early_bird ? 'text-decoration-line-through text-grey text-body-2' : ''"
          >
            {{ formatNumber(enrichedDate.starting_price * 100) }}€<span class="text-body-2 font-weight-bold">/pers</span>
          </span>
          <span
            v-if="enrichedDate.last_minute || enrichedDate.early_bird"
            class="text-h2 font-weight-black text-green-light"
          >
            {{ formatNumber((enrichedDate.starting_price - (enrichedDate.last_minute ? enrichedDate.lastMinutePrice : enrichedDate.earlyBirdPrice)) * 100) }}€<span class="text-body-2 font-weight-bold  ">/pers</span>
          </span>
        </v-row>
      </v-col>
      <v-col
        cols="6"
        md="3"
        class="pl-5 pl-md-2 pt-1 d-none d-md-flex flex-column justify-center align-start  justify-lg-start"
      >
        <span
          class="text-h2 font-weight-black"
          :class="enrichedDate.last_minute || enrichedDate.early_bird ? 'text-decoration-line-through text-grey text-body-2' : ''"
        >
          {{ formatNumber(enrichedDate.starting_price * 100) }}€<span class="text-body-2 font-weight-bold">/pers</span>
        </span>
        <span
          v-if="enrichedDate.last_minute || enrichedDate.early_bird"
          class="text-h2 font-weight-black text-green-light"
        >
          {{ formatNumber((enrichedDate.starting_price - (enrichedDate.last_minute ? enrichedDate.lastMinutePrice : enrichedDate.earlyBirdPrice)) * 100) }}€<span class="text-body-2 font-weight-bold  ">/pers</span>
        </span>
      </v-col>
      <v-spacer />
      <v-col
        cols="12"
        sm="4"
      >
        <v-row
          justify="end"
          justify-md="center"
          class="text-center"
        >
          <v-col class="pl-5 pl-md-2 pt-1 d-flex d-sm-none flex-column justify-center align-start  justify-lg-start">
            <span
              class="text-h2 font-weight-black"
              :class="enrichedDate.last_minute || enrichedDate.early_bird ? 'text-decoration-line-through text-grey text-body-2' : ''"
            >
              {{ formatNumber(enrichedDate.starting_price * 100) }}€<span class="text-body-2 font-weight-bold">/pers</span>
            </span>
            <span
              v-if="enrichedDate.last_minute || enrichedDate.early_bird"
              class="text-h2 font-weight-black text-green-light"
            >
              {{ formatNumber((enrichedDate.starting_price - (enrichedDate.last_minute ? enrichedDate.lastMinutePrice : enrichedDate.earlyBirdPrice)) * 100) }}€<span class="text-body-2 font-weight-bold  ">/pers</span>
            </span>
          </v-col>
          <v-col
            cols="6"
            sm="12"
          >
            <v-btn-secondary
              :height="width < 500 ? 50 : 60"
              block
              :disabled="enrichedDate.status.status === 'full'"
              rounded="md"
              :to="checkoutLink"
              @click="handleBookingClick"
            >
              <span class="text-body-1 font-weight-bold text-decoration-none">
                Réserver
              </span>
            </v-btn-secondary>
          </v-col>
        </v-row>
        <v-row class="text-size-14 text-grey d-none d-sm-block">
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

const today = dayjs()
const { width } = useDisplay()
const { date } = defineProps({
  date: {
    type: Object,
    required: true,
  },
})

const enrichedDate = computed(() => {
  return {
    ...date,
    min_travelers: date.custom_display ? date.displayed_min_travelers : date.min_travelers,
    max_travelers: date.custom_display ? date.displayed_max_travelers : date.max_travelers,
    booked_seat: date.custom_display ? date.displayed_booked_seat : date.booked_seat,
    include_flight: date.custom_display ? date.displayed_include_flight : date.include_flight,
    badges: date.custom_display ? (date.displayed_badges || '') : (date.badges || ''),
    starting_price: date.custom_display ? date.displayed_starting_price : date.starting_price,
    early_bird: date.custom_display ? date.displayed_early_bird : today.isAfter(dayjs(date.departure_date).add(7, 'month')) ? date.early_bird : false,
    last_minute: date.custom_display ? date.displayed_last_minute : dayjs(date.departure_date).diff(today, 'day') <= 31 ? date.last_minute : false,
    status: getDateStatus(date),
  }
})

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Reactive state to track existing booked dates
const existingBookedDates = ref(new Map())
const checkoutLink = ref('')

// Function to get or fetch existing booked date
const getExistingBookedDate = async (dateId) => {
  if (existingBookedDates.value.has(dateId)) {
    return existingBookedDates.value.get(dateId)
  }

  try {
    const existingBookedId = await retrieveExistingBookedDate(dateId)
    existingBookedDates.value.set(dateId, existingBookedId)
    return existingBookedId
  }
  catch (error) {
    console.error('Error retrieving existing booked date:', error)
    return null
  }
}

// Function to generate checkout link
const generateCheckoutLink = async () => {
  if (!import.meta.client) {
    checkoutLink.value = `/checkout?date_id=${enrichedDate.value.id}&type=deposit&voyage=${date.travel_slug}`
    return
  }

  try {
    const in30days = dayjs().add(30, 'day')
    const checkoutType = dayjs(enrichedDate.value.departure_date).isBefore(in30days) ? 'full' : 'deposit'

    // Check for stored booking details
    const storedBookingDetails = localStorage.getItem(enrichedDate.value.id)

    if (storedBookingDetails) {
      const existingBookedId = await getExistingBookedDate(enrichedDate.value.id)

      if (existingBookedId) {
        checkoutLink.value = `/checkout?booked_id=${existingBookedId}&type=${checkoutType}&step=1&voyage=${date.travel_slug}`
      }
      else {
        checkoutLink.value = `/checkout?date_id=${enrichedDate.value.id}&type=${checkoutType}&step=0&voyage=${date.travel_slug}`
      }
    }
    else {
      checkoutLink.value = `/checkout?date_id=${enrichedDate.value.id}&type=${checkoutType}&step=0&voyage=${date.travel_slug}`
    }
  }
  catch (error) {
    console.error('Error generating checkout link:', error)
    // Fallback to basic link
    checkoutLink.value = `/checkout?date_id=${enrichedDate.value.id}&type=deposit&step=0&voyage=${date.travel_slug}`
  }
}

// Function to handle booking button click
const handleBookingClick = async () => {
  try {
    trackPixel('track', 'AddToWishlist')

    // Generate link if not already generated
    if (!checkoutLink.value) {
      await generateCheckoutLink()
    }

    // Navigate to checkout
    if (checkoutLink.value) {
      await navigateTo(checkoutLink.value)
    }
  }
  catch (error) {
    console.error('Error handling booking click:', error)
  }
}

// Watch for changes in enrichedDate and regenerate link
watch(enrichedDate, async () => {
  await generateCheckoutLink()
}, { immediate: true })
</script>

<style scoped>
.custom-height-card{
    height: fit-content!important;
  }
  .custom-chip-height:deep(.v-chip){
    height: 25px!important;
  }

  .text-size-11 {
  font-size: 11px!important;
  }
  .text-size-14 {
  font-size: 10px!important;
  }
  .font-size-custom {
    font-weight: 500!important;
  }
  .line-height-2 {
    line-height: 20px !important;
  }
  .text-custom:deep(.v-chip){
    font-size: 10px!important;
  }
  .flex-direction-custom{
    flex-direction: column;
  }
  @media screen and  (min-width: 400px) {
    .flex-direction-custom{
      flex-direction: row;
    }
  .custom-chip-height:deep(.v-chip){
    height: 30px!important;
  }
}
  @media screen and  (min-width: 900px) {
    .text-custom:deep(.v-chip){
    font-size: 16px!important;
  }
  .text-size-14 {
  font-size: 14px!important;
  }
}
@media screen and (min-width: 600px) {
  .custom-height-card{
    height: fit-content!important;
  }
}
@media screen and (min-width: 960px) {
  .custom-height-card{
    height: 100%!important;
  }
  .custom-chip-height:deep(.v-chip){
    height: 46px!important;
  }
}
</style>
