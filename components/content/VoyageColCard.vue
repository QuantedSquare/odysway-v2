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
    lg="4"
  >
    <v-card
      elevation="0"
    >
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
            class="badge-position"
          >
            <v-btn
              size="small"
              color="white"
              rounded="pill"
              :height="mdAndUp ? 46 : 36"
            >
              <div class="d-flex justify-center align-center mx-1">
                <v-icon
                  :icon="mdiStar"
                  color="yellow-rating"
                  class="mb-1"
                  :size="mdAndUp ? 20 : 16"
                />
                <span class="text-body-2 font-weight-bold text-primary">
                  {{ `${voyage.rating.toString().replace('.', ',')}/5` }}
                </span>
              </div>
            </v-btn>
          </div>
          <div
            v-else
            class="badge-position"
          >
            <v-btn
              size="small"
              color="primary"
              class="font-weight-bold text-body-2 text-md-body-1"
              rounded="pill"
              :height="mdAndUp ? 46 : 36"
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
          <v-card-text class="py-1 px-2">
            <v-container>
              <v-row>
                <v-col class="pt-md-3 pt-0">
                  <div class="text-primary text-h4 font-weight-bold py-1 px-0 no-white-space title-container">
                    <div
                      ref="titleRef"
                      class="line-clamp-2"
                    >{{ voyage.title }}</div>
                    <v-tooltip
                      v-if="voyage.title.length > 60"
                      activator="parent"
                    >
                      <span>
                        {{ voyage.title }}
                      </span>
                    </v-tooltip>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <div class="text-grey font-weight-bold"> Type </div>
                  <div class="text-h6 font-weight-bold text-primary">{{ voyage.groupeAvailable ? 'Groupe' : 'Solo' }}</div>
                </v-col>
                <v-divider
                  inset
                  vertical
                />
                <v-col
                  cols="4"
                  class="text-center"
                >
                  <div class="text-h6 font-weight-bold text-primary">(todo)
                    <!-- {{ voyage.duration }} -->
                  </div>
                  <div class="text-grey font-weight-bold">Jours </div>
                </v-col>
                <v-divider
                  inset
                  vertical
                />
                <v-col
                  cols="4"
                  class="text-right"
                >
                  <div class="text-grey font-weight-bold text-no-wrap"> À partir de </div>
                  <div class="text-h6 font-weight-bold text-primary">{{ voyage.startingPrice }}€</div>
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
                class="font-weight-bold text-body-1"
              >
                <div class="mb-1 mr-2">
                  Découvrir les dates
                </div>
                <v-icon
                  size="24px"
                >{{ mdiPlusCircle }}</v-icon>
              </v-btn>
              <v-btn
                v-else
                block
                color="secondary"
                class="text-decoration-none font-weight-bold text-body-1"
                :to="`/calendly?travelTitle=${voyage.title}`"
              >
                <div class="mb-1 mr-2">
                  Demander un devis
                </div>
                <v-icon
                  size="24px"
                >{{ mdiPlusCircle }}</v-icon>
              </v-btn>
            </client-only>
          </v-card-actions>
        </NuxtLink>
      </div>
    </v-card>
  </v-col>
</template>

<script setup>
import { mdiPlusCircle, mdiStar } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const { mdAndUp } = useDisplay()
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
.badge-position{
  position: absolute;
  top: 25px;
  right: 28px;
}
.title-container {
  height: 2.4em; /* This sets a fixed height equivalent to 2 lines */
}
.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
