<template>
  <section
    ref="rootEl"
    class="concept-section max-container-width"
    :class="{ 'reveal-ready': revealReady, 'is-visible': isVisible }"
  >
    <div class="manifesto bg-primary">
      <div class="manifesto__inner">
        <p
          v-if="merged.eyebrow"
          class="eyebrow text-secondary-light anim anim-eyebrow"
        >
          {{ merged.eyebrow }}
        </p>
        <p
          v-if="merged.lead"
          class="manifesto__lead anim"
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
            class="stat anim"
          >
            <div class="num">
              {{ animatedNums[i] != null ? animatedNums[i] : stat.num }}
            </div>
            <div class="label">
              {{ stat.label }}
            </div>
          </div>
        </div>
        <div
          v-if="merged.ctaButton?.link"
          class="concept-cta anim"
        >
          <CtaButton
            :link="merged.ctaButton.link"
            color="soft"
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
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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

// ---- Count-up animation -------------------------------------------------
// Coerce a stat value to a plain string. Sanity's visual-editing (stega)
// wraps string fields in a value whose toString() yields "[object Object]"
// even though it JSON-serialises (and renders in a Vue {{ }}) as the real
// string — so String() alone isn't safe here.
const toPlain = (v) => {
  if (v == null) return ''
  if (typeof v === 'string') return v
  const s = String(v)
  if (s === '[object Object]') {
    try {
      const j = JSON.parse(JSON.stringify(v))
      if (typeof j === 'string') return j
    }
    catch { /* fall through */ }
  }
  return s
}

// Parse a stat string into { prefix, target, suffix, decimals, sep } so we
// can animate only the numeric part while keeping "%", "/5", French decimal
// commas, etc. intact. Non-numeric stats return target = null (no animation).
const parseStat = (raw) => {
  const str = toPlain(raw)
  const m = str.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/)
  if (!m) return { prefix: '', target: null, suffix: str, decimals: 0, sep: '.' }
  const [, prefix, numStr, suffix] = m
  const sep = numStr.includes(',') ? ',' : '.'
  const normalized = numStr.replace(',', '.')
  const decimals = normalized.includes('.') ? normalized.split('.')[1].length : 0
  return { prefix, target: parseFloat(normalized), suffix, decimals, sep }
}

const formatVal = (value, stat) => {
  const fixed = value.toFixed(stat.decimals)
  const withSep = stat.sep === ',' ? fixed.replace('.', ',') : fixed
  return `${stat.prefix}${withSep}${stat.suffix}`
}

// Per-index animated override. `null` = show the live `stat.num` as-is
// (SSR, no-JS, reduced motion, and before the reveal all render it verbatim).
const animatedNums = ref(stats.value.map(() => null))

const revealReady = ref(false)
const isVisible = ref(false)
const rootEl = ref(null)
let observer = null
let rafIds = []
let timeouts = []

const animateStat = (index) => {
  // Parse fresh at animation time (data has settled by the time the section
  // is scrolled into view), so we never bake in a transient stega value.
  const stat = parseStat(stats.value[index]?.num)
  if (stat.target == null) return
  const duration = 1500 + index * 120
  const start = performance.now()
  // Note: we do NOT seed the value to 0 synchronously. The first rAF frame
  // sets it (≈0) and it counts up; if rAF is ever starved, the value simply
  // stays null → the live final `stat.num` renders, and the safety timeout
  // below guarantees the final value — so numbers can never get stuck at 0.
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
    animatedNums.value[index] = formatVal(stat.target * eased, stat)
    if (t < 1) rafIds.push(requestAnimationFrame(step))
    else animatedNums.value[index] = formatVal(stat.target, stat)
  }
  rafIds.push(requestAnimationFrame(step))
  timeouts.push(setTimeout(() => {
    animatedNums.value[index] = formatVal(stat.target, stat)
  }, duration + 400))
}

onMounted(() => {
  const el = rootEl.value
  if (!el) return

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  // No IntersectionObserver / reduced motion → keep final numbers, no reveal.
  if (reduce || typeof IntersectionObserver === 'undefined') return

  revealReady.value = true

  observer = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      isVisible.value = true
      stats.value.forEach((_, i) => animateStat(i))
      observer.disconnect()
      observer = null
    }
  }, { threshold: 0.25 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  rafIds.forEach(id => cancelAnimationFrame(id))
  timeouts.forEach(id => clearTimeout(id))
  rafIds = []
  timeouts = []
})
</script>

<style scoped>
.concept-section {
  margin-top: var(--gap-section, 4.5rem);
  /* No extra inset: the teal block spans the same max-container-width box as
     the carousel colour blocks, so their side edges line up. */
  padding-inline: 0;
}

.manifesto {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  color: #fff;
  /* Layered depth instead of a flat fill: a diagonal teal gradient with two
     soft radial highlights (warm top-right, mint bottom-left). */
 
  box-shadow: 0 24px 60px rgba(12, 30, 30, 0.22);
}

.manifesto__inner {
  position: relative;
  z-index: 1;
}

.eyebrow {
  position: relative;
  display: inline-block;
  margin: 0 0 8px;
  padding-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Accent line under the eyebrow (visible by default; grows in on reveal). */
.eyebrow::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 46px;
  height: 2px;
  border-radius: 2px;
  background: rgb(var(--v-theme-secondary));
  transform: translateX(-50%) scaleX(1);
  transform-origin: center;
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

.stat {
  position: relative;
}

.manifesto__stats .num {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

.manifesto__stats .label {
  margin-top: 6px;
  font-size: 15px;
  color: #bcd3ce;
}

/* Subtle divider between stats (desktop only). */
@media (min-width: 769px) {
  .stat:not(:first-child)::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 46px;
    background: linear-gradient(transparent, rgba(255, 255, 255, 0.18), transparent);
  }
}

@media (hover: hover) {
  .stat {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .stat:hover {
    transform: translateY(-6px);
  }

  .stat .num {
    transition: text-shadow 0.4s ease;
  }

  .stat:hover .num {
    text-shadow: 0 8px 26px rgba(120, 200, 172, 0.55);
  }
}

/* ---- Scroll-reveal (only when JS enables it, off for reduced motion) --- */
.reveal-ready .manifesto {
  opacity: 0;
  transform: translateY(28px) scale(0.986);
  transition:
    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-ready.is-visible .manifesto {
  opacity: 1;
  transform: none;
}

.reveal-ready .anim {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-ready.is-visible .anim {
  opacity: 1;
  transform: none;
}

/* Eyebrow accent line grows in with the cascade. */
.reveal-ready .eyebrow::after {
  transform: translateX(-50%) scaleX(0);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
}

.reveal-ready.is-visible .eyebrow::after {
  transform: translateX(-50%) scaleX(1);
}

/* Staggered delays for the cascade. */
.reveal-ready .anim-eyebrow { transition-delay: 0.08s; }
.reveal-ready .manifesto__lead { transition-delay: 0.18s; }
.reveal-ready .stat:nth-child(1) { transition-delay: 0.3s; }
.reveal-ready .stat:nth-child(2) { transition-delay: 0.4s; }
.reveal-ready .stat:nth-child(3) { transition-delay: 0.5s; }
.reveal-ready .stat:nth-child(4) { transition-delay: 0.6s; }
.reveal-ready .concept-cta { transition-delay: 0.72s; }

@media (max-width: 768px) {
  .concept-section{
    margin-top: 20px;
  }
  .manifesto {
    padding: 36px 22px;
    border-radius:0;
  }

  .manifesto__stats {
    grid-template-columns: 1fr 1fr;
  }

  .manifesto__stats .num {
    font-size: 30px;
  }

  .manifesto__stats .label {
    font-size: 14px;
  }

  .manifesto__lead {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .manifesto,
  .anim,
  .stat,
  .eyebrow::after,
  .stat .num {
    transition: none !important;
  }
}
</style>
