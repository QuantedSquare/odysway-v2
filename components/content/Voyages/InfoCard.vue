<template>
  <v-card>
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
          v-if="displayedDates.length > 0 && !isLoading"
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
        <v-row v-else-if="isLoading">
          <v-col cols="12">
            <v-skeleton-loader
              type="article"
            />
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col
            cols="12"
          >
            <v-alert
              color="#fbefec"
              rounded="lg"
              class="d-flex align-center ga-2 text-secondary font-weight-bold"
            >
              <CustomBadge :color="'red'" />
              Pas encore de dates indiquées
              <!-- #TODO: add the key in the page schema -->
            </v-alert>
          </v-col>
          <v-col
            cols="12"
          >
            <v-btn
              height="60"
              block
              rounded="md"
            >
              <span class="text-body-2 font-weight-bold text-decoration-none">
                Demander un devis
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
        <template v-if="displayedDates.length > 0">
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
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12">
              <div class="d-flex align-center ga-2">
                <v-icon>
                  {{ mdiCheckCircleOutline }}
                </v-icon>
                <span class="text-primary font-weight-bold">
                  <!-- #TODO: add the key in the page -->
                  Je souhaite être tenu informé des départs
                </span>
              </div>
            </v-col>
            <NewsletterContainer is-on-voyage />
          </v-row>
        </template>
      </v-container>
    </v-card-text>
  </v-card>
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
const { dates, isLoading } = useDates()

const displayedDates = ref([])

const { stickyBlock, voyage } = defineProps({
  stickyBlock: {
    type: Object,
    required: true,
  },
  voyage: {
    type: Object,
    required: true,
  },
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

watch(dates, () => {
  if (dates.value.length > 0) {
    const sortedByDates = dates.value
      .filter(date => dayjs(date.departure_date).isAfter(dayjs()))
      .sort((a, b) => dayjs(a.departure_date).diff(dayjs(b.departure_date)))
    displayedDates.value = sortedByDates.slice(0, 3).map((date) => {
      const in30days = dayjs().add(30, 'day')
      const checkoutType = dayjs(date.departure_date).isBefore(in30days) ? 'full' : 'deposit'
      return {
        departureDate: date.departure_date,
        returnDate: date.return_date,
        status: getStatus(date),
        link: `/checkout?date_id=${date.id}&type=${checkoutType}`,
      }
    })
  }
}, { immediate: true })
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
