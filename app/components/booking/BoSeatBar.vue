<template>
  <span
    v-if="!max"
    class="bo-hint"
  >—</span>
  <div
    v-else
    class="bo-seats"
  >
    <span
      class="bo-seats__bar"
      role="img"
      :aria-label="label"
    >
      <i
        class="bo-seats__in"
        :class="guaranteed ? 'bo-seats__in--guaranteed' : ''"
        :style="{ width: `${percent}%` }"
      />
      <span
        v-for="tick in ticks"
        :key="tick.seat"
        class="bo-seats__tick"
        :class="tick.even ? 'bo-seats__tick--even' : ''"
        :style="{ left: `${tick.left}%` }"
      />
    </span>
    <span
      class="bo-seats__n"
      aria-hidden="true"
    >
      <b>{{ realPax }}</b> Ody<template v-if="partners > 0"> · {{ partners }} part.</template> / {{ max }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Remplissage d'un départ.
//
// Deux choses se lisent d'un coup d'œil : où on en est par rapport à la
// capacité, et où tombe le prochain siège pair. La marge marginale d'un siège
// pair vaut environ le double d'un impair (effet chambre double), donc c'est
// vers un pair qu'il faut pousser la prochaine vente — les repères épais.
//
// La jauge mesure `booked` (nos inscrits + les places partenaires), parce que
// c'est ce total qui déclenche la garantie ; le compteur à droite, lui, sépare
// les deux, parce que seuls nos inscrits sont actionnables.
const props = defineProps({
  booked: { type: Number, default: 0 },
  realPax: { type: Number, default: 0 },
  partners: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  guaranteed: { type: Boolean, default: false },
})

const percent = computed(() => {
  if (!props.max) return 0
  return Math.min(100, Math.round((props.booked / props.max) * 100))
})

// Au-delà d'une vingtaine de sièges les repères se touchent sur 56 px de barre
// et ne forment plus qu'un aplat : on les retire plutôt que d'afficher du bruit.
const ticks = computed(() => {
  if (!props.max || props.max > 20) return []
  const out = []
  for (let seat = 1; seat < props.max; seat++) {
    out.push({ seat, even: seat % 2 === 0, left: (seat / props.max) * 100 })
  }
  return out
})

const label = computed(() => {
  const parts = [`${props.realPax} voyageur${props.realPax > 1 ? 's' : ''} Odysway`]
  if (props.partners > 0) parts.push(`${props.partners} place${props.partners > 1 ? 's' : ''} partenaire`)
  return `${parts.join(', ')} sur ${props.max} places${props.guaranteed ? ' — départ garanti' : ''}`
})
</script>
