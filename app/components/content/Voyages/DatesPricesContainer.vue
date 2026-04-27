<template>
  <v-container
    v-if="dates"
    id="dates-container"
    fluid
    class="px-0"
  >
    <v-divider class="my-md-6" />
    <v-row
      v-if="isGroupeAvailable"
      justify="center"
      align="center"
      class="px-2 px-md-0"
    >
      <v-col
        class="font-weight-black text-h4 mt-4 my-md-4 "
      >
        {{ dateSections.title }}
      </v-col>
    </v-row>

    <v-row class="relative">
      <TransitionGroup
        name="list"
      >
        <v-col
          v-for="(date, index) in limitedDatesList"
          :key="index"
          cols="12"
        >
          <DatesPricesItem
            :date="Object.assign(date, { index, lastMinutePrice, earlyBirdPrice })"
            :voyage="props.voyage"
          />
        </v-col>
      </TransitionGroup>
    </v-row>
    <v-row
      v-if="sortedByDates.length > 3"
      justify="center"
      align="center"
      class="flex-column"
    >
      <span class="text-h5 text-md-h4 font-weight-bold mt-4">Voir {{ isExpanded ? 'moins' : 'plus' }} de dates</span>
      <BouncingBtn v-model="isExpanded" />
    </v-row>
    <template v-else-if="sortedByDates.length === 0 && isGroupeAvailable">
      <v-row
        justify="center"
        align="center"
        class="my-8"
      >
        <v-col
          cols="12"
        >
          <v-card
            elevation="0"
            class="pa-8 pa-md-12"
            color="soft-blush"
          >
            <div class="d-flex flex-column align-center text-center ga-6">
              <!-- Status indicator with icon -->
              <div class="d-flex align-center ga-3">
                <CustomBadge :color="'red'" />
                <h3 class="text-h5 text-md-h4 font-weight-bold text-secondary">
                  Pas encore de dates disponibles
                  <!-- #TODO: add the key in the page schema -->
                </h3>
              </div>

              <!-- Descriptive text -->
              <p
                class="text-body-2 text-primary-light-2 mx-auto"
                style="max-width: 500px;"
              >
                Inscrivez-vous à notre alerte pour être informé dès que de nouvelles dates seront disponibles pour ce voyage.
              </p>

              <!-- Newsletter form with better spacing -->
              <div
                class="w-100"
                style="max-width: 600px;"
              >
                <NewsletterContainer
                  is-on-voyage
                  :voyage="props.voyage"
                />
              </div>

              <!-- Confirmation message with icon -->
              <div class="d-flex align-center ga-2 text-primary">
                <v-icon
                  size="20"
                  color="green"
                >
                  {{ mdiCheckCircleOutline }}
                </v-icon>
                <span class="text-body-2 font-weight-medium">
                  <!-- #TODO: add the key in the page -->
                  Vous serez informé dès l'ouverture des réservations
                </span>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <v-row
      v-if="sortedByDates.length > 0"
      class="d-none d-md-flex  ml-0 justify-center ga-4 align-center mb-8"
    >
      <span>
        🔄
        Remboursement intégral jusqu'à J-60
      </span>
      <v-divider
        class="d-none d-md-flex"
        vertical
        color="primary"
      />
      <span>
        💳
        CB, virement, chèques vacances · 2 ou 3 fois
      </span>
      <v-divider
        class="d-none d-md-flex"
        vertical
        color="primary"
      />
      <span>
        👩‍✈️
        Conseillère dédiée avant, pendant & après
      </span>
    </v-row>
    <v-row v-if="isPrivatisationAvailable && !isGroupeAvailable">
      <v-col class="bg-grey-light-3 rounded-lg mx-3 d-flex flex-column align-center justify-center ga-6 my-5 py-10">
        <div class="text-h4 font-weight-bold text-primary text-center">
          {{ indivSection.titleOnlyPrivatisationAvailable }}
        </div>
        <v-btn
          height="54"
          :to="`/devis?slug=${route.params.voyageSlug}`"
        >
          <div class="text-h6 font-weight-bold">
            {{ indivSection.textButtonDevis }}
          </div>
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col
        cols="11"
        md="8"
        lg="12"
      >
        <ContactUsCard
          variant="section"
          :avatars="contactSection?.teamMembers"
          :rdv-link="`/rdv-projet-voyage?travelTitle=${props.voyage?.title}`"
          :show-privatisation="props.voyage?.availabilityTypes?.includes('groupe')"
          :privatisation-text="indivSection?.privatisationText"
          :privatisation-link="`/devis?slug=${props.voyage?.slug?.current}`"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="sortedByDates.length > 0"
      class="d-flex d-md-none justify-start ml-1 ga-2 align-center mt-8 mb-0"
    >
      <span>
        🔄
        Remboursement intégral jusqu'à J-60
      </span>
      <v-divider
        class="d-none d-md-flex"
        vertical
        color="primary"
      />
      <span>
        💳
        CB, virement, chèques vacances · 2 ou 3 fois
      </span>
      <v-divider
        class="d-none d-md-flex"
        vertical
        color="primary"
      />
      <span>
        👩‍✈️
        Conseillère dédiée avant, pendant & après
      </span>
    </v-row>
  </v-container>
</template>

<script setup>
import { useGoTo } from 'vuetify'
import { mdiCheckCircleOutline } from '@mdi/js'
import dayjs from 'dayjs'

const goTo = useGoTo()
const { dates } = useDates()
const isExpanded = ref(false)
const route = useRoute()

const props = defineProps({
  dateSections: {
    type: Object,
    required: true,
  },
  contactSection: {
    type: Object,
    default: null,
  },
  isGroupeAvailable: {
    type: Boolean,
    default: true,
  },
  isPrivatisationAvailable: {
    type: Boolean,
    default: false,
  },
  lastMinutePrice: {
    type: Number,
    default: 0,
  },
  earlyBirdPrice: {
    type: Number,
    default: 0,
  },
  closingDays: {
    type: Number,
    default: 30,
  },
  voyage: {
    type: Object,
    default: null,
  },
  indivSection: {
    type: Object,
    default: null,
  },
})

const { dateSections, indivSection, isGroupeAvailable, isPrivatisationAvailable, closingDays } = props

watch(isExpanded, (newValue) => {
  if (!newValue) {
    goTo(`#dates-container`, {
      offset: -200,
    })
  }
})

const sortedByDates = computed(() => {
  return dates.value
    .filter(date => dayjs(date.departure_date).isAfter(dayjs().add(closingDays, 'day')))
    .sort((a, b) => dayjs(a.departure_date).diff(dayjs(b.departure_date)))
})

const limitedDatesList = computed(() => {
  // const sortedByDates = dates.value
  //   .filter(date => dayjs(date.departure_date).isAfter(dayjs()))
  //   .sort((a, b) => dayjs(a.departure_date).diff(dayjs(b.departure_date)))
  // console.log('sortedByDates', sortedByDates)
  return sortedByDates.value.slice(0, isExpanded.value ? sortedByDates.value.length : 3)
})
</script>

<style scoped>
.relative {
  position: relative;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to{
  opacity: 0;
  transform: translateY(-30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
