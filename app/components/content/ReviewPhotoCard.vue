<template>
  <article class="testimonial-card">
    <div
      class="testimonial-card__media"
      :style="bgStyle"
    />
    <div class="blur-overlay" />
    <div class="scrim" />

    <div class="testimonial-card__caption">
      <div
        class="testimonial-card__stars"
        role="img"
        :aria-label="`Noté ${stars} sur 5`"
      >
        {{ '★'.repeat(stars) }}
      </div>
      <p class="testimonial-card__quote">
        “{{ quoteText }}”
      </p>
      <button
        v-if="canExpand"
        type="button"
        class="testimonial-card__more"
        @click="open = true"
      >
        Lire +
      </button>
      <div class="testimonial-card__name">
        {{ review.author }}
      </div>
      <NuxtLink
        v-if="review.voyageTitle && review.voyageSlug"
        :to="`/voyages/${review.voyageSlug}`"
        class="testimonial-card__trip testimonial-card__trip--link"
      >
        {{ review.voyageTitle }}
      </NuxtLink>
      <div
        v-else-if="review.voyageTitle"
        class="testimonial-card__trip"
      >
        {{ review.voyageTitle }}
      </div>
    </div>

    <Transition name="testimonial-full">
      <div
        v-if="open"
        class="testimonial-card__full"
      >
        <button
          type="button"
          class="close"
          aria-label="Fermer"
          @click="open = false"
        >&times;</button>
        <div
          class="stars"
          role="img"
          :aria-label="`Noté ${stars} sur 5`"
        >
          {{ '★'.repeat(stars) }}
        </div>
        <div class="text">
          “{{ quoteText }}”
        </div>
        <div class="meta">
          <b>{{ review.author }}</b>
          <span v-if="review.voyageTitle">{{ review.voyageTitle }}</span>
        </div>
      </div>
    </Transition>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getImageUrl } from '~/utils/getImageUrl'

const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})

const open = ref(false)

const stars = computed(() => {
  const n = Math.round(Number(props.review?.rating))
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 5
})

const quoteText = computed(() => (props.review?.text || '').replace(/\\n|\n/g, ' ').trim())

// Show "Lire +" only when the quote is long enough to be clamped.
const canExpand = computed(() => quoteText.value.length > 140)

// Prefer the voyage's own photo (now that we have that data) over the
// traveller's uploaded photo, since it's more consistently available and
// visually matches the rest of the site's voyage imagery.
const bgStyle = computed(() => {
  const ref = props.review?.voyageImage?.asset?._ref || props.review?.photo?.asset?._ref
  return ref ? { backgroundImage: `url('${getImageUrl(ref, null, null, 600)}')` } : {}
})
</script>

<style scoped>
.testimonial-card {
  position: relative;
  flex: 0 0 290px;
  width: 290px;
  height: 420px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(43, 76, 82, 0.12);
}

.testimonial-card__media {
  position: absolute;
  inset: 0;
  background-color: rgb(var(--v-theme-primary));
  background-size: cover;
  background-position: center;
}

/* Bottom-half frosted blur behind the caption, same technique as the
   "envies" cards (CardGrid / ImageTitleColCard): a masked backdrop-filter so
   only the lower half of the photo blurs, keeping the top of the image crisp. */
.blur-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  mask: linear-gradient(transparent, rgb(0, 0, 0), black);
  backdrop-filter: blur(4px);
}

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 14, 12, 0.86), rgba(8, 14, 12, 0.04) 58%);
}

.testimonial-card__caption {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  color: #fff;
}

.testimonial-card__stars {
  margin-bottom: 8px;
  font-size: 14px;
  letter-spacing: 1px;
  color: #ffb14e;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.testimonial-card__quote {
  margin: 0 0 12px;
  font-style: italic;
  font-size: 16px;
  line-height: 1.45;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.testimonial-card__name {
  font-size: 15px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.testimonial-card__trip {
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12.5px;
  color: #e3ece9;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.testimonial-card__trip--link {
  text-decoration: underline;
  text-decoration-color: rgba(227, 236, 233, 0.4);
  text-underline-offset: 2px;
  transition: text-decoration-color 0.25s ease, color 0.25s ease;
}

.testimonial-card__trip--link:hover {
  color: #fff;
  text-decoration-color: rgba(255, 255, 255, 0.9);
}

.testimonial-card__more {
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: rgb(var(--v-theme-primary));
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.25s ease,
    box-shadow 0.3s ease;
}

.testimonial-card__more:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.testimonial-card__more:active {
  transform: translateY(0);
}

.testimonial-card__full {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 22px;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  z-index: 2;
}

/* Expand animation for the full-quote panel (triggered by "Lire +"). */
.testimonial-full-enter-active,
.testimonial-full-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.testimonial-full-enter-from,
.testimonial-full-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .testimonial-card__more,
  .testimonial-full-enter-active,
  .testimonial-full-leave-active,
  .testimonial-card__trip--link {
    transition: none;
  }
}

.testimonial-card__full .close {
  align-self: flex-end;
  background: none;
  border: none;
  color: #cfe0df;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.testimonial-card__full .stars {
  margin-bottom: 10px;
  font-size: 14px;
  letter-spacing: 1px;
  color: #ffb14e;
}

.testimonial-card__full .text {
  flex: 1;
  overflow-y: auto;
  font-style: italic;
  font-size: 15.5px;
  line-height: 1.5;
}

.testimonial-card__full .meta {
  margin-top: 14px;
}

.testimonial-card__full .meta b {
  display: block;
  font-size: 15px;
}

.testimonial-card__full .meta span {
  font-size: 12.5px;
  color: #cfe0df;
}
</style>
