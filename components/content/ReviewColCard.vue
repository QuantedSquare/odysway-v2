<template>
  <v-col
    v-if="status === 'pending'"
    cols="12"
    sm="6"
    md="4"
  >
    <v-skeleton-loader
      class="mx-auto"
      type="card"
      height="250"
    />
  </v-col>
  <v-col
    v-else-if="status === 'success' && review"
    cols="12"
    sm="6"
    md="4"
  >
    <v-sheet elevation="0">
      <v-card-item>
        <v-card-title class="d-flex align-center ga-2">
          <AvatarImg
            :avatar-img="review.photo"
            avatar-size="62"
          />
          <div class="d-flex flex-column">
            <span class="text-h5"> {{ review.author }}</span>
            <span class="text-h6 text-grey text-truncate"> {{ review.voyageTitle }}</span>
          </div>
        </v-card-title>
        <v-card-subtitle class="mt-4 ">
          <v-icon
            v-for="i in 5"
            :key="i"
            :icon="mdiStar"
            color="secondary"
            size="20"
          />
        </v-card-subtitle>
      </v-card-item>
      <v-card-text class="text-h5 font-weight-bold text-primary">
        "{{ review.text }}
      </v-card-text>
    </v-sheet>
  </v-col>
</template>

<script setup>
import { mdiStar } from '@mdi/js'
import { useImage } from '#imports'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})
const { data: review, status } = useAsyncData('reviews' + props.slug, () => {
  return queryCollection('reviews').where('slug', '=', props.slug).first()
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
