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
    v-else-if="status === 'success' && voyage"
    cols="12"
    sm="6"
    md="4"
  >
    <v-card elevation="0">
      <NuxtLink
        :to="`/voyages/${voyage.slug}`"
        class="text-decoration-none position-relative text-white"
      >
        <v-img
          :src="img(voyage.imgSrc1.src, { format: 'webp', quality: 90, height: 228, width: 640 })"
          :alt="voyage.imgSrc1.alt"
          height="228px"
          class="hover-scale"
          cover
        >
          <div
            v-if="voyage.comments > 0"
            class="d-flex justify-end mt-4 mr-1 position-absolute top-0 right-0"
          >
            <v-btn
              size="small"
              color="white"
              rounded="pill"
            >

              <v-icon
                :icon="mdiStar"
                color="secondary-light"
              />
              {{ voyage.rating }}/5
            </v-btn>
          </div>
          <div
            v-else
            class="d-flex justify-center mt-4 mr-1 position-absolute top-0 right-0"
          >
            <v-btn
              size="small"
              color="primary"
              rounded="pill"
            >
              Nouveau
            </v-btn>
          </div>
        </v-img>
      </NuxtLink>

      <!--  BOTTOM TEXT -->
      <div>
        <NuxtLink
          :to="`/voyages/${voyage.slug}`"
          class="text-decoration-none"
        >
          <v-card-text class="py-1 px-0">
            <v-container>
              <v-row>
                <v-col>
                  <div class="text-primary text-test font-weight-bold py-1 px-0 no-white-space">
                    {{ voyage.title }}
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <div class="text-grey-lighten-1 font-weight-medium"> Type </div>
                  <div class="font-weight-bold text-primary">{{ voyage.groupeAvailable ? 'Groupe' : 'Solo' }}</div>
                </v-col>
                <v-divider
                  inset
                  vertical
                />
                <v-col class="text-center">
                  <div class="font-weight-bold text-primary">{{ voyage.duration }}</div>
                  <div class="text-grey-lighten-1 font-weight-medium">Jours </div>
                </v-col>
                <v-divider
                  inset
                  vertical
                />
                <v-col class="text-right">
                  <div class="text-grey-lighten-1 font-weight-medium"> À partir de </div>
                  <div class="font-weight-bold text-primary">{{ voyage.startingPrice }}€</div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider />
          <v-card-actions class="justify-center">
            <client-only>
              <v-btn
                v-if="voyage.dates?.length > 0"
                block
                color="primary"
                class="font-weight-bold"
              >
                Découvrir les dates
              </v-btn>
              <v-btn
                v-else
                block
                color="secondary"
                class="text-decoration-none font-weight-bold"
                :to="`/calendly?travelTitle=${voyage.title}`"
              >
                Demander un devis
              </v-btn>
            </client-only>
          </v-card-actions>
        </NuxtLink>
      </div>
    </v-card>
  </v-col>
</template>

<script setup>
import { mdiStar } from '@mdi/js'
import { useImage } from '#imports'

const props = defineProps({
  voyageSlug: {
    type: String,
    required: true,
  },
})
const img = useImage()

const { data: voyage, status } = useAsyncData(`voyage-${props.voyageSlug}`, () => {
  return queryCollection('deals').where('slug', '=', props.voyageSlug).first()
})
</script>

<style scoped>
 .hover-scale:hover .blur-overlay {
  height: 100%;
}
 .hover-scale:hover{
  transform: scale(1.01);
  transition: transform 0.2s ease-in-out;
}
.hover-scale{
  transform: scale(1);
  transition: transform 0.2s ease-in-out;
}
</style>
