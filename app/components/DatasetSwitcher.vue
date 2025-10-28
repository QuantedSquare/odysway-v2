<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :color="dataset === 'production' ? 'success' : 'warning'"
        variant="outlined"
        size="small"
      >
        <v-icon start>
          {{ mdiDatabase }}
        </v-icon>
        {{ dataset }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="option in datasetOptions"
        :key="option.value"
        :active="dataset === option.value"
        @click="handleDatasetChange(option.value)"
      >
        <v-list-item-title>
          <v-icon
            :color="option.color"
            start
          >
            {{ mdiCircle }}
          </v-icon>
          {{ option.label }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { mdiCircle, mdiDatabase } from '@mdi/js'

const { dataset, setDataset } = useSanityDataset()

const datasetOptions = [
  {
    label: 'Production',
    value: 'production',
    color: 'success',
  },
  {
    label: 'Preproduction',
    value: 'preprod',
    color: 'warning',
  },
  {
    label: 'Development',
    value: 'development',
    color: 'info',
  },
]

const handleDatasetChange = (newDataset) => {
  setDataset(newDataset)
  // Optionally, you can trigger a page refresh or refetch data
  // window.location.reload() // Full page reload
  // Or use navigateTo to refresh the current page
  // navigateTo(useRoute().fullPath, { replace: true })
}
</script>
