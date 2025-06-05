<template>
  <v-col
    v-if="loading && !voyage"
    cols="10"
    sm="6"
    md="4"
    class="pr-1 pr-md-3"
  >
    <v-skeleton-loader
      class="mx-auto"
      type="card"
      height="250"
    />
  </v-col>
  <v-col
    v-else-if="voyage && !isThematique && !isExperience"
    cols="10"
    sm="5"
    lg="4"
    class="pr-1 pr-md-3"
  >
    <!-- <v-lazy
      :min-height="228"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    > -->
    <VoyageCard :voyage="voyage" />
    <!-- </v-lazy> -->
  </v-col>
  <v-col
    v-else-if="voyage && (!isThematique || !isExperience)"
    cols="12"
    class="px-1"
  >
    <!-- <v-lazy
      :min-height="228"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    > -->
    <VoyageCard :voyage="voyage" />
    <!-- </v-lazy> -->
  </v-col>
</template>

<script setup>
// import { useDisplay } from 'vuetify'
// import { useImage } from '#imports'

// const { width } = useDisplay()
const loading = ref(false)
const voyage = ref(null)
const props = defineProps({
  voyageSlug: {
    type: String,
    // required: true,
  },
  voyageProps: {
    type: Object,
  },
  isThematique: {
    type: Boolean,
    default: false,
  },
  isExperience: {
    type: Boolean,
    default: false,
  },
})
// const img = useImage()

const loadVoyage = async () => {
  loading.value = true
  if (props.voyageProps) {
    voyage.value = { ...props.voyageProps }
  }
  else {
    voyage.value = await queryCollection('voyages').where('slug', '=', props.voyageSlug).first()
  }
  loading.value = false
}

await loadVoyage()
</script>
