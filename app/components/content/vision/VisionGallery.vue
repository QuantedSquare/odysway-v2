<template>
  <section
    v-if="tiles.length"
    class="gallery-band"
  >
    <div class="gallery-inner">
      <div class="gallery-head">
        <p
          v-if="eyebrow"
          class="eyebrow"
        >
          {{ eyebrow }}
        </p>
        <h2 v-if="title">
          {{ title }}
        </h2>
      </div>

      <div class="gallery-grid">
        <div
          v-for="tile in tiles"
          :key="tile.key"
          class="gallery-cell"
          :class="`gallery-cell--${tile.size}`"
        >
          <!-- Voyage / destination : la case renvoie vers la page -->
          <NuxtLink
            v-if="tile.link"
            :to="tile.link"
            class="gallery-item"
            :aria-label="`Découvrir ${tile.caption}`"
          >
            <NuxtImg
              :src="tile.src"
              :srcset="tile.srcset"
              sizes="(max-width: 600px) 50vw, 400px"
              :alt="tile.alt"
              format="webp"
              loading="lazy"
              width="600"
              height="450"
            />
            <span class="scrim" />
            <span
              v-if="tile.caption"
              class="caption"
            >
              {{ tile.caption }}
              <IconArrowRight
                :size="15"
                :stroke="2"
              />
            </span>
          </NuxtLink>

          <!-- Photo : ouverture en lightbox -->
          <button
            v-else
            type="button"
            class="gallery-item"
            :aria-label="`Agrandir la photo${tile.caption ? ` : ${tile.caption}` : ''}`"
            @click="openLightbox(tile.photoIndex)"
          >
            <NuxtImg
              :src="tile.src"
              :srcset="tile.srcset"
              sizes="(max-width: 600px) 50vw, 400px"
              :alt="tile.alt"
              format="webp"
              loading="lazy"
              width="600"
              height="450"
            />
            <span class="scrim" />
            <span
              v-if="tile.caption"
              class="caption"
            >{{ tile.caption }}</span>
          </button>
        </div>
      </div>
    </div>

    <v-dialog
      v-model="lightboxOpen"
      max-width="860"
      aria-label="Photo de voyage"
    >
      <div class="lightbox">
        <button
          type="button"
          class="lightbox__close"
          aria-label="Fermer"
          @click="lightboxOpen = false"
        >
          <IconX
            :size="24"
            :stroke="1.8"
          />
        </button>
        <button
          v-if="photoTiles.length > 1"
          type="button"
          class="lightbox__nav"
          aria-label="Photo précédente"
          @click="step(-1)"
        >
          <IconChevronLeft
            :size="22"
            :stroke="1.8"
          />
        </button>
        <figure class="lightbox__figure">
          <NuxtImg
            v-if="activeTile"
            :src="activeTile.large"
            :alt="activeTile.alt"
            format="webp"
            width="1200"
            height="800"
          />
          <figcaption v-if="activeTile?.caption">
            {{ activeTile.caption }}
          </figcaption>
        </figure>
        <button
          v-if="photoTiles.length > 1"
          type="button"
          class="lightbox__nav"
          aria-label="Photo suivante"
          @click="step(1)"
        >
          <IconChevronRight
            :size="22"
            :stroke="1.8"
          />
        </button>
      </div>
    </v-dialog>
  </section>
</template>

<script setup>
import { IconX, IconChevronLeft, IconChevronRight, IconArrowRight } from '@tabler/icons-vue'
import { getImageUrl } from '~/utils/getImageUrl'

const props = defineProps({
  eyebrow: {
    type: String,
    default: 'Instants de voyage',
  },
  title: {
    type: String,
    default: 'En vrai, par nos voyageurs',
  },
  // CMS tiles. Each entry is a photo ({ image, caption }) OR a reference to a
  // voyage / destination — those render with the trip's own picture and link to
  // its page instead of opening the lightbox. When the list is empty we fall
  // back to the traveller reviews that carry a photo.
  items: {
    type: Array,
    default: () => [],
  },
})

const reviewPhotosQuery = groq`*[_type == "review" && defined(photo.asset)][0...8]{
  _id,
  author,
  photo,
  voyage->{ title }
}`

const { data: reviewPhotos } = await useSanityQuery(reviewPhotosQuery, undefined, { dedupe: 'defer' })

// Mosaic rhythm: 2 wide (2 columns) + 2 tall (2 rows) + 4 squares fill a 4×3
// grid exactly. The prototype's pattern left one cell empty — this one doesn't.
// Any other count falls back to plain squares, which always tile cleanly.
const mosaicPattern = ['wide', 'tall', 'tall', 'plain', 'plain', 'wide', 'plain', 'plain']
const sizeByIndex = (i, total) => (total === mosaicPattern.length ? mosaicPattern[i] : 'plain')

// Rows without a usable picture (a row an editor added but hasn't filled yet)
// are dropped here, before the fallback decision — otherwise one empty row
// would hide the whole section.
const cmsSources = computed(() =>
  (props.items || []).map((item, i) => {
    const target = item.voyage || item.destination
    const image = item.image?.asset ? item.image : (target?.imageCard || target?.image)
    const label = item.caption || target?.title || ''
    const link = item.voyage?.slug
      ? `/voyages/${item.voyage.slug}`
      : (item.destination?.slug ? `/destinations/${item.destination.slug}` : null)
    return {
      key: item._key || `cms-${i}`,
      ref: image?.asset?._ref,
      caption: label,
      alt: item.image?.alt || label || 'Photo de voyage',
      explicitSize: item.size,
      link,
    }
  }).filter(source => source.ref),
)

const reviewSources = computed(() =>
  (reviewPhotos.value || []).map((review, i) => ({
    key: review._id || `review-${i}`,
    ref: review.photo?.asset?._ref,
    caption: review.voyage?.title || review.author || '',
    alt: `Photo de voyage partagée par ${review.author || 'un voyageur'}`,
    explicitSize: null,
    link: null,
  })).filter(source => source.ref),
)

const tiles = computed(() => {
  const sources = cmsSources.value.length ? cmsSources.value : reviewSources.value
  let photoIndex = 0
  return sources.map((source, i) => ({
    ...source,
    size: source.explicitSize || sizeByIndex(i, sources.length),
    // Only the lightbox-able tiles get an index in the photo carousel.
    photoIndex: source.link ? null : photoIndex++,
    src: getImageUrl(source.ref, null, null, 600),
    srcset: [400, 600, 900].map(w => `${getImageUrl(source.ref, null, null, w)} ${w}w`).join(', '),
    large: getImageUrl(source.ref, null, null, 1200),
  }))
})

const photoTiles = computed(() => tiles.value.filter(tile => !tile.link))

const lightboxOpen = ref(false)
const activeIndex = ref(0)
const activeTile = computed(() => photoTiles.value[activeIndex.value])

const openLightbox = (i) => {
  activeIndex.value = i
  lightboxOpen.value = true
}

const step = (direction) => {
  const total = photoTiles.value.length
  if (!total) return
  activeIndex.value = (activeIndex.value + direction + total) % total
}
</script>

<style scoped>
.gallery-band {
  margin-top: var(--gap-section, 4.5rem);
  padding-block: 3.5rem;
  border-radius: 20px;
  background: #1f3a3f;
}

.gallery-inner {
  /* Narrower container than the rest of the site: this page keeps wide side
     margins, like the prototype. */
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 32px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary-light));
}

.gallery-head h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
}

.gallery-grid {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 150px;
  /* dense: a custom size set in the CMS can't punch a hole in the mosaic. */
  grid-auto-flow: dense;
  gap: 12px;
}

.gallery-cell {
  min-width: 0;
}

.gallery-item {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
}

.gallery-item :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.gallery-cell--wide {
  grid-column: span 2;
}

.gallery-cell--tall {
  grid-row: span 2;
}

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent 60%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.caption {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  opacity: 0;
  transition: opacity 0.25s ease;
}

@media (hover: hover) {
  .gallery-item:hover .scrim,
  .gallery-item:hover .caption,
  .gallery-item:focus-visible .scrim,
  .gallery-item:focus-visible .caption {
    opacity: 1;
  }

  .gallery-item:hover :deep(img) {
    transform: scale(1.06);
  }
}

/* ===== Lightbox ===== */
.lightbox {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: rgba(10, 15, 13, 0.96);
  border-radius: 16px;
}

.lightbox__figure {
  margin: 0;
  text-align: center;
  min-width: 0;
}

.lightbox__figure :deep(img) {
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  border-radius: 12px;
}

.lightbox__figure figcaption {
  margin-top: 12px;
  color: #fff;
  font-size: 15px;
}

.lightbox__close {
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 1;
  display: flex;
  border: none;
  background: none;
  color: #fff;
}

.lightbox__nav {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.lightbox__nav:hover {
  background: rgba(255, 255, 255, 0.28);
}

@media (max-width: 960px) {
  .gallery-band {
    padding-block: 2.75rem;
    border-radius: 0;
  }

  .gallery-inner {
    padding-inline: 20px;
  }

  .gallery-head h2 {
    font-size: 25px;
  }

  .gallery-grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 132px;
    gap: 10px;
  }

  /* Two even columns on touch: every tile becomes a square so the mosaic
     never leaves a gap, and captions stay visible (no hover). */
  .gallery-cell--wide,
  .gallery-cell--tall {
    grid-column: auto;
    grid-row: auto;
  }

  .scrim,
  .caption {
    opacity: 1;
  }

  .lightbox__nav {
    width: 38px;
    height: 38px;
  }
}

/* Two columns are kept even on the smallest phones: a single column would
   turn the 8-photo mosaic into a very long scroll. */
@media (max-width: 420px) {
  .gallery-grid {
    grid-auto-rows: 118px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gallery-item :deep(img),
  .scrim,
  .caption {
    transition: none;
  }
}
</style>
