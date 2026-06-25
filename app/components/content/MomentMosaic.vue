<template>
  <section
    v-if="feature"
    class="moment-section max-container-width"
  >
    <div class="section-head">
      <div>
        <p
          v-if="merged.eyebrow"
          class="eyebrow"
        >
          {{ merged.eyebrow }}
        </p>
        <h2>{{ merged.title }}</h2>
      </div>
      <NuxtLink
        v-if="merged.moreLink"
        class="more d-none d-sm-inline"
        :to="merged.moreLink"
      >
        {{ merged.moreText || 'Voir tous les voyages' }}
        <v-icon
          :icon="mdiArrowRight"
          size="18"
        />
      </NuxtLink>
    </div>

    <div class="moment">
      <NuxtLink
        class="feature"
        :to="featureLink"
      >
        <div
          class="feature__media"
          :style="bgStyle(feature.image, 1000)"
        />
        <div class="scrim" />
        <div class="feature__body">
          <span
            v-if="feature.pill"
            class="pill"
          >{{ feature.pill }}</span>
          <h3>
            {{ feature.title }}
            <span
              class="feature__line"
              aria-hidden="true"
            />
          </h3>
          <p v-if="feature.description">
            {{ feature.description }}
          </p>
          <div class="feature__meta">
            <span v-if="feature.duration">
              <v-icon
                :icon="mdiClockOutline"
                size="16"
              /> {{ feature.duration }}
            </span>
            <span v-if="feature.maxTravelers">
              <v-icon
                :icon="mdiAccountGroupOutline"
                size="16"
              /> {{ feature.maxTravelers }}
            </span>
            <span
              v-if="feature.price"
              class="price"
            >{{ feature.price }}</span>
          </div>
          <span class="feature__cta">
            Découvrir le voyage
            <v-icon
              :icon="mdiArrowRight"
              size="18"
            />
          </span>
        </div>
      </NuxtLink>

      <div class="moment__side">
        <NuxtLink
          v-for="(mini, i) in miniFeatures"
          :key="i"
          class="feature-mini"
          :to="linkFor(mini)"
        >
          <div
            class="feature-mini__media"
            :style="bgStyle(mini.image, 600)"
          />
          <div class="scrim" />
          <span
            class="feature-mini__arrow"
            aria-hidden="true"
          >
            <v-icon
              :icon="mdiArrowRight"
              size="18"
            />
          </span>
          <div class="feature-mini__body">
            <h3>{{ mini.title }}</h3>
            <span
              v-if="mini.meta"
              class="feature-mini__meta"
            >{{ mini.meta }}</span>
          </div>
        </NuxtLink>
      </div>
      <v-btn-secondary
       class="d-flex d-sm-none rounded-xl"
       variant="outlined"
       height="50"
      :to="merged.moreLink">
          {{ merged.moreText || 'Voir tous les voyages' }}
          <v-icon
            :icon="mdiArrowRight"
            size="18"
          />
      </v-btn-secondary>
    </div>
  </section>
</template>

<script setup>
import { mdiArrowRight, mdiClockOutline, mdiAccountGroupOutline } from '@mdi/js'
import { getImageUrl } from '~/utils/getImageUrl'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

// Fallback copy used when the CMS section is empty. Images are optional — the
// feature/mini tiles fall back to the teal brand colour when none is set.
const defaultData = {
  eyebrow: 'Coups de cœur',
  title: 'Les séjours du moment',
  moreText: 'Voir tous les voyages',
  moreLink: '/voyages',
  feature: {
    pill: 'Le voyage signature',
    title: 'Trek chez l\'habitant au Népal',
    description: '15 jours d\'immersion dans l\'Himalaya, à la table des familles et au rythme des sentiers.',
    duration: '15 jours',
    maxTravelers: '8 max',
    price: 'dès 2 690 €',
    link: '/voyages',
  },
  miniFeatures: [
    { title: 'Safari en Tanzanie', meta: '12 j · dès 3 490 €', link: '/voyages' },
    { title: 'Açores, volcans et baleines', meta: '8 j · dès 1 690 €', link: '/voyages' },
  ],
}

const merged = computed(() => {
  const d = props.data || {}
  return {
    eyebrow: d.eyebrow || defaultData.eyebrow,
    title: d.title || defaultData.title,
    moreText: d.moreText || defaultData.moreText,
    moreLink: d.moreLink || defaultData.moreLink,
    feature: d.feature || defaultData.feature,
    miniFeatures: d.miniFeatures?.length ? d.miniFeatures.slice(0, 2) : defaultData.miniFeatures,
  }
})

const feature = computed(() => merged.value.feature)
const miniFeatures = computed(() => merged.value.miniFeatures)

const voyageLink = (voyage) => {
  const slug = voyage?.slug?.current || voyage?.slug
  return slug ? `/voyages/${slug}` : null
}

const linkFor = item => item?.link || voyageLink(item?.voyage) || '/voyages'

const featureLink = computed(() => linkFor(feature.value))

const bgStyle = (image, width) => {
  const ref = image?.asset?._ref
  if (!ref) return {}
  return { backgroundImage: `url('${getImageUrl(ref, null, null, width)}')` }
}
</script>

<style scoped>
.moment-section {
  margin-top: var(--gap-section, 2.5rem);
  padding-inline: 24px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.section-head h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.more {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-secondary));
  white-space: nowrap;
}

.moment {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.moment__side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature,
.feature-mini {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  color: #fff;
  background-color: rgb(var(--v-theme-primary));
  text-decoration: none;
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Separate image layer so it can zoom independently of the text. */
.feature__media,
.feature-mini__media {
  position: absolute;
  inset: 0;
  background-color: rgb(var(--v-theme-primary));
  background-size: cover;
  background-position: center;
  transform: scale(1);
  transform-origin: center;
  transition:
    transform 0.9s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.9s ease;
  will-change: transform;
}

/* ===== Hover choreography (desktop) ===== */
@media (hover: hover) {
  .feature:hover,
  .feature-mini:hover {
    transform: translateY(-6px);
    box-shadow: 0 22px 48px rgba(12, 22, 20, 0.32);
  }

  .feature:hover .feature__media,
  .feature-mini:hover .feature-mini__media {
    transform: scale(1.08);
    filter: brightness(1.04) saturate(1.05);
  }

  /* Feature: accent line grows + CTA rises in */
  .feature:hover .feature__line {
    width: 64px;
  }

  .feature:hover .feature__cta {
    opacity: 1;
    transform: translateY(0);
  }

  .feature:hover .feature__cta .v-icon {
    transform: translateX(5px);
  }

  /* Mini: corner arrow reveals + meta slides up */
  .feature-mini:hover .feature-mini__arrow {
    opacity: 1;
    transform: translate(0, 0);
  }

  .feature-mini:hover .feature-mini__body {
    transform: translateY(-4px);
  }
}

.feature {
  min-height: 420px;
}

.feature-mini {
  flex: 1;
  min-height: 200px;
  border-radius: 18px;
}

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(12, 22, 20, 0.85), rgba(12, 22, 20, 0.05) 70%);
}

.feature__body {
  position: relative;
  z-index: 2;
  padding: 30px;
  max-width: 520px;
}

.feature__body h3 .feature__line {
  display: block;
  width: 0;
  height: 2px;
  margin-top: 10px;
  background: rgb(var(--v-theme-secondary));
  border-radius: 2px;
  transition: width 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.45s ease,
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature__cta .v-icon {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature__body .pill {
  display: inline-block;
  margin-bottom: 12px;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgb(var(--v-theme-secondary));
  font-size: 12px;
  font-weight: 600;
}

.feature__body h3 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.15;
}

.feature__body p {
  margin: 0 0 16px;
  font-size: 15px;
  color: #e3ece9;
  line-height: 1.5;
}

.feature__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  flex-wrap: wrap;
}

.feature__meta .price {
  font-size: 18px;
  font-weight: 700;
}

.feature-mini__body {
  position: relative;
  z-index: 2;
  padding: 18px;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature-mini__body h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.feature-mini__body .feature-mini__meta {
  font-size: 13px;
  color: #dfeae6;
}

.feature-mini__arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: rgb(var(--v-theme-primary));
  opacity: 0;
  transform: translate(8px, -8px);
  transition:
    opacity 0.4s ease,
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .feature,
  .feature-mini,
  .feature__media,
  .feature-mini__media,
  .feature__line,
  .feature__cta,
  .feature__cta .v-icon,
  .feature-mini__body,
  .feature-mini__arrow {
    transition: none;
  }
}

@media (max-width: 768px) {
  .moment {
    grid-template-columns: 1fr;
  }

  .section-head h2 {
    font-size: 24px;
  }

  .feature {
    min-height: 320px;
  }

  .feature__body {
    padding: 22px;
  }

  .feature__body h3 {
    font-size: 21px;
  }
}
</style>
