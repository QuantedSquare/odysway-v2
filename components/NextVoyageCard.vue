<template>
  <v-card
    elevation="0"
  >
    <NuxtLink
      :key="`Voyage ${deal.slug}`"
      :to="`/voyages/${deal.slug}`"
      class="text-decoration-none position-relative text-white"
    >
      <v-img
        :src="img(deal.imgSrc1.src, { format: 'webp', quality: 90, height: 350, width: 640 })"
        :alt="deal.imgSrc1.alt"
        rounded="xl"
        height="250px"
        class="hover-scale"
        cover
      >
        <client-only>
          <div class="d-flex justify-end mt-4 mr-1 position-absolute top-0 right-0">
            <v-tooltip
              v-if="voyageTooltips.group"
              location="bottom"
              :text="voyageTooltips.group"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="x-small"
                  color="rgba(0, 0, 0, 0.32)"
                >
                  <v-icon
                    :icon="mdiAccountGroup"
                    color="white"
                  />
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="voyageTooltips.child"
              location="bottom"
              :text="voyageTooltips.child"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="x-small"
                  color="rgba(0, 0, 0, 0.32)"
                >
                  <v-img
                    src="/icons/child.svg"
                    alt="Child icon"
                    class="svg-child-icon"
                  />
                </v-btn>
              </template>
            </v-tooltip>
          </div>
          <div class="display-mobile">
            <div class="blur-overlay" />
            <div class="position-absolute bottom-text text-shadow text-white bottom-0">
              <v-card-title class="font-weight-bold py-1 px-0 text-h6 text-sm-h5 no-white-space">
                {{ deal.title }}
              </v-card-title>
              <v-card-text class="font-weight-bold px-0 d-flex flex-column align-start ga-2 mt-4">
                <span>
                  <span class="hover-underline">{{ deal.country }} - </span><span class="text-caption font-weight-bold"><v-icon>{{ mdiCalendar }}</v-icon>{{
                    dayjs(deal.dates[0].departureDate).format('DD/MM/YYYY') }} - {{ dayjs(deal.dates[0].returnDate).format('DD/MM/YYYY') }} </span>
                </span>
                <div
                  v-if="deal.dates[0].earlyBird"
                >
                  À partir de
                  <span class="text-decoration-line-through">{{ deal.dates[0].startingPrice }} € </span>
                  <span class="text-primary"> {{ deal.dates[0].startingPrice - deal.dates[0].promoEarlyBird }} €</span>
                </div>
                <div
                  v-else-if="deal.dates[0].lastMinute "
                >
                  À partir de
                  <span class="text-decoration-line-through">{{ deal.dates[0].startingPrice }} €</span>
                  <span class="text-secondary"> {{ deal.dates[0].startingPrice - deal.dates[0].promoLastMinute }} €</span>
                </div>
                <span
                  v-else
                >À partir de {{ deal.dates[0].startingPrice }} €</span>
                <client-only>
                  <div
                    v-if="deal.comments > 0"
                    class="d-flex align-center text-caption"
                  >
                    <v-rating
                      :key="`rating-${deal.slug}`"
                      half-increments
                      size="small"
                      readonly
                      :model-value="deal.rating"
                      color="orange-lighten-1"
                      density="compact"
                    />
                    <span class="text-caption">({{ deal.comments }})</span>
                  </div>
                </client-only>
              </v-card-text>
            </div>
          </div>
        </client-only>
      </v-img>

    </NuxtLink>

    <!--  BOTTOM TEXT -->
    <div class="d-none d-sm-block ">
      <NuxtLink
        :to="`/destinations/${deal.country}`"
        class="text-decoration-none"
      >
        <v-card-text class="font-weight-bold py-1 px-0 d-flex align-center">
          <span>
            <span class="text-primary hover-underline">{{ deal.country }} - </span><span class="text-secondary text-caption font-weight-bold"><v-icon>{{ mdiCalendar }}</v-icon>{{
              dayjs(deal.dates[0].departureDate).format('DD/MM/YYYY') }} - {{ dayjs(deal.dates[0].returnDate).format('DD/MM/YYYY') }} </span>
          </span>
        </v-card-text>
      </NuxtLink>
      <NuxtLink
        :to="`/voyages/${deal.slug}`"
        class="text-decoration-none"
      >
        <v-card-title class="text-body-1 font-weight-bold py-1 px-0  no-white-space">
          {{ deal.title }}
        </v-card-title>
        <v-card-text class="text-body-2 font-weight-bold  py-1 px-0">
          <div
            v-if="deal.dates[0].earlyBird"
          >
            À partir de
            <span class="text-decoration-line-through">{{ deal.dates[0].startingPrice }} € </span>
            <span class="text-primary">{{ deal.dates[0].startingPrice - deal.dates[0].promoEarlyBird }} €</span>
          </div>
          <div
            v-else-if="deal.dates[0].lastMinute"
          >
            À partir de
            <span class="text-decoration-line-through">{{ deal.dates[0].startingPrice }} €</span>
            <span class="text-secondary">{{ deal.dates[0].startingPrice - deal.dates[0].promoLastMinute }} €</span>
          </div>
          <span
            v-else
          >À partir de {{ deal.dates[0].startingPrice }} €</span>
        </v-card-text>
        <div
          v-if="deal.comments > 0"
          class="d-flex align-center "
        >
          <client-only>
            <v-rating
              :key="`rating-${deal.slug}`"
              half-increments
              :size="24"
              :model-value="deal.rating"
              readonly
              color="orange-lighten-1"
            />
            <span>({{ deal.comments }})</span>
          </client-only>
        </div>
      </NuxtLink>
    </div>
  </v-card>
</template>

<script setup>
import { mdiAccountGroup, mdiCalendar } from '@mdi/js'
import dayjs from 'dayjs'
import { useImage } from '#imports'

const props = defineProps({
  deal: {
    type: Object,
  },
})
const img = useImage()

const voyageTooltips = computed(() => {
  return {
    child: props.deal.tooltipChild,
    group: props.deal.tooltipGroup,
  }
})
</script>

<style scoped>
.hover-underline:hover{
  text-decoration: underline;
}
.svg-child-icon {
    width: 1rem;
    height: 1rem;
}
.display-mobile{
  display:none;
}
@media screen and (max-width: 600px) {
  .display-mobile{
    display:block;
  }
}
.bottom-text{
  padding-top:1em;
  padding-left:1em;
}
.blur-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  border-radius: 24px;
  mask: linear-gradient(transparent, rgb(0, 0, 0), black);
  backdrop-filter: blur(4px);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.752));
  transition: all 0.5s ease-in-out;
}

.position-absolute{
  position:absolute;
  bottom:0;
}

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
.min-height-img{
  height: 225px;
}
@media screen and (max-width: 600px) {
  .min-height-img{
    min-height: 300px!important;
    min-width:300px;
  }
}
</style>
