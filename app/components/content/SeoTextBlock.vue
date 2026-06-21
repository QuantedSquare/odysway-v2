<template>
  <section class="seo-band">
    <div class="seo max-container-width">
      <h2>{{ title }}</h2>
      <EnrichedText
        v-if="hasCmsContent"
        :value="data.content"
        class="seo__content"
      />
      <div
        v-else
        class="seo__content"
      >
        <p
          v-for="(paragraph, i) in defaultParagraphs"
          :key="i"
        >
          {{ paragraph }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const title = computed(() => props.data?.title || 'Odysway, l\'agence des voyages en immersion')

const hasCmsContent = computed(() => props.data?.content?.length > 0)

// Fallback copy (plain paragraphs) used when the CMS rich text is empty.
const defaultParagraphs = [
  'Odysway est l\'agence des voyages en immersion, pensés pour celles et ceux qui veulent vivre un lieu de l\'intérieur plutôt que de le visiter. Chaque séjour se construit avec des guides locaux et des familles d\'accueil, en petit groupe de 8 voyageurs maximum ou en privatif, à votre rythme.',
  'Voyage chez l\'habitant, trek hors des sentiers battus, rencontres locales et nuits à la table des familles : nous concevons une expérience locale qui a du sens, portée par des guides locaux francophones et passionnés. Vous êtes accompagnés de A à Z, avant, pendant et après le voyage. C\'est notre façon de défendre un tourisme responsable, du Népal au Pérou, de la France au Maroc.',
  'Découvrez nos voyages en immersion par envie, du trek à la faune sauvage, des familles d\'accueil à la déconnexion, ou par destination, des Alpes aux grands espaces d\'Asie, d\'Afrique et des Amériques.',
]
</script>

<style scoped>
.seo-band {
  background: #f7f8f8;
  padding-block: 3.5rem;
  margin-top: var(--gap-section, 4.5rem);
}

.seo {
  padding-inline: 24px;
}

.seo h2 {
  margin: 0 0 14px;
  font-size: 22px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.seo__content {
  max-width: 920px;
}

.seo__content :deep(p),
.seo__content p {
  font-size: 15px;
  line-height: 1.8;
  color: #5d6566;
  margin-bottom: 14px;
}

.seo__content :deep(a),
.seo__content a {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
</style>
