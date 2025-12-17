<template>
  <v-lazy
    :options="{ threshold: 0.1 }"
    transition="fade-transition"
    class="rounded-xl custom-height-lazy"
  >
    <v-card
      v-if="voyageCardContent"
      elevation="0"
      hover
      class="custom-card-width next-departure-card"
    >
      <NuxtLink
        :to="`/voyages/${voyage.slug.current || voyage.slug}`"
        class="text-decoration-none position-relative text-white"
      >
        <v-img
          v-if="voyageCardImg"
          :src="img(voyageCardImg, { format: 'webp', quality: 75, height: 228, width: 640 })"
          :lazy-src="img(voyageCardImg, { format: 'webp', quality: 10, height: 228, width: 640 })"
          :alt="voyage.image.alt || `Paysage de destination pour le voyage ${voyage.title}`"
          :srcset="`${img(voyageCardImg, { format: 'webp', quality: 75, width: 640 })} 640w, ${img(voyageCardImg, { format: 'webp', quality: 75, width: 1024 })} 1024w`"
          sizes="(max-width: 600px) 480px, 1024px"
          class="img-height"
          cover
          aspect-ratio="auto"
        />

      </NuxtLink>
      <!--  BOTTOM TEXT -->
      <div>
        <NuxtLink
          :to="`/voyages/${voyage.slug.current || voyage.slug}`"
          class="text-decoration-none"
        >
          <v-card-text class="py-1">
            <v-container class="px-0 px-md-2">
              <v-row>
                <v-col class="pt-lg-3 pt-0">
                  <div
                    class="text-primary text-h5 text-sm-h4 font-weight-bold py-1 px-0 no-white-space title-container"
                  >
                    <v-tooltip
                      v-if="voyage.title.length > 50"
                      :id="`tooltip-${voyage.slug}`"
                      activator="parent"
                      role="tooltip"
                      :aria-label="`Titre complet du voyage: ${voyage.title}`"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <div
                          :id="`tooltip-${voyage.slug.current || voyage.slug}`"
                          ref="titleRef"
                          class="line-clamp-2"
                          :aria-describedby="voyage.title.length > 50 ? `tooltip-${voyage.slug.current || voyage.slug}` : undefined"
                          role="tooltip"
                          :aria-label="`Titre complet du voyage: ${voyage.title}`"
                          v-bind="tooltipProps"
                        >
                          {{ voyage.title }}</div>
                      </template>
                      <span>
                        {{ voyage.title }}
                      </span>
                    </v-tooltip>
                    <div
                      v-else
                      ref="titleRef"
                      class="line-clamp-2"
                    >{{ voyage.title }}</div>
                  </div>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                class="mt-4 cta-bg rounded pa-2"
              >
                <v-col
                  cols="8"
                  class=" text-start text-grey-darken-2"
                >
                  <div>
                    Prochain départ
                  </div>
                  <div class="icon d-flex align-center mt-1">
                    <v-icon size="20px">{{ mdiCalendarCheck }}</v-icon>
                    <span class="text-subtitle-2 font-weight-bold ml-1 text-primary">{{ dayjs(voyage.departureDate).format('DD MMM YYYY') }}</span>

                  </div>
                </v-col>
                <v-col
                  v-if="statusBadge"
                  cols="4"
                  class="d-flex justify-center align-center"
                >

                  <span
                    class="status-chip text-h6 text-wrap font-weight-bold text-primary text-center mb-1"
                  >
                    {{ statusBadge?.text }}
                  </span>
                </v-col>
              </v-row>
              <v-row
                justify="center"
                class="px-3"
              >
                <div class="w-40 d-flex flex-column  align-center ga-1 justify-start">
                  <v-icon
                    size="20px"
                    class="text-primary"
                  >{{ mdiAccountMultiple }}</v-icon>
                  <div class="text-subtitle-2  text-center text-no-wrap text-md-left text-grey">{{ voyage.availabilityTypes?.includes('groupe')
                    ? (voyageCardContent?.groupType || 'Groupe') : (voyageCardContent?.soloType || 'Solo') }}</div>
                </div>

                <div class="w-20 d-flex flex-column  ga-1  align-center justify-start">

                  <div class="text-subtitle-2  font-weight-bold text-primary">
                    {{ voyage.duration }}
                  </div>
                  <div class="text-grey text-subtitle-2">{{ voyageCardContent?.days
                    || 'Jours'
                  }}</div>

                </div>
                <div class="w-40 d-flex flex-column justify-start ga-1 justify-md-end align-center">
                  <div class="text-grey text-subtitle-2  text-md-subtitle-2">{{
                    voyageCardContent?.startingFrom
                      || 'À partir de' }}</div>
                  <div class="text-subtitle-2  text-primary">{{ voyage.pricing?.startingPrice
                    ?? voyage.startingPrice
                  }} €</div>

                </div>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider class="text-grey" />
          <v-card-actions
            v-if="voyage.departureDate"
            :class="voyage.availabilityTypes?.includes('groupe') ? 'hover-primary' : 'hover-secondary'"
          >
            <client-only>
              <div
                class="text-decoration-none px-4 py-2 w-100 text-primary1"
              >
                <v-row>
                  <v-col
                    cols="12"
                    class="text-subtitle-1 text-primary-light-1 font-weight-bold text-center d-flex align-center justify-center ga-2"
                  >
                    <span class="text-primary">
                      {{ voyage.dates.length }} départs à venir
                    </span>
                    <v-icon
                      size="20px"
                      class="text-secondary"
                    >{{ mdiArrowRight }}</v-icon>
                  </v-col>
                </v-row>

              </div>
            </client-only>
          </v-card-actions>
        </NuxtLink>
      </div>
    </v-card>
  </v-lazy>
</template>

<script setup>
import { mdiArrowRight, mdiAccountMultiple, mdiCalendarCheck } from '@mdi/js'
import dayjs from 'dayjs'
import { useImage } from '#imports'
import { getDateStatus } from '~/utils/getDateStatus'

const { voyage } = defineProps({
  voyage: {
    type: Object,
  },
})
const img = useImage()

const voyageCardContentQuery = groq`*[_type == "voyage_card"][0]{
  type,
  groupType,
  soloType,
  days,
  startingFrom,
  discoverDates,
  requestQuote
}`

const sanity = useSanity()
const { data: voyageCardContent } = await useAsyncData('voyage-card-content', () =>
  sanity.fetch(voyageCardContentQuery),
{
  dedupe: 'defer', // This ensures all components wait for first request to complete
},
)
const dateData = computed(() => {
  return voyage.dates.find(date => date.departure_date === voyage.departureDate)
})
const remainingSeats = computed(() => {
  if (!dateData.value) return null
  const { max_travelers, booked_seat } = dateData.value
  if (typeof max_travelers !== 'number' || typeof booked_seat !== 'number') return null
  return max_travelers - booked_seat
})

const statusBadge = computed(() => {
  const date = dateData.value
  if (!date) return null

  if (typeof remainingSeats.value === 'number' && remainingSeats.value < 4 && remainingSeats.value > 0) {
    return {
      text: 'Dernières places',
      color: 'secondary',
    }
  }

  const status = getDateStatus(date)
  if (!status) return null

  return {
    text: status.text,
    color: status.color,
  }
})
const actionColor = computed(() => voyage.availabilityTypes?.includes('groupe') ? '#f7f8f8' : '#fef9f8')
const voyageCardImg = computed(() => {
  return getImageUrl(voyage.image?.asset?._ref)
})
</script>

<style scoped>
.cta-bg{
  background-color: #dfe3f07f;
}
.badge-position {
  position: absolute;
  top: 25px;
  right: 28px;
}
.w-40{
  width: 40%;
}
.w-20{
  width: 20%;
  border-right: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
}
.status-chip :deep(.v-chip__underlay) {
  display: none;
}
.status-chip {
  line-height: 1.2;
}

@media screen and (max-width: 650px) {
  .w-40, .w-20 {
    width:33%;
  }
  .w-20 {
    border-right: none;
    border-left: none;
  }
}

.title-container {
  height: 2.4em;
  /* This sets a fixed height equivalent to 2 lines */
}

.hover-primary:hover {
  background-color: v-bind(actionColor);
}

.hover-secondary:hover {
  background-color: v-bind(actionColor);
}

:deep(.v-btn--variant-text .v-btn__overlay) {
  background-color: v-bind(actionColor);
}

.img-height {
  height: 228px;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  line-height: 120% !important;
  font-size: 24px !important;
}

.custom-card-width {
  min-width: 406px !important;
  max-width: 600px !important;
}

.next-departure-card {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
  /* border: 1px solid transparent; */
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.next-departure-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  border-color: #e0e7ff;
}

.next-departure-card .img-height {
  transition: transform 220ms ease;
}

.next-departure-card:hover .img-height {
  transform: scale(1.03);
}

@media screen and (max-width: 1280px) {
  .custom-card-width {
    min-width: 406px !important;
  }
}

@media screen and (max-width: 1400px) {
  .custom-card-width {
    min-width: 350px !important;
  }
}

@media screen and (max-width: 1240px) {
  .line-clamp-2 {
    font-size: 24px !important;
  }

  .title-container {
    height: 2.2em;
    /* This sets a fixed height equivalent to 2 lines */
  }

  .custom-card-width {
    min-width: 350px !important;
  }
}

@media screen and (max-width: 1024px) {
  .line-clamp-2 {
    font-size: 18px !important;
  }
}

@media screen and (max-width: 750px) {
  .custom-card-width {
    min-width: 280px !important;
  }
}

@media screen and (max-width: 600px) {
  .badge-position {
    position: absolute;
    top: 18px;
    right: 18px;
  }

  .img-height {
    height: 150px;
  }

  .line-clamp-2 {
    line-height: 20px !important;
    font-size: 16px !important;
  }

  .custom-card-width {
    min-width: 280px !important;
    max-width: 100% !important;
  }
}

.custom-row-height {
  height: 77px !important;
}

.custom-height-lazy {
  min-height: 455px !important;
  min-width: 406px !important;
  max-width: 600px !important;
}

@media screen and (max-width: 1280px) {
  .custom-height-lazy {
    min-height: 438px !important;
    min-width: 406px !important;
  }
}

@media screen and (max-width: 1400px) {
  .custom-height-lazy {
    min-width: 350px !important;
  }
}

@media screen and (max-width: 1240px) {
  .custom-height-lazy {
    min-height: 420px !important;
    min-width: 350px !important;
  }
}

@media screen and (max-width: 960px) {
  .custom-height-lazy {
    min-height: 420px !important;
  }
}

@media screen and (max-width: 750px) {
  .custom-height-lazy {
    min-width: 280px !important;
  }
}

@media screen and (max-width: 600px) {
  .custom-height-lazy {
    min-height: 343px !important;
    min-width: 280px !important;
  }
}
</style>
