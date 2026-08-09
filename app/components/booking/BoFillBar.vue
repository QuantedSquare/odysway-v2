<template>
  <!-- Sans capacité connue (aucun départ à venir), une jauge vide à « 0/? »
       est du bruit : on n'affiche rien à mesurer. -->
  <span
    v-if="!total"
    class="bo-hint"
  >—</span>
  <div
    v-else
    class="bo-fill"
  >
    <div
      class="bo-fill__bar"
      role="img"
      :aria-label="`${booked} places réservées sur ${total}`"
    >
      <div
        class="bo-fill__in"
        :class="state"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <span class="bo-fill__n"><b>{{ booked }}</b>/{{ total }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  booked: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

const percent = computed(() => {
  if (!props.total) return 0
  return Math.min(100, Math.round((props.booked / props.total) * 100))
})

const state = computed(() => {
  if (!props.total) return ''
  if (props.booked > props.total) return 'bo-fill__in--over'
  if (props.booked === props.total) return 'bo-fill__in--full'
  return ''
})
</script>
