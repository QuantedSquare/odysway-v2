<template>
  <section class="concept-section max-container-width">
    <div class="manifesto">
      <p
        v-if="merged.eyebrow"
        class="eyebrow"
      >
        {{ merged.eyebrow }}
      </p>
      <p
        v-if="merged.lead"
        class="manifesto__lead"
      >
        {{ merged.lead }}
      </p>
      <div
        v-if="stats.length"
        class="manifesto__stats"
      >
        <div
          v-for="(stat, i) in stats"
          :key="i"
        >
          <div class="num">
            {{ stat.num }}
          </div>
          <div class="label">
            {{ stat.label }}
          </div>
        </div>
      </div>
      <CtaButton
        v-if="merged.ctaButton?.link"
        :link="merged.ctaButton.link"
        color="soft-blush"
        text-color="primary"
        cta-id="concept-home"
        :rounded-value="'pill'"
        :cta-label="merged.ctaButton.text"
      >
        <template #text>
          {{ merged.ctaButton.text }}
        </template>
      </CtaButton>
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

// Fallback copy used when the CMS section is empty.
const defaultData = {
  eyebrow: 'Notre concept',
  lead: 'Dormir chez l\'habitant. Partager un repas avec une famille. Marcher avec un guide qui vit sur place. Voyager à huit maximum. Chez Odysway, la rencontre n\'est pas une activité du voyage : elle est le voyage.',
  stats: [
    { num: '8', label: 'voyageurs maximum par groupe' },
    { num: '90%', label: 'de départs garantis' },
    { num: '4,9/5', label: 'note Trustpilot' },
    { num: '172', label: 'avis voyageurs vérifiés' },
  ],
  ctaButton: { text: 'Découvrir notre concept', link: '/vision-voyage-odysway' },
}

const merged = computed(() => {
  const d = props.data || {}
  return {
    eyebrow: d.eyebrow || defaultData.eyebrow,
    lead: d.lead || defaultData.lead,
    stats: d.stats?.length ? d.stats : defaultData.stats,
    ctaButton: d.ctaButton?.link ? d.ctaButton : defaultData.ctaButton,
  }
})

const stats = computed(() => (merged.value.stats || []).slice(0, 4))
</script>

<style scoped>
.concept-section {
  margin-top: var(--gap-section, 4.5rem);
  padding-inline: 24px;
}

.manifesto {
  background: rgb(var(--v-theme-primary));
  color: #fff;
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #f0b49c;
}

.manifesto__lead {
  max-width: 820px;
  margin: 0 auto 34px;
  font-size: 26px;
  font-weight: 500;
  line-height: 1.4;
  color: #eaf3f0;
}

.manifesto__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.manifesto__stats .num {
  font-size: 38px;
  font-weight: 800;
}

.manifesto__stats .label {
  margin-top: 3px;
  font-size: 15px;
  color: #bcd3ce;
}

@media (max-width: 768px) {
  .manifesto {
    padding: 36px 22px;
  }

  .manifesto__lead {
    font-size: 21px;
  }

  .manifesto__stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
