<template>
  <div class="d-flex flex-column ga-5">
    <div>
      <h1 class="text-h5 text-md-h4 font-weight-bold">
        Bonjour{{ moi?.compte?.prenom ? ` ${moi.compte.prenom}` : '' }}
      </h1>
      <p
        v-if="sousTitre"
        class="text-body-2 text-primary-light-2 mt-1"
      >
        {{ sousTitre }}
      </p>
    </div>

    <template v-if="chargement">
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="list-item-two-line@3" />
    </template>

    <v-alert
      v-else-if="erreur"
      type="error"
      variant="tonal"
    >
      {{ erreur }}
    </v-alert>

    <template v-else-if="!dossiers.length">
      <v-card class="pa-6">
        <h2 class="text-h6 font-weight-bold mb-2">
          Aucun voyage rattaché à cette adresse
        </h2>
        <p class="text-body-2 text-primary-light-2 mb-4">
          Vos dossiers sont retrouvés grâce à l'adresse email de votre réservation. Si vous avez réservé avec une autre adresse, rattachez-la à votre espace.
        </p>
        <div class="d-flex flex-wrap ga-3">
          <v-btn
            to="/mon-espace/rattacher"
            color="secondary"
            rounded="pill"
          >
            Retrouver un dossier
          </v-btn>
          <v-btn
            to="/voyages"
            variant="outlined"
            rounded="pill"
          >
            Découvrir nos voyages
          </v-btn>
        </div>
      </v-card>
    </template>

    <template v-else>
      <div
        v-if="alertes.length"
        class="d-flex flex-column ga-3"
      >
        <v-alert
          v-for="a in alertes"
          :key="a.cle"
          :type="a.type"
          variant="tonal"
          border="start"
        >
          <div class="d-flex flex-column flex-sm-row align-sm-center ga-3">
            <div class="flex-grow-1">
              <div class="font-weight-bold">
                {{ a.titre }}
              </div>
              <div class="text-body-2">
                {{ a.texte }}
              </div>
            </div>
            <v-btn
              :to="a.lien"
              :color="a.type === 'warning' ? 'secondary' : 'primary'"
              rounded="pill"
              size="small"
              class="flex-shrink-0"
            >
              {{ a.action }}
            </v-btn>
          </div>
        </v-alert>
      </div>

      <EspaceTripCard
        v-if="prochain"
        :dossier="prochain"
        :kicker="prochain.etat === 'en_cours' ? 'Voyage en cours' : 'Prochain départ'"
      />

      <v-row v-if="prochain">
        <v-col
          cols="12"
          md="6"
        >
          <v-card class="pa-5 h-100">
            <div class="d-flex align-center mb-3">
              <h2 class="text-subtitle-1 font-weight-bold">
                Avant le départ
              </h2>
              <v-spacer />
              <span
                v-if="checklist.length"
                class="text-caption text-primary-light-2"
              >{{ checklist.filter(c => c.fait).length }} sur {{ checklist.length }}</span>
            </div>
            <v-skeleton-loader
              v-if="!detail"
              type="list-item@3"
            />
            <v-list
              v-else
              density="compact"
              class="pa-0"
            >
              <v-list-item
                v-for="c in checklist"
                :key="c.cle"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar
                    size="26"
                    :color="c.fait ? 'green' : 'orange-darken-4'"
                    variant="tonal"
                  >
                    <v-icon
                      size="15"
                      :icon="c.fait ? mdiCheck : mdiExclamation"
                    />
                  </v-avatar>
                </template>
                <v-list-item-title
                  class="text-body-2"
                  :class="c.fait ? 'text-primary-light-2' : ''"
                >
                  {{ c.titre }}
                </v-list-item-title>
                <v-list-item-subtitle
                  v-if="c.detail"
                  class="text-caption"
                >
                  {{ c.detail }}
                </v-list-item-subtitle>
                <template
                  v-if="!c.fait && c.lien"
                  #append
                >
                  <v-btn
                    :to="c.lien"
                    variant="text"
                    color="secondary"
                    size="small"
                  >
                    {{ c.action }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-card class="pa-5 h-100">
            <h2 class="text-subtitle-1 font-weight-bold mb-3">
              Votre groupe
            </h2>
            <v-skeleton-loader
              v-if="!detail"
              type="list-item@2"
            />
            <EspaceGroupe
              v-else
              :detail="detail"
              compact
            />
          </v-card>
        </v-col>
      </v-row>

      <div v-if="autres.length">
        <h2 class="text-subtitle-1 font-weight-bold mb-3">
          Vos autres voyages
        </h2>
        <div class="d-flex flex-column ga-3">
          <EspaceTripCard
            v-for="d in autres"
            :key="d.id"
            :dossier="d"
            compact
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { mdiCheck, mdiExclamation } from '@mdi/js'

definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Mon espace — Odysway', robots: 'noindex, nofollow' })

const { moi, chargerMoi, api } = useEspace()
const { charger, titre } = useEspaceVoyages()

const chargement = ref(true)
const erreur = ref(null)
const detail = ref(null)

const dossiers = computed(() => moi.value?.dossiers || [])
const actifs = computed(() => dossiers.value.filter(d => ['a_venir', 'en_cours'].includes(d.etat)))
const prochain = computed(() => actifs.value.find(d => d.etat === 'en_cours') || actifs.value[0] || null)
const autres = computed(() => dossiers.value.filter(d => d.id !== prochain.value?.id))

const euros = n => formatNumber(n, 'currency', '€', 'euro')

const alertes = computed(() => {
  const out = []
  for (const d of actifs.value) {
    const p = d.paiement
    if (d.option) {
      out.push({
        cle: `option-${d.id}`,
        type: 'info',
        titre: `Option posée sur ${titre(d)}`,
        texte: d.option.expire
          ? `Votre place est réservée jusqu'au ${formatDate(d.option.expire, 'D MMMM YYYY')}. Réglez l'acompte pour la confirmer.`
          : 'Votre place est réservée pour quelques jours. Réglez l\'acompte pour la confirmer.',
        action: 'Voir le dossier',
        lien: `/mon-espace/voyages/${d.id}`,
      })
    }
    else if (p && ['a_regler', 'en_retard'].includes(p.statut)) {
      out.push({
        cle: `solde-${d.id}`,
        type: 'warning',
        titre: p.statut === 'en_retard'
          ? `Solde de ${euros(p.reste)} en retard`
          : `Solde de ${euros(p.reste)} à régler avant le ${formatDate(p.echeance, 'D MMMM YYYY')}`,
        texte: `${titre(d)} — réglable par carte ou par virement depuis votre dossier.`,
        action: 'Payer le solde',
        lien: `/mon-espace/voyages/${d.id}#paiement`,
      })
    }
  }
  return out
})

const sousTitre = computed(() => {
  if (chargement.value || !dossiers.value.length) return null
  const restant = checklist.value.filter(c => !c.fait).length
  if (prochain.value?.etat === 'en_cours') return 'Bon voyage ! Retrouvez ici toutes les informations de votre séjour.'
  if (prochain.value && restant) return `Il reste ${restant === 1 ? 'une chose' : `${restant} choses`} à finaliser avant votre départ.`
  if (prochain.value) return 'Tout est prêt pour votre départ.'
  return 'Retrouvez ici vos voyages passés.'
})

const checklist = computed(() => {
  const d = prochain.value
  if (!d || !detail.value) return []
  const out = []
  const p = d.paiement
  if (p) {
    out.push({ cle: 'acompte', titre: d.option ? 'Acompte à régler' : 'Acompte réglé', fait: !d.option && (p.paye || 0) > 0, lien: `/mon-espace/voyages/${d.id}#paiement`, action: 'Payer' })
    out.push({
      cle: 'solde',
      titre: p.statut === 'solde' ? 'Solde réglé' : `Solde de ${euros(p.reste)}`,
      detail: p.statut === 'solde' || !p.echeance ? null : `À régler avant le ${formatDate(p.echeance, 'D MMMM YYYY')}`,
      fait: p.statut === 'solde',
      lien: `/mon-espace/voyages/${d.id}#paiement`,
      action: 'Payer',
    })
  }
  const nommes = detail.value.voyageurs?.length || 0
  const attendus = d.nbVoyageurs || nommes
  out.push({
    cle: 'voyageurs',
    titre: 'Voyageurs renseignés',
    detail: attendus ? `${Math.min(nommes, attendus)} sur ${attendus}` : null,
    fait: attendus > 0 && nommes >= attendus,
    lien: `/mon-espace/voyages/${d.id}#voyageurs`,
    action: 'Voir',
  })
  return out
})

onMounted(async () => {
  try {
    await chargerMoi({ forcer: true })
    await charger(dossiers.value.map(d => d.slug))
  }
  catch (err) {
    if (err?.statusCode !== 401) erreur.value = 'Impossible de charger vos voyages pour le moment. Réessayez dans un instant.'
  }
  finally {
    chargement.value = false
  }
  if (prochain.value) {
    try {
      detail.value = await api(`dossiers/${prochain.value.id}`)
    }
    catch {
      detail.value = { voyageurs: [], compagnons: null }
    }
  }
})
</script>
