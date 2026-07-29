<template>
  <section class="direction-band">
    <div class="direction">
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
    </div>
  </section>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  paragraphs: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.direction-band {
  margin-top: var(--gap-section, 4.5rem);
  padding-block: 3.5rem;
  background: rgb(var(--v-theme-soft-blush));
  border-radius: 20px;
}

.direction {
  text-align: center;
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
  color: rgb(var(--v-theme-secondary));
}

.direction h2 {
  margin: 0 auto 18px;
  max-width: 720px;
  font-size: 34px;
  font-weight: 600;
  line-height: 1.2;
  color: rgb(var(--v-theme-primary));
}

.direction p {
  margin: 0 auto 14px;
  max-width: 740px;
  font-size: 16px;
  line-height: 1.8;
  color: #4f4a47;
}

@media (max-width: 960px) {
  .direction-band {
    padding-block: 2.75rem;
    border-radius: 0;
  }

  .direction {
    padding-inline: 20px;
  }

  .direction h2 {
    font-size: 25px;
  }

  .direction p {
    font-size: 15px;
  }
}
</style>
