<template>
  <v-col
    cols="12"
    sm="4"
    md="3"
  >
    <NuxtLink
      :to="`/thematiques/${slug}`"
      class="image-wrapper"
      :class="{
        'default-expanded': isMobile,
      }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <v-img
        v-if="image"
        :src="imgComp(image, { format: 'webp', quality: 70, width: 1024 })"
        width="100%"
        :alt="title"
        cover
      />

      <div class="blur-overlay" />
      <div class="image-overlay" />

      <TransitionGroup
        name="slide"
        class="content-wrapper"
        tag="div"
      >
        <h3
          key="title"
          class="text-h4 text-lg-h2 text-center text-shadow"
        >
          {{ title }}
        </h3>
        <p
          v-if="isHovered || isMobile"
          key="description"
          class="description text-shadow text-center"
        >
          Cliquez pour en apprendre plus à propos des {{ title }}
          <client-only>
            <v-btn
              v-if="isMobile"
              class="explore-btn mt-4"
              :to="`/thematiques/${slug}`"
              @click.stop
            >
              Explorez
            </v-btn>
          </client-only>
        </p>
      </TransitionGroup>
    </NuxtLink>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

const imgComp = useImage()
const isMobile = ref(false)
const isHovered = ref(false)
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
})
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 960
  }

  checkMobile()
  window.addEventListener('resize', checkMobile)

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
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
  border-radius: 1rem;
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
  padding: 2rem;
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

@media screen and (max-width: 1280px) {
  h3 {
    font-size: 1.5rem !important;
  }
}

@media screen and (max-width: 600px) {
  .image-wrapper {
    height: 16rem;
  }
}
</style>
