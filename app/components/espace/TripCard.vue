<template>
  <v-card class="overflow-hidden">
    <div class="d-flex flex-column flex-sm-row">
      <v-img
        :src="image(dossier, compact ? 300 : 600)"
        :alt="`Photo du voyage ${titre(dossier)}`"
        :width="smAndUp ? largeurImage : '100%'"
        :max-width="smAndUp ? largeurImage : undefined"
        :height="smAndUp ? undefined : 140"
        min-height="140"
        cover
        class="flex-shrink-0"
      >
        <v-chip
          v-if="kicker"
          size="small"
          color="white"
          variant="flat"
          class="ma-3 text-uppercase font-weight-bold text-caption"
        >
          {{ kicker }}
        </v-chip>
      </v-img>

      <div class="pa-4 pa-md-5 d-flex flex-column ga-3 flex-grow-1">
        <div>
          <component
            :is="compact ? 'h3' : 'h2'"
            :class="compact ? 'text-subtitle-1' : 'text-h6'"
            class="font-weight-bold"
          >
            {{ titre(dossier) }}
          </component>
          <div class="text-caption text-primary-light-2">
            Dossier n° {{ dossier.id }}<span v-if="dossier.duree"> · {{ dossier.duree }} jours</span><span v-if="dossier.nbVoyageurs"> · {{ dossier.nbVoyageurs }} voyageur{{ dossier.nbVoyageurs > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <div
          v-if="!compact"
          class="d-flex flex-wrap ga-6"
        >
          <div v-if="dossier.depart">
            <div class="fact-label">
              Départ
            </div>
            <div class="font-weight-medium">
              {{ formatDate(dossier.depart, 'D MMMM YYYY') }}
            </div>
          </div>
          <div v-if="dossier.retour">
            <div class="fact-label">
              Retour
            </div>
            <div class="font-weight-medium">
              {{ formatDate(dossier.retour, 'D MMMM YYYY') }}
            </div>
          </div>
          <div v-if="dossier.joursAvantDepart !== null">
            <div class="fact-label">
              Dans
            </div>
            <div class="text-sky">
              <span class="text-h5 font-weight-bold">{{ dossier.joursAvantDepart }}</span> jour{{ dossier.joursAvantDepart > 1 ? 's' : '' }}
            </div>
          </div>
        </div>
        <div
          v-else-if="dossier.depart"
          class="text-caption text-primary-light-2"
        >
          {{ formatDate(dossier.depart, 'D MMM YYYY') }}<span v-if="dossier.retour"> → {{ formatDate(dossier.retour, 'D MMM YYYY') }}</span>
        </div>

        <div class="d-flex flex-wrap align-center ga-2 mt-auto">
          <EspaceStatutPaiement
            v-if="dossier.paiement"
            :paiement="dossier.paiement"
            :etat="dossier.etat"
          />
          <v-chip
            v-if="dossier.role === 'voyageur'"
            size="small"
            variant="tonal"
            color="sky"
          >
            Sur invitation
          </v-chip>
          <v-spacer />
          <v-btn
            v-if="!surLaFiche"
            :to="`/mon-espace/voyages/${dossier.id}`"
            :variant="compact ? 'outlined' : 'flat'"
            rounded="pill"
            :size="compact ? 'small' : 'default'"
          >
            Voir le dossier
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const props = defineProps({
  dossier: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  kicker: { type: String, default: null },
  // Déjà sur la fiche du dossier : pas de lien vers elle-même.
  surLaFiche: { type: Boolean, default: false },
})

const { smAndUp } = useDisplay()
const { titre, image } = useEspaceVoyages()
const largeurImage = computed(() => (props.compact ? 150 : 240))
</script>

<style scoped>
.fact-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-primary), 0.6);
}
</style>
