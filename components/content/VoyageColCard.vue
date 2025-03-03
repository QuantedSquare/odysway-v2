<template>
  <v-col
    v-if="voyage && voyage.imgSrc"
    cols="12"
    sm="4"
    md="3"
  >
    <v-card
      elevation="0"
      rounded="xl"
    >
      <NuxtLink
        :key="`Voyage ${voyage.slug}`"
        :to="`/voyages/${voyage.slug}`"
        class="text-decoration-none position-relative text-white"
      >
        <v-img
          :src="img(voyage.imgSrc, { format: 'webp', quality: 90, height: 350, width: 640 })"
          :alt="`Image principale du voyage ${voyage.title}`"
          width="100%"
          rounded="xl"
          cover
          class="hover-scale"
        >
          <client-only>
            <div class="d-flex justify-end mt-4 mr-1 position-absolute top-0 right-0">
              <v-tooltip
                location="bottom"
                text="Test tooltip"
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
                location="bottom"
                text="Test tooltip"
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
                <v-card-title class="font-weight-bold py-1 px-0 text-h6 text-sm-h5 text-wrap">
                  {{ voyage.title }}
                </v-card-title>
                <v-card-text class="font-weight-bold  px-0 d-flex flex-column align-start ga-2 mt-4">
                  <span class="text-body-1">{{ voyage.country }} - {{ voyage.duration }}</span>
                  <span class="text-body-2"> A partir de {{ voyage.startingPrice }}€</span>
                  <client-only>
                    <div
                      v-if="voyage.comments > 0"
                      class="d-flex align-center text-catpion"
                    >
                      <v-rating
                        :key="`rating-${voyage.slug}`"
                        half-increments
                        size="small"
                        readonly
                        :model-value="voyage.rating"
                        color="orange-lighten-1"
                        density="compact"
                      />
                      <span class="text-caption">({{ voyage.comments }})</span>
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
          :to="`/destinations/${voyage.country}`"
          class="text-decoration-none"
        >
          <v-card-text class="font-weight-bold py-1 px-0 d-flex align-center">
            <span>
              <span class="text-primary hover-underline">{{ voyage.country }} </span><span class="text-secondary"> - {{
                voyage.duration }}</span>
            </span>
          </v-card-text>
        </NuxtLink>
        <NuxtLink
          :to="`/voyages/${voyage.slug}`"
          class="text-decoration-none"
        >
          <v-card-title class="text-body-1 font-weight-bold py-1 px-0 text-dark no-white-space">
            {{ voyage.title }}
          </v-card-title>
          <v-card-text class="text-body-2 py-1 px-0">
            <span class="text-grey-darken-2 "> A partir de </span>
            <span class="font-weight-bold text-dark">{{ voyage.startingPrice }}€</span>
          </v-card-text>
          <div
            v-if="voyage.comments > 0"
            class="d-flex align-center text-dark"
          >
            <client-only>
              <v-rating
                :key="`rating-${voyage.slug}`"
                half-increments
                :size="24"
                :model-value="voyage.rating"
                readonly
                color="orange-lighten-1"
              />
              <span>({{ voyage.comments }})</span>
            </client-only>
          </div>
        </NuxtLink>
      </div>
    </v-card>
  </v-col>
</template>

<script setup>
import { mdiAccountGroup } from '@mdi/js'
import { useImage } from '#imports'

const props = defineProps({
  voyageSlug: {
    type: String,
    required: true,
  },
})
const img = useImage()

const { data: voyage } = await useAsyncData(`voyage-${props.voyageSlug}`, () => {
  return queryCollection('voyages').where('slug', '=', props.voyageSlug).first()
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
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}
/* .hover-scale{
  transform: scale(1);
  transition: transform 0.2s ease-in-out;
} */
</style>
