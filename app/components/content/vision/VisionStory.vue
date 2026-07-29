<template>
  <section
    class="story"
    :class="{ 'story--reverse': reverse, 'story--no-media': !mediaSrc }"
  >
    <div
      v-if="mediaSrc"
      class="story__media"
    >
      <NuxtImg
        :src="mediaSrc"
        :srcset="mediaSrcset"
        sizes="(max-width: 960px) 100vw, 560px"
        :alt="image?.alt || title"
        format="webp"
        loading="lazy"
        width="900"
        height="900"
      />
    </div>

    <div class="story__text">
      <p
        v-if="eyebrow"
        class="eyebrow"
      >
        {{ eyebrow }}
      </p>
      <h2 v-if="title">
        {{ title }}
      </h2>

      <p
        v-for="(part, i) in parts"
        :key="i"
        :class="{ pull: part.type === 'quote' }"
      >
        {{ part.text }}
      </p>

      <!-- Même traitement d'avatar que Voyages/AuthorNote.vue -->
      <div
        v-if="signature?.name"
        class="signature"
      >
        <NuxtImg
          v-if="signatureSrc"
          :src="signatureSrc"
          :srcset="signatureSrcset"
          sizes="72px"
          :alt="`Photo de ${signature.name}`"
          class="author-avatar"
          format="webp"
          loading="lazy"
        />
        <div class="signature__id">
          <b>{{ signature.name }}</b>
          <span v-if="signature.role">{{ signature.role }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'
import { getImageUrl } from '~/utils/getImageUrl'

const config = useRuntimeConfig()
const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const props = defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  // Paragraphs of the story. Each entry is either a plain string (regular
  // paragraph) or { text, quote: true } for the orange-bordered pull quote.
  paragraphs: {
    type: Array,
    default: () => [],
  },
  image: {
    type: Object,
    default: () => ({}),
  },
  // Media on the right instead of the left.
  reverse: {
    type: Boolean,
    default: false,
  },
  // { image, name, role } — founder block under the text.
  signature: {
    type: Object,
    default: null,
  },
})

const parts = computed(() =>
  (props.paragraphs || [])
    .map(p => (typeof p === 'string'
      ? { type: 'text', text: p }
      : { type: p?.quote ? 'quote' : 'text', text: p?.text }))
    .filter(p => p.text),
)

const assetRef = computed(() => props.image?.asset?._ref)
const mediaSrc = computed(() => (assetRef.value ? getImageUrl(assetRef.value, null, null, 900) : ''))
const mediaSrcset = computed(() => {
  if (!assetRef.value) return ''
  return [600, 900, 1200]
    .map(w => `${getImageUrl(assetRef.value, null, null, w)} ${w}w`)
    .join(', ')
})

// Square, centre-cropped avatar (same build as Voyages/AuthorNote.vue) so the
// portrait isn't squashed inside the circle.
const buildAvatarUrl = (size, quality = 70) => {
  const ref = props.signature?.image?.asset?._ref
  if (!ref) return ''
  return builder
    .image(ref)
    .width(size)
    .height(size)
    .format('webp')
    .quality(quality)
    .fit('crop')
    .url()
}

const signatureSrc = computed(() => buildAvatarUrl(72))
const signatureSrcset = computed(() =>
  [`${buildAvatarUrl(72)} 72w`, `${buildAvatarUrl(144, 75)} 144w`].filter(Boolean).join(', '),
)
</script>

<style scoped>
.story {
  display: grid;
  /* minmax(0, …) so a wide image can never push the text column out. */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 50px;
  /* stretch: the photo column takes exactly the height of the text column. */
  align-items: stretch;
  margin-top: var(--gap-section, 4.5rem);
  /* Narrower container than the rest of the site (1360px): this page keeps
     wide side margins, like the prototype. */
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 32px;
}

.story--reverse .story__media {
  order: 2;
}

/* No image set in the CMS: the text takes over the full row, kept to a
   comfortable reading width instead of leaving an empty media column. */
.story--no-media {
  grid-template-columns: minmax(0, 820px);
  justify-content: center;
}

.story__media {
  min-height: 420px;
  border-radius: 20px;
  overflow: hidden;
  background-color: rgb(var(--v-theme-primary));
}

.story__media :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story__text h2 {
  margin: 0 0 18px;
  font-size: 32px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  line-height: 1.15;
}

.story__text p {
  margin: 0 0 14px;
  font-size: 15.5px;
  line-height: 1.8;
  color: #3f4644;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.pull {
  margin: 22px 0;
  padding-left: 18px;
  border-left: 3px solid rgb(var(--v-theme-secondary));
  font-style: italic;
  font-size: 20px !important;
  line-height: 1.5 !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.signature {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
}

/* Same avatar treatment as Voyages/AuthorNote.vue */
.author-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  flex-shrink: 0;
}

.signature__id {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.signature b {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.signature span {
  font-size: 13px;
  color: #5d6566;
}

@media (max-width: 960px) {
  .story {
    grid-template-columns: 1fr;
    gap: 26px;
    padding-inline: 20px;
  }

  .story--reverse .story__media {
    order: 0;
  }

  .story__media {
    min-height: 0;
    height: 240px;
  }

  .author-avatar {
    width: 60px;
    height: 60px;
  }

  .story__text h2 {
    font-size: 25px;
  }

  .story__text p {
    font-size: 15px;
    line-height: 1.75;
  }

  .pull {
    font-size: 18px !important;
    margin: 18px 0;
  }
}
</style>
