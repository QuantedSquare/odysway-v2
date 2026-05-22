<template>
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="call-banner-wrapper"
      :class="`variant-${variant}`"
    >
      <!-- Variant A: Full-width gradient bar -->
      <div
        v-if="variant === 'A'"
        class="banner-a"
      >
        <span class="banner-a__icon">📞</span>
        <div class="banner-a__text">
          <span class="banner-a__title">Ce voyage vous intéresse ?</span>
          <span class="banner-a__sub">Nos experts répondent à toutes vos questions en 20 min.</span>
        </div>
        <v-btn
          variant="outlined"
          rounded="pill"
          color="white"
          height="40"
          class="banner-a__cta flex-shrink-0"
          :href="ctaUrl"
        >
          Réserver un appel
        </v-btn>
        <v-btn
          icon
          variant="text"
          color="white"
          size="small"
          class="banner-a__close"
          aria-label="Fermer"
          @click="dismiss"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Variant B: Centered floating card -->
      <div
        v-else-if="variant === 'B'"
        class="banner-b-backdrop"
        @click.self="dismiss"
      >
        <div class="banner-b">
          <v-btn
            icon
            variant="text"
            size="small"
            class="banner-b__close"
            aria-label="Fermer"
            @click="dismiss"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <div class="banner-b__emoji">
            🧭
          </div>
          <p class="banner-b__title">
            On répond à toutes vos questions en 20 min !
          </p>
          <p class="banner-b__sub">
            Parlons de votre projet et trouvons ensemble le voyage qui vous ressemble.
          </p>
          <v-btn
            color="secondary"
            rounded="lg"
            height="52"
            block
            class="banner-b__cta mt-2"
            :href="ctaUrl"
          >
            Réserver un appel gratuit
          </v-btn>
        </div>
      </div>

      <!-- Variant C: Bottom-right peek card -->
      <div
        v-else-if="variant === 'C'"
        class="banner-c"
      >
        <div class="banner-c__header">
          <span class="banner-c__icon">💬</span>
          <span class="banner-c__title">Une question sur ce voyage ?</span>
          <v-btn
            icon
            variant="text"
            size="x-small"
            class="banner-c__close"
            aria-label="Fermer"
            @click="dismiss"
          >
            <v-icon size="16">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <p class="banner-c__sub">
          Nos experts vous répondent en 20 min. C'est gratuit et sans engagement.
        </p>
        <v-btn
          color="secondary"
          rounded="lg"
          height="44"
          block
          class="banner-c__cta"
          :href="ctaUrl"
        >
          Réserver un appel
        </v-btn>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  voyageTitle: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'A',
    validator: v => ['A', 'B', 'C'].includes(v),
  },
})

const DELAY_MS = 1

const visible = ref(false)
let timer = null

const ctaUrl = computed(
  () => `/rdv-projet-voyage?travelTitle=${encodeURIComponent(props.voyageTitle)}`,
)

const dismiss = () => {
  visible.value = false
}

onMounted(() => {
  timer = setTimeout(() => {
    visible.value = true
  }, DELAY_MS)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<style scoped>
/* ── Slide-up transition ── */
.slide-up-enter-active {
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
}
.slide-up-leave-active {
  transition: transform 0.3s ease-in, opacity 0.25s ease-in;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ── Variant A ── */
.banner-a {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1010;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(90deg, #2b4c52 0%, #237c8c 100%);
  box-shadow: 0 -4px 24px rgba(43, 76, 82, 0.22);
}

.banner-a__icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.banner-a__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.banner-a__title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-a__sub {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-a__close {
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .banner-a {
    flex-wrap: wrap;
    padding: 12px 16px 16px;
  }
  .banner-a__title,
  .banner-a__sub {
    white-space: normal;
  }
  .banner-a__cta {
    width: 100%;
  }
  .banner-a__close {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}

/* ── Variant B ── */
.banner-b-backdrop {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1010;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;
}

.banner-b {
  pointer-events: all;
  position: relative;
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  border-top: 3px solid #db6644;
  box-shadow: 0 -6px 48px rgba(43, 76, 82, 0.18);
  padding: 28px 28px 24px;
  text-align: center;
}

.banner-b__close {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #888;
}

.banner-b__emoji {
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.banner-b__title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2b4c52;
  margin: 0 0 6px;
  line-height: 1.3;
}

.banner-b__sub {
  font-size: 0.88rem;
  color: #666;
  margin: 0 0 16px;
  line-height: 1.5;
}

/* ── Variant C ── */
.call-banner-wrapper.variant-C {
  position: fixed;
  bottom: 200px;
  right: 20px;
  z-index: 1010;
  pointer-events: none;
}

.banner-c {
  pointer-events: all;
  width: 300px;
  background: #fbf0ec;
  border-radius: 16px;
  border-left: 4px solid #db6644;
  box-shadow: 0 8px 40px rgba(43, 76, 82, 0.16);
  padding: 16px 16px 18px;
  bottom: 50px;
}

.banner-c__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.banner-c__icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.banner-c__title {
  font-weight: 700;
  font-size: 0.88rem;
  color: #2b4c52;
  flex: 1;
  line-height: 1.3;
}

.banner-c__close {
  flex-shrink: 0;
  color: #888;
}

.banner-c__sub {
  font-size: 0.8rem;
  color: #555;
  line-height: 1.5;
  margin: 0 0 14px;
}

@media (max-width: 400px) {
  .call-banner-wrapper.variant-C {
    left: 12px;
    right: 12px;
    bottom: 16px;
  }
  .banner-c {
    width: 100%;
  }
}
</style>
