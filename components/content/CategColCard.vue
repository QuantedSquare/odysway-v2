<template>
  <v-col class="mr-0 pr-0">
    <!-- <v-lazy
      :min-height="width <= 960 ? 300 : 415"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    > -->
    <NuxtLink
      :to="`/${type}/${slug}`"
      class="image-wrapper default-expanded rounded"
    >
      <v-img
        v-if="image"
        :src="imgComp(image, { format: 'webp', quality: 70, width: 1024 })"
        :lazy-src="imgComp(image, { format: 'webp', quality: 10, width: 1024 })"
        :srcset="`${imgComp(image, { format: 'webp', quality: 70, width: 1024 })} 1024w, ${imgComp(image, { format: 'webp', quality: 70, width: 1536 })} 1536w`"
        sizes="(max-width: 600px) 480px, 1024px"
        loading="lazy"
        width="100%"
        :alt="`Image de la thématique ${title}`"
        cover
      />

      <div class="blur-overlay" />
      <div class="image-overlay" />

      <div
        class="content-wrapper "
      >
        <h3
          key="title"
          class=" font-weight-bold custom-font-size text-center text-shadow text-line-space mx-2 mx-md-3"
        >
          {{ title }}
        </h3>
      </div>
    </NuxtLink>
    <!-- </v-lazy> -->
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
    type: String,
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
.image-wrapper {
  position: relative;
  display: flex;
  height: 415px;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
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
  height: 100%;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
}

.custom-font-size {
  font-size: 28px!important;
}

@media screen and (max-width: 600px) {
  .image-wrapper {
    min-height: 120px;
    max-height: 120px;
    height: 120px;
    width: 150px;

  }
  .content-wrapper{
    padding: 0;
    justify-content: center;
  }
  .custom-font-size {
    font-size: 0.9rem!important;
    text-shadow: 10px 0 15px rgb(0, 0, 0)!important;
  }
}
</style>
