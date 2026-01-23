<template>
  <v-card>
    <v-card-text>
      <v-container
        fluid
        class="pa-6"
      >
        <v-row>
          <v-col
            cols="5"
            class="d-flex flex-column align-start"
          >
            <span class="text-caption text-lg-body-2 text-grey">
              {{ stickyBlock.pricePrefix }}
            </span>
            <span class="text-h3 text-lg-h2 font-weight-bold text-primary">
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
            <v-divider v-if="voyage.availabilityTypes?.includes('groupe')" />
          </v-col>
        </v-row>

        <v-row class="mt-0">
          <v-col cols="12">
            <span
              v-if="voyage.availabilityTypes?.includes('groupe')"
              class="text-h4 font-weight-bold text-primary"
            >
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
            <DateButton
              v-if="date.status.status !== 'full'"
              :date="date"
              :voyage="voyage"
            />
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
            v-if="voyage.availabilityTypes?.includes('groupe') && !voyage.availabilityTypes?.includes('privatisation')"
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
              :to="`/devis?slug=${typeof voyage.slug === 'object' ? voyage.slug.current : voyage.slug}`"
            >
              <span class="text-body-2 font-weight-bold text-decoration-none">
                Demander un devis
              </span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          v-if="!voyage.availabilityTypes?.includes('groupe') && !voyage.availabilityTypes?.includes('privatisation')"
          justify-md="center"
        >
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
                :to="`/calendly?travelTitle=${voyage.title}`"
                @click="trackPixel('trackCustom', 'ClicRdv', { voyage: `${voyage.title}` })"
              >
                <div class="d-flex align-center ga-2">
                  <SanityImage
                    :asset-id="stickyBlock.ctaCall.avatar.asset._ref"
                    auto="format"
                  >
                    <template #default="{ src }">
                      <v-avatar
                        :size="mdAndDown ? 30 : 40"
                        :image="src"
                        color="white"
                      />
                    </template>
                  </SanityImage>

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
        <template v-else-if="displayedDates.length === 0 && voyage.availabilityTypes?.includes('groupe')">
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
    v-if="voyage.availabilityTypes?.includes('groupe')"
    class="mt-4"
  >
    <v-col
      cols="12"
    >
      <NuxtLink
        width="100%"
        class="text-primary text-break d-flex align-center justify-center ga-3"
        :to="`/devis?slug=${voyage.slug.current}`"
        @click="trackPixel('trackCustom', 'ClicRdv', { voyage: `${voyage.title}` })"
      >
        <v-icon
          size="24"
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

const displayedDates = computed(() => {
  if (dates.value.length > 0) {
    const filteredDates = dates.value.filter(d => getDateStatus(d)?.status !== 'full')

    const sortedByDates = filteredDates
      .filter(date => dayjs(date.departure_date).isAfter(dayjs().add(voyage.closingDays, 'day')))
      .sort((a, b) => dayjs(a.departure_date).diff(dayjs(b.departure_date)))

    return sortedByDates.slice(0, 4).map((date) => {
      const in30days = dayjs().add(30, 'day')
      const checkoutType = dayjs(date.departure_date).isBefore(in30days) ? 'full' : 'deposit'
      return {
        departureDate: date.departure_date,
        returnDate: date.return_date,
        status: getDateStatus(date),
        link: `/checkout?date_id=${date.id}&type=${checkoutType}`,
        id: date.id,
        slug: voyage.slug.current,
      }
    })
  }
  return []
})
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
