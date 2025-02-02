<template>
  <v-col
    v-if="voyage && voyageSlug"
    cols="12"
    sm="6"
    md="3"
    class="height-voyageCard"
  >
    <v-card
      elevation="0"
    >
      <NuxtLink
        :key="`Voyage ${voyage.slug}`"
        :to="`/voyages/${voyage.slug}`"
        class="text-decoration-none position-relative"
      >
        <v-img
          :src="img(voyage.imgSrc, { format: 'webp', quality: 90, height: 350, width: 400 })"
          :alt="`Image principale du voyage ${voyage.title}`"
          rounded="lg"
          contain
        >
          <client-only>
            <div class="d-flex justify-end mt-4 mr-1 position-absolute top-0 right-0">
              <v-tooltip
                location="bottom"
                text="Test tooltip"
              >
                <template #activator="{ props }">
                  <VBtnVoyage
                    v-bind="props"
                    icon
                  >
                    <v-icon
                      :icon="mdiAccountGroup"
                      color="white"
                    />
                  </VBtnVoyage>
                </template>
              </v-tooltip>
              <v-tooltip
                location="bottom"
                text="Test tooltip"
              >
                <template #activator="{ props }">
                  <VBtnVoyage v-bind="props">
                    <v-img
                      src="/icons/child.svg"
                      alt="Child icon"
                      class="svg-child-icon"
                    />
                  </VBtnVoyage>
                </template>
              </v-tooltip>
            </div>
          </client-only>
        </v-img>
      </NuxtLink>
      <NuxtLink
        :to="`/destinations/${voyage.country}`"
        class="text-decoration-none"
      >
        <v-card-text class="font-weight-bold py-1 px-0 d-flex align-center">
          <span>
            <span class="text-primary hover-underline">{{ voyage.country }} </span><span class="text-secondary"> - {{
              voyage.duration }}</span>
          </span>
        </v-card-text>
      </NuxtLink>
      <NuxtLink
        :to="`/voyages/${voyage.slug}`"
        class="text-decoration-none"
      >
        <v-card-title class="text-body-1 font-weight-bold py-1 px-0 text-textColor">
          {{ voyage.title }}
        </v-card-title>
        <v-card-text class="text-body-2 py-1 px-0">
          <span class="text-grey-darken-2 "> A partir de </span>
          <span class="font-weight-bold text-textColor">{{ voyage.startingPrice }}€</span>
        </v-card-text>
        <div
          v-if="voyage.comments > 0"
          class="d-flex align-center text-textColor"
        >
          <client-only>
            <v-rating
              :key="`rating-${voyage.slug}`"
              half-increments
              :size="24"
              :model-value="voyage.rating"
              readonly
              color="orange-lighten-1"
            />
            <span>({{ voyage.comments }})</span>
          </client-only>
        </div>
      </NuxtLink>
    </v-card>
  </v-col>
</template>

<script setup>
import { mdiAccountGroup } from '@mdi/js'
import { useImage } from '#imports'

const props = defineProps({
  voyageSlug: {
    type: String,
    required: true,
  },
})

const img = useImage()

const { data: voyage } = await useAsyncData(`voyage-${props.voyageSlug}`, () => {
  return queryCollection('voyages').where('slug', '=', props.voyageSlug).first()
})
</script>

<style scoped>
/* @media only screen and (min-width: 400px) {
  .height-voyageCard
  {
    max-height: 120vw !important;
  }
}
@media only screen and (min-width: 600px) {
  .height-voyageCard
  {
    height: 60vw !important;
  }
}
@media only screen and (min-width: 960px) {
  .height-voyageCard{
    height: 40vw !important;
  }
}
@media only screen and (min-width: 1024px) {
  .height-voyageCard{
    height: 35vw !important;
  }
}
@media only screen and (min-width: 1200px) {
  .height-voyageCard{
    height: 30vw !important;
  }
}
@media only screen and (min-width: 1400px) {
  .height-voyageCard{
    height: 30vw !important;
  }
} */
.hover-underline:hover{
  text-decoration: underline;
}
.svg-child-icon {
    width: 1rem;
    height: 1rem;
}
</style>
