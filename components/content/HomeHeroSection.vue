<template>
  <div class="mt-8 mt-md-0">
    <div class="relative-hero-section mb-16 rounded-xl">
      <SanityImage
        v-if="image"
        :asset-id="image.asset._ref"
        auto="format"
      >
        <template #default="{ src }">
          <v-img
            :src="img(src, { format: 'webp', quality: 90, height: 900, width: 1536 })"
            :lazy-src="img(src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
            size="(max-width: 600) 480px, 1500px"
            :srcset="`${img(src, { format: 'webp', quality: 80, width: 640, height: 900 })} 480w, ${img(src, { format: 'webp', quality: 80, width: 1024, height: 900 })} 1500w`"
            height="100%"
            alt="Image principale Hero d'Odysway"
            class="rounded-xl hero-height"
            cover
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
              </div>
            </template>

            <template #default>
              <div class="h-100 d-flex align-center position-relative">
                <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow text-center">
                  <v-row
                    justify="center"
                    align="center"
                  >
                    <v-col
                      cols="12"
                      md="auto"
                    >
                      <h1 class="custom-hero-title ">
                        <slot name="title" />
                      </h1>
                      <slot name="subtitle" />
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </template>
          </v-img>
        </template>
      </SanityImage>
    </div>
    <div class="searchfield-overlap">
      <SearchField />
    </div>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  image: {
    type: Object,
    required: true,
  },
})
const img = useImage()
</script>

<style scoped>
.img-shadow{
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}
.title-container {
  container-type: inline-size;
}
.title-container .responsive-title {
  font-size: 19.2cqw;
  text-align: start;
}
.responsive-subtitle {
  font-size: 10.9cqw;
  text-align: start;
}
.relative-hero-section {
 position:relative;
 height: 600px;
 width: 100%;
}

.custom-hero-title {
font-weight: 700;
font-size: 78px;
line-height: 80px!important;
margin-bottom: 45px;
}

.searchfield-overlap {
  max-width: 1070px;
  margin: -110px auto 0 auto;
}
.hero-height {
  height: 600px;
}
@media (max-width: 960px) {
  .relative-hero-section {
    height: 70vh;
  }

  .custom-hero-title {
    font-size: 60px!important;
    line-height: 55px!important;
    margin-bottom: 85px;
  }
  .searchfield-overlap {
    margin: -150px auto 0 auto;
  }
}
@media (max-width: 600px) {
  .relative-hero-section {
    height: 50vh;
  }
  .hero-height {
    height: 50vh;
  }
  .custom-hero-title {
    font-size: 40px!important;
    line-height: 40px!important;
    margin-bottom: 90px;
  }
  .searchfield-overlap {
    margin: -150px auto 0 auto;
  }
}
</style>
