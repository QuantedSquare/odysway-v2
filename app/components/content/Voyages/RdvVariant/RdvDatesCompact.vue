<template>
  <section
    id="dates-container"
    ref="sectionRef"
    class="rdv-dates my-8"
  >
    <div class="d-flex flex-column ga-1 mb-4">
      <h2 class="text-primary rdv-dates-title">
        {{ content.title }}
      </h2>
      <div class="text-body-2 text-primary-light-2">
        {{ content.subtitle }}
      </div>
    </div>

    <template v-if="isLoading">
      <v-skeleton-loader
        v-for="n in 3"
        :key="n"
        type="list-item-two-line"
        class="rounded-lg mb-2"
      />
    </template>

    <div
      v-else-if="upcomingDates.length"
      class="d-flex flex-column ga-2"
    >
      <div
        v-for="date in visibleDates"
        :key="date.id"
        class="dep-card"
      >
        <div class="dep-left">
          <div class="dep-when">
            {{ formatRange(date) }}
          </div>
          <BookingStatus
            class="text-body-2"
            :status="date.status"
            :booked-places="date.booked_seat"
            :max-travellers="date.max_travelers"
            :min-travellers="date.min_travelers"
          />
        </div>
        <div class="dep-bot">
          <div class="d-flex flex-column align-end">
            <span
              v-if="date.originalPrice"
              class="text-caption text-decoration-line-through text-primary-light-2"
            >
              {{ formatEur(date.originalPrice) }}
            </span>
            <span class="dep-price">{{ formatEur(date.price) }}</span>
          </div>
          <v-btn
            variant="outlined"
            color="primary"
            rounded="md"
            height="42"
            class="text-body-2 font-weight-bold"
            :loading="loadingDateId === date.id"
            @click="handleBook(date)"
          >
            {{ content.bookButtonText }}
          </v-btn>
        </div>
      </div>
      <button
        v-if="upcomingDates.length > initialCount"
        type="button"
        class="more-link"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? content.lessText : content.moreText }}
      </button>
    </div>

    <div
      v-else
      class="dep-card flex-column align-start"
    >
      <p class="text-body-2 mb-0">
        {{ content.emptyText }}
      </p>
      <v-btn-secondary
        rounded="md"
        class="text-body-2 font-weight-bold text-decoration-none"
        @click="openRdv('dates_empty')"
      >
        {{ rdvButtonText }}
      </v-btn-secondary>
    </div>
  </section>
</template>

<script setup>
import dayjs from 'dayjs'
import { stegaClean } from '@sanity/client/stega'
import { formatEur } from '~/utils/formatNumber'
import { AB_TEST_NAME } from '~/utils/rdvVariant'
import retrieveExistingBookedDate from '~/utils/retrieveExistingBookedDate.js'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  upcomingDates: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  voyage: {
    type: Object,
    required: true,
  },
  rdvButtonText: {
    type: String,
    default: 'Prendre rendez-vous',
  },
})

const { openRdv } = useRdvBooking()
const { trackAbEvent, trackAddToWishlist, trackCtaClick } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

const isExpanded = ref(false)
const loadingDateId = ref(null)
const initialCount = computed(() => Number(stegaClean(props.content.initialCount)) || 3)
const visibleDates = computed(() => isExpanded.value ? props.upcomingDates : props.upcomingDates.slice(0, initialCount.value))

function formatRange(date) {
  const from = dayjs(date.departure_date)
  const to = dayjs(date.return_date)
  const fromFormat = from.year() === to.year() ? 'DD MMM' : 'DD MMM YYYY'
  return `${from.format(fromFormat)} → ${to.format('DD MMM YYYY')}`
}

async function buildCheckoutLink(date) {
  const base = `type=${date.checkoutType}&step=1&voyage=${date.travel_slug}`
  try {
    // Même logique que DatesPricesItem : reprendre la réservation déjà entamée.
    if (localStorage.getItem(date.id)) {
      const bookedId = await retrieveExistingBookedDate(date.id)
      if (bookedId) return `/checkout?booked_id=${bookedId}&${base}`
    }
  }
  catch (error) {
    console.error('Error retrieving existing booked date:', error)
  }
  return `/checkout?date_id=${date.id}&${base}`
}

async function handleBook(date) {
  loadingDateId.value = date.id
  try {
    trackAbEvent('inscription_start', { ab_test: AB_TEST_NAME, date_id: date.id })
    trackAddToWishlist({
      ...formatVoyageForGtm(props.voyage),
      item_variant: `${dayjs(date.departure_date).format('DD/MM/YY')} - ${dayjs(date.return_date).format('DD/MM/YY')}`,
    }, 1, props.voyage.pricing?.startingPrice, 'ab-rdv-dates-compact')

    const link = await buildCheckoutLink(date)
    trackCtaClick({ ctaId: 'ab-rdv-dates-compact', ctaLabel: stegaClean(props.content.bookButtonText), ctaUrl: link })
    await navigateTo(link)
  }
  finally {
    loadingDateId.value = null
  }
}

// « Module de départs réellement vu » : 50 % visible pendant une seconde.
const sectionRef = ref(null)
let observer = null
let viewTimer = null
onMounted(() => {
  if (!sectionRef.value || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      viewTimer = setTimeout(() => {
        trackAbEvent('departs_view', { ab_test: AB_TEST_NAME })
        observer?.disconnect()
      }, 1000)
    }
    else {
      clearTimeout(viewTimer)
    }
  }, { threshold: 0.5 })
  observer.observe(sectionRef.value)
})
onBeforeUnmount(() => {
  clearTimeout(viewTimer)
  observer?.disconnect()
})
</script>

<style scoped>
.rdv-dates {
  scroll-margin-top: 100px;
}
.rdv-dates-title {
  font-size: 1.6rem;
  line-height: 1.2;
}
.dep-card {
  border: 1px solid #DFE4E3;
  border-radius: 14px;
  background: #fff;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  color: rgb(var(--v-theme-primary));
}
.dep-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dep-when {
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.dep-bot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dep-price {
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.more-link {
  align-self: flex-start;
  padding: 8px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  background: none;
  border: 0;
  cursor: pointer;
}
@media (min-width: 960px) {
  .rdv-dates-title {
    font-size: 1.85rem;
  }
  .dep-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 15px 18px;
  }
  .dep-bot {
    gap: 16px;
  }
}
</style>
