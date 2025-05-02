<template>
  <v-card
    v-if="dates.length > 0"
  >
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col
            cols="5"
            class="d-flex flex-column align-start"
          >
            <span class="text-body-2 text-grey">
              {{ stickyBlock.pricePrefix }}
            </span>
            <span class="text-h2 font-weight-bold text-primary">
              {{ voyage.pricing.startingPrice }}€<span class="text-body-2 font-weight-bold">{{ stickyBlock.priceSuffix }}</span>
            </span>
          </v-col>
          <v-spacer class="d-block" />
          <v-col
            cols="5"
            class="d-flex align-start justify-end"
          >
            <RatingBadge
              :rating="voyage.rating"
            />
          </v-col>
        </v-row>
        <v-row justify-md="center">
          <v-col
            cols="12"
          >
            <v-divider />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12">
            <span class="text-h4 font-weight-bold text-primary">
              {{ stickyBlock.dateText }}
            </span>
          </v-col>
        </v-row>
        <v-row
          justify-md="center"
          class="text-center"
        >
          <v-col
            v-for="(date, i) in displayedDates"
            :key="date.departureDate + i"
            cols="12"
          >
            <v-btn
              :height="mdAndDown ? 80 : 52"
              color="grey-light-3"
              rounded="md"
              block
              :to="date.link"
              class="w-100 block-btn-without-padding"
            >
              <div class="d-inline-flex flex-column flex-lg-row align-center  ga-2 justify-space-between w-100">
                <div class="d-flex align-center  ga-1">
                  <CustomBadge :color="date.status.color" />
                  <span class="text-body-2 text-decoration-none text-primary text-size-14 text-wrap text-start">
                    du <span class="font-weight-bold">{{ dayjs(date.departureDate).format('DD MMMM ') }}</span> au <span class="font-weight-bold">{{ dayjs(date.returnDate).format('DD MMMM') }} {{ dayjs(date.returnDate).format('YYYY') }}</span>
                  </span>
                </div>

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
            </v-btn>
          </v-col>

          <v-col
            cols="12"
          >
            <v-btn
              height="60"
              block
              rounded="md"
              @click="goTo('#dates-container', { offset: -200 })"
            >
              <span class="text-body-2 font-weight-bold text-decoration-none">
                {{ stickyBlock.dateButtonText }}
              </span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row justify-md="center">
          <v-col
            cols="12"
          >
            <v-divider />
          </v-col>
        </v-row>
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
              rounded="md"
              :to="stickyBlock.ctaCall.link"
            >
              <div class="d-flex align-center ga-2">
                <v-avatar
                  :size="mdAndDown ? 30 : 40"
                  :image="stickyBlock.ctaCall.avatar"
                  color="white"
                />
                <span class="text-caption text-lg-body-2 font-weight-bold text-decoration-none">
                  {{ stickyBlock.ctaCall.text }}
                </span>
              </div>
            </v-btn-secondary>
          </v-col>
        </v-row>
        <v-row class="text-size-14 text-grey">
          <v-col
            cols="12"
            class="d-flex align-start flex-column ga-1"
          >
            <div
              v-for="item, index in stickyBlock.ctaBottom.list"
              :key="index"
              class="d-flex align-center ga-2"
            >
              <v-icon>
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span v-dompurify-html="parseBoldText(item)" />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <v-skeleton-loader
    v-else
    type="card"
  />
  <v-row
    v-if="voyage.privatisationAvailable"
    class="mt-4"
  >
    <v-col
      cols="12"
    >
      <NuxtLink
        width="100%"
        class="text-primary text-break d-flex align-center justify-center ga-3"
        :to="`/calendly?travelTitle=${voyage.slug}`"
      >

        <v-icon
          size="small"
          color="x-small"
          class="bg-primary rounded-lg pa-1"
        >
          {{ mdiArrowRight }}
        </v-icon>
        <span class="text-left font-weight-bold text-primary">
          {{ stickyBlock.privatisationText }}
        </span>
      </NuxtLink>
    </v-col>
  </v-row>
</template>

<script setup>
import { mdiArrowRight, mdiCheckCircleOutline } from '@mdi/js'
import { useGoTo, useDisplay } from 'vuetify'
import dayjs from 'dayjs'

const { mdAndDown } = useDisplay()
const goTo = useGoTo()
const displayedDates = ref([])
const dates = inject('dates')
const { stickyBlock } = inject('page')
const voyage = inject('voyage')

const getStatus = (date) => {
  if (date.bookedTravelers < 2) {
    return {
      status: 'pending',
      text: `Bientôt confirmé`,
      color: 'yellow',
    }
  }
  else {
    if (date.bookedTravelers === date.maxTravellers) {
      return {
        status: 'full',
        text: 'Complet',
        color: 'secondary',
      }
    }
    else {
      return {
        status: 'confirmed',
        text: 'Départ confirmé',
        color: 'green',
      }
    }
  }
}

if (dates.length > 0) {
  const sortedByDates = dates
    .filter(date => dayjs(date.departureDate).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.departureDate).diff(dayjs(b.departureDate)))
  displayedDates.value = sortedByDates.slice(0, 3).map((date) => {
    const in30days = dayjs().add(30, 'day')
    const checkoutType = dayjs(date.departureDate).isBefore(in30days) ? 'full' : 'deposit'
    return {
      departureDate: date.departureDate,
      returnDate: date.returnDate,
      status: getStatus(date),
      link: `/checkout?slug=${voyage.slug}&departure_date=${dayjs(date.departureDate).format('YYYY-MM-DD')}&return_date=${dayjs(date.returnDate).format('YYYY-MM-DD')}&type=${checkoutType}`,
    }
  })
  console.log('displayedDates', displayedDates.value)
}
</script>

<style scoped>
.block-btn-without-padding:deep(.v-btn__content) {
  padding: 0px !important;
  width: 100% !important;
}
  .text-size-14 {
  font-size: 14px!important;
  }
  .text-size-11 {
  font-size: 11px!important;
  }
</style>
