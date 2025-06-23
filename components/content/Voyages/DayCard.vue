<template>
  <v-card
    variant="text"
    class="shadow-none"
  >
    <v-row v-if="isHydrated">
      <v-col
        cols="12"
        sm="5"
        lg="auto"
      >
        <v-img
          rounded="lg"
          :src="img(photo, { format: 'webp', quality: 70, width: 640 })"
          cover
          :width="xs ? width : 298"
          height="214"
        />
      </v-col>
      <v-col
        cols="12"
        sm="7"
      >
        <v-card-title class="no-white-space">
          <div class="d-flex align-center ga-3">
            <span class="d-flex align-center bg-secondary rounded-lg text-subtitle-2 font-weight-bold text-white px-2 py-1 text-no-wrap">
              {{ badgeText }}
            </span>

            <span class="text-primary text-h6 font-weight-bold ">{{ title }}</span>
          </div>
        </v-card-title>

        <v-card-text class="text-primary text-subtitle-1 font-weight-regular pt-2 line-height">
          <ExpandableText
            :clamp-lines="3"
            :line-height="30"
          >
            <span v-if="description">{{ description }}</span>
            <div class="d-flex flex-column px-8 mt-4">
              <div v-if="denivellation">
                <span class="font-weight-bold">Dénivelé:&nbsp;</span>
                <span>{{ denivellation }}</span>
              </div>
              <div v-if="road">
                <span class="font-weight-bold">Temps de trajet:&nbsp;</span>
                <span>{{ road }}</span>
              </div>
              <div v-if="night">
                <span class="font-weight-bold">Nuit:&nbsp;</span>
                <span>{{ night }}</span>
              </div>
            </div>
          </ExpandableText>
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { useDisplay } from 'vuetify'

defineProps({
  photo: {
    type: String,
    required: true,
  },
  badgeText: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  denivellation: {
    type: String,
    default: '',
  },
  road: {
    type: String,
    default: '',
  },
  night: {
    type: String,
    default: '',
  },
})

const img = useImage()
const { xs, width } = useDisplay()

const isHydrated = ref(false)
onMounted(() => {
  isHydrated.value = true
})
</script>

<style scoped>
.shadow-none{
  box-shadow: none !important;
}
.line-height{
  line-height: 30px !important;
}
</style>
