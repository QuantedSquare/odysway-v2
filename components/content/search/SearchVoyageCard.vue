<template>
  <v-card
    elevation="0"
    height="100%"
  >
    <NuxtLink
      :to="`/voyages/${voyage.slug}`"
      class="text-decoration-none position-relative text-white"
    >
      <v-img
        :src="img(voyage.image.src, { format: 'webp', quality: 90, height: 228, width: 640 })"
        :lazy-src="img(voyage.image.src, { format: 'webp', quality: 10, height: 228, width: 640 })"
        :alt="voyage.image.alt || voyage.title"
        :srcset="`${img(voyage.image.src, { format: 'webp', quality: 90, width: 640 })} 640w, ${img(voyage.image.src, { format: 'webp', quality: 90, width: 1024 })} 1024w`"
        sizes="(max-width: 600px) 480px, 1024px"
        loading="lazy"
        height="228px"
        class="hover-scale"
        cover
      >
        <div class="badge-position">
          <RatingBadge :rating="voyage.rating" />
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
                <div class="text-h6 font-weight-bold text-primary">
                  {{ voyage.duration }}
                </div>
                <div class="text-grey font-weight-bold">Jours</div>
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
                <div class="text-h6 font-weight-bold text-primary">{{ voyage.pricing.startingPrice }}€</div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider />
        <v-card-actions
          class="justify-center"
          :class="voyage.groupeAvailable ? 'hover-primary' : 'hover-secondary'"
        >
          <client-only>
            <v-btn
              v-if="voyage.groupeAvailable"
              block
              color="primary"
              class="font-weight-bold text-body-1"
            >
              <div class="mr-2">
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
              class="text-decoration-none font-weight-bold text-body-1 d-flex align-center "
            >
              <div class="mr-2">
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
</template>

<script setup>
import { mdiPlusCircle } from '@mdi/js'
import { useImage } from '#imports'

const { voyage } = defineProps({
  voyage: {
    type: Object,
    required: true,
  },
})

const img = useImage()
const actionColor = computed(() => voyage.groupeAvailable ? '#f7f8f8' : '#fef9f8')
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
  height: 2.4em;
}
.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
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
</style>
