<template>
  <span
    v-if="!code"
    class="bo-voyage__code"
  >{{ title }}</span>
  <span
    v-else
    class="bo-voyage"
  >
    <span class="bo-voyage__code">{{ code }}</span>
    <span :class="inline ? 'bo-muted ml-2' : 'bo-voyage__title'">{{ title }}</span>
  </span>
</template>

<script setup>
// Libellé d'un voyage dans une liste de départs.
//
// Le code BMS (« Pays - CODE », ex. « France - FR-BER-01 ») porte l'identité :
// c'est lui qu'on cherche du regard dans une liste longue, et lui qu'on dicte
// au téléphone. Le titre commercial ne sert qu'à lever un doute, il passe donc
// en appui — sur une seconde ligne, ou sur la même quand la table est déjà
// dense (`inline`).
defineProps({
  code: { type: String, default: '' },
  title: { type: String, default: '' },
  inline: { type: Boolean, default: false }
})
</script>
