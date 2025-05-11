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
    v-for="review, index in reviews"
    v-else-if="status === 'success' && reviews"
    :key="review.id + index"
    cols="12"
    sm="6"
    md="4"
  >
    <v-lazy
      :min-height="200"
      :options="{ threshold: 0.3 }"
      transition="fade-transition"
    >
      <v-sheet elevation="0">
        <v-card-item>
          <v-card-title class="d-flex align-center ga-2">
            <AvatarImg
              :avatar-img="review.photo"
              avatar-size="62"
              :name="review.author"
            />
            <div class="d-flex flex-column">
              <span class="text-h5"> {{ review.author }}</span>
              <NuxtLink
                v-if="review.voyageTitle && review.voyageSlug"
                :to="`/voyages/${review.voyageSlug}`"
                class="text-body-2 text-primary"
              >
                <span class="text-truncate">
                  {{ review.voyageTitle }}
                </span>
              </NuxtLink>
            </div>
          </v-card-title>
          <v-card-subtitle class="mt-4 ">
            <v-icon
              v-for="i in 5"
              :key="i"
              :icon="mdiStar"
              :color="i <= review.rating ? 'secondary' : 'grey'"
              size="20"
            />
          </v-card-subtitle>
        </v-card-item>
        <v-card-text
          class="text-h5 font-weight-bold text-primary max-lines overflow-y-auto mb-10 mb-md-0"
          style="max-height: 250px;"
        >
          "{{ review.text }}"
        </v-card-text>
      </v-sheet>
    </v-lazy>
  </v-col>
</template>

<script setup>
import { mdiStar } from '@mdi/js'

const { data: reviews, status } = useAsyncData('reviews-home', () => {
  return queryCollection('reviews').where('isOnHome', '=', true).limit(10).all()
})
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
.max-lines{
 line-clamp: 3!important;
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
