<template>
  <div
    v-if="visible"
    class="site-banner d-flex align-center justify-center flex-wrap ga-3 px-4 py-2"
    :class="`bg-${banner.variant || 'primary'}`"
  >
    <span class="site-banner-text text-body-2 text-md-body-1 text-center">
      {{ banner.text }}
    </span>

    <v-btn
      v-if="banner.ctaLabel && banner.ctaHref"
      v-bind="ctaLinkProps"
      size="small"
      variant="flat"
      color="white"
      class="text-primary"
      rounded="default"
    >
      {{ banner.ctaLabel }}
    </v-btn>

    <v-btn
      icon
      size="x-small"
      variant="text"
      class="site-banner-close"
      aria-label="Fermer la bannière"
      @click="dismiss"
    >
      <v-icon>{{ mdiClose }}</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { mdiClose } from '@mdi/js'

const DISMISS_KEY = 'odysway-banner-dismissed'

const bannerQuery = groq`*[_type == "siteBanner"][0]{ enabled, text, ctaLabel, ctaHref, variant }`
const { data: banner } = await useSanityQuery(bannerQuery)

// Tracks the user's dismissal. Kept null during SSR to avoid a hydration
// mismatch; resolved on mount from localStorage.
const dismissed = ref(false)

onMounted(() => {
  const stored = window.localStorage.getItem(DISMISS_KEY)
  // Re-show the banner whenever its text changes.
  dismissed.value = stored === banner.value?.text
})

const visible = computed(() => Boolean(banner.value?.enabled) && !dismissed.value)

// External links (https://) open in a new tab, internal paths use the router.
const ctaLinkProps = computed(() => {
  const href = banner.value?.ctaHref || ''
  return href.includes('https://')
    ? { href, target: '_blank', rel: 'noopener' }
    : { to: href }
})

function dismiss() {
  dismissed.value = true
  window.localStorage.setItem(DISMISS_KEY, banner.value?.text || '')
}
</script>

<style scoped>
.site-banner {
  position: sticky;
  top: 90px;
  z-index: 1998;
  width: 100%;
}

.site-banner-text {
  color: white;
}

.site-banner-close {
  color: white;
}

@media (max-width: 960px) {
  .site-banner {
    top: 60px;
  }
}
</style>
