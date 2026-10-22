<template>
  <v-card
    id="paiement"
    class="pa-5"
  >
    <div class="d-flex align-center mb-4">
      <h2 class="text-subtitle-1 font-weight-bold">
        Paiement
      </h2>
      <v-spacer />
      <EspaceStatutPaiement
        :paiement="detail.paiement"
        :etat="detail.etat"
      />
    </div>

    <v-alert
      v-if="aRegler"
      :type="detail.paiement.statut === 'en_retard' ? 'error' : 'warning'"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex flex-column flex-sm-row align-sm-center ga-3">
        <div class="flex-grow-1">
          <div class="font-weight-bold">
            Il reste {{ euros(detail.paiement.reste) }} à régler
          </div>
          <div
            v-if="detail.paiement.echeance"
            class="text-body-2"
          >
            Date limite le {{ formatDate(detail.paiement.echeance, 'D MMMM YYYY') }}, soit {{ detail.paiement.delaiJours }} jours avant le départ. Passé cette date, votre place n'est plus garantie.
          </div>
        </div>
        <v-btn
          v-if="detail.lienPaiement"
          color="secondary"
          rounded="pill"
          class="flex-shrink-0"
          @click="dialogue = true"
        >
          Payer en ligne
        </v-btn>
      </div>
    </v-alert>

    <v-row dense>
      <v-col
        v-for="m in montants"
        :key="m.label"
        cols="12"
        sm="4"
      >
        <v-sheet
          rounded="lg"
          :color="m.du ? 'yellow-light-2' : 'surface-panel'"
          class="pa-4"
        >
          <div class="label">
            {{ m.label }}
          </div>
          <div
            class="text-h6 font-weight-bold"
            :class="m.du ? 'text-orange-darken-4' : ''"
          >
            {{ m.valeur === null ? '—' : euros(m.valeur) }}
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <h3 class="text-body-1 font-weight-bold mt-6 mb-2">
      Paiements reçus
    </h3>
    <v-table
      v-if="detail.paiements?.paiements?.length"
      density="comfortable"
    >
      <thead>
        <tr>
          <th>Date</th>
          <th>Moyen</th>
          <th class="text-right">
            Montant
          </th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(p, i) in detail.paiements.paiements"
          :key="i"
        >
          <td class="text-no-wrap">
            {{ p.le ? formatDate(p.le, 'DD/MM/YYYY') : '—' }}
          </td>
          <td>{{ moyen(p) }}</td>
          <td class="text-right font-weight-medium text-no-wrap">
            {{ euros(p.montant) }}<div
              v-if="p.rembourse"
              class="text-caption text-primary-light-2"
            >
              dont {{ euros(p.rembourse) }} remboursés
            </div>
          </td>
          <td>
            <v-chip
              size="small"
              variant="tonal"
              :color="p.statut === 'paye' ? 'green' : 'orange-darken-4'"
            >
              {{ p.statut === 'paye' ? 'Reçu' : 'En attente' }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
    <p
      v-else
      class="text-body-2 text-primary-light-2"
    >
      Aucun paiement détaillé pour ce dossier.
    </p>
    <p
      v-if="detail.paiements?.horsListe || (detail.paiements && !detail.paiements.complet)"
      class="text-caption text-primary-light-2 mt-3 mb-0"
    >
      <span v-if="detail.paiements.horsListe">« Déjà réglé » comprend aussi {{ euros(detail.paiements.horsListe) }} réglés hors ligne, pas encore détaillés ici.</span>
      <span v-if="!detail.paiements.complet">L'historique n'a pas pu être lu entièrement, réessayez plus tard.</span>
    </p>

    <v-dialog
      v-model="dialogue"
      max-width="440"
    >
      <!-- La modale est rendue hors de la page : la casse normale des boutons doit y être redonnée. -->
      <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
        <v-card class="pa-6">
          <div class="d-flex align-start mb-4">
            <div>
              <h2 class="text-h6 font-weight-bold">
                Régler le solde
              </h2>
              <div class="text-caption text-primary-light-2">
                Dossier n° {{ detail.id }}
              </div>
            </div>
            <v-spacer />
            <v-btn
              :icon="mdiClose"
              variant="text"
              size="small"
              aria-label="Fermer"
              @click="dialogue = false"
            />
          </div>
          <v-sheet
            rounded="lg"
            color="surface-panel"
            class="pa-4 mb-4 text-body-2"
          >
            <div class="d-flex justify-space-between py-1">
              <span>Prix du voyage</span><span>{{ euros(detail.paiement.total) }}</span>
            </div>
            <div class="d-flex justify-space-between py-1">
              <span>Déjà réglé</span><span>− {{ euros(detail.paiement.paye || 0) }}</span>
            </div>
            <v-divider class="my-2" />
            <div class="d-flex justify-space-between font-weight-bold text-body-1">
              <span>Solde à régler</span><span>{{ euros(detail.paiement.reste) }}</span>
            </div>
          </v-sheet>
          <v-btn
            :href="detail.lienPaiement"
            color="secondary"
            rounded="pill"
            block
            size="large"
          >
            Payer {{ euros(detail.paiement.reste) }}
          </v-btn>
          <div class="d-flex align-center justify-center ga-2 mt-3 text-caption text-primary-light-2">
            <v-icon
              :icon="mdiLock"
              size="14"
            />Paiement sécurisé par carte ou virement
          </div>
        </v-card>
      </v-defaults-provider>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { mdiClose, mdiLock } from '@mdi/js'

const props = defineProps({
  detail: { type: Object, required: true },
})

const dialogue = ref(false)
const euros = n => formatNumber(n, 'currency', '€', 'euro')
const aRegler = computed(() => ['a_regler', 'en_retard'].includes(props.detail.paiement?.statut) && props.detail.etat !== 'passe')
const montants = computed(() => [
  { label: 'Prix total', valeur: props.detail.paiement.total },
  { label: 'Déjà réglé', valeur: props.detail.paiement.paye },
  { label: 'Reste à payer', valeur: props.detail.paiement.reste, du: aRegler.value },
])
// Règlements saisis dans Ulysse (journal d'encaissements).
const HORS_LIGNE = { cheque_vacances: 'Chèque vacances', cheque: 'Chèque', virement: 'Virement direct', especes: 'Espèces', autre: 'Règlement hors ligne' }
const moyen = (p) => {
  if (p.via === 'Hors ligne') return HORS_LIGNE[p.moyen] || 'Règlement hors ligne'
  return [p.moyen === 'carte' ? 'Carte' : p.moyen === 'virement' ? 'Virement' : null, p.via === 'Alma' ? 'Alma (3x)' : null].filter(Boolean).join(' · ') || p.via
}
</script>

<style scoped>
.label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-primary), 0.6);
}
</style>
