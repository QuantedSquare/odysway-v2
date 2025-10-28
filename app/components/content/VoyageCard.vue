<template>
  <v-lazy
    :options="{ threshold: 0.1 }"
    transition="fade-transition"
    class="bg-grey-light-3 rounded-xl custom-height-lazy"
  >
    <v-card
      v-if="voyageCardContent"
      elevation="0"
      hover
      class="custom-card-width"
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
              <RatingBadge
                :rating="voyage.rating"
                :comments="voyage.comments"
                no-link
              />
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
                  <div class="text-primary text-h5 text-sm-h4 font-weight-bold py-1 px-0 no-white-space title-container">
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
                        >{{ voyage.title }}</div>
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
              <v-row class="custom-row-height">
                <v-col cols="4">
                  <div class="text-grey font-weight-bold text-body-2 text-md-subtitle-2">{{ voyageCardContent?.type || 'Type' }}</div>
                  <div class="text-h6 font-weight-bold text-primary">{{ voyage.groupeAvailable ? (voyageCardContent?.groupType || 'Groupe') : (voyageCardContent?.soloType || 'Solo') }}</div>
                </v-col>
                <v-divider
                  inset
                  vertical
                />
                <v-col
                  cols="4"
                  class="text-center"
                >
                  <div class="text-h6 font-weight-bold text-primary">
                    {{ voyage.duration }}
                  </div>
                  <div class="text-grey text-body-2 text-md-subtitle-2 font-weight-bold">{{ voyageCardContent?.days || 'Jours' }}</div>
                </v-col>
                <v-divider
                  inset
                  vertical
                />
                <v-col
                  cols="4"
                  class="text-right"
                >
                  <div class="text-grey text-body-2 text-md-subtitle-2 font-weight-bold">{{ voyageCardContent?.startingFrom || 'À partir de' }}</div>
                  <div class="text-h6 font-weight-bold text-primary">{{ voyage.pricing?.startingPrice ?? voyage.startingPrice }}€</div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider />
          <v-card-actions
            :class="voyage.groupeAvailable ? 'hover-primary' : 'hover-secondary'"
          >
            <client-only>
              <v-btn
                v-if="voyage.groupeAvailable"
                block
                color="primary"
                class="text-body-1"
              >
                <div class="mb-md-1 mr-2">
                  {{ voyageCardContent?.discoverDates || 'Découvrir les dates' }}
                </div>
                <v-icon
                  size="24px"
                >{{ mdiPlusCircle }}</v-icon>
              </v-btn>
              <v-btn
                v-else
                block
                color="secondary"
                class="text-decoration-none text-body-1"
              >
                <div class="mb-md-1 mr-2">
                  {{ voyageCardContent?.requestQuote || 'Demander un devis' }}
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
  </v-lazy>
</template>

<script setup>
import { mdiPlusCircle } from '@mdi/js'
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
  requestQuote
}`

const sanity = useSanity()
const { data: voyageCardContent } = await useAsyncData('voyage-card-content', () =>
  sanity.fetch(voyageCardContentQuery),
  {
    dedupe: 'defer' // This ensures all components wait for first request to complete
  }
)

const actionColor = computed(() => voyage.groupeAvailable ? '#f7f8f8' : '#fef9f8')
const voyageCardImg = computed(() => {
  return getImageUrl(voyage.image?.asset?._ref)
})
</script>

<style scoped>
.badge-position{
  position: absolute;
  top: 25px;
  right: 28px;
}
.title-container {
  height: 2.4em; /* This sets a fixed height equivalent to 2 lines */
}
.hover-primary:hover{
  background-color: v-bind(actionColor);
}
.hover-secondary:hover{
  background-color: v-bind(actionColor);
}
:deep(.v-btn--variant-text .v-btn__overlay){
  background-color: v-bind(actionColor);
}
.img-height{
  height: 228px;
}

.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  line-height: 120%!important;
  font-size: 28px!important;
}
.custom-card-width{
  min-width:406px!important;
  max-width: 600px!important;
}
@media screen and (max-width: 1280px) {
  .custom-card-width{
  min-width:406px!important;
  }
}
@media screen and (max-width: 1400px) {
  .custom-card-width{
  min-width:350px!important;
  }
}

@media screen and (max-width: 1240px) {
  .line-clamp-2{
    font-size: 24px!important;
  }
  .title-container {
    height: 2.2em; /* This sets a fixed height equivalent to 2 lines */
  }
  .custom-card-width{
  min-width:350px!important;
  }
}

@media screen and (max-width: 1024px) {
.line-clamp-2{
  font-size: 18px!important;
  }
}
@media screen and (max-width: 750px) {
  .custom-card-width{
  min-width:280px!important;
  }
}
@media screen and (max-width: 600px) {
  .badge-position{
    position: absolute;
    top: 18px;
    right: 18px;
  }
  .img-height{
    height: 150px;
  }
  .line-clamp-2{
    line-height: 20px!important;
    font-size: 16px!important;
  }
  .custom-card-width{
  min-width:280px!important;
  max-width: 280px!important;
  max-height: 345px!important;
  }
}
.custom-row-height{
  height: 77px!important;
}

.custom-height-lazy{
  min-height: 455px!important;
  min-width: 406px!important;
  max-width: 600px!important;
}
@media screen and (max-width: 1280px) {
  .custom-height-lazy{
    min-height: 438px!important;
    min-width: 406px!important;
  }
}
@media screen and (max-width: 1400px) {
  .custom-height-lazy{
    min-width: 350px!important;
  }
}
@media screen and (max-width: 1240px) {
  .custom-height-lazy{
    min-height: 420px!important;
    min-width: 350px!important;
  }
}
@media screen and (max-width: 960px) {
  .custom-height-lazy{
    min-height: 420px!important;
  }
}
@media screen and (max-width: 750px) {
  .custom-height-lazy{
    min-width: 280px!important;
  }
}
@media screen and (max-width: 600px) {
  .custom-height-lazy{
    min-height: 343px!important;
    min-width: 280px!important;
  }
}
</style>
