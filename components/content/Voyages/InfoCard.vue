<template>
  <v-card
    v-if="deal"
  >
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col
            cols="5"
            class="d-flex flex-column align-start"
          >
            <span class="text-body-2 text-grey">
              À partir de
            </span>
            <span class="text-h2 font-weight-bold text-primary">
              {{ deal.startingPrice }}€<span class="text-body-2 font-weight-bold">/pers</span>
            </span>
          </v-col>
          <v-spacer class="d-block" />
          <v-col
            cols="5"
            class="d-flex align-start justify-end"
          >
            <ClientOnly>
              <v-btn
                size="small"
                color="white"
                rounded="pill"
                height="46"
                class="btn-shadow"
              >
                <div class="d-flex justify-center align-center mx-1">
                  <v-icon
                    :icon="mdiStar"
                    color="yellow-rating"
                    size="20"
                  />
                  <span class="text-body-2 font-weight-bold text-primary">
                    {{ `${deal.rating.toString().replace('.', ',')}/5` }}
                  </span>
                </div>
              </v-btn>
            </ClientOnly>
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
              Dates disponibles
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
              height="52"
              color="grey-light-3"
              rounded="md"
              block
              :to="date.link"
              class="w-100 block-btn-without-padding"
            >
              <div class="d-inline-flex align-center justify-space-between w-100">
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
                  <span class="text-caption font-weight-bold  text-white ">
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
                Voir tous les départs +
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
              @click="goTo('#dates-container', { offset: -200 })"
            >
              <div class="d-flex align-center ga-2">
                <v-avatar
                  image="/images/photo Romain.webp"
                  color="white"
                />
                <span class="text-body-2 font-weight-bold text-decoration-none">
                  Contacter un expert en voyage
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
            <div class="d-flex align-center ga-2">
              <v-icon>
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span>
                <strong>15 jours</strong> pour changer d'avis
              </span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon>
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span>
                Paiement en <strong>trois fois</strong> (Alma)
              </span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon>
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span>
                Paiement par <strong>chèque vacances</strong> (ANCV)
              </span>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <v-row
    v-if="deal"
    class="mt-4"
  >
    <v-col
      cols="12"
    >
      <NuxtLink
        width="100%"
        class="text-primary text-break d-flex align-center justify-center ga-3"
        :to="`/calendly?travelTitle=${deal.slug}`"
      >

        <v-icon
          size="small"
          color="x-small"
          class="bg-primary rounded-lg pa-1"
        >
          {{ mdiArrowRight }}
        </v-icon>
        <span class="text-left font-weight-bold text-primary">
          Demander une privatisation de ce voyage
        </span>
      </NuxtLink>
    </v-col>
  </v-row>
  <v-skeleton-loader
    v-else
    type="card"
  />
</template>

<script setup>
import { mdiArrowRight, mdiStar, mdiCheckCircleOutline } from '@mdi/js'
import { useGoTo } from 'vuetify'
import dayjs from 'dayjs'

const goTo = useGoTo()
const deal = useState('deal', () => null)
const route = useRoute()
const displayedDates = ref([])
deal.value = await queryCollection('deals').where('slug', '=', route.params.voyageSlug).first()
console.log('deal in infocard', deal.value)

const getStatus = (date) => {
  if (date.bookedPlaces < 2) {
    return {
      status: 'pending',
      text: `Bientôt confirmé`,
      color: 'yellow',
    }
  }
  else {
    if (date.bookedPlaces === date.maxTravellers) {
      return {
        status: 'full',
        text: 'Complet',
        color: 'blue',
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

if (deal.value?.dates.length > 0) {
  const sortedByDates = deal.value.dates
    .filter(date => dayjs(date.departureDate).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.departureDate).diff(dayjs(b.departureDate)))
  displayedDates.value = sortedByDates.slice(0, 3).map((date) => {
    const in30days = dayjs().add(30, 'day')
    const checkoutType = dayjs(date.departureDate).isBefore(in30days) ? 'full' : 'deposit'
    return {
      departureDate: date.departureDate,
      returnDate: date.returnDate,
      status: getStatus(date),
      link: `/checkout?slug=${deal.value.slug}&departure_date=${dayjs(date.departureDate).format('YYYY-MM-DD')}&return_date=${dayjs(date.returnDate).format('YYYY-MM-DD')}&type=${checkoutType}`,
    }
  })
}
</script>

<style scoped>
.btn-shadow {
  box-shadow: 0px 1px 6px 0px rgba(34, 34, 35, 0.09)!important;
}
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
