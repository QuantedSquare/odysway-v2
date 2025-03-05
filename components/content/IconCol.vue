<template>
  <v-col
    cols="6"
    md="4"
    lg="auto"
    class="d-flex align-center"
  >
    <v-tooltip
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn-secondary
          v-bind="props"
          icon
          size="x-small"
          class="mr-2"
        >
          <v-icon
            :icon="icon"
            size="x-large"
          />
        </v-btn-secondary>
      </template>
      <span>
        <slot
          name="tooltip"
          mdc-unwrap="p"
        />
      </span>
    </v-tooltip>

    <span class="text-caption">
      <slot
        name="text"
        mdc-unwrap="p"
      />
    </span>
  </v-col>
</template>

<script setup>
import { mdiCalendar, mdiWhiteBalanceSunny, mdiTent, mdiAccountGroup, mdiTeddyBear, mdiAirplane } from '@mdi/js'

const props = defineProps({
  iconName: {
    type: String,
    default: 'mdiCalendar',
  },
})

const icons = { mdiCalendar, mdiWhiteBalanceSunny, mdiTent, mdiAccountGroup, mdiTeddyBear, mdiAirplane }

const icon = computed (() => {
  return icons[props.iconName]
})
</script>
