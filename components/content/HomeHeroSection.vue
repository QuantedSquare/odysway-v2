<template>
  <div class="mt-8 mt-md-0">
    <div class="relative-hero-section mb-16 rounded-xl">
      <v-img
        :src="img(imageSrc, { format: 'webp', quality: 80, height: 900, width: 1536 })"
        :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900, width: 1536 })"
        size="(max-width: 600) 480px, 1500px"
        :srcset="`${img(imageSrc, { format: 'webp', quality: 80, width: 640, height: 900 })} 480w, ${img(imageSrc, { format: 'webp', quality: 80, width: 1024, height: 900 })} 1500w`"
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

        <!-- Gradient overlay -->
        <div class="gradient-overlay" />

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
                <h1 class="custom-hero-title">
                  <slot name="title" />
                </h1>
                <slot name="subtitle" />
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-img>
    </div>
    <div class="searchfield-overlap">
      <SearchContainer />
    </div>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
  primaryColor: {
    type: String,
    default: 'rgba(43, 76, 82, 0)',
  },
  secondaryColor: {
    type: String,
    default: 'rgba(43, 76, 82, 0)',
  },
  tertiaryColor: {
    type: String,
    default: 'rgba(43, 76, 82, 0)',
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
.gradient-overlay {
  position: absolute;
  top: -600px;
  left: -100px;
  right: -100px;
  bottom: -100px;
  background:
    linear-gradient(165.07deg, v-bind(primaryColor) 39.02%, rgba(43, 76, 82, 0) 66.32%),
    linear-gradient(227.83deg, rgba(219, 102, 68, 0) 72.77%, v-bind(secondaryColor) 97.79%),
    linear-gradient(311.34deg, v-bind(tertiaryColor) 12.5%, rgba(240, 179, 72, 0) 29.18%);
  pointer-events: none;
}
.relative-hero-section {
 position:relative;
 height: 80vh;
 width: 100%;
}

.custom-hero-title {
font-weight: 700;
font-size: 78px;
line-height: 80px!important;
}

.searchfield-overlap {
  max-width: 1070px;
  margin: -110px auto 0 auto;
}
.hero-height {
  height: 80vh;
}
@media (max-width: 960px) {
  .relative-hero-section {
    height: 70vh;
  }

  .custom-hero-title {
    font-size: 60px!important;
    line-height: 55px!important;
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
    font-size: 45px!important;
    line-height: 40px!important;
  }
  .searchfield-overlap {
    margin: -150px auto 0 auto;
  }
}
</style>
