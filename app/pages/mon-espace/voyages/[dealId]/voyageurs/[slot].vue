<template>
  <div class="d-flex flex-column ga-5">
    <v-btn
      :to="`/mon-espace/voyages/${route.params.dealId}#voyageurs`"
      variant="text"
      :prepend-icon="mdiArrowLeft"
      class="align-self-start px-0"
    >
      Retour au dossier
    </v-btn>

    <v-skeleton-loader
      v-if="chargement"
      type="article, card"
    />
    <v-alert
      v-else-if="erreur && !donnees"
      type="error"
      variant="tonal"
    >
      {{ erreur }}
    </v-alert>

    <template v-else-if="donnees">
      <div>
        <h1 class="text-h5 text-md-h4 font-weight-bold">
          {{ donnees.voyageur.moi ? 'Mon profil voyageur' : `Profil ${dePrenom(donnees.voyageur.prenom)}` }}
        </h1>
        <p class="text-body-2 text-primary-light-2 mt-1">
          Ces informations sont transmises à nos hôtes et à votre accompagnateur, jamais à des tiers.
        </p>
      </div>

      <v-alert
        v-if="donnees.precedent && !repris"
        type="info"
        variant="tonal"
      >
        <div class="d-flex flex-column flex-sm-row align-sm-center ga-3">
          <div class="flex-grow-1 text-body-2">
            Vous avez déjà rempli votre profil pour un précédent voyage<span v-if="donnees.precedent.pieceNumeroFin"> (pièce se terminant par {{ donnees.precedent.pieceNumeroFin }})</span>. Reprendre ces informations ?
          </div>
          <v-btn
            color="primary"
            rounded="pill"
            size="small"
            :loading="enCours === 'reprendre'"
            class="flex-shrink-0"
            @click="reprendre"
          >
            Reprendre mes informations
          </v-btn>
        </div>
      </v-alert>

      <v-alert
        v-if="message"
        ref="blocMessage"
        :type="message.type"
        variant="tonal"
        closable
        @click:close="message = null"
      >
        {{ message.texte }}
      </v-alert>

      <!-- Pièce d'identité : encadré « à compléter » de la maquette tant qu'elle manque. -->
      <v-card
        id="piece"
        class="pa-5"
        :color="pieceAlerte ? 'yellow-light-2' : undefined"
        :class="pieceAlerte ? 'border-alerte' : ''"
      >
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon
            v-if="pieceAlerte"
            :icon="mdiAlertOutline"
            color="orange-darken-4"
          />
          <h2
            class="text-subtitle-1 font-weight-bold"
            :class="pieceAlerte ? 'text-orange-darken-4' : ''"
          >
            {{ pieceAlerte ? 'Pièce d\'identité à compléter' : 'Pièce d\'identité' }}
          </h2>
        </div>
        <p class="text-body-2 text-primary-light-2 mb-4">
          Les billets et les réservations sont émis au nom exact figurant sur la pièce.
          Elle doit être valable au moins {{ donnees.validiteMois }} mois après le retour<span v-if="profil.completude.validiteRequise">, soit jusqu'au {{ formatDate(profil.completude.validiteRequise, 'D MMMM YYYY') }}</span>.
        </p>
        <v-alert
          v-if="profil.completude.expireTropTot"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Cette pièce expire avant la date requise. Pensez à la renouveler et à mettre à jour ces informations.
        </v-alert>

        <v-radio-group
          v-model="form.pieceType"
          inline
          hide-details
          class="mb-3"
        >
          <v-radio
            label="Passeport"
            value="passeport"
          />
          <v-radio
            label="Carte d'identité"
            value="carte_identite"
          />
        </v-radio-group>

        <v-row dense>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-if="modifierNumero || !profil.pieceNumeroFin"
              v-model="form.pieceNumero"
              label="Numéro"
              variant="outlined"
              autocomplete="off"
              class="numero"
              hint="Chiffré dès réception : seuls les 4 derniers caractères restent lisibles."
              persistent-hint
            />
            <v-text-field
              v-else
              :model-value="`••••• ${profil.pieceNumeroFin}`"
              label="Numéro"
              variant="outlined"
              readonly
              class="numero"
            >
              <template #append-inner>
                <v-btn
                  variant="text"
                  size="small"
                  @click="modifierNumero = true"
                >
                  Modifier
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="form.pieceExpiration"
              label="Date d'expiration"
              type="date"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="form.piecePays"
              :items="countries"
              item-title="title"
              item-value="value"
              label="Pays de délivrance"
              variant="outlined"
              clearable
            />
          </v-col>
        </v-row>

        <div class="label mt-2 mb-2">
          Copie de la pièce (page photo)
        </div>
        <div
          v-if="profil.scan"
          class="d-flex flex-wrap align-center ga-3"
        >
          <v-chip
            :prepend-icon="mdiFileCheckOutline"
            color="green"
            variant="tonal"
          >
            Déposée le {{ formatDate(profil.scan.deposeLe, 'D MMMM YYYY') }}
          </v-chip>
          <v-btn
            variant="text"
            size="small"
            :loading="enCours === 'voir'"
            @click="voirPiece"
          >
            Voir
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            @click="choisirFichier"
          >
            Remplacer
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            color="secondary"
            :loading="enCours === 'supprimer'"
            @click="supprimerPiece"
          >
            Supprimer
          </v-btn>
        </div>
        <v-btn
          v-else
          variant="outlined"
          rounded="pill"
          :prepend-icon="mdiPlus"
          :loading="enCours === 'deposer'"
          @click="choisirFichier"
        >
          Déposer un fichier ou une photo
        </v-btn>
        <input
          ref="champFichier"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/heic,image/heif"
          class="d-none"
          @change="deposerPiece"
        >
        <p class="text-caption text-primary-light-2 mt-2 mb-0">
          PDF, JPEG, PNG ou photo iPhone, 10 Mo maximum. Stockée de façon privée, supprimée {{ donnees.conservationScanJours }} jours après votre retour.
        </p>
      </v-card>

      <v-card class="pa-5">
        <div class="d-flex align-center mb-3">
          <h2 class="text-subtitle-1 font-weight-bold">
            Préférences alimentaires
          </h2>
          <v-spacer />
          <span class="text-caption text-primary-light-2">Transmises aux familles d'accueil</span>
        </div>
        <v-chip-group
          v-model="form.regimes"
          multiple
          filter
          column
          selected-class="text-primary"
        >
          <v-chip
            v-for="r in donnees.regimesDisponibles"
            :key="r.valeur"
            :value="r.valeur"
            variant="outlined"
          >
            {{ r.libelle }}
          </v-chip>
        </v-chip-group>
        <v-text-field
          v-model="form.allergies"
          label="Allergies ou intolérances"
          variant="outlined"
          class="mt-4"
          counter="500"
        />
      </v-card>

      <v-card class="pa-5">
        <h2 class="text-subtitle-1 font-weight-bold mb-1">
          Personne à prévenir en cas d'urgence
        </h2>
        <p class="text-caption text-primary-light-2 mb-4">
          Communiquée à l'accompagnateur uniquement pendant le voyage.
        </p>
        <v-row dense>
          <v-col
            cols="12"
            sm="5"
          >
            <v-text-field
              v-model="form.urgenceNom"
              label="Nom"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            sm="3"
          >
            <v-text-field
              v-model="form.urgenceLien"
              label="Lien (conjoint, parent…)"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            sm="4"
          >
            <v-text-field
              v-model="form.urgenceTelephone"
              label="Téléphone"
              type="tel"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-card>

      <v-card class="pa-5">
        <h2 class="text-subtitle-1 font-weight-bold mb-3">
          Ce qu'il faut savoir {{ donnees.voyageur.moi ? 'sur moi' : `sur ${donnees.voyageur.prenom || 'ce voyageur'}` }}
        </h2>
        <v-textarea
          v-model="form.notes"
          label="Rythme, santé, envies, appréhensions"
          variant="outlined"
          rows="4"
          auto-grow
          counter="2000"
          hint="Lu par votre conseiller et votre accompagnateur avant le départ."
          persistent-hint
        />
        <div class="d-flex flex-wrap align-center ga-4 mt-5">
          <v-btn
            color="primary"
            rounded="pill"
            size="large"
            :loading="enCours === 'enregistrer'"
            @click="enregistrer"
          >
            Enregistrer le profil
          </v-btn>
          <span
            v-if="profil.misAJourLe"
            class="text-caption text-primary-light-2"
          >Dernière modification le {{ formatDate(profil.misAJourLe, 'D MMMM YYYY') }}</span>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { mdiAlertOutline, mdiArrowLeft, mdiFileCheckOutline, mdiPlus } from '@mdi/js'

definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Profil voyageur — Odysway', robots: 'noindex, nofollow' })

const route = useRoute()
const { api, chargerMoi } = useEspace()

const chemin = computed(() => `dossiers/${route.params.dealId}/voyageurs/${route.params.slot}`)
const donnees = ref(null)
const chargement = ref(true)
const erreur = ref(null)
const message = ref(null)
const enCours = ref(null)
const repris = ref(false)
const modifierNumero = ref(false)
const champFichier = ref(null)
const blocMessage = ref(null)

// Le bouton d'enregistrement est en bas, le message en haut : on l'amène à l'écran.
watch(message, (m) => {
  if (m) nextTick(() => blocMessage.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
})

const form = reactive({
  pieceType: null,
  pieceNumero: '',
  pieceExpiration: '',
  piecePays: null,
  regimes: [],
  allergies: '',
  urgenceNom: '',
  urgenceLien: '',
  urgenceTelephone: '',
  notes: '',
})

const profil = computed(() => donnees.value?.profil || { completude: {} })
const pieceAlerte = computed(() => !profil.value.completude.piece || profil.value.completude.expireTropTot)

const texteErreur = err => err?.data?.statusMessage || err?.statusMessage || 'Une erreur est survenue. Réessayez dans un instant.'

const remplir = (p) => {
  Object.assign(form, {
    pieceType: p.pieceType,
    pieceNumero: '',
    pieceExpiration: p.pieceExpiration || '',
    piecePays: p.piecePays,
    regimes: [...(p.regimes || [])],
    allergies: p.allergies,
    urgenceNom: p.urgenceNom,
    urgenceLien: p.urgenceLien,
    urgenceTelephone: p.urgenceTelephone,
    notes: p.notes,
  })
  modifierNumero.value = false
}

// « Je mange de tout » exclut les autres puces, et inversement.
watch(() => [...form.regimes], (apres, avant = []) => {
  if (apres.includes('tout') && apres.length > 1) {
    form.regimes = avant.includes('tout') ? apres.filter(r => r !== 'tout') : ['tout']
  }
})

const charger = async () => {
  donnees.value = await api(chemin.value)
  remplir(donnees.value.profil)
}

const enregistrer = async () => {
  message.value = null
  enCours.value = 'enregistrer'
  try {
    const corps = { ...form }
    // Numéro absent = inchangé : le navigateur ne connaît jamais l'ancien.
    if (!modifierNumero.value && donnees.value.profil.pieceNumeroFin) delete corps.pieceNumero
    else if (!corps.pieceNumero) corps.pieceNumero = donnees.value.profil.pieceNumeroFin ? null : undefined
    const { profil: p } = await api(chemin.value + '/profil', { method: 'POST', body: corps })
    donnees.value = { ...donnees.value, profil: p }
    remplir(p)
    message.value = p.completude.expireTropTot
      ? { type: 'warning', texte: 'Profil enregistré, mais la pièce d\'identité expire avant la date requise.' }
      : { type: 'success', texte: p.completude.complet ? 'Profil enregistré et complet. Merci !' : 'Profil enregistré. Il reste des informations à compléter.' }
  }
  catch (err) {
    message.value = { type: 'error', texte: texteErreur(err) }
  }
  finally {
    enCours.value = null
  }
}

const reprendre = async () => {
  enCours.value = 'reprendre'
  try {
    const { profil: p } = await api(chemin.value + '/profil', { method: 'POST', body: { reprendre: true } })
    donnees.value = { ...donnees.value, profil: p }
    remplir(p)
    repris.value = true
    message.value = { type: 'success', texte: 'Informations reprises. Vérifiez-les, puis déposez la copie de la pièce.' }
  }
  catch (err) {
    message.value = { type: 'error', texte: texteErreur(err) }
  }
  finally {
    enCours.value = null
  }
}

const choisirFichier = () => champFichier.value?.click()

const deposerPiece = async (e) => {
  const fichier = e.target.files?.[0]
  e.target.value = ''
  if (!fichier) return
  if (fichier.size > 10 * 1024 * 1024) {
    message.value = { type: 'error', texte: 'Fichier trop lourd : 10 Mo maximum.' }
    return
  }
  enCours.value = 'deposer'
  try {
    const corps = new FormData()
    corps.append('fichier', fichier)
    await api(chemin.value + '/piece', { method: 'POST', body: corps })
    await charger()
    message.value = { type: 'success', texte: 'Copie de la pièce déposée.' }
  }
  catch (err) {
    message.value = { type: 'error', texte: texteErreur(err) }
  }
  finally {
    enCours.value = null
  }
}

const voirPiece = async () => {
  enCours.value = 'voir'
  // Onglet ouvert pendant le clic (sinon bloqué comme fenêtre surgissante),
  // rempli quand le lien de 60 s arrive.
  const onglet = window.open('', '_blank')
  try {
    const { url } = await api(chemin.value + '/piece')
    if (onglet) onglet.location.href = url
    else window.location.assign(url)
  }
  catch (err) {
    onglet?.close()
    message.value = { type: 'error', texte: texteErreur(err) }
  }
  finally {
    enCours.value = null
  }
}

const supprimerPiece = async () => {
  enCours.value = 'supprimer'
  try {
    await api(chemin.value + '/piece', { method: 'DELETE' })
    await charger()
    message.value = { type: 'success', texte: 'Copie supprimée.' }
  }
  catch (err) {
    message.value = { type: 'error', texte: texteErreur(err) }
  }
  finally {
    enCours.value = null
  }
}

onMounted(async () => {
  try {
    await chargerMoi()
    await charger()
    if (route.hash) nextTick(() => document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
  catch (err) {
    if (err?.statusCode === 404) erreur.value = 'Ce profil n\'est pas accessible depuis votre compte.'
    else if (err?.statusCode !== 401) erreur.value = 'Impossible de charger ce profil pour le moment.'
  }
  finally {
    chargement.value = false
  }
})
</script>

<style scoped>
.label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-primary), 0.6);
}
.border-alerte {
  border: 1px solid rgb(var(--v-theme-yellow));
}
.numero :deep(input) {
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
}
</style>
