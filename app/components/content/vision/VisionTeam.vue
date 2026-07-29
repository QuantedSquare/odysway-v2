<template>
  <section
    class="team"
    :class="{ 'team--no-media': !mediaSrc }"
  >
    <div
      v-if="mediaSrc"
      class="team__media"
    >
      <NuxtImg
        :src="mediaSrc"
        :srcset="mediaSrcset"
        sizes="(max-width: 960px) 100vw, 560px"
        :alt="image?.alt || title"
        format="webp"
        loading="lazy"
        width="900"
        height="700"
      />
    </div>

    <div class="team__text">
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
        v-for="(paragraph, i) in paragraphs"
        :key="i"
      >
        {{ paragraph }}
      </p>

      <!-- Avatars de l'équipe (documents teamMember, partagés avec la home).
           `compact` réduit la pile pour cette colonne de texte uniquement. -->
      <div class="team__avatars">
        <AvatarsRowStack compact />
      </div>

      <CtaButton
        v-if="ctaButton?.link"
        :link="ctaButton.link"
        color="primary"
        rounded-value="pill"
        cta-id="team-vision"
        :cta-label="ctaButton.text"
      >
        <template #text>
          {{ ctaButton.text }}
        </template>
      </CtaButton>
    </div>
  </section>
</template>

<script setup>
import { getImageUrl } from '~/utils/getImageUrl'

const props = defineProps({
  eyebrow: {
    type: String,
    default: 'Une équipe à taille humaine',
  },
  title: {
    type: String,
    default: 'Des passionnés qui ont arpenté chaque voyage',
  },
  paragraphs: {
    type: Array,
    default: () => [
      'Odysway, ce n\'est pas une grande agence avec des bureaux partout. C\'est une équipe de personnes curieuses, qui connaissent les voyages qu\'elles proposent pour les avoir vécus elles-mêmes.',
      'Quand vous nous contactez, vous échangez avec quelqu\'un qui prend le temps. Pas pour vous vendre un séjour à tout prix, mais pour comprendre ce que vous cherchez vraiment.',
    ],
  },
  image: {
    type: Object,
    default: () => ({}),
  },
  ctaButton: {
    type: Object,
    default: () => ({ text: 'Échanger avec l\'équipe', link: '/rdv-projet-voyage' }),
  },
})

const assetRef = computed(() => props.image?.asset?._ref)
const mediaSrc = computed(() => (assetRef.value ? getImageUrl(assetRef.value, null, null, 900) : ''))
const mediaSrcset = computed(() => {
  if (!assetRef.value) return ''
  return [600, 900, 1200]
    .map(w => `${getImageUrl(assetRef.value, null, null, w)} ${w}w`)
    .join(', ')
})
</script>

<style scoped>
.team {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 50px;
  align-items: center;
  margin-top: var(--gap-section, 4.5rem);
  /* Narrower container than the rest of the site: this page keeps wide side
     margins, like the prototype. */
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 32px;
}

/* No team photo in the CMS: keep the text centred on a single column
   rather than leaving an empty media block. */
.team--no-media {
  grid-template-columns: minmax(0, 820px);
  justify-content: center;
  text-align: center;
}

.team--no-media .team__text :deep(.v-btn) {
  margin-inline: auto;
}

/* Fixed ratio rather than stretching to the text column: hovering an avatar
   expands the name/description panel, and a stretched photo would grow with
   it. The ratio matches the team photo, so nothing is cropped. */
.team__media {
  aspect-ratio: 4 / 3;
  border-radius: 20px;
  overflow: hidden;
  /* Placeholder tint only — a saturated colour would show as a dark fringe
     around the clipped corners while the image loads. */
  background-color: rgba(43, 76, 82, 0.06);
}

.team__media :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Rounded on the image itself too: clipping alone leaves a 1px halo of the
     container's background on the corners. */
  border-radius: inherit;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.team__text h2 {
  margin: 0 0 16px;
  font-size: 32px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  line-height: 1.15;
}

.team__text p {
  margin: 0 0 14px;
  font-size: 15.5px;
  line-height: 1.8;
  color: #3f4644;
}

.team__avatars {
  margin: 30px 0 34px;
}

/* The shared stack centres itself; inside this text column it reads better
   flush left (and centred again when the section has no photo). */
.team:not(.team--no-media) .team__avatars :deep(.avatar-row-wrapper),
.team:not(.team--no-media) .team__avatars :deep(.avatar-stack) {
  justify-content: flex-start;
  margin-left: 0;
}

/* CtaButton centres itself; keep it flush left under the text (Vuetify's
   justify-center utility is !important, hence the override). */
.team__text :deep(.d-flex.justify-center) {
  justify-content: flex-start !important;
}

.team--no-media .team__text :deep(.d-flex.justify-center) {
  justify-content: center !important;
}

@media (max-width: 960px) {
  .team {
    grid-template-columns: 1fr;
    gap: 26px;
    padding-inline: 20px;
  }

  .team__media {
    aspect-ratio: auto;
    height: 240px;
  }

  .team__avatars {
    margin: 24px 0 28px;
  }

  .team__text h2 {
    font-size: 25px;
  }

  .team__text p {
    font-size: 15px;
    line-height: 1.75;
  }
}
</style>
