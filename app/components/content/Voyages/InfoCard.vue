<template>
  <v-card>
    <v-card-text>
      <v-container
        fluid
        class="pa-6"
      >
        <v-row c>
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

        <v-row
          v-if="displayedDates.length > 0 && !isLoading"
          justify-md="center"
          class="text-center"
        >
          <v-col
            cols="12"
          >
            <v-btn
              height="60"
              block
              rounded="md"
              variant="outlined"
              @click="handleAllDeparturesClick()"
            >
              <span class="text-body-2 font-weight-bold text-decoration-none">
                Voir les départs disponibles
                <v-icon>
                  {{ mdiArrowDown }}
                </v-icon>
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
              Pas encore de dates disponibles
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
              :click="handleAskDevis()"
            >
              <span class="text-body-2 font-weight-bold text-decoration-none">
                Demander un devis
              </span>
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-divider />
          <v-col
            cols="12"
            class="d-flex align-start flex-column ga-1"
          >
            <div
              v-for="item, index in tempListPlaceholder"
              :key="index"
              class="d-flex align-center ga-2"
            >
              <v-icon color="secondary">
                {{ item.icon }}
              </v-icon>
              {{ item.text }}
            </div>
          </v-col>
        </v-row>
        <template v-if="displayedDates.length === 0 && voyage.availabilityTypes?.includes('groupe')">
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
            <NewsletterContainer
              is-on-voyage
              :voyage="voyage"
            />
          </v-row>
        </template>
      </v-container>
    </v-card-text>
  </v-card>

  <ContactUsCard
    variant="card"
    :avatars="stickyBlock.ctaCall.avatars"
    :rdv-link="`/rdv-projet-voyage?travelTitle=${voyage.title}`"
    :show-privatisation="voyage.availabilityTypes?.includes('groupe')"
    :privatisation-text="stickyBlock.privatisationText"
    :privatisation-link="`/devis?slug=${voyage.slug.current}`"
    @privatisation-click="handleIndivClick"
  />
</template>

<script setup>
import { mdiCreditCard, mdiSyncCircle, mdiLock, mdiCheckCircleOutline, mdiArrowDown } from '@mdi/js'
import { useGoTo } from 'vuetify'
import dayjs from 'dayjs'

const goTo = useGoTo()
const { dates, isLoading } = useDates()
const { trackRdvClick, trackCtaClick } = useGtmTracking()

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

    return sortedByDates.slice(0, 3).map((date) => {
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
function handleAllDeparturesClick() {
  trackCtaClick({
    ctaId: 'button-see-all-dates-side-card-page-voyage',
    ctaLabel: stickyBlock.dateButtonText,
    ctaUrl: '#dates-container',
  })
  goTo('#dates-container', { offset: -200 })
}

function handleIndivClick() {
  trackRdvClick('voyage-info-card-indiv')
  trackCtaClick({
    ctaId: 'button-indiv-funnel-side-card-page-voyage',
    ctaLabel: stickyBlock.privatisationText,
    ctaUrl: `/devis?slug=${voyage.slug.current}`,
  })
}
function handleAskDevis() {
  trackCtaClick({
    ctaId: 'button-ask-devis-side-card-page-voyage',
    ctaLabel: 'Demander un devis',
    ctaUrl: `/devis?slug=${typeof voyage.slug === 'object' ? voyage.slug.current : voyage.slug}`,
  })
}
const tempListPlaceholder = [{
  text: `Annulation gratuite jusqu'à J-60`,
  icon: mdiSyncCircle,
}, {
  text: `CB, virement, chèques vacances`,
  icon: mdiCreditCard,
}, {
  text: `Acompte 30% · Solde avant départ`,
  icon: mdiLock,
}]
</script>

<style scoped>
.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar-item {
  border: 2px solid white;
}

.avatar-item + .avatar-item {
  margin-left: -8px;
}

.avatar-center {
  z-index: 2;
  margin-left: -8px;
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
