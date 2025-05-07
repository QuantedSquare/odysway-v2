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
  </v-container>
</template>

<script setup>
import { useGoTo, useDisplay } from 'vuetify'
import dayjs from 'dayjs'

const goTo = useGoTo()
const isExpanded = ref(false)
const { width } = useDisplay()

const dates = inject('dates')
const { dateSections } = inject('page')

watch(isExpanded, (newValue) => {
  console.log('isExpanded', newValue)
  if (!newValue) {
    goTo(`#dates-container`, {
      offset: -200,
    })
  }
})

const limitedDatesList = computed(() => {
  const sortedByDates = dates
    .filter(date => dayjs(date.departureDate).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.departureDate).diff(dayjs(b.departureDate)))
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
