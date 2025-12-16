<template>
  <div>
    <v-btn
      v-if="!isLoading"
      :height="mdAndDown ? 80 : 52"
      color="grey-light-3"
      rounded="md"
      block
      class="w-100 block-btn-without-padding"
      @click="handleDateClick"
    >
      <div class="d-inline-flex flex-column flex-lg-row align-center  ga-2 justify-space-between w-100">
        <div class="d-flex align-center  ga-1">
          <CustomBadge :color="date.status.color" />
          <span class="text-body-2 text-decoration-none text-primary text-size-14 text-wrap text-start">
            du <span class="font-weight-bold">{{ dayjs(date.departureDate).format('DD MMM YY') }}</span> au <span class="font-weight-bold">{{ dayjs(date.returnDate).format('DD MMM YY') }}</span>
          </span>
        </div>
        <div>
          <v-chip
            variant="flat"
            :color="date.status.color"
            rounded="lg"
          >
            <span class="text-caption font-weight-bold  text-white mb-1 px-1">
              {{ date.status.text }}
            </span>
          </v-chip>
        </div>
      </div>
    </v-btn>
    <v-skeleton-loader
      v-else-if="isLoading"
      type="article"
    />
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import dayjs from 'dayjs'
import retrieveExistingBookedDate from '~/utils/retrieveExistingBookedDate.js'
import trackPixel from '~/utils/trackPixel.js'

const { mdAndDown } = useDisplay()
const { date } = defineProps({
  date: {
    type: Object,
    required: true,
  },
})
const isLoading = ref(false)
// Reactive state to track existing booked dates
const existingBookedDates = ref(new Map())
const checkoutLink = ref('')

// Function to get or fetch existing booked date
const getExistingBookedDate = async (dateId) => {
  if (existingBookedDates.value.has(dateId)) {
    return existingBookedDates.value.get(dateId)
  }

  try {
    isLoading.value = true
    const existingBookedId = await retrieveExistingBookedDate(dateId)
    existingBookedDates.value.set(dateId, existingBookedId)
    isLoading.value = false
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
    checkoutLink.value = `/checkout?date_id=${date.id}&type=deposit&voyage=${date.slug}`
    return
  }

  try {
    const in30days = dayjs().add(30, 'day')
    const checkoutType = dayjs(date.departureDate).isBefore(in30days) ? 'full' : 'deposit'

    // Check for stored booking details
    const storedBookingDetails = localStorage.getItem(date.id)
    if (storedBookingDetails) {
      const existingBookedId = await getExistingBookedDate(date.id)
      if (existingBookedId) {
        checkoutLink.value = `/checkout?booked_id=${existingBookedId}&type=${checkoutType}&step=1&voyage=${date.slug}`
      }
      else {
        checkoutLink.value = `/checkout?date_id=${date.id}&type=${checkoutType}&voyage=${date.slug}`
      }
    }
    else {
      checkoutLink.value = `/checkout?date_id=${date.id}&type=${checkoutType}&voyage=${date.slug}`
    }
  }
  catch (error) {
    console.error('Error generating checkout link:', error)
    // Fallback to basic link
    checkoutLink.value = `/checkout?date_id=${date.id}&type=deposit&voyage=${date.slug}`
  }
}

// Function to handle date button click
const handleDateClick = async () => {
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
    console.error('Error handling date click:', error)
  }
}

await generateCheckoutLink()
</script>

<style scoped>
.block-btn-without-padding:deep(.v-btn__content) {
  padding: 0px !important;
  width: 100% !important;
}
.text-size-14 {
  font-size: 14px!important;
}
</style>
