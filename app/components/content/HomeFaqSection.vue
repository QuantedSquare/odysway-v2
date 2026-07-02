<template>
  <section
    v-if="items.length"
    class="faq-section"
  >
    <h2 class="faq-section__title">
      Questions fréquentes
    </h2>
    <div class="faq-list">
      <div
        v-for="(item, i) in items.slice(0, 5)"
        :key="item._key || i"
        class="faq-item"
      >
        <button
          type="button"
          class="faq-item__question"
          :aria-expanded="openIndex === i"
          @click="toggle(i)"
        >
          <span>{{ item.question }}</span>
          <IconPlus
            class="faq-item__icon text-secondary"
            :class="{ 'faq-item__icon--open': openIndex === i }"
            :size="22"
            :stroke="2"
          />
        </button>
        <div
          class="faq-item__answer"
          :class="{ 'faq-item__answer--open': openIndex === i }"
        >
          <div class="faq-item__answer-inner">
            <EnrichedText
              class="faq-item__answer-text"
              :value="item.answer"
            />
          </div>
        </div>
      </div>
    </div>
    <p class="faq-section__more">
      Vous ne trouvez pas votre réponse ?
      <NuxtLink to="/faq">
        Voir toutes nos réponses →
      </NuxtLink>
    </p>
  </section>
</template>

<script setup>
import { IconPlus } from '@tabler/icons-vue'

const faqQuery = groq`*[_type == "faq"][0]{
  faqItems
}`

const { data } = await useSanityQuery(faqQuery, undefined, { dedupe: 'defer' })

const items = computed(() => (data.value?.faqItems || []).filter(item => !item.hide))

const openIndex = ref(null)
const toggle = i => (openIndex.value = openIndex.value === i ? -1 : i)
</script>

<style scoped>
.faq-section {
  padding-inline: 24px;
}

.faq-section__title {
  margin: 0 0 28px;
  font-size: 30px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  text-align: center;
}

.faq-list {
  /* max-width: 820px; */
  margin-inline: auto;
}

.faq-item {
  background: #fff;
  border: 1px solid rgba(43, 76, 82, 0.13);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.faq-item__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.faq-item__icon {
  flex: 0 0 auto;
  transition: transform 0.25s ease;
}

.faq-item__icon--open {
  transform: rotate(45deg);
}

.faq-item__answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.faq-item__answer--open {
  grid-template-rows: 1fr;
}

.faq-item__answer-inner {
  overflow: hidden;
}

.faq-item__answer-text {
  padding: 0 22px 20px;
  font-size: 14.5px;
  line-height: 1.7;
  color: #5d6566;
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 0.3s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.faq-item__answer--open .faq-item__answer-text {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.08s;
}

@media (prefers-reduced-motion: reduce) {
  .faq-item__answer,
  .faq-item__answer-text,
  .faq-item__icon {
    transition: none;
  }
}

.faq-section__more {
  margin: 26px 0 0;
  text-align: center;
  font-size: 14px;
  color: #5d6566;
}

.faq-section__more a {
  color: rgb(var(--v-theme-secondary));
  font-weight: 600;
}

@media (max-width: 768px) {
  .faq-section__title {
    font-size: 24px;
  }
}
</style>
