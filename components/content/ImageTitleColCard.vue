<template>
  <v-col
    cols="6"
    sm="4"
    md="3"
  >
    <v-lazy
      :min-height="228"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    >
      <NuxtLink
        :to="link"
        class="image-wrapper"
        :class="{ 'default-expanded': width <= 960 }"
      >
        <v-img
          :src="imgComp(image.src, { format: 'webp', quality: 70, width: 640 })"
          :lazy-src="imgComp(image.src, { format: 'webp', quality: 10, width: 640 })"
          :srcset="`${imgComp(image.src, { format: 'webp', quality: 70, width: 640 })} 640w, ${imgComp(image.src, { format: 'webp', quality: 70, width: 1024 })} 1024w`"
          :alt="image.alt"
          sizes="(max-width: 600px) 266px, 228px"
          cover
          height="228"
          loading="lazy"
        />

        <div class="blur-overlay" />
        <div class="image-overlay" />
        <div class="content-overlay">
          <div class="w-100 d-flex flex-column align-center justify-center">
            <h3 class="category-title font-weight-bold  text-h3 d-flex align-center text-center text-shadow ">{{ title }}</h3>
            <p class="category-description text-shadow d-flex flex-column align-center justify-space-between ga-4">
              <span class="text-center">
                {{ subtitle }}
              </span>
            </p>
          </div>
        </div>
      </NuxtLink>
    </v-lazy>
  </v-col>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const imgComp = useImage()
const { width } = useDisplay()

defineProps({
  image: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '/',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.image-wrapper {
  position: relative;
  display: flex;
  height: 228px;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  border-radius: 1rem;
  transition: all 0.5s ease-in-out;
}
@media (max-width: 500px) {
  .image-wrapper {
    max-height: 200px;
  }
}

.blur-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  mask: linear-gradient(transparent, rgb(0, 0, 0), black);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper:hover .blur-overlay,
.image-wrapper.default-expanded .blur-overlay {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.752));
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper:hover .image-overlay,
.image-wrapper.default-expanded .image-overlay {
  opacity: 1;
}

.content-overlay {
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1rem;
  color: white;
  transform: translateY(calc(100% - 5rem));
  transition: transform 0.5s ease-in-out;
  z-index: 1;
}

.image-wrapper:hover .content-overlay {
  transform: translateY(0);
}

.category-title {
  margin: -2em 0 0 0;
  transition: transform 0.3s ease-in-out;
}

.category-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  opacity: 0;
  transform: translateY(1rem);
  transition: all 0.3s ease-in-out;
}

.image-wrapper:hover .category-description {
  opacity: 1;
  transform: translateY(0);
}

.explore-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid white !important;
  color: white !important;
  font-weight: bold;
}

.explore-btn:hover {
  background: white;
  color: black;
}

@media screen and (max-width: 1280px) {
  .text-to-wrap {
    padding-bottom: 10px;
  }
  .category-title {
    margin: -60px 0 0 0 !important;
  }
}

@media screen and (max-width: 600px) {
  .category-title {
    margin: -2rem 0 0 0 !important;

    font-size: 1.2rem !important;
  }
  .image-wrapper {
    height: 16rem;
  }
}
@media screen and (max-width: 400px) {
  .category-title {
    font-size: 1rem !important;
    line-height: 1.4rem !important;
  }
}
</style>
