<template>
  <aside
    v-if="visible"
    ref="root"
    class="site-banner"
    :class="[`site-banner--${banner.variant || 'primary'}`, { 'site-banner--open': expanded }]"
    role="region"
    aria-label="Information Odysway"
  >
    <div
      class="site-banner__inner"
      @click="onBarClick"
    >
      <span
        v-if="banner.tag"
        class="site-banner__tag"
      >
        {{ banner.tag }}
      </span>

      <div
        id="site-banner-body"
        class="site-banner__body"
      >
        <div class="site-banner__text">
          <PortableText
            :value="banner.content"
            :components="ptComponents"
          />
        </div>

        <NuxtLink
          v-if="banner.ctaLabel && banner.ctaHref"
          :to="banner.ctaHref"
          :target="isExternalCta ? '_blank' : undefined"
          :rel="isExternalCta ? 'noopener' : undefined"
          class="site-banner__cta"
          @click.stop
        >
          {{ banner.ctaLabel }}
          <v-icon size="14">
            {{ mdiArrowRight }}
          </v-icon>
        </NuxtLink>
      </div>

      <!-- Compact viewports only: the message is truncated to one line and this
           chevron reveals the full text + the CTA (see the max-width media
           query). Rendered unconditionally so SSR never depends on breakpoint. -->
      <button
        type="button"
        class="site-banner__toggle"
        :aria-expanded="expanded"
        aria-controls="site-banner-body"
        :aria-label="expanded ? 'Réduire le message' : 'Lire le message complet'"
        @click.stop="toggle"
      >
        <v-icon size="20">
          {{ mdiChevronDown }}
        </v-icon>
      </button>

      <button
        v-if="banner.dismissible !== false"
        type="button"
        class="site-banner__close"
        aria-label="Fermer le bandeau"
        @click.stop="dismiss"
      >
        <v-icon size="18">
          {{ mdiClose }}
        </v-icon>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { mdiArrowRight, mdiChevronDown, mdiClose } from '@mdi/js'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { h, resolveComponent } from 'vue'
import { PortableText } from '@portabletext/vue'

const DISMISS_KEY = 'odysway-banner-dismissed'
// Set pre-hydration by the inline script below, and read by the stylesheet, so a
// visitor who already closed the banner never sees it flash back in.
const DISMISSED_CLASS = 'odysway-banner-dismissed'
// Must stay in sync with the `max-width` media query in the stylesheet.
const COMPACT_QUERY = '(max-width: 959.98px)'

const bannerQuery = groq`*[_type == "siteBanner"][0]{
  _rev,
  enabled,
  variant,
  tag,
  ctaLabel,
  ctaHref,
  dismissible,
  startDate,
  endDate,
  content[]{
    ...,
    _type == "image" => { ..., "url": asset->url }
  }
}`
const { data: banner } = await useSanityQuery(bannerQuery)

const root = ref(null)
const expanded = ref(false)
const dismissed = ref(false)
const isCompact = useMediaQuery(COMPACT_QUERY)

// Pages are served through ISR (1 to 5 days), so the server-rendered "now" can
// be days old. Re-reading the clock on mount is what actually enforces the
// display window on a cached page.
const now = ref(Date.now())

const withinWindow = computed(() => {
  const start = banner.value?.startDate
  const end = banner.value?.endDate
  if (start && now.value < Date.parse(start)) return false
  if (end && now.value > Date.parse(end)) return false
  return true
})

// Rendered server-side (the banner is part of the first paint, so it costs no
// layout shift). `dismissed` intentionally stays false until mounted: flipping
// it during setup would desync SSR and client markup.
const visible = computed(() => Boolean(banner.value?.enabled)
  && Boolean(banner.value?.content?.length)
  && withinWindow.value
  && !dismissed.value)

const isExternalCta = computed(() => (banner.value?.ctaHref || '').startsWith('http'))

if (banner.value?.enabled) {
  // Runs before the banner markup is parsed: hides it via CSS when this exact
  // revision was already dismissed, which avoids both a flash and the upward
  // layout shift that removing the node on mount would cause.
  useHead({
    script: [{
      key: 'site-banner-dismissed',
      tagPosition: 'head',
      innerHTML: `try{if(localStorage.getItem('${DISMISS_KEY}')===${JSON.stringify(banner.value._rev || '')})document.documentElement.classList.add('${DISMISSED_CLASS}')}catch(e){}`,
    }],
  })
}

// The banner sits in the normal flow above <TopBar>, but both headers are
// `position: fixed`, so they need to be pushed down by whatever part of the
// banner is still on screen. `--site-banner-offset` carries that value; the
// stylesheet ships a static fallback for the pre-hydration paint.
let bannerHeight = 0
let lastOffset = -1

function writeOffset(px) {
  if (px === lastOffset) return
  lastOffset = px
  document.body.style.setProperty('--site-banner-offset', `${px}px`)
}

function clearOffset() {
  lastOffset = -1
  document.body.style.removeProperty('--site-banner-offset')
}

function syncOffset() {
  writeOffset(Math.max(0, bannerHeight - window.scrollY))
}

function measure() {
  if (!root.value) return
  bannerHeight = root.value.offsetHeight
  syncOffset()
}

function toggle() {
  expanded.value = !expanded.value
}

// Tapping the collapsed bar expands it — the truncated line is a teaser, so the
// whole strip is the target rather than the chevron alone.
function onBarClick() {
  if (!isCompact.value || expanded.value) return
  expanded.value = true
}

function dismiss() {
  dismissed.value = true
  expanded.value = false
  clearOffset()
  document.documentElement.classList.add(DISMISSED_CLASS)
  try {
    // Keyed on the document revision so editing the banner re-shows it.
    window.localStorage.setItem(DISMISS_KEY, banner.value?._rev || '')
  }
  catch {
    // Private mode / storage disabled: the banner simply comes back next visit.
  }
}

// Registered at setup level so @vueuse can dispose them with the component
// (both are no-ops during SSR).
useEventListener('scroll', () => {
  // Cheap: the height is cached, and writeOffset() skips identical values, so
  // scrolling below the banner costs nothing.
  syncOffset()
  // Scrolling away closes the expanded compact panel.
  if (lastOffset === 0 && expanded.value) expanded.value = false
}, { passive: true })
useEventListener('resize', measure, { passive: true })

// Expanding grows the banner, which has to push the fixed headers down too.
watch([expanded, isCompact], () => {
  if (!isCompact.value) expanded.value = false
  nextTick(measure)
})

onMounted(() => {
  now.value = Date.now()
  try {
    dismissed.value = window.localStorage.getItem(DISMISS_KEY) === banner.value?._rev
  }
  catch {
    dismissed.value = false
  }
  if (visible.value) nextTick(measure)
})

onBeforeUnmount(clearOffset)

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

<style>
/* Global on purpose: the fixed headers live in another component, and this is
   the value they read. It also has to be correct on the very first paint,
   before hydration can measure the real height — `:has()` keeps it scoped to
   pages that actually render a banner. */
body:has(.site-banner) {
  /* Static bar height, for full-screen blocks that need to fit under the
     banner (hero). Never scroll-linked, so it can't resize content. */
  --site-banner-h: 40px;
  --site-banner-offset: 40px;
}

@media (max-width: 959.98px) {
  body:has(.site-banner) {
    --site-banner-h: 44px;
    --site-banner-offset: 44px;
  }
}

/* Dismissed in a previous visit: hidden before the browser paints it. */
html.odysway-banner-dismissed .site-banner {
  display: none;
}

html.odysway-banner-dismissed body {
  --site-banner-h: 0px;
  --site-banner-offset: 0px;
}
</style>

<style scoped>
.site-banner {
  position: relative;
  flex: none;
  /* Above both headers (1999) so the expanded panel can overlap them while
     they catch up with their own `top` transition. */
  z-index: 2000;
  background: var(--sb-bg);
  color: var(--sb-fg);
}

/* Variants ---------------------------------------------------------------- */
.site-banner--primary {
  --sb-bg: #2b4c52;
  --sb-fg: #fff;
  --sb-tag-bg: #de5e2c;
  --sb-tag-fg: #fff;
  --sb-cta-bg: #fff;
  --sb-cta-fg: #2b4c52;
  --sb-hover: rgba(255, 255, 255, 0.16);
}

.site-banner--secondary {
  --sb-bg: #db6644;
  --sb-fg: #fff;
  --sb-tag-bg: #2b4c52;
  --sb-tag-fg: #fff;
  --sb-cta-bg: #fff;
  --sb-cta-fg: #db6644;
  --sb-hover: rgba(255, 255, 255, 0.18);
}

.site-banner--soft-blush {
  --sb-bg: #fbf0ec;
  --sb-fg: #2b4c52;
  --sb-tag-bg: #de5e2c;
  --sb-tag-fg: #fff;
  --sb-cta-bg: #2b4c52;
  --sb-cta-fg: #fff;
  --sb-hover: rgba(43, 76, 82, 0.08);

  border-bottom: 1px solid rgba(43, 76, 82, 0.12);
}

/* Row --------------------------------------------------------------------- */
.site-banner__inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 40px;
  max-width: 1440px;
  margin-inline: auto;
  padding: 6px 56px;
  font-size: 13.5px;
  line-height: 1.35;
}

/* Desktop keeps tag / text / CTA on one centered line. */
.site-banner__body {
  display: contents;
}

.site-banner__tag {
  flex: none;
  padding: 3px 10px;
  border-radius: 30px;
  background: var(--sb-tag-bg);
  color: var(--sb-tag-fg);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
}

.site-banner__text {
  min-width: 0;
  font-weight: 500;
}

/* Links and images come from PortableText render functions, so they don't
   carry the scoped data-v attribute — reach them with :deep(). */
.site-banner__text :deep(p) {
  margin: 0;
}

.site-banner__text :deep(strong) {
  font-weight: 700;
}

.site-banner__text :deep(.site-banner__link) {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.2s ease;
}

.site-banner__text :deep(.site-banner__link:hover) {
  opacity: 0.75;
}

.site-banner__text :deep(.site-banner__img) {
  display: inline-block;
  max-height: 20px;
  width: auto;
  margin: 0 2px;
  vertical-align: -4px;
  border-radius: 4px;
}

.site-banner__cta {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.site-banner__cta:hover {
  opacity: 0.75;
}

/* Controls ---------------------------------------------------------------- */
.site-banner__toggle,
.site-banner__close {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: inherit;
  opacity: 0.75;
  transform: translateY(-50%);
  transition: opacity 0.2s ease, background-color 0.2s ease, transform 0.25s ease;
}

.site-banner__toggle:hover,
.site-banner__close:hover {
  opacity: 1;
  background-color: var(--sb-hover);
}

.site-banner__close {
  right: 12px;
}

/* Chevron is a compact-viewport affordance only. */
.site-banner__toggle {
  display: none;
  right: 46px;
}

/* Compact viewports ------------------------------------------------------ */
/* One truncated line by default (44px, no wasted height), tap to expand the
   full message plus the CTA as a real button. */
@media (max-width: 959.98px) {
  .site-banner__inner {
    justify-content: flex-start;
    gap: 8px;
    min-height: 44px;
    padding: 0 84px 0 14px;
    font-size: 12.5px;
    cursor: pointer;
  }

  .site-banner__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
  }

  .site-banner__text {
    max-width: 100%;
  }

  .site-banner__text :deep(p) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Collapsed: the line is a teaser, so every tap expands instead of
     following a half-visible inline link. */
  .site-banner:not(.site-banner--open) .site-banner__text :deep(a) {
    pointer-events: none;
  }

  .site-banner__cta {
    display: none;
  }

  .site-banner__toggle {
    display: flex;
  }

  .site-banner__toggle,
  .site-banner__close {
    top: 7px;
    transform: none;
  }

  .site-banner--open .site-banner__inner {
    align-items: flex-start;
    padding-top: 11px;
    padding-bottom: 14px;
    cursor: default;
  }

  .site-banner--open .site-banner__tag {
    margin-top: 1px;
  }

  .site-banner--open .site-banner__text :deep(p) {
    overflow: visible;
    white-space: normal;
  }

  .site-banner--open .site-banner__cta {
    display: inline-flex;
    padding: 8px 16px;
    border-radius: 30px;
    background: var(--sb-cta-bg);
    color: var(--sb-cta-fg);
    text-decoration: none;
  }

  .site-banner--open .site-banner__toggle {
    transform: rotate(180deg);
  }
}

@media (max-width: 599.98px) {
  .site-banner__tag {
    padding: 2px 8px;
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-banner__toggle,
  .site-banner__close {
    transition: opacity 0.2s ease, background-color 0.2s ease;
  }
}
</style>
