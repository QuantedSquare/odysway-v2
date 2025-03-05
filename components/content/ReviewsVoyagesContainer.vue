<template>
  <div class="bg-img mt-16">
    <v-container
      class="relative"
    >
      <v-row class="bg-primary row-height rounded-xl">
        <v-col
          cols="12"
          md="4"
          class="relative rounded-xl d-flex flex-column justify-center align-center"
        >
          <v-row
            class="d-flex flex-column align-center text-center text-md-start align-md-start px-5 ga-4 mt-16"
          >
            <div class="coma-absolute bg-primary-light rounded-circle pa-6 ">
              <v-img
                src="/images/guillemet-gauche.svg"
                height="100"
                width="100"
              />
            </div>

            <h2 class="text-white text-h4 text-md-h3 text-shadow mt-6">
              Les mots de nos voyageurs
            </h2>
            <div class=" text-body-1">
              Ce que les personnes ayant voyagé avec Odysway disent de nous
            </div>
            <NuxtLink
              to="https://fr.trustpilot.com/review/odysway.com"
              target="blank"
            >
              <span class="text-white">
                Lire d'autres avis
              </span>
              <v-btn
                :icon="mdiChevronRight"
              />
            </NuxtLink>
          </v-row>
        </v-col>
        <v-col
          cols="12"
          md="8"
          class="d-block d-md-flex align-end pb-10"
        >
          <div class="card-container h-100">
            <v-slide-group
              v-model="slideGroup"
              class=" mx-0 px-0 pa-md-4 d-block"
              show-arrows
            >
              <template #prev="{ prev }">
                <Teleport
                  to="#prev-btn"
                  defer
                >
                  <v-btn
                    :icon="mdiChevronLeft"
                    class="bg-white"
                    size="small"
                    @click="prev"
                  />
                </Teleport>
              </template>
              <template #next="{ next }">
                <Teleport
                  to="#next-btn"
                  defer
                >
                  <v-btn
                    :icon="mdiChevronRight"
                    class="bg-white mb-4"
                    size="small"
                    @click="next"
                  />
                </Teleport>
              </template>
              <v-slide-group-item
                v-for="review, index in reviewsList"
                :key="index"
              >
                <v-card
                  class="mx-4 card-width rounded-xl d-flex flex-column "
                  :to="`/voyages/${review.voyageSlug}`"
                  elevation="0"
                >
                  <v-img
                    max-height="250"
                    height="250"
                    class="hover-scale"
                    :src="review.voyagePhoto"
                    cover
                  />

                  <v-card-title>
                    <h3 class="text-body-1 text-wrap">
                      {{ review.voyageTitle }}
                    </h3>
                  </v-card-title>
                  <v-card-text class="text-body-2 text-wrap ">
                    {{ review.text }}
                  </v-card-text>
                  <v-spacer />
                  <v-card-actions class="text-body-1 text-wrap ">
                    <v-avatar>
                      <v-img
                        :src="formatImage(review.photo)"
                        :alt="`Photo de ${review.author}`"
                        cover
                      />
                      <!-- <span v-else>{{ getInitial(item.author) }}</span> -->
                    </v-avatar>
                    <span>{{ review.author }}</span>
                    <ClientOnly>
                      <v-rating
                        :model-value="4.5"
                        color="orange-lighten-1"
                        density="compact"
                        size="small"
                        half-increments
                        readonly
                      />
                    </ClientOnly>
                  </v-card-actions>
                </v-card>
              </v-slide-group-item>
            </v-slide-group>
          </div>
          <v-row class="d-flex justify-center ga-4">
            <div id="prev-btn" />
            <div id="next-btn" />
          </v-row>
        </v-col>
      </v-row>
    <!-- <v-row
      justify="center"
      class="row-height"
    >
      <v-col
        cols="12"
        sm="8"
        class="min-height-container d-flex flex-column justify-center align-center"
      >
        <v-window v-model="currentReview">
          <v-window-item
            v-for="review, index in reviewsList"
            :key="index"
          >
            <ReviewColCard
              :review="review"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        class="d-flex flex-column align-center"
      >
        <ReviewerAvatars
          v-model="currentReview"
          :items="reviewsList"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <NuxtLink
          to="https://fr.trustpilot.com/review/odysway.com"
          target="blank"
        >
          <v-btn-secondary>
            Lire d'autres avis voyageurs
          </v-btn-secondary>
        </NuxtLink>
      </v-col>
    </v-row> -->
    </v-container>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { mdiChevronRight, mdiChevronLeft } from '@mdi/js'

const img = useImage()
const slideGroup = ref(1)
const currentReview = ref(0)
const { smAndUp } = useDisplay()

const { data: reviews } = await useAsyncData('reviews', () => {
  return queryCollection('reviews').all()
})

const onHomeReviews = computed(() => {
  return reviews.value?.filter(r => r.isOnHome)
})

const reviewsList = computed(() => {
  return smAndUp.value ? onHomeReviews.value : onHomeReviews.value.slice(0, 3)
})

// Helper functions
const formatImage = photo => img(photo, {
  format: 'webp',
  quality: 70,
  height: 100,
  width: 320,
})

const getInitial = name => name[0]
</script>

<style scoped>
.card-width{
  width: 450px;
  /* height:550px; */
}
.coma-absolute{
  position: absolute;
  top: -12%;
  left:25%;
}

.card-container{
  position: absolute;
  height: 100%;
  top:-20%;
  width:100%;
}
.row-height{
  height: 550px;
  position: relative;
}
/* .min-height-container{
  min-height: 40vh;
} */

.hover-scale:hover .blur-overlay {
  height: 100%;
}
.hover-scale:hover{
  transform: scale(1.02);
  cursor:pointer;
  transition: transform 0.2s ease-in-out;
}
.hover-scale{
  transform:scale(1);
  transition: transform 0.2s ease-in-out;
}
.relative{
  position: relative;
}

@media screen and (max-width: 1024px) {
  .row-height{
    height: 100%;
  }
  .card-container{
    position:relative;
    top:0;
  }
  .card-width{
    width: 350px;
  }
  .coma-absolute{
    top:-25%;
    left:33vw;
  }

}
</style>
