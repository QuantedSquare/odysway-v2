<template>
  <aside
    v-if="visible"
    ref="root"
    class="site-banner"
    :class="`site-banner--${banner.variant || 'primary'}`"
    role="region"
    aria-label="Information Odysway"
  >
    <div class="site-banner__inner">
      <span
        v-if="banner.tag"
        class="site-banner__tag"
      >
        {{ banner.tag }}
      </span>

      <div class="site-banner__text">
        <PortableText
          :value="content"
          :components="ptComponents"
        />
      </div>

      <NuxtLink
        v-if="banner.ctaLabel && banner.ctaHref"
        :to="banner.ctaHref"
        :target="isExternalCta ? '_blank' : undefined"
        :rel="isExternalCta ? 'noopener' : undefined"
        class="site-banner__cta"
      >
        {{ banner.ctaLabel }}
      </NuxtLink>
    </div>

    <!-- Positioned against the full-width bar (not the centered row) so it stays
         pinned to the viewport edge on wide screens. -->
    <button
      v-if="banner.dismissible !== false"
      type="button"
      class="site-banner__close"
      aria-label="Fermer le bandeau"
      @click="dismiss"
    >
      <v-icon size="16">
        {{ mdiClose }}
      </v-icon>
    </button>
  </aside>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import { useEventListener } from '@vueuse/core'
import { h, resolveComponent } from 'vue'
import { PortableText } from '@portabletext/vue'
import { stegaClean } from '@sanity/client/stega'

const DISMISS_KEY = 'odysway-banner-dismissed'
// Set pre-hydration by the inline script below, and read by the stylesheet, so a
// visitor who already closed the banner never sees it flash back in.
const DISMISSED_CLASS = 'odysway-banner-dismissed'

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

// Visual editing is on for every non-production deploy (see `sanity.stega` in
// nuxt.config), and it hides its click-to-edit metadata inside each string as a
// few thousand zero-width characters. U+200B is a legal line-break opportunity,
// so on a one-line strip the invisible payload wraps into dozens of empty lines
// and the bar grows from 43px to several hundred. The banner therefore opts out
// of click-to-edit and renders clean text.
if (banner.value) banner.value = stegaClean(banner.value)

const root = ref(null)
const dismissed = ref(false)

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

// The Sanity editor keeps hard line breaks, and PortableText turns each one into
// a <br>. The bar is a one-line strip, so a message typed on several lines has
// to be flattened — otherwise a stray Entrée in the CMS doubles its height.
// Only line breaks are touched: `\s` would also match invisible characters and
// turn them into visible spaces.
const content = computed(() => (banner.value?.content || []).map((block) => {
  if (block._type !== 'block' || !block.children) return block
  return {
    ...block,
    children: block.children.map(child => (
      typeof child.text === 'string' ? { ...child, text: child.text.replace(/[\r\n]+/g, ' ') } : child
    )),
  }
}))

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
  // A long message wraps on narrow screens, so the real bar can be taller than
  // the static fallback; publish the measured height too.
  document.body.style.setProperty('--site-banner-h', `${bannerHeight}px`)
}

function dismiss() {
  dismissed.value = true
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
}, { passive: true })
useEventListener('resize', measure, { passive: true })

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
  /* Bar height, for full-screen blocks that need to fit under the banner
     (hero). Never scroll-linked, so it can't resize content. This is the
     one-line height with an étiquette; mount-time measurement overwrites it
     with the real value, which is taller when a long message wraps. */
  --site-banner-h: 43px;
  --site-banner-offset: 43px;
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
  /* Above both headers (1999). */
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
}

.site-banner--secondary {
  --sb-bg: #db6644;
  --sb-fg: #fff;
  --sb-tag-bg: #2b4c52;
  --sb-tag-fg: #fff;
}

.site-banner--soft-blush {
  --sb-bg: #fbf0ec;
  --sb-fg: #2b4c52;
  --sb-tag-bg: #de5e2c;
  --sb-tag-fg: #fff;

  border-bottom: 1px solid rgba(43, 76, 82, 0.12);
}

/* Row --------------------------------------------------------------------- */
/* Desktop keeps tag / text / link on one centered line. */
.site-banner__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 1180px;
  margin-inline: auto;
  padding: 15px 52px;
  font-size: 15px;
  line-height: 1.4;
}

.site-banner__tag {
  flex: 0 0 auto;
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
  flex: 0 1 auto;
  min-width: 0;
}

/* Links and images come from PortableText render functions, so they don't
   carry the scoped data-v attribute — reach them with :deep(). */
.site-banner__text :deep(p) {
  margin: 0;
}

.site-banner__text :deep(strong) {
  font-weight: 700;
}

.site-banner__text :deep(.site-banner__img) {
  display: inline-block;
  max-height: 20px;
  width: auto;
  margin: 0 2px;
  vertical-align: -4px;
  border-radius: 4px;
}

.site-banner__text :deep(.site-banner__link),
.site-banner__cta {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.site-banner__text :deep(.site-banner__link:hover),
.site-banner__cta:hover {
  opacity: 0.8;
}

.site-banner__cta {
  flex: 0 0 auto;
}

/* Close ------------------------------------------------------------------- */
/* 28px box for a usable tap target, offset so the glyph still lands where the
   design puts it (26px from the right edge). */
.site-banner__close {
  position: absolute;
  top: 50%;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: inherit;
  opacity: 0.8;
  transform: translateY(-50%);
  transition: opacity 0.2s ease;
}

.site-banner__close:hover {
  opacity: 1;
}

.site-banner__close:focus-visible {
  border-radius: 50%;
  opacity: 1;
  outline: 2px solid currentcolor;
  outline-offset: -2px;
}

/* Mobile ------------------------------------------------------------------ */
/* Pastille on the left, text + link flowing after it, close pinned top-right. */
@media (max-width: 768px) {
  .site-banner__inner {
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 6px 8px;
    padding: 10px 40px 10px 18px;
    font-size: 12.5px;
  }

  .site-banner__tag {
    margin-top: 1px;
  }

  .site-banner__text {
    flex: 1 1 auto;
  }

  .site-banner__text :deep(.site-banner__link),
  .site-banner__cta {
    white-space: normal;
  }

  .site-banner__close {
    top: 6px;
    right: 10px;
    transform: none;
  }
}
</style>
