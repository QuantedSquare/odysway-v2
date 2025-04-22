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
    v-else-if="status === 'success'"
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
          :src="img(voyage.imgSrc1.src, { format: 'webp', quality: 90, height: 350, width: 640 })"
          :alt="voyage.imgSrc1.alt"
          rounded="t-xl"
          height="250px"
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
                color="primary"
              />
              {{ voyage.rating }}/5
            </v-btn>

          </div>
        </v-img>
      </NuxtLink>

      <!--  BOTTOM TEXT -->
      <div class="d-none d-sm-block ">
        <NuxtLink
          :to="`/voyages/${voyage.slug}`"
          class="text-decoration-none"
        >

          <v-card-text class="text-body-2 py-1 px-0">
            <v-container>
              <v-row>
                <v-col>
                  <div class="text-body-1 font-weight-black py-1 px-0 text-dark no-white-space">
                    {{ voyage.title }}
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <div class="text-grey-darken-2 "> Type </div>
                  <div class="font-weight-bold text-dark">{{ voyage.startingPrice }}€</div>
                </v-col>
                <v-divider vertical />
                <v-col class="text-center">
                  <div class="font-weight-bold text-dark">{{ voyage.duration }}</div>
                  <div class="text-grey-darken-2 ">Jours </div>
                </v-col>
                <v-divider vertical />
                <v-col class="text-right">
                  <div class="text-grey-darken-2"> A partir de </div>
                  <div class="font-weight-bold text-dark">{{ voyage.startingPrice }}€</div>
                </v-col>
              </v-row>
            </v-container>
            <v-divider />
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              block
              color="primary"
            >
              Découvrir les dates
            </v-btn>
          </v-card-actions>
        </NuxtLink>
      </div>
    </v-card>
  </v-col>
</template>

<script setup>
import { mdiAccountGroup, mdiStar } from '@mdi/js'
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

const voyageTooltips = computed(() => {
  return {
    child: voyage.value?.tooltipChild,
    group: voyage.value?.tooltipGroup,
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
