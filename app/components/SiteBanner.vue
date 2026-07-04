<template>
  <Teleport to="body">
    <Transition name="banner">
      <div
        v-if="visible"
        class="site-banner-wrap"
      >
        <aside
          class="site-banner"
          :class="`site-banner--${banner.variant || 'primary'}`"
          aria-label="Annonce"
        >
          <span
            class="site-banner__shine"
            aria-hidden="true"
          />

          <div class="site-banner__content">
            <PortableText
              :value="banner.content"
              :components="ptComponents"
            />
            <v-btn
              v-if="banner.ctaLabel && banner.ctaHref"
              v-bind="ctaLinkProps"
              class="site-banner__cta"
              size="small"
              variant="flat"
              rounded="pill"
            >
              {{ banner.ctaLabel }}
            </v-btn>
          </div>

          <button
            type="button"
            class="site-banner__close"
            aria-label="Fermer l'annonce"
            @click="dismiss"
          >
            <v-icon size="20">
              {{ mdiClose }}
            </v-icon>
          </button>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import { h, resolveComponent } from 'vue'
import { PortableText } from '@portabletext/vue'

const DISMISS_KEY = 'odysway-banner-dismissed'

const bannerQuery = groq`*[_type == "siteBanner"][0]{
  _rev,
  enabled,
  variant,
  ctaLabel,
  ctaHref,
  content[]{
    ...,
    _type == "image" => { ..., "url": asset->url }
  }
}`
const { data: banner } = await useSanityQuery(bannerQuery)

// Resolve dismissal client-side only: keeps SSR output empty (no hydration
// mismatch) and lets the enter animation play on mount.
const dismissed = ref(false)
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
  dismissed.value = window.localStorage.getItem(DISMISS_KEY) === banner.value?._rev
})

const visible = computed(
  () => mounted.value && Boolean(banner.value?.enabled) && !dismissed.value,
)

// External links (http/https) open in a new tab, internal paths use the router.
const ctaLinkProps = computed(() => {
  const href = banner.value?.ctaHref || ''
  return href.startsWith('http')
    ? { href, target: '_blank', rel: 'noopener' }
    : { to: href }
})

function dismiss() {
  dismissed.value = true
  // Keyed on the document revision so editing the banner re-shows it.
  window.localStorage.setItem(DISMISS_KEY, banner.value?._rev || '')
}

// Compact portable-text renderer tuned for a single inline banner line.
const ptComponents = {
  types: {
    image: ({ value }) =>
      h('img', {
        src: value.asset?.url || value.url || '',
        alt: value.alt || '',
        class: 'site-banner__img',
      }),
  },
  marks: {
    link: (props) => {
      const href = props.value?.href || ''
      if (href.startsWith('/')) {
        const NuxtLink = resolveComponent('NuxtLink')
        return h(NuxtLink, { to: href, class: 'site-banner__link' }, () => props.text)
      }
      return h(
        'a',
        {
          href,
          target: props.value?.openInNewTab ? '_blank' : undefined,
          rel: props.value?.openInNewTab ? 'noopener noreferrer' : undefined,
          class: 'site-banner__link',
        },
        props.text,
      )
    },
  },
}
</script>

<style scoped>
.site-banner-wrap {
  position: fixed;
  top: 104px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 12px;
  z-index: 1500;
  pointer-events: none;
}

.site-banner {
  position: relative;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: min(720px, calc(100vw - 24px));
  padding: 9px 46px 9px 22px;
  border-radius: 999px;
  overflow: hidden;
  box-shadow:
    0 12px 30px -10px rgba(43, 76, 82, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.08);
  animation: banner-float 6s ease-in-out infinite;
  will-change: transform;
}

/* Variants ---------------------------------------------------------------- */
.site-banner--primary {
  background: linear-gradient(135deg, #2b4c52 0%, #237c8c 100%);
  color: #fff;
}

.site-banner--secondary {
  background: linear-gradient(135deg, #db6644 0%, #f0b348 100%);
  color: #fff;
}

.site-banner--soft-blush {
  background: linear-gradient(135deg, #fbf0ec 0%, #fdf6f2 100%);
  color: #2b4c52;
  border: 1px solid rgba(43, 76, 82, 0.12);
}

/* Content ----------------------------------------------------------------- */
.site-banner__content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 12px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.3;
}

.site-banner__content :deep(p) {
  margin: 0;
  display: inline;
}

.site-banner__content :deep(strong) {
  font-weight: 700;
}

/* Links and images are produced by PortableText render functions, so they
   don't carry the scoped data-v attribute — reach them with :deep(). */
.site-banner__content :deep(.site-banner__link) {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.site-banner__content :deep(.site-banner__img) {
  height: 26px;
  width: auto;
  max-width: 120px;
  vertical-align: middle;
  display: inline-block;
  margin: 0 2px;
  border-radius: 6px;
  object-fit: cover;
}

/* CTA --------------------------------------------------------------------- */
.site-banner__cta {
  background: #fff !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.site-banner__cta:hover {
  transform: translateY(-1px) scale(1.03);
}

.site-banner--primary .site-banner__cta {
  color: #2b4c52 !important;
}

.site-banner--secondary .site-banner__cta {
  color: #db6644 !important;
}

.site-banner--soft-blush .site-banner__cta {
  background: #2b4c52 !important;
  color: #fff !important;
}

/* Close ------------------------------------------------------------------- */
.site-banner__close {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: inherit;
  opacity: 0.75;
  transition: opacity 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.site-banner__close:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-50%) rotate(90deg);
}

.site-banner--soft-blush .site-banner__close:hover {
  background-color: rgba(43, 76, 82, 0.1);
}

/* Internal shine sweep ---------------------------------------------------- */
.site-banner__shine {
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent,
    rgba(255, 255, 255, 0.35),
    transparent
  );
  transform: skewX(-20deg);
  animation: banner-shine 5.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes banner-shine {
  0%,
  55% {
    left: -60%;
  }
  100% {
    left: 150%;
  }
}

@keyframes banner-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Enter / leave ----------------------------------------------------------- */
.banner-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.banner-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.35s ease;
}

.banner-enter-from {
  opacity: 0;
  transform: translateY(-18px) scale(0.96);
}

.banner-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

/* Responsive -------------------------------------------------------------- */
@media (max-width: 960px) {
  .site-banner-wrap {
    top: 72px;
  }

  .site-banner {
    padding: 8px 42px 8px 18px;
  }

  .site-banner__content {
    font-size: 0.82rem;
  }

  .site-banner__content :deep(.site-banner__img) {
    height: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-banner,
  .site-banner__shine {
    animation: none;
  }

  .banner-enter-active,
  .banner-leave-active {
    transition: opacity 0.2s ease;
  }

  .banner-enter-from,
  .banner-leave-to {
    transform: none;
  }
}
</style>
