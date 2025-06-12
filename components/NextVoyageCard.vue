<template>
  <v-card
    elevation="0"
    hover
    class="custom-card-width"
  >
    <NuxtLink
      :to="`/voyages/${deal.slug}`"
      class="text-decoration-none position-relative text-white"
    >
      <v-img
        :src="img(deal.image.src, { format: 'webp', quality: 90, height: 228, width: 640 })"
        :lazy-src="img(deal.image.src, { format: 'webp', quality: 10, height: 228, width: 640 })"
        :alt="deal.image.alt || deal.title"
        :srcset="`${img(deal.image.src, { format: 'webp', quality: 90, width: 640 })} 640w, ${img(deal.image.src, { format: 'webp', quality: 90, width: 1024 })} 1024w`"
        sizes="(max-width: 600px) 480px, 1024px"
        class="img-height"
        cover
      >
        <div class="badge-position">
          <client-only>
            <v-rating
              :key="`rating-${deal.slug}`"
              half-increments
              size="small"
              readonly
              :model-value="deal.rating"
              color="orange-lighten-1"
              density="compact"
            />
            <span class="text-caption ml-1">({{ deal.comments }})</span>
          </client-only>
        </div>
      </v-img>
    </NuxtLink>
    <!--  BOTTOM TEXT -->
    <div>
      <NuxtLink
        :to="`/voyages/${deal.slug}`"
        class="text-decoration-none"
      >
        <v-card-text class="py-1">
          <v-container class="px-0 px-md-2">
            <v-row>
              <v-col class="pt-lg-3 pt-0">
                <div class="text-primary text-h5 text-sm-h4 font-weight-bold py-1 px-0 no-white-space title-container">
                  <div class="line-clamp-2">{{ deal.title }}</div>
                  <v-tooltip
                    v-if="deal.title.length > 60"
                    activator="parent"
                  >
                    <span>
                      {{ deal.title }}
                    </span>
                  </v-tooltip>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <div class="text-grey font-weight-bold text-body-2 text-md-subtitle-2"> Type </div>
                <div class="text-h6 font-weight-bold text-primary">{{ deal.groupeAvailable ? 'Groupe' : 'Solo' }}</div>
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
                  {{ deal.duration || (deal.dates[0]?.duration || '-') }}
                </div>
                <div class="text-grey text-body-2 text-md-subtitle-2 font-weight-bold">Jours</div>
              </v-col>
              <v-divider
                inset
                vertical
              />
              <v-col
                cols="4"
                class="text-right"
              >
                <div class="text-grey text-body-2 text-md-subtitle-2 font-weight-bold"> À partir de </div>
                <div class="text-h6 font-weight-bold text-primary">
                  <template v-if="deal.dates[0]?.early_bird">
                    <span class="text-decoration-line-through">{{ deal.dates[0]?.starting_price }}€</span>
                    <span class="text-primary ml-1">{{ deal.dates[0]?.starting_price - (deal.dates[0]?.promoEarlyBird || 0) }}€</span>
                  </template>
                  <template v-else-if="deal.dates[0]?.last_minute">
                    <span class="text-decoration-line-through">{{ deal.dates[0]?.starting_price }}€</span>
                    <span class="text-secondary ml-1">{{ deal.dates[0]?.starting_price - (deal.dates[0]?.promoLastMinute || 0) }}€</span>
                  </template>
                  <template v-else>
                    {{ deal.dates[0]?.starting_price }}€
                  </template>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                class="pt-0"
              >
                <div class="text-caption text-grey-darken-1">
                  <v-icon size="18">{{ mdiCalendar }}</v-icon>
                  {{ deal.dates[0]?.departure_date ? dayjs(deal.dates[0]?.departure_date).format('DD/MM/YYYY') : '-' }}
                  <span v-if="deal.dates[0]?.return_date"> - {{ dayjs(deal.dates[0]?.return_date).format('DD/MM/YYYY') }}</span>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider />
        <v-card-actions
          class="justify-center"
          :class="deal.groupeAvailable ? 'hover-primary' : 'hover-secondary'"
        >
          <client-only>
            <v-btn
              v-if="deal.groupeAvailable"
              block
              color="primary"
              class="text-body-1"
            >
              <div class="mb-md-1 mr-2">
                Découvrir les dates
              </div>
              <v-icon size="24px">{{ mdiPlusCircle }}</v-icon>
            </v-btn>
            <v-btn
              v-else
              block
              color="secondary"
              class="text-decoration-none text-body-1"
            >
              <div class="mb-md-1 mr-2">
                Demander un devis
              </div>
              <v-icon size="24px">{{ mdiPlusCircle }}</v-icon>
            </v-btn>
          </client-only>
        </v-card-actions>
      </NuxtLink>
    </div>
  </v-card>
</template>

<script setup>
import { mdiPlusCircle, mdiCalendar } from '@mdi/js'
import dayjs from 'dayjs'
import { useImage } from '#imports'

const props = defineProps({
  deal: {
    type: Object,
  },
})
const img = useImage()
const actionColor = computed(() => props.deal.groupeAvailable ? '#f7f8f8' : '#fef9f8')
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
  }
}
</style>
