<template>
  <v-lazy
    :options="{ threshold: 0.1 }"
    transition="fade-transition"
    class="rounded-xl custom-height-lazy"
  >
    <v-card
      v-if="voyageCardContent"
      elevation="0"
      hover
      class="custom-card-width voyage-card"
    >
      <NuxtLink
        :to="`/voyages/${voyage.slug.current || voyage.slug}`"
        class="text-decoration-none position-relative text-white"
      >
        <v-img
          v-if="voyageCardImg"
          :src="img(voyageCardImg, { format: 'webp', quality: 75, height: 228, width: 640 })"
          :lazy-src="img(voyageCardImg, { format: 'webp', quality: 10, height: 228, width: 640 })"
          :alt="voyage.image.alt || `Paysage de destination pour le voyage ${voyage.title}`"
          :srcset="`${img(voyageCardImg, { format: 'webp', quality: 75, width: 640 })} 640w, ${img(voyageCardImg, { format: 'webp', quality: 75, width: 1024 })} 1024w`"
          sizes="(max-width: 600px) 480px, 1024px"
          class="img-height"
          cover
          aspect-ratio="auto"
        >
          <template #default>
            <div class="badge-position">
              <!-- <RatingBadge
                :rating="voyage.rating"
                :comments="voyage.comments"
                no-link
              /> -->
            </div>
          </template>
        </v-img>

      </NuxtLink>

      <!--  BOTTOM TEXT -->
      <div>
        <NuxtLink
          :to="`/voyages/${voyage.slug.current || voyage.slug}`"
          class="text-decoration-none"
        >
          <v-card-text class="py-1">
            <v-container class="px-0 px-md-2">
              <v-row>
                <v-col class="pt-lg-3 pt-0">
                  <div
                    class="text-primary text-h5 text-sm-h4 font-weight-bold py-1 px-0 no-white-space title-container"
                  >
                    <v-tooltip
                      v-if="voyage.title.length > 50"
                      :id="`tooltip-${voyage.slug}`"
                      activator="parent"
                      role="tooltip"
                      :aria-label="`Titre complet du voyage: ${voyage.title}`"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <div
                          :id="`tooltip-${voyage.slug.current || voyage.slug}`"
                          ref="titleRef"
                          class="line-clamp-2"
                          :aria-describedby="voyage.title.length > 50 ? `tooltip-${voyage.slug.current || voyage.slug}` : undefined"
                          role="tooltip"
                          :aria-label="`Titre complet du voyage: ${voyage.title}`"
                          v-bind="tooltipProps"
                        >
                          {{ voyage.title }}</div>
                      </template>
                      <span>
                        {{ voyage.title }}
                      </span>
                    </v-tooltip>
                    <div
                      v-else
                      ref="titleRef"
                      class="line-clamp-2"
                    >{{ voyage.title }}</div>
                  </div>
                </v-col>
              </v-row>
              <v-row
                class="custom-row-height pt-0 mt-0"
                align="center"
                justify="center"
              >
                <v-col
                  cols="4"
                  class="d-flex flex-column  align-center ga-1 justify-center "
                >
                  <v-icon
                    class="text-primary custom-icon-size"
                  >{{ mdiAccountMultiple }}</v-icon>
                  <div class="text-caption text-md-subtitle-2 line-height font-weight-bold text-primary text-center">{{ voyage.availabilityTypes?.includes('groupe')
                    ? (voyageCardContent?.groupType || 'Groupe') : (voyageCardContent?.soloType || 'Solo') }}</div>
                </v-col>
                <v-divider
                  inset
                  class="text-grey"
                  vertical
                />
                <v-col
                  cols="4"
                  class="text-center"
                >
                  <div class="text-h6 font-weight-bold text-primary">
                    {{ voyage.duration }}
                  </div>
                  <div class="text-grey text-body-2 text-md-subtitle-2 font-weight-bold">{{ voyageCardContent?.days
                    || 'Jours'
                  }}</div>
                </v-col>
                <v-divider
                  inset
                  class="text-grey"
                  vertical
                />

                <v-col
                  cols="4"
                  class="d-flex flex-column justify-space-between ga-1 align-center"
                >
                  <span class="text-grey text-body-2 text-md-subtitle-2 font-weight-bold">{{
                    voyageCardContent?.startingFrom
                      || 'À partir de' }}</span>
                  <v-spacer />
                  <span class="text-h6 font-weight-bold text-primary">{{ voyage.pricing?.startingPrice
                    ?? voyage.startingPrice
                  }}€</span>
                </v-col>
                <v-col
                  cols="12"
                  class="py-0 py-md-1 px-4 d-flex align-center"
                >
                  <span class="line-height text-grey text-body-2 text-md-subtitle-1">
                    {{ voyageCardContent?.indivDescription }}</span>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider class="text-grey" />
          <v-card-actions
            :class="voyage.availabilityTypes?.includes('groupe') ? 'hover-primary' : 'hover-secondary'"
          >
            <client-only>
              <v-btn
                v-if="voyage.availabilityTypes?.includes('groupe')"
                block

                color="primary"
                class="text-body-1 py-2 custom-btn-height"
              >
                <div class="mb-md-1 mr-2">
                  {{ voyageCardContent?.discoverDates || 'Découvrir les dates' }}
                </div>
                <v-icon size="24px">{{ mdiPlusCircle }}</v-icon>
              </v-btn>
              <v-btn
                v-else
                block
                color="secondary"
                class="text-decoration-none text-body-1 custom-btn-height"
              >
                <div class="mb-md-1 mr-2 ">
                  {{ voyageCardContent?.requestQuote || 'Demander un devis' }}
                </div>
                <v-icon size="24px">{{ mdiPlusCircle }}</v-icon>
              </v-btn>
            </client-only>
          </v-card-actions>
        </NuxtLink>
      </div>
    </v-card>
  </v-lazy>
</template>

<script setup>
import { mdiPlusCircle, mdiAccountMultiple } from '@mdi/js'

import { useImage } from '#imports'

const { voyage } = defineProps({
  voyage: {
    type: Object,
  },
})
const img = useImage()

const voyageCardContentQuery = groq`*[_type == "voyage_card"][0]{
  type,
  groupType,
  soloType,
  days,
  startingFrom,
  discoverDates,
  requestQuote,
  indivDescription
}`

const sanity = useSanity()
const { data: voyageCardContent } = await useAsyncData('voyage-card-content', () =>
  sanity.fetch(voyageCardContentQuery),
{
  dedupe: 'defer', // This ensures all components wait for first request to complete
},
)

const actionColor = computed(() => voyage.availabilityTypes?.includes('groupe') ? '#f7f8f8' : '#fef9f8')
const voyageCardImg = computed(() => {
  return getImageUrl(voyage.image?.asset?._ref)
})
</script>

<style scoped>
.custom-icon-size{
    font-size: 22px !important;
  }
.badge-position {
  position: absolute;
  top: 25px;
  right: 28px;
}
.custom-btn-height:deep(){
  height:45px!important;
}
.title-container {
  height: 2.4em;
  /* This sets a fixed height equivalent to 2 lines */
}

.hover-primary:hover {
  background-color: v-bind(actionColor);
}

.hover-secondary:hover {
  background-color: v-bind(actionColor);
}

:deep(.v-btn--variant-text .v-btn__overlay) {
  background-color: v-bind(actionColor);
}
.line-height {
  line-height: 20px !important;
  min-height: 40px !important; /* reserve space for 2 lines */
  display: block;
}
.img-height {
  height: 228px;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  line-height: 120% !important;
  font-size: 24px !important;
}

.custom-card-width {
  min-width: 406px !important;
  max-width: 600px !important;
}

@media screen and (max-width: 1280px) {
  .custom-card-width {
    min-width: 406px !important;
  }
}

@media screen and (max-width: 1400px) {
  .custom-card-width {
    min-width: 350px !important;
  }
}

@media screen and (max-width: 1240px) {
  .line-clamp-2 {
    font-size: 24px !important;
  }

  .title-container {
    height: 2.2em;
    /* This sets a fixed height equivalent to 2 lines */
  }

  .custom-card-width {
    min-width: 350px !important;
  }
}

@media screen and (max-width: 1024px) {
  .line-clamp-2 {
    font-size: 18px !important;
  }

}

@media screen and (max-width: 750px) {
  .custom-card-width {
    min-width: 280px !important;
  }
}
.custom-row-height {
  min-height: 125px !important;
  align-items: center;
}
@media screen and (max-width: 600px) {
  .badge-position {
    position: absolute;
    top: 18px;
    right: 18px;
  }
  .custom-btn-height:deep(){
  height:37px!important;
}

  .img-height {
    height: 150px;
  }

  .line-clamp-2 {
    line-height: 20px !important;
    font-size: 16px !important;
  }

  .custom-card-width {
    min-width: 280px !important;
    max-width: 100% !important;
    /* max-height: 345px !important; */
  }
  .custom-row-height {
    min-height: 120px !important;
  }
}

.custom-height-lazy {
  /* height: 100%; */
  min-height: 455px !important;
  min-width: 406px !important;
  max-width: 600px !important;
}

.voyage-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.voyage-card :deep(.v-card-text) {
  flex: 1 0 auto;
}

.voyage-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  border-color: #e0e7ff;
}

.voyage-card .img-height {
  transition: transform 220ms ease;
}

.voyage-card:hover .img-height {
  transform: scale(1.03);
}

@media screen and (max-width: 1280px) {
  .custom-height-lazy {
    min-height: 438px !important;
    min-width: 406px !important;
  }
}

@media screen and (max-width: 1400px) {
  .custom-height-lazy {
    min-width: 350px !important;
  }
}

@media screen and (max-width: 1240px) {
  .custom-height-lazy {
    min-height: 420px !important;
    min-width: 350px !important;
  }
}

@media screen and (max-width: 960px) {
  .custom-height-lazy {
    min-height: 420px !important;
  }
}

@media screen and (max-width: 750px) {
  .custom-height-lazy {
    min-width: 280px !important;
  }
}

@media screen and (max-width: 600px) {
  .custom-height-lazy {
    min-height: 343px !important;
    min-width: 280px !important;
  }
}
</style>
