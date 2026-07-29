<template>
  <section class="cta-section">
    <div class="cta">
      <h2>{{ title }}</h2>
      <p v-if="description">
        {{ description }}
      </p>
      <div class="cta__btns">
        <v-btn
          v-if="primaryCta?.link"
          :to="primaryCta.link"
          color="secondary"
          height="56"
          rounded="pill"
          class="text-body-1 font-weight-bold px-8"
          @click="track(primaryCta, 'vision-cta-primary')"
        >
          {{ primaryCta.text }}
        </v-btn>
        <v-btn
          v-if="secondaryCta?.link"
          :to="secondaryCta.link"
          color="soft-blush"
          height="56"
          rounded="pill"
          class="text-body-1 font-weight-bold px-8 text-primary"
          @click="track(secondaryCta, 'vision-cta-secondary')"
        >
          {{ secondaryCta.text }}
        </v-btn>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Et si votre prochain voyage commençait par une rencontre ?',
  },
  description: {
    type: String,
    default: 'Parcourez nos voyages en immersion, ou échangez avec un spécialiste pour imaginer le séjour qui vous ressemble.',
  },
  primaryCta: {
    type: Object,
    default: () => ({ text: 'Voir tous nos voyages', link: '/voyages' }),
  },
  secondaryCta: {
    type: Object,
    default: () => ({ text: 'Prendre RDV 👋', link: '/rdv-projet-voyage' }),
  },
})

const { trackCtaClick } = useGtmTracking()

const track = (cta, ctaId) => {
  trackCtaClick({
    ctaId,
    ctaLabel: cta.text,
    ctaUrl: cta.link,
  })
}
</script>

<style scoped>
.cta-section {
  margin-top: var(--gap-section, 4.5rem);
  /* Narrower container than the rest of the site: this page keeps wide side
     margins, like the prototype. */
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 32px;
}

.cta {
  text-align: center;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  border-radius: 24px;
  padding: 50px 40px;
}

.cta h2 {
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: 600;
}

.cta p {
  margin: 0 auto 24px;
  max-width: 560px;
  font-size: 16px;
  line-height: 1.6;
  color: #d7e4e1;
}

.cta__btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .cta-section {
    padding-inline: 20px;
  }

  .cta {
    padding: 38px 22px;
    border-radius: 20px;
  }

  .cta h2 {
    font-size: 24px;
  }

  .cta p {
    font-size: 15px;
  }

  .cta__btns .v-btn {
    width: 100%;
  }
}
</style>
