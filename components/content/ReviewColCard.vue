<template>
  <v-row
    no-gutters
    justify="center"
  >
    <v-col
      cols="auto"
    >
      <v-img
        src="/images/guillemet-gauche.svg"
        height="27"
        width="27"
      />
    </v-col>
    <v-col
      cols="10"
      xl="8"
    >
      <p class="text-center mb-4">
        {{ review.text }}
      </p>
    </v-col>
    <v-col cols="auto">
      <v-img
        src="/images/guillemet-droite.svg"
        height="27"
        width="27"
      />
    </v-col>
    <v-col
      cols="12"
      sm="8"
      xl="6"
    >
      <v-card
        variant="text"
        :href="`/voyages/${review.voyageSlug}`"
        target="_blank"
        rounded="xl"
        class="mt-4 pa-2"
      >
        <v-row justify="center">
          <v-col cols="4">
            <v-img
              min-height="150px"
              :src="img(review.voyagePhoto, { format: 'webp', quality: 70, width: 400 })"
              rounded="xl"
              cover
              class="border-xl green-border"
            />
          </v-col>
          <v-col cols="8">
            <v-card-subtitle class="text-textColor text-uppercase text-caption no-white-space px-0">
              Lire le récit de voyage de {{ review.author }}:
            </v-card-subtitle>
            <v-card-title class="text-textColor text-subtitle-1 font-weight-bold no-white-space px-0">
              <h4>
                {{ review.voyageTitle }}
              </h4>
            </v-card-title>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  review: Object,
})

const img = useImage()
</script>

<style scoped>
.green-border{
  border: 4px solid #2E8B57 !important;
}
.no-white-space {
  white-space: normal;
}
</style>
