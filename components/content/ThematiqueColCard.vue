<template>
  <v-col
    cols="7"
    md="3"
    class="pr-1 pr-md-3"
  >
    <v-lazy
      class="image-wrapper-lazy bg-grey-light-2 rounded-lg"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    >
      <NuxtLink
        :to="`/${type}/${slug}`"
        class="image-wrapper default-expanded"
      >
        <SanityImage
          v-if="image.asset._ref"
          :asset-id="image.asset._ref"
          auto="format"
        >
          <template #default="{ src }">
            <v-img
              v-if="src"
              :src="imgComp(src, { format: 'webp', quality: 70, width: 1024 })"
              :lazy-src="imgComp(src, { format: 'webp', quality: 10, width: 1024 })"
              :srcset="`${imgComp(src, { format: 'webp', quality: 70, width: 1024 })} 1024w, ${imgComp(src, { format: 'webp', quality: 70, width: 1536 })} 1536w`"
              sizes="(max-width: 600px) 480px, 1024px"
              loading="lazy"
              width="100%"
              :alt="`Illustration de la catégorie ${title}`"
              cover
            />
          </template>
        </SanityImage>
        <div class="blur-overlay" />
        <div class="image-overlay" />

        <TransitionGroup
          name="slide"
          class="content-wrapper"
          tag="div"
        >
          <h3
            key="title"
            class="font-weight-bold text-h3 text-center text-shadow text-line-space mx-2 mx-md-3"
          >
            {{ title }}
          </h3>

        </TransitionGroup>
      </NuxtLink>
    </v-lazy>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

const imgComp = useImage()

defineProps({
  slug: {
    type: String,
    required: true,
  },
  image: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'Cliquez pour en apprendre plus',
  },
  type: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.image-wrapper-lazy{
  min-height: 415px!important;
}
.image-wrapper {
  position: relative;
  display: flex;
  height: 415px;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  border-radius: 1rem;
  aspect-ratio: 4/5; /* Ensures stable card size regardless of image/content */
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

.content-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 0;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
}

.description {
  margin-top: 1rem;
  font-size: 0.875rem;
}

.explore-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid white !important;
  color: white !important;
  font-weight: bold;
}

.explore-btn:hover {
  background: white !important;
  color: black !important;
}

/* TransitionGroup animations */
.slide-move,
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.slide-leave-active {
  position: absolute;
}
h3{
  font-size: 38px!important;
  line-height: 40px!important;
}
@media screen and (max-width: 1280px) {
  h3 {
    font-size: 1.5rem !important;
    line-height: 30px!important;

  }
}

@media screen and (max-width: 600px) {
  .image-wrapper {
    height: 300px;
    width: 100%;
  }
  .image-wrapper-lazy{
    min-height: 300px!important;
  }
  h3 {
    font-size: 1.1rem !important;
  }
}
</style>
