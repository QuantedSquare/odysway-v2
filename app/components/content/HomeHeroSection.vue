<template>
  <section class="hero">
    <!-- <div
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
      <button
        class="hero-dev-btn"
        type="button"
        @click="adjustNoise(0.05)"
      >
        Grain +
      </button>
      <button
        class="hero-dev-btn"
        type="button"
        @click="adjustNoise(-0.05)"
      >
        Grain -
      </button>
      <span class="hero-dev-badge">Grain: {{ (noiseLevelValue * 100).toFixed(0) }}%</span>
    </div> -->
    <div
      class="hero-image-bg"
      :class="{ 'hero-noise-enabled': noiseEnabled }"
      :style="{ '--hero-noise-opacity': noiseLevelValue }"
    >
      <NuxtImg
        v-if="displayedSrc"
        :key="activeImageKey"
        :src="displayedSrc"
        :srcset="displayedSrcset"
        sizes="(max-width: 600px) 100vw, (max-width: 960px) 90vw, 100vw"
        alt="Image principale Hero d'Odysway"
        class="hero-image"
        :class="{ 'hero-image-dim': noiseEnabled }"
        format="webp"
        loading="eager"
        fetchpriority="high"
        width="1536"
        height="900"
      />
    </div>
    <div class="hero-content">
      <h1 class="text-white">
        <template v-if="titleText">
          {{ titleText }}
        </template>
        <slot
          v-else
          name="title"
        />
      </h1>
      <h2 class="custom-hero-subtitle text-white">
        <template v-if="subtitleText">
          {{ subtitleText }}
        </template>
        <slot
          v-else
          name="subtitle"
        />
        <span
          v-if="typewriterWords.length"
          class="typewriter-text text-center font-italic"
          :class="{ 'typewriter-active': currentWord.length }"
        >
          {{ currentWord }}<span class="cursor">|</span>
        </span>
      </h2>
      <div
        class="glass-search-trigger mt-10"
        role="button"
        tabindex="0"
        @click="openSearchDialog"
        @keydown.enter="openSearchDialog"
      >
        <v-icon
          :icon="mdiMagnify"
          color="primary"
          size="24"
          class="mr-3 icon-search"
        />
        <span class="search-placeholder">{{ placeholder }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { mdiMagnify } from '@mdi/js'
import imageUrlBuilder from '@sanity/image-url'
import { useSearchDialog } from '~/composables/useSearchDialog'

const { openDialog: openSearchDialog } = useSearchDialog()

const heroProps = defineProps({
  image: {
    type: Object,
    required: true,
  },
  imageTest: {
    type: Object,
    required: true,
  },
  imageMobile: {
    type: Object,
    required: true,
  },
  imageMobileTest: {
    type: Object,
    required: true,
  },
  typewriterWords: {
    type: Array,
    default: () => [],
  },
  noiseLevel: {
    type: Number,
    default: 0.05,
  },
  placeholder: {
    type: String,
    default: '',
  },
  placeholderImage: {
    type: Object,
    required: true,
  },
  // Plain-text title/subtitle. When provided, the h1/h2 render text
  // directly and skip <EnrichedText>/<PortableText> on the LCP path —
  // major LCP win because we no longer wait on portable-text hydration.
  // Slots stay as fallback so existing callers don't break.
  titleText: {
    type: String,
    default: '',
  },
  subtitleText: {
    type: String,
    default: '',
  },
})

const typewriterWords = computed(() => heroProps.typewriterWords || [])
// Typewriter Logic
const currentWord = ref('')
const isDeleting = ref(false)
const wordIndex = ref(0)
const typingSpeed = ref(100)

onMounted(() => {
  if (!typewriterWords.value.length) return
  // Delay 800ms so the typewriter doesn't compete with the LCP paint
  // for main-thread time on slow devices.
  setTimeout(() => {
    requestAnimationFrame(typeLoop)
  }, 800)
})

const typeLoop = () => {
  const currentIndex = wordIndex.value % typewriterWords.value.length
  const fullWord = typewriterWords.value[currentIndex]

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

  // rAF aligns DOM updates with the paint cycle so we don't queue
  // synchronous reflow work between frames.
  setTimeout(() => requestAnimationFrame(typeLoop), typingSpeed.value)
}

const config = useRuntimeConfig()
// const showControls = computed(() => config.public.environment !== 'production')
// const useTestImage = ref(config.public.environment !== 'production' ? true : false)
const noiseEnabled = ref(true)
const clampNoise = (value) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0.1
  return Math.min(Math.max(parsed, 0), 1)
}
const noiseLevelLocal = ref(clampNoise(heroProps.noiseLevel ?? 0.1))

const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const activeDesktopImage = computed(() => (heroProps.image))
const activeMobileImage = computed(() => (heroProps.imageMobile))
const activeImageKey = computed(() => `${activeDesktopImage.value?.asset?._ref || ''}-${activeMobileImage.value?.asset?._ref || ''}`)
const noiseLevelValue = computed(() => {
  return clampNoise(noiseLevelLocal.value)
})

// const adjustNoise = (delta) => {
//   noiseLevelLocal.value = clampNoise(noiseLevelLocal.value + delta)
// }

// Build optimized Sanity URLs with proper sizes for each breakpoint
const buildSanityImageUrl = (source, width, height, quality = 75) => {
  if (!source?.asset?._ref) return ''
  return builder
    .image(source)
    .width(width)
    .height(height)
    .auto('format')
    .quality(quality)
    // Ensure Sanity hotspot/crop are respected
    .fit('crop')
    .url()
}

// Use the mobile-cropped image as the base src so the browser's prefetch
// heuristic picks a small file on mobile instead of the desktop landscape crop.
const displayedSrc = computed(() => {
  return buildSanityImageUrl(activeMobileImage.value, 640, 360, 70)
    || buildSanityImageUrl(activeDesktopImage.value, 1280, 720, 70)
    || buildSanityImageUrl(heroProps.placeholderImage, 1280, 720, 70)
})

// Trimmed from 6 srcset entries down to 3 — the in-between sizes were
// rarely picked by the browser yet inflated the rendered HTML and
// triggered 3 extra builder.image() calls per render.
const displayedSrcset = computed(() => {
  return [
    `${buildSanityImageUrl(activeMobileImage.value, 640, 360, 70)} 640w`,
    `${buildSanityImageUrl(activeMobileImage.value, 1280, 720, 70)} 1280w`,
    `${buildSanityImageUrl(activeDesktopImage.value, 1920, 1080, 70)} 1920w`,
  ].filter(Boolean).join(', ')
})

// Preload the LCP image, but only on viewports ≤ 600px. The previous
// attempt was reverted because preloading the full srcset on slow 4G
// competed with the 3 font weights — by limiting the preload to a single
// 640w mobile URL we get the early-discovery win without starving fonts.
// Desktop falls back to the existing fetchpriority="high" on <NuxtImg>.
const isMobileViewport = ref(false)
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    isMobileViewport.value = window.matchMedia('(max-width: 600px)').matches
  }
})

useHead(() => {
  if (!isMobileViewport.value || !displayedSrc.value) return {}
  return {
    link: [{
      rel: 'preload',
      as: 'image',
      fetchpriority: 'high',
      href: displayedSrc.value,
    }],
  }
})
</script>

<style scoped>
.hero {
  position: relative;
  /* svh = small viewport height; doesn't recompute when the mobile
     URL bar collapses, avoiding layout thrash on first paint. */
  min-height: 100svh;
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
  background-image: url('/noise.webp');
  background-repeat: repeat;
  background-size: auto;
  opacity: 0;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.hero-noise-enabled::after {
  opacity: var(--hero-noise-opacity, 0.1);
  filter: brightness(0.8) contrast(1.1);
}

/* Skip the grain layer on mobile: avoids the noise.webp request and
   the mix-blend-mode compositor layer, which is the more impactful
   cost on low-power devices. Desktop visual unchanged. */
@media (max-width: 600px) {
  .hero-image-bg::after,
  .hero-noise-enabled::after {
    display: none;
  }
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

.hero-content h1,
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
.hero-content h1 {
  /* Reset h1 default margins so plain-text rendering matches the
     :deep(p) variant exactly. */
  padding: 0;
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

/* Animate translate only so the LCP candidate paints immediately
   instead of waiting on opacity transition. */
@keyframes fadeSlideUp {
  from {
    transform: translateY(20px);
  }

  to {
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

  border-radius: 20px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  cursor: pointer;

  /* Animation (translate only, paints immediately for LCP) */
  animation: fadeSlideUp 0.8s ease-out 0.4s forwards;

  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.glass-search-trigger {
  width: min(90vw, 600px);
}
@media (max-width: 600px) {
  .glass-search-trigger {
    width: min(94vw, 480px);
    height: 45px;
    padding: 0 16px;
  }
  .search-placeholder {
    font-size: 12px!important;
  }
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
  /* transform: skewX(-20deg); */
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
  font-weight: 200;
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
.typewriter-text,  .cursor {
  color: rgba(var(--v-theme-secondary), 0.8)!important;
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
  /* transform: skew(-20deg) scaleX(0.96); */
  transform-origin: left center;
  opacity: 0;
  transition: opacity 180ms ease, transform 180ms ease;
  z-index: -1;
}

.typewriter-active::before {
  opacity: 1;
  /* transform:  skew(-20deg) scaleX(0.96); */
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
  top: 15%;
  opacity: 50%;
  left: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
}
@media (max-width: 600px) {
  .hero-dev-controls {
    top: 90%;
    opacity: 50%;
  }
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

.hero-dev-badge {
  align-self: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 6px 10px;
  color: #fff;
  font-size: 12px;
  backdrop-filter: blur(4px);
}
</style>
