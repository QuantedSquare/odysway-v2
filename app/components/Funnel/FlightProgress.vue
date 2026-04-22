<template>
  <div class="flight-progress">
    <div
      v-if="!reducedMotion"
      class="flight-progress__track-wrapper"
    >
      <div class="flight-progress__track" />
      <div
        class="flight-progress__fill"
        :style="{ width: `${progress}%` }"
      />
      <div
        class="flight-progress__plane"
        :style="{ left: `${progress}%` }"
      >
        <v-icon
          :icon="walkIcon"
          color="secondary"
          class="rotate-icon"
          size="28"
        />
      </div>
    </div>
    <v-progress-linear
      v-else
      indeterminate
      color="secondary"
      rounded
      height="4"
    />
    <Transition name="flight-text">
      <div
        v-if="text"
        class="flight-progress__text text-body-2 text-medium-emphasis"
      >
        {{ text }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { mdiRun, mdiWalk } from '@mdi/js'

const props = defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['finished'])

const progress = ref(0)
const reducedMotion = ref(false)
const walkIcon = ref(mdiWalk)

let rafId = null
let walkIntervalId = null

const startWalkCycle = () => {
  if (walkIntervalId !== null) return
  walkIntervalId = setInterval(() => {
    walkIcon.value = walkIcon.value === mdiWalk ? mdiRun : mdiWalk
  }, 200)
}

const stopWalkCycle = () => {
  if (walkIntervalId !== null) {
    clearInterval(walkIntervalId)
    walkIntervalId = null
  }
}
let tweenStart = 0
let tweenFrom = 0
let tweenTo = 0
let tweenDuration = 0
let tweenEasing = t => t
let tweenOnDone = null

const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const cancelTween = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

const tween = (to, duration, easing, onDone) => {
  cancelTween()
  tweenFrom = progress.value
  tweenTo = to
  tweenDuration = duration
  tweenEasing = easing
  tweenStart = performance.now()
  tweenOnDone = onDone || null

  const step = (now) => {
    const elapsed = now - tweenStart
    const t = Math.min(elapsed / tweenDuration, 1)
    const eased = tweenEasing(t)
    progress.value = tweenFrom + (tweenTo - tweenFrom) * eased
    if (t < 1) {
      rafId = requestAnimationFrame(step)
    }
    else {
      rafId = null
      const cb = tweenOnDone
      tweenOnDone = null
      if (cb) cb()
    }
  }

  rafId = requestAnimationFrame(step)
}

const startSlowTween = () => {
  progress.value = 0
  startWalkCycle()
  // Phase 1: quick takeoff to mid-course
  tween(55, 1400, easeOutCubic, () => {
    // Phase 2: cruise smoothly toward 80%
    tween(80, 3200, easeOutCubic, () => {
      // Phase 3: imperceptible creep so the plane never sits still
      tween(93, 9000, easeOutCubic)
    })
  })
}

const finishTween = () => {
  tween(100, 600, easeInOutCubic, () => {
    stopWalkCycle()
    emit('finished')
  })
}

watch(() => props.loading, (isLoading) => {
  if (reducedMotion.value) {
    if (!isLoading) {
      emit('finished')
    }
    return
  }
  if (isLoading) {
    startSlowTween()
  }
  else {
    // Always finish — never gate on progress.value, otherwise a fast
    // resolution (before the first rAF tick) leaves the component stuck
    // and 'finished' is never emitted.
    finishTween()
  }
}, { immediate: false })

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  if (reducedMotion.value) {
    if (!props.loading) emit('finished')
    return
  }
  if (props.loading) {
    startSlowTween()
  }
  else {
    finishTween()
  }
})

onBeforeUnmount(() => {
  cancelTween()
  stopWalkCycle()
})
</script>

<style scoped>
.flight-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  min-height: 56px;
  padding: 0 14px;
}

.flight-progress__track-wrapper {
  position: relative;
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
}

.flight-progress__track {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 0;
  border-top: 2px dashed rgba(43, 76, 82, 0.2);
}

.flight-progress__fill {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 3px;
  background: rgb(219, 102, 68);
  border-radius: 3px;
  transition: width 300ms ease-out;
}

.flight-progress__plane {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) rotate(10deg);
  transition: left 300ms ease-out;
  filter: drop-shadow(0 4px 8px rgba(219, 102, 68, 0.25));
  pointer-events: none;
}

.flight-progress__text {
  margin-top: 12px;
  text-align: center;
}

.flight-text-enter-active {
  transition: opacity 400ms ease 150ms, transform 400ms ease 150ms;
}
.flight-text-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
