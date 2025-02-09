<template>
  <v-row
    no-gutters
    justify="center"
    align="center"
    class="height-fixed"
  >
    <v-col
      cols="12"
      class="d-flex align-start mb-10"
    >
      <v-img
        src="/images/guillemet-gauche.svg"
        height="27"
        width="27"
      />
      <p class="text-center  text-body-1">
        {{ review.text }}
      </p>
      <v-img
        src="/images/guillemet-droite.svg"
        height="27"
        width="27"
      />
    </v-col>

    <v-col
      cols="12"
    >
      <v-card
        variant="text"
        :href="`/voyages/${review.voyageSlug}`"
        target="_blank"
        class="border-card"
      >
        <v-row
          justify="center"
          no-gutters
          align="center"
        >
          <v-col
            cols="auto"
            class="d-flex align-center ga-4"
          >
            <v-img
              max-height="150px"
              min-width="170px"
              :src="img(review.voyagePhoto, { format: 'webp', quality: 70, width: 400 })"
              rounded="xl"
              cover
              class=" green-border"
            />
            <div>
              <v-card-subtitle class="text-uppercase sub-headline text-dark no-white-space px-0">
                Le voyage de {{ review.author }}:
              </v-card-subtitle>
              <v-card-title class="text-dark text-subtitle-1 font-weight-bold no-white-space px-0">
                <h4>
                  {{ review.voyageTitle }}
                </h4>
              </v-card-title>
            </div>
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
  border: 4px solid rgb(var(--v-theme-primary)) !important;
}
.no-white-space {
  white-space: normal;
}
.border-card{
  border-radius: 2% 2% 0 0 !important;
}
.sub-headline{
  font-size: 0.6rem !important;
}
</style>
