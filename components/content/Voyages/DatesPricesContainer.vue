<template>
  <v-container
    v-if="dates"
    id="dates-container"
    :fluid="width < 1600"
  >
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        class=" font-weight-black text-h4 my-4"
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
          <DatesPricesItem :date="Object.assign(date, { index })" />
        </v-col>
      </TransitionGroup>
    </v-row>
    <v-row
      v-if="dates.length > 4"
      justify="center"
      align="center"
      class="flex-column"
    >
      <span>Voir {{ isExpanded ? 'moins' : 'plus' }}</span>
      <BouncingBtn v-model="isExpanded" />
    </v-row>
    <v-row v-if="indivAvailable">
      <v-col class="bg-grey-light-3 rounded-lg mx-3 d-flex flex-column align-center justify-center ga-4 my-5 py-10">
        <div class="text-h4 font-weight-bold text-primary">
          {{ indivSection.title }}
        </div>
        <v-btn
          height="54"
          :to="`/calendly?travelTitle=${route.params.voyageSlug}`"
        >
          <div class="text-h6">
            {{ indivSection.textButton }}
          </div>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useGoTo, useDisplay } from 'vuetify'
import dayjs from 'dayjs'

const goTo = useGoTo()
const { dates } = useDates()
const isExpanded = ref(false)
const { width } = useDisplay()
const route = useRoute()

const { dateSections, indivAvailable, indivSection } = defineProps({
  dateSections: {
    type: Object,
    required: true,
  },
  indivAvailable: {
    type: Boolean,
    required: true,
  },
  indivSection: {
    type: Object,
    required: true,
  },
})

watch(isExpanded, (newValue) => {
  console.log('isExpanded', newValue)
  if (!newValue) {
    goTo(`#dates-container`, {
      offset: -200,
    })
  }
})

const limitedDatesList = computed(() => {
  const sortedByDates = dates.value
    .filter(date => dayjs(date.departure_date).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.departure_date).diff(dayjs(b.departure_date)))
  return sortedByDates.slice(0, isExpanded.value ? sortedByDates.length : 4)
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
