<template>
  <div class="destinations-page">
    <!-- ============ INTRO ============ -->
    <section class="dp-container dp-intro">
      <h1>{{ pageTitle }}</h1>
      <p>{{ introText }}</p>
    </section>

    <!-- ============ CONTINENTS ============ -->
    <section class="dp-container">
      <div class="dp-zones">
        <div
          v-for="zone in zones"
          :key="zone.id"
          class="dp-zone"
        >
          <div class="dp-zone__head">
            <h2>{{ zone.name }}</h2>
            <NuxtLink :to="`/destinations/${zone.slug}`">
              Voir tous les voyages {{ prep(zone.name) }}
              <v-icon size="18">
                {{ mdiArrowRight }}
              </v-icon>
            </NuxtLink>
          </div>
          <div class="dp-grid">
            <NuxtLink
              v-for="destination in zone.destinations"
              :key="destination._id"
              class="dp-tile"
              :to="`/destinations/${destination.slug}`"
            >
              <img
                class="dp-tile__ph"
                :src="getImageUrl(destination.image?.asset?._ref, null, null, 600)"
                :alt="destination.title"
                loading="lazy"
                decoding="async"
              >
              <span class="dp-tile__scrim" />
              <span class="dp-tile__name">{{ destination.title }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ SEO ============ -->
    <section class="dp-seo-band">
      <div class="dp-container dp-seo">
        <h2>Nos destinations, vécues de l'intérieur</h2>
        <p>
          Toutes nos destinations s'organisent autour d'une même idée : vivre un lieu de
          l'intérieur, à la table des familles et au pas des guides qui le connaissent par cœur.
          En <NuxtLink to="/destinations/france">
            France
          </NuxtLink>, des Alpes à la Bretagne. En
          <NuxtLink to="/destinations/europe">
            Europe
          </NuxtLink>, des volcans des Açores aux nuits
          étoilées de Laponie. En <NuxtLink to="/destinations/asie">
            Asie
          </NuxtLink>, du Népal au Japon, de
          village en village.
        </p>
        <p>
          En <NuxtLink to="/destinations/afrique">
            Afrique
          </NuxtLink>, du Sahara marocain aux plaines de
          Tanzanie. Dans les <NuxtLink to="/destinations/amerique-du-sud">
            Amériques
          </NuxtLink>, des chemins
          incas du Pérou à l'Amazonie brésilienne. Quelle que soit la destination, nos voyages en
          immersion se vivent en petit groupe de 8 voyageurs maximum ou en privatisé, à votre
          rythme, dans le respect des lieux et des personnes.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import { getImageUrl } from '~/utils/getImageUrl'

const { zones, asyncData } = useDestinationsMenu()
await asyncData

const pageContentQuery = groq`*[_type == "page_destinations"][0]{
  index,
  heroText,
  seo
}`
const { data: pageContent } = await useSanityQuery(pageContentQuery)

const pageTitle = computed(() =>
  pageContent.value?.index?.pageTitle || 'Toutes nos destinations de voyage en immersion',
)

const introText = computed(() =>
  pageContent.value?.heroText
  || `Chez Odysway, chaque destination se découvre pas à pas, au plus près de celles et ceux qui y vivent. De la France aux grands espaces d'Asie, d'Afrique ou des Amériques, vous choisissez une terre et nous vous ouvrons la porte de ses habitants. Nos voyages en immersion, en petit groupe ou en privatisé, prennent le temps de la rencontre et de la marche, loin des sentiers les plus fréquentés.`,
)

// Grammatical preposition preceding the continent name ("de France", "d'Asie"…).
function prep(name) {
  if (!name) return ''
  return /^[aeiouyàâäéèêëîïôöûü]/i.test(name.trim()) ? `d'${name}` : `de ${name}`
}

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})

if (pageContent.value) {
  useSeo({
    seoData: pageContent.value?.seo,
    slug: 'destinations',
    content: pageContent.value,
    pageType: 'website',
  })
}
</script>

<style scoped>
.destinations-page {
  --dp-teal: #2b4c52;
  --dp-orange: #de5e2c;
  --dp-ink: #222223;
  --dp-muted: #5d6566;
  --dp-surface-alt: #f7f8f8;
  --dp-border: rgba(43, 76, 82, 0.13);
  color: var(--dp-ink);
}

.dp-container {
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 24px;
}

/* ===== Intro ===== */
.dp-intro {
  margin-top: 34px;
}
.dp-intro h1 {
  margin: 0 0 12px;
  font-size: 40px;
  font-weight: 700;
  color: var(--dp-ink);
  line-height: 1.12;
  letter-spacing: -0.01em;
}
.dp-intro p {
  max-width: 780px;
  margin: 0;
  font-size: 16px;
  line-height: 1.75;
  color: var(--dp-muted);
}

/* ===== Zones (continents) ===== */
.dp-zones {
  margin-top: 40px;
}
.dp-zone {
  margin-bottom: 40px;
}
.dp-zone:last-child {
  margin-bottom: 0;
}
.dp-zone__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--dp-border);
}
.dp-zone__head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--dp-teal);
  letter-spacing: -0.01em;
}
.dp-zone__head a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  color: var(--dp-orange);
  white-space: nowrap;
  text-decoration: none;
  transition: gap 0.2s ease;
}
.dp-zone__head a:hover {
  gap: 9px;
}
.dp-zone__head a :deep(.v-icon) {
  color: inherit;
}

.dp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.dp-tile {
  position: relative;
  height: 160px;
  border-radius: 14px;
  overflow: hidden;
  display: block;
  text-decoration: none;
  background: var(--dp-surface-alt);
}
.dp-tile:hover .dp-tile__ph {
  transform: scale(1.05);
}
.dp-tile__ph {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.dp-tile__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 14, 12, 0.72), rgba(8, 14, 12, 0.05) 60%);
}
.dp-tile__name {
  position: absolute;
  left: 13px;
  right: 13px;
  bottom: 11px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

/* ===== SEO ===== */
.dp-seo-band {
  margin-top: 72px;
  background: var(--dp-surface-alt);
  padding-block: 3.5rem;
}
.dp-seo h2 {
  margin: 0 0 14px;
  font-size: 22px;
  font-weight: 700;
  color: var(--dp-teal);
}
.dp-seo p {
  max-width: 900px;
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--dp-muted);
}
.dp-seo p:last-child {
  margin-bottom: 0;
}
.dp-seo a {
  color: var(--dp-teal);
  font-weight: 600;
  text-decoration: none;
}
.dp-seo a:hover {
  text-decoration: underline;
}

@media (max-width: 960px) {
  .dp-intro h1 {
    font-size: 28px;
  }
  .dp-grid {
    grid-template-columns: 1fr 1fr;
  }
  .dp-zone__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .dp-seo-band {
    margin-top: 48px;
    padding-block: 2.5rem;
  }
}
</style>
