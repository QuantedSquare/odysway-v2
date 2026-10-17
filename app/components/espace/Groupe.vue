<template>
  <div class="d-flex flex-column ga-4">
    <div v-if="compact && detail.voyageurs?.length">
      <div class="label mb-2">
        Sur votre dossier
      </div>
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="v in detail.voyageurs"
          :key="v.slot"
          size="small"
          variant="tonal"
          :color="v.moi ? 'sky' : 'primary'"
        >
          {{ [v.prenom, v.nom].filter(Boolean).join(' ') }}<span v-if="v.moi">&nbsp;(vous)</span>
        </v-chip>
      </div>
    </div>

    <div v-if="detail.compagnons">
      <div class="label mb-2">
        Les autres voyageurs du départ
      </div>
      <div
        v-if="detail.compagnons.visibles.length || detail.compagnons.autres"
        class="d-flex flex-wrap ga-2"
      >
        <v-chip
          v-for="(nom, i) in detail.compagnons.visibles"
          :key="i"
          size="small"
          variant="outlined"
        >
          {{ nom }}
        </v-chip>
        <v-chip
          v-if="detail.compagnons.autres"
          size="small"
          variant="text"
        >
          {{ detail.compagnons.visibles.length ? '+ ' : '' }}{{ detail.compagnons.autres }} voyageur{{ detail.compagnons.autres > 1 ? 's' : '' }}
        </v-chip>
      </div>
      <p
        v-else
        class="text-body-2 text-primary-light-2"
      >
        Vous êtes les premiers inscrits sur ce départ.
      </p>
      <p class="text-caption text-primary-light-2 mt-2">
        Seuls les voyageurs qui l'ont accepté apparaissent, avec leur prénom et l'initiale de leur nom.
      </p>
    </div>
    <p
      v-else-if="!compact || !detail.voyageurs?.length"
      class="text-body-2 text-primary-light-2"
    >
      Un voyage sur mesure ou en individuel : pas de liste de groupe.
    </p>
  </div>
</template>

<script setup>
defineProps({
  detail: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
</script>

<style scoped>
.label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-primary), 0.6);
}
</style>
