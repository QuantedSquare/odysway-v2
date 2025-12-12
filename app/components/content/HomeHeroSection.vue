<template>
  <section class="hero">
    <div
      v-if="showControls"
      class="hero-dev-controls"
    >
      <button
        class="hero-dev-btn"
        type="button"
        @click="useTestImage = !useTestImage"
      >
        {{ useTestImage ? 'Use main image' : 'Use test image' }}
      </button>
      <button
        class="hero-dev-btn"
        type="button"
        @click="noiseEnabled = !noiseEnabled"
      >
        {{ noiseEnabled ? 'Disable grain' : 'Enable grain' }}
      </button>
    </div>
    <div
      class="hero-image-bg"
      :class="{ 'hero-noise-enabled': noiseEnabled }"
    >
      <NuxtImg
        v-if="srcUrl"
        :key="activeImageKey"
        :src="srcUrl"
        :srcset="srcset"
        sizes="(max-width: 600px) 100vw, (max-width: 960px) 90vw, 100vw"
        alt="Image principale Hero d'Odysway"
        class="hero-image"
        :class="{ 'hero-image-dim': noiseEnabled }"
        format="webp"
        loading="eager"
        :preload="{
          fetchpriority: 'high',
        }"
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
      <SearchDialog>
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="glass-search-trigger mt-10"
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
  </section>
</template>

<script setup>
import { mdiMagnify } from '@mdi/js'
import imageUrlBuilder from '@sanity/image-url'

const { image, typewriterWords, imageTest } = defineProps({
  image: {
    type: Object,
    required: true,
  },
  imageTest: {
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
const showControls = computed(() => config.public.environment !== 'production')
const useTestImage = ref(config.public.environment !== 'production' ? true : false)
const noiseEnabled = ref(true)

const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const activeImage = computed(() => (useTestImage.value ? imageTest : image))
const activeImageKey = computed(() => activeImage.value?.asset?._ref || '')

// Build optimized Sanity URLs with proper sizes for each breakpoint
const buildSanityImageUrl = (width, height, quality = 75) => {
  if (!activeImage.value?.asset?._ref) return ''
  return builder
    .image(activeImage.value)
    .width(width)
    .height(height)
    .auto('format')
    .quality(quality)
    // Ensure Sanity hotspot/crop are respected
    .fit('crop')
    .url()
}

const heroReady = ref(false)

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    heroReady.value = true
  }, 0)
})

const srcUrl = computed(() => {
  if (!heroReady.value) return ''
  return buildSanityImageUrl(1920, 1080, 100)
})

const srcset = computed(() => {
  if (!heroReady.value) return ''
  return [
    `${buildSanityImageUrl(640, 360, 90)} 640w`,
    `${buildSanityImageUrl(960, 540, 90)} 960w`,
    `${buildSanityImageUrl(1280, 720, 90)} 1280w`,
    `${buildSanityImageUrl(1600, 900, 90)} 1600w`,
    `${buildSanityImageUrl(1920, 1080, 90)} 1920w`,
    `${buildSanityImageUrl(2560, 1440, 100)} 2560w`,
  ].join(', ')
})
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100dvh;
  width: 100vw;
  display: flex;
  align-items: center;
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

.hero-image-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  background-size: auto;
  opacity: 0;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.hero-noise-enabled::after {
  opacity: 0.1;
  filter: brightness(0.8) contrast(1.1);
}

.hero-image {
  width: 100vw;
  height: 100vh;
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
  border: 0;
  opacity: 1;
  transition: filter .4s;

  /* Use aspect-ratio to match the 16:9 images from Sanity */
  /* This ensures the rendered box matches the crop ratio, preventing extra cropping */
  aspect-ratio: 16 / 9;
  object-fit: cover;
  /* object-position: center; */
  min-height: 460px;
}

.hero-image-dim {
  filter: brightness(.8);
}

.hero-search {
  display: block;
  width: 100%;
  top: calc(56px + 40%);
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
  /* margin-top: 20vh; */
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
.custom-hero-subtitle:deep(p) {
margin-bottom: 0!important;
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

.hero-dev-controls {
  position: absolute;
  top: 10%;
  left: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.hero-dev-btn {
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.hero-dev-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-1px);
}

.hero-dev-btn:active {
  transform: translateY(0);
  background: rgba(0, 0, 0, 0.7);
}
</style>
