<template>
  <section
    class="vision-hero"
    aria-label="Notre vision"
  >
    <NuxtImg
      v-if="heroSrc"
      :src="heroSrc"
      :srcset="heroSrcset"
      sizes="(max-width: 600px) 100vw, (max-width: 960px) 960px, 1600px"
      :alt="image?.alt || title"
      class="vision-hero__img"
      format="webp"
      loading="eager"
      fetchpriority="high"
      width="1600"
      height="900"
    />
    <div class="vision-hero__veil" />
    <div class="vision-hero__content">
      <!-- Restores the layout inset the section bleeds out of, so the inner
           container lines up with the body sections at every width. -->
      <div class="vision-hero__inset">
        <div class="vision-container">
          <h1>{{ title }}</h1>
          <p v-if="subtitle">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { getImageUrl } from '~/utils/getImageUrl'

const props = defineProps({
  image: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: 'Notre vision du voyage',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const assetRef = computed(() => props.image?.asset?._ref)
const heroSrc = computed(() => (assetRef.value ? getImageUrl(assetRef.value, null, null, 1600) : ''))
const heroSrcset = computed(() => {
  if (!assetRef.value) return ''
  return [640, 960, 1600]
    .map(w => `${getImageUrl(assetRef.value, null, null, w)} ${w}w`)
    .join(', ')
})
</script>

<style scoped>
/* Edge-to-edge hero: the `simple-pages` layout insets <v-main> by 4px (px-1)
   and, from the md breakpoint up, another 20px (mx-md-5). Cancelling exactly
   that inset — rather than using 100vw — keeps the hero flush with the window
   on both sides without ever overflowing past a classic scrollbar. */
.vision-hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 520px;
  overflow: hidden;
  background-color: rgb(var(--v-theme-primary));
  width: calc(100% + 8px);
  margin-inline: -4px;
}

@media (min-width: 960px) {
  .vision-hero {
    width: calc(100% + 48px);
    margin-inline: -24px;
  }
}

.vision-hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vision-hero__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(12, 22, 20, 0.75), rgba(12, 22, 20, 0.15) 60%);
}

/* The inner container matches the body sections, so the h1 lines up with the
   page text below it. */
.vision-hero__content {
  position: relative;
  width: 100%;
  padding-bottom: 50px;
  color: #fff;
}

.vision-hero__inset {
  padding-inline: 4px;
}

@media (min-width: 960px) {
  .vision-hero__inset {
    padding-inline: 24px;
  }
}

/* Same box as every other section of the page. */
.vision-container {
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 32px;
}

.vision-hero h1 {
  margin: 0 0 14px;
  max-width: 720px;
  font-size: 56px;
  font-weight: 600;
  line-height: 1.05;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
}

.vision-hero p {
  margin: 0;
  max-width: 560px;
  font-size: 19px;
  line-height: 1.6;
}

@media (max-width: 960px) {
  .vision-hero {
    min-height: 440px;
  }

  .vision-hero__content {
    padding-bottom: 34px;
  }

  .vision-container {
    padding-inline: 20px;
  }

  .vision-hero h1 {
    font-size: 31px;
    line-height: 1.1;
  }

  .vision-hero p {
    font-size: 16px;
  }
}

@media (max-width: 420px) {
  .vision-hero h1 {
    font-size: 28px;
  }
}
</style>
