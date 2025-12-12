<template>
  <section class="hero">
    <div class="hero-search">
      <SearchDialog>
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="glass-search-trigger"
            role="button"
            tabindex="0"
          >
            <v-icon
              :icon="mdiMagnify"
              color="primary"
              size="24"
              class="mr-3 icon-search"
            />
            <span class="search-placeholder">Cap Vert, Népal, yoga, trek, février…</span>
          </div>
        </template>
      </SearchDialog>
    </div>
    <div class="hero-image-bg">
      <NuxtImg
        v-if="srcUrl"
        :src="srcUrl"
        :srcset="srcset"
        sizes="(max-width: 600px) 100vw, (max-width: 960px) 90vw, (max-width: 1280px) 85vw, 1280px"
        alt="Image principale Hero d'Odysway"
        class="hero-image"
        format="webp"
        loading="eager"
        fetchpriority="high"
        width="1536"
        height="900"
      />
    </div>
    <div class="hero-content">
      <h1>
        <slot name="title" />
      </h1>
      <h2 class="custom-hero-subtitle">
        <slot name="subtitle" />

        <span
          v-if="typewriterWords.length"
          class="typewriter-text text-center text-secondary font-italic"
          :class="{ 'typewriter-active': currentWord.length }"
        >
          {{ currentWord }}<span class="cursor text-secondary">|</span>
        </span>
      </h2>
    </div>
    <!-- <div class="hero-overlay h-100 d-flex align-center">
      <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow text-center">
        <v-row justify="center" align="center">
          <v-col cols="12" md="auto">
            <h1 class="custom-hero-title">
              <slot name="title" />
            </h1>
            <slot name="subtitle" />
          </v-col>
        </v-row>
      </v-container>
    </div>  -->
  </section>
</template>

<script setup>
import { mdiMagnify } from '@mdi/js'
import imageUrlBuilder from '@sanity/image-url'

const { image, typewriterWords } = defineProps({
  image: {
    type: Object,
    required: true,
  },
  typewriterWords: {
    type: Array,
    default: () => [],
  },
})

// Typewriter Logic
const currentWord = ref('')
const isDeleting = ref(false)
const wordIndex = ref(0)
const typingSpeed = ref(100)

onMounted(() => {
  if (typewriterWords.length) {
    typeLoop()
  }
})

const typeLoop = () => {
  const currentIndex = wordIndex.value % typewriterWords.length
  const fullWord = typewriterWords[currentIndex]

  if (isDeleting.value) {
    currentWord.value = fullWord.substring(0, currentWord.value.length - 1)
    typingSpeed.value = 50 // Deleting speed
  }
  else {
    currentWord.value = fullWord.substring(0, currentWord.value.length + 1)
    typingSpeed.value = 100 // Typing speed
  }

  if (!isDeleting.value && currentWord.value === fullWord) {
    // Word complete, pause before deleting
    typingSpeed.value = 1500
    isDeleting.value = true
  }
  else if (isDeleting.value && currentWord.value === '') {
    // Word deleted, move to next
    isDeleting.value = false
    wordIndex.value++
    typingSpeed.value = 500
  }

  setTimeout(typeLoop, typingSpeed.value)
}

const config = useRuntimeConfig()
const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

// Build optimized Sanity URLs with proper sizes for each breakpoint
const buildSanityImageUrl = (width, height, quality = 75) => {
  if (!image?.asset?._ref) return ''
  return builder
    .image(image)
    .width(width)
    .height(height)
    .auto('format')
    .quality(quality)
    .fit('crop')
    .url()
}

const srcUrl = computed(() => {
  // Default to 800px as fallback for common desktop viewport
  return buildSanityImageUrl(1000, 563, 100)
})

const srcset = computed(() => {
  // Generate srcset matching actual container widths accounting for padding
  // Heights calculated to maintain 1.7:1 aspect ratio (hero section aspect)
  return [
    `${buildSanityImageUrl(400, 225, 100)} 400w`, // 400px image = 225px height (16:9)
    `${buildSanityImageUrl(600, 338, 100)} 600w`, // 600px image = 338px height (16:9)
    `${buildSanityImageUrl(800, 450, 100)} 800w`, // 800px image = 450px height (16:9)
    `${buildSanityImageUrl(1000, 563, 100)} 1000w`, // 1000px image = 563px height (16:9)
    `${buildSanityImageUrl(1400, 788, 100)} 1400w`, // 1400px image = 788px height (16:9)
  ].join(', ')
})
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100dvh;
  width: 100vw;
  display: flex;
  align-items: start;
  justify-content: center;
  overflow: hidden;
  isolation: isolate;
}

.hero-image-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.hero-image {
  width: 100vw;
  height: 100vh;
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
  border: 0;
  opacity: 1;
  /* background: var(--color-primary-beige); */
  transition: filter .4s;
  /* filter: brightness(.8) contrast(1.1); */
}

.hero-search {
  display: block;
  width: 100%;
  top: calc(56px + 70%);
  z-index: 3;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  justify-content: center;
  color: #fff;
  /* width:  min(90vw, 1024px); */
  width: 100%;
  margin-inline: auto;
  margin-top: 20vh;
  padding: 2rem 2vw;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-content h1:deep(p) {
  margin-block: 0 12px;
  text-wrap: balance;
  font-size: clamp(40px, 6vw, 76px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -1.5px;
  color: #FBF0EC;
  animation: fadeSlideUp 0.8s ease-out forwards;
}

.hero-content h2 {
  font-size: clamp(18px, 2.5vw, 24px);
  line-height: 1.5;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
  animation: fadeSlideUp 0.8s ease-out 0.2s forwards;
  max-width: 800px;
  margin-inline: auto;
  /* Flexbox to keep text centered but allow dynamic part to grow */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .custom-hero-subtitle {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .typewriter-text {
    margin-left: 0;
  }
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glass Search Trigger Styles */
.glass-search-trigger {
  width: min(90vw, 600px);
  height: 64px;
  /* Slightly taller for more presence */
  /* background: rgba(255, 255, 255, 0.15); */
  background: #FBF0EC;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);

  /* Double border trick using shadow for 3D glass effect */
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    /* Top inner highlight */
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    /* Bottom inner shadow */
    0 8px 32px rgba(0, 0, 0, 0.2);
  /* Deep drop shadow */

  border-radius: 100px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  cursor: pointer;

  /* Animation */
  opacity: 0;
  /* Start hidden for animation */
  animation: fadeSlideUp 0.8s ease-out 0.4s forwards;

  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.hero-content h2:deep(p) {
  color: rgba(251, 240, 236, 1)!important;
}

/* Shimmer Effect on Hover */
.glass-search-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  transform: skewX(-20deg);
  transition: 0.5s;
}

.glass-search-trigger:hover::before {
  animation: shimmer 1.5s infinite;
}

.glass-search-trigger:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px) scale(1.01);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 12px 40px rgba(0, 0, 0, 0.25);
}

.glass-search-trigger:active {
  transform: translateY(0) scale(0.99);
}
.glass-search-trigger:hover .icon-search {
  color:white!important;
}
.glass-search-trigger:hover .search-placeholder {
  color:white!important;
}
.search-placeholder {
  color: rgb(var(--v-theme-primary));
  /* color: rgba(255, 255, 255, 0.95); */
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(207, 207, 207, 0.1);
}

@keyframes shimmer {
  100% {
    left: 200%;
  }
}

/* Typewriter Cursor */
.typewriter-text {
  white-space: pre;
  display: inline-flex;
  align-items: center;
  position: relative;
  padding: 6px 14px;
  margin-left: 6px;
  text-align: left;
  min-width: 0;
  z-index: 0;
}

.typewriter-text::before {
  content: '';
  position: absolute;
  inset: 0;
  left: -2px;
  right: -5px;
  background: rgba(255, 255, 255, 1);
  border-radius: 6px;
  transform: skew(-20deg) scaleX(0.96);
  transform-origin: left center;
  opacity: 0;
  transition: opacity 180ms ease, transform 180ms ease;
  z-index: -1;
}

.typewriter-active::before {
  opacity: 1;
  transform:  skew(-20deg) scaleX(0.96);
}

.cursor {
  display: inline-block;
  font-weight: 100;
  color: rgba(255, 255, 255, 0.7);
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
