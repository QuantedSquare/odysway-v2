<template>
  <v-card
    id="voyageurs"
    class="pa-5"
  >
    <div class="d-flex align-center mb-2">
      <h2 class="text-subtitle-1 font-weight-bold">
        Voyageurs
      </h2>
      <v-spacer />
      <span
        v-if="detail.nbVoyageurs"
        class="text-caption text-primary-light-2"
      >{{ voyageurs.length }} sur {{ detail.nbVoyageurs }} renseigné{{ voyageurs.length > 1 ? 's' : '' }}</span>
    </div>
    <p
      v-if="titulaire"
      class="text-body-2 text-primary-light-2 mb-3"
    >
      Invitez vos compagnons de voyage : ils retrouveront le programme et les documents dans leur propre espace, sans voir les montants.
    </p>

    <v-alert
      v-if="message"
      :type="message.type"
      variant="tonal"
      density="compact"
      closable
      class="mb-3"
      @click:close="message = null"
    >
      {{ message.texte }}
    </v-alert>

    <div class="d-flex flex-column">
      <div
        v-for="v in voyageurs"
        :key="v.slot"
        class="voyageur d-flex flex-wrap align-center ga-3 py-3"
      >
        <v-avatar
          color="sky"
          variant="tonal"
          size="38"
          class="font-weight-bold text-body-2"
        >
          {{ (v.prenom?.[0] || '?').toUpperCase() }}{{ (v.nom?.[0] || '').toUpperCase() }}
        </v-avatar>
        <div class="flex-grow-1 nom">
          <div class="font-weight-medium">
            {{ [v.prenom, v.nom].filter(Boolean).join(' ') || `Voyageur ${v.slot}` }}
            <span
              v-if="v.moi"
              class="text-caption text-primary-light-2"
            >(vous)</span>
          </div>
          <div
            v-if="v.dateNaissance"
            class="text-caption text-primary-light-2"
          >
            Né(e) le {{ formatDate(v.dateNaissance, 'D MMMM YYYY') }}
          </div>
          <div class="text-caption text-primary-light-2">
            <template v-if="v.invitation === 'rejoint'">
              A rejoint l'espace
            </template>
            <template v-else-if="v.invitation === 'envoyee'">
              Invitation envoyée à {{ v.email }}
            </template>
            <template v-else-if="v.titulaire">
              Titulaire du dossier
            </template>
          </div>
          <v-btn
            v-if="v.moi && v.titulaireChoisi"
            variant="text"
            size="x-small"
            class="px-0"
            :loading="enCours === `moi-${v.slot}`"
            @click="designer(v, null)"
          >
            Ce n'est pas vous ?
          </v-btn>
        </div>
        <div class="d-flex flex-wrap align-center ga-3 actions">
          <EspaceStatutProfil
            v-if="v.profil"
            :completude="v.profil"
          />
          <v-btn
            v-if="v.peutModifierProfil"
            :to="`/mon-espace/voyages/${detail.id}/voyageurs/${v.slot}`"
            size="small"
            :variant="v.profil?.complet ? 'text' : 'flat'"
            :color="v.profil?.complet ? undefined : 'primary'"
            rounded="pill"
          >
            {{ v.profil?.complet ? 'Voir le profil' : 'Compléter le profil' }}
          </v-btn>
          <v-switch
            v-if="v.peutChangerVisibilite && detail.compagnons"
            :model-value="v.visibleGroupe"
            :loading="enCours === `vis-${v.slot}`"
            density="compact"
            class="flex-grow-0"
            :aria-label="`${v.prenom || 'Ce voyageur'} visible du groupe`"
            @update:model-value="val => changerVisibilite(v, val)"
          >
            <template #label>
              <span class="text-body-2">Visible du groupe</span>
            </template>
          </v-switch>
          <v-btn
            v-if="choixPossible && v.peutSeDesigner"
            size="small"
            variant="tonal"
            color="secondary"
            rounded="pill"
            :loading="enCours === `moi-${v.slot}`"
            @click="designer(v, v.slot)"
          >
            C'est moi
          </v-btn>
          <v-btn
            v-if="titulaire"
            size="small"
            variant="text"
            rounded="pill"
            :prepend-icon="mdiPencilOutline"
            @click="ouvrirCorrection(v)"
          >
            Corriger
          </v-btn>
          <v-btn
            v-if="v.peutInviter"
            size="small"
            variant="outlined"
            rounded="pill"
            @click="ouvrirInvitation(v)"
          >
            {{ v.invitation === 'envoyee' ? 'Modifier' : 'Inviter' }}
          </v-btn>
        </div>
      </div>
    </div>
    <p
      v-if="choixPossible"
      class="text-body-2 text-primary-light-2 mt-2"
    >
      Vous voyagez aussi ? Choisissez « C'est moi » sur votre place : vous pourrez y remplir votre propre profil.
    </p>
    <p
      v-if="!voyageurs.length"
      class="text-body-2 text-primary-light-2"
    >
      Les voyageurs de ce dossier n'ont pas encore été renseignés. Notre équipe les complétera avec vous.
    </p>

    <v-dialog
      v-model="dialogue"
      max-width="440"
    >
      <!-- La modale est rendue hors de la page : la casse normale des boutons doit y être redonnée. -->
      <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
        <v-card class="pa-6">
          <h2 class="text-h6 font-weight-bold mb-1">
            Inviter {{ invite?.prenom || 'ce voyageur' }}
          </h2>
          <p class="text-body-2 text-primary-light-2 mb-4">
            Nous lui envoyons un email. Il ou elle se connectera avec cette adresse, sans mot de passe.
          </p>
          <v-form @submit.prevent="inviter">
            <v-text-field
              v-model="emailInvite"
              label="Adresse email"
              type="email"
              variant="outlined"
              autofocus
              :error-messages="erreurInvite"
            />
            <div class="d-flex ga-2 justify-end">
              <v-btn
                v-if="invite?.invitation === 'envoyee'"
                variant="text"
                color="secondary"
                :loading="enCours === 'annuler'"
                @click="annulerInvitation"
              >
                Annuler l'invitation
              </v-btn>
              <v-spacer />
              <v-btn
                type="submit"
                color="secondary"
                rounded="pill"
                :loading="enCours === 'inviter'"
              >
                Envoyer
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-defaults-provider>
    </v-dialog>
    <v-dialog
      v-model="dialogueCorrection"
      max-width="460"
    >
      <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
        <v-card class="pa-6">
          <h2 class="text-h6 font-weight-bold mb-1">
            Corriger {{ corrige?.prenom || `le voyageur ${corrige?.slot}` }}
          </h2>
          <template v-if="detail.correction && !detail.correction.possible">
            <v-alert
              type="info"
              variant="tonal"
              class="my-4"
            >
              {{ detail.correction.message }}
            </v-alert>
            <div class="d-flex justify-end ga-2">
              <v-btn
                variant="text"
                @click="dialogueCorrection = false"
              >
                Fermer
              </v-btn>
              <v-btn
                to="/contact"
                color="secondary"
                rounded="pill"
              >
                Nous contacter
              </v-btn>
            </div>
          </template>
          <template v-else>
            <p class="text-body-2 text-primary-light-2 mb-4">
              Tels qu'ils figurent sur le passeport ou la carte d'identité : ils servent à l'émission des billets et à l'assurance. Notre équipe est prévenue de chaque correction.
            </p>
            <v-alert
              v-if="erreurCorrection"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ erreurCorrection }}
            </v-alert>
            <v-form @submit.prevent="corriger">
              <v-text-field
                v-model="saisie.prenom"
                label="Prénom"
                variant="outlined"
                autocomplete="off"
                maxlength="50"
                :error-messages="erreursChamps.prenom"
              />
              <v-text-field
                v-model="saisie.nom"
                label="Nom"
                variant="outlined"
                autocomplete="off"
                maxlength="80"
                :error-messages="erreursChamps.nom"
              />
              <v-text-field
                v-model="saisie.dateNaissance"
                label="Date de naissance"
                type="date"
                variant="outlined"
                :max="aujourdhui"
                :error-messages="erreursChamps.dateNaissance"
              />
              <div class="d-flex ga-2 justify-end">
                <v-btn
                  variant="text"
                  @click="dialogueCorrection = false"
                >
                  Annuler
                </v-btn>
                <v-btn
                  type="submit"
                  color="secondary"
                  rounded="pill"
                  :loading="enCours === 'corriger'"
                >
                  Enregistrer
                </v-btn>
              </div>
            </v-form>
          </template>
        </v-card>
      </v-defaults-provider>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { mdiPencilOutline } from '@mdi/js'

const props = defineProps({
  detail: { type: Object, required: true },
})
const emit = defineEmits(['maj'])

const { api } = useEspace()
const titulaire = computed(() => props.detail.role === 'titulaire')
const voyageurs = computed(() => props.detail.voyageurs || [])

const message = ref(null)
const enCours = ref(null)
const dialogue = ref(false)
const invite = ref(null)
const emailInvite = ref('')
const erreurInvite = ref(null)

// Le titulaire n'est reconnu sur aucune place : il peut désigner la sienne.
const choixPossible = computed(() => titulaire.value && !voyageurs.value.some(v => v.moi) && voyageurs.value.some(v => v.peutSeDesigner))

const dialogueCorrection = ref(false)
const corrige = ref(null)
const saisie = ref({ prenom: '', nom: '', dateNaissance: '' })
const erreursChamps = ref({})
const erreurCorrection = ref(null)
const aujourdhui = new Date().toISOString().slice(0, 10)

const texteErreur = err => err?.data?.statusMessage || err?.statusMessage || 'Une erreur est survenue. Réessayez dans un instant.'

const changerVisibilite = async (v, visible) => {
  enCours.value = `vis-${v.slot}`
  try {
    await api(`dossiers/${props.detail.id}/voyageurs/${v.slot}/visibilite`, { method: 'POST', body: { visible } })
    emit('maj')
  }
  catch (err) {
    message.value = { type: 'error', texte: texteErreur(err) }
  }
  finally {
    enCours.value = null
  }
}

const designer = async (v, slot) => {
  enCours.value = `moi-${v.slot}`
  try {
    await api(`dossiers/${props.detail.id}/titulaire`, { method: 'POST', body: { slot } })
    emit('maj')
  }
  catch (err) {
    message.value = { type: 'error', texte: texteErreur(err) }
  }
  finally {
    enCours.value = null
  }
}

const ouvrirCorrection = (v) => {
  corrige.value = v
  saisie.value = { prenom: v.prenom || '', nom: v.nom || '', dateNaissance: v.dateNaissance || '' }
  erreursChamps.value = {}
  erreurCorrection.value = null
  dialogueCorrection.value = true
}

const corriger = async () => {
  const v = corrige.value
  erreursChamps.value = {}
  erreurCorrection.value = null
  enCours.value = 'corriger'
  try {
    const r = await api(`dossiers/${props.detail.id}/voyageurs/${v.slot}/identite`, {
      method: 'POST',
      body: {
        avant: { prenom: v.prenom || null, nom: v.nom || null, dateNaissance: v.dateNaissance || null },
        apres: saisie.value,
      },
    })
    dialogueCorrection.value = false
    message.value = r.resultat === 'inchange'
      ? { type: 'info', texte: 'Aucune modification.' }
      : { type: 'success', texte: `${r.voyageur.prenom} ${r.voyageur.nom} : correction enregistrée.` }
    emit('maj')
  }
  catch (err) {
    erreursChamps.value = err?.data?.data?.erreurs || {}
    erreurCorrection.value = Object.keys(erreursChamps.value).length ? null : texteErreur(err)
    if (err?.data?.data?.code === 'modifie') emit('maj')
  }
  finally {
    enCours.value = null
  }
}

const ouvrirInvitation = (v) => {
  invite.value = v
  emailInvite.value = v.email || ''
  erreurInvite.value = null
  dialogue.value = true
}

const inviter = async () => {
  erreurInvite.value = null
  enCours.value = 'inviter'
  try {
    await api(`dossiers/${props.detail.id}/voyageurs/${invite.value.slot}/invitation`, { method: 'POST', body: { email: emailInvite.value } })
    dialogue.value = false
    message.value = { type: 'success', texte: `Invitation envoyée à ${emailInvite.value.trim()}.` }
    emit('maj')
  }
  catch (err) {
    erreurInvite.value = texteErreur(err)
  }
  finally {
    enCours.value = null
  }
}

const annulerInvitation = async () => {
  enCours.value = 'annuler'
  try {
    await api(`dossiers/${props.detail.id}/voyageurs/${invite.value.slot}/invitation`, { method: 'POST', body: { email: null } })
    dialogue.value = false
    emit('maj')
  }
  catch (err) {
    erreurInvite.value = texteErreur(err)
  }
  finally {
    enCours.value = null
  }
}
</script>

<style scoped>
.voyageur + .voyageur {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.08);
}
.nom {
  min-width: 160px;
}
/* Sur téléphone, les actions passent sous le nom au lieu de l'écraser. */
@media (max-width: 599px) {
  .actions {
    width: 100%;
    padding-left: 50px;
  }
}
</style>
