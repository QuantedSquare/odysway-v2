<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Voyages personnalisés</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const loading = ref(false)
const travels = ref([])

const fetchTravels = async () => {
  loading.value = true
  const res = await fetch('/api/v1/booking/travels')
  const data = await res.json()
  travels.value = data.filter(travel => travel.is_custom_travel)
  console.log('travels', travels.value)
  loading.value = false
}
onMounted(fetchTravels)
</script>
