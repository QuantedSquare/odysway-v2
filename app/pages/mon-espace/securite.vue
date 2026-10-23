<template>
  <div class="d-flex flex-column ga-5">
    <div>
      <h1 class="text-h5 text-md-h4 font-weight-bold">
        Connexion et sécurité
      </h1>
      <p class="text-body-2 text-primary-light-2 mt-1">
        Choisissez comment vous connecter à votre espace.
      </p>
    </div>

    <v-alert
      v-if="succes"
      type="success"
      variant="tonal"
      closable
      @click:close="succes = null"
    >
      {{ succes }}
    </v-alert>

    <v-card class="pa-5">
      <h2 class="text-subtitle-1 font-weight-bold mb-2">
        Moyens de connexion
      </h2>
      <p class="text-caption text-primary-light-2 mb-2">
        Compte : <b>{{ moyensConnexion.email }}</b>
      </p>

      <div class="moyen d-flex align-center ga-4 py-4">
        <v-avatar
          color="sky"
          variant="tonal"
          size="40"
        >
          <v-icon :icon="mdiEmailOutline" />
        </v-avatar>
        <div class="flex-grow-1">
          <div class="font-weight-medium">
            Code par email
          </div>
          <div class="text-caption text-primary-light-2">
            Toujours disponible, y compris si vous oubliez votre mot de passe.
          </div>
        </div>
        <v-chip
          size="small"
          variant="tonal"
          color="green"
        >
          Actif
        </v-chip>
      </div>

      <div class="moyen d-flex align-center ga-4 py-4">
        <v-avatar
          color="sky"
          variant="tonal"
          size="40"
        >
          <v-icon :icon="mdiGoogle" />
        </v-avatar>
        <div class="flex-grow-1">
          <div class="font-weight-medium">
            Google
          </div>
          <div class="text-caption text-primary-light-2">
            Avec un compte Google à la même adresse email.
          </div>
        </div>
        <v-chip
          size="small"
          variant="tonal"
          :color="moyensConnexion.google ? 'green' : undefined"
        >
          {{ moyensConnexion.google ? 'Déjà utilisé' : 'Disponible' }}
        </v-chip>
      </div>

      <div class="moyen d-flex flex-wrap align-center ga-4 py-4">
        <v-avatar
          color="sky"
          variant="tonal"
          size="40"
        >
          <v-icon :icon="mdiLockOutline" />
        </v-avatar>
        <div class="flex-grow-1">
          <div class="font-weight-medium">
            Mot de passe
          </div>
          <div class="text-caption text-primary-light-2">
            {{ moyensConnexion.motDePasse
              ? 'Défini : vous pouvez vous connecter sans aller dans votre boîte mail.'
              : 'Facultatif : pour vous connecter sans attendre de code.' }}
          </div>
        </div>
        <v-btn
          :color="moyensConnexion.motDePasse ? undefined : 'secondary'"
          :variant="moyensConnexion.motDePasse ? 'outlined' : 'flat'"
          rounded="pill"
          size="small"
          @click="ouvrir('motDePasse')"
        >
          {{ moyensConnexion.motDePasse ? 'Modifier' : 'Définir un mot de passe' }}
        </v-btn>
      </div>
    </v-card>

    <v-card class="pa-5">
      <h2 class="text-subtitle-1 font-weight-bold mb-2">
        Mon compte
      </h2>

      <p
        v-if="equipe"
        class="text-body-2 text-primary-light-2"
      >
        Ce compte est celui d'un membre de l'équipe Odysway : son adresse et sa suppression se gèrent avec l'administrateur d'Ulysse, pas depuis l'espace client.
      </p>

      <template v-else>
        <div class="moyen d-flex flex-wrap align-center ga-4 py-4">
          <v-avatar
            color="sky"
            variant="tonal"
            size="40"
          >
            <v-icon :icon="mdiAt" />
          </v-avatar>
          <div class="flex-grow-1">
            <div class="font-weight-medium">
              Adresse de connexion
            </div>
            <div class="text-caption text-primary-light-2">
              {{ moyensConnexion.email }}
            </div>
          </div>
          <v-btn
            variant="outlined"
            rounded="pill"
            size="small"
            @click="ouvrir('email')"
          >
            Changer d'adresse
          </v-btn>
        </div>

        <div class="moyen d-flex flex-wrap align-center ga-4 py-4">
          <v-avatar
            color="error"
            variant="tonal"
            size="40"
          >
            <v-icon :icon="mdiAccountRemoveOutline" />
          </v-avatar>
          <div class="flex-grow-1">
            <div class="font-weight-medium">
              Supprimer mon compte
            </div>
            <div class="text-caption text-primary-light-2">
              Efface votre accès à l'espace et votre profil voyageur. Vos réservations restent chez Odysway.
            </div>
          </div>
          <v-btn
            color="error"
            variant="outlined"
            rounded="pill"
            size="small"
            @click="ouvrir('suppression')"
          >
            Supprimer
          </v-btn>
        </div>
      </template>
    </v-card>

    <v-dialog
      v-model="dialogue"
      max-width="500"
      :persistent="envoi"
    >
      <!-- La modale est rendue hors de la page : la casse normale des boutons doit y être redonnée. -->
      <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
        <v-card class="pa-6 dialogue">
          <div class="d-flex align-start mb-3">
            <h2 class="text-h6 font-weight-bold">
              {{ titre }}
            </h2>
            <v-spacer />
            <v-btn
              :icon="mdiClose"
              variant="text"
              size="small"
              aria-label="Fermer"
              :disabled="envoi"
              @click="dialogue = false"
            />
          </div>

          <v-alert
            v-if="erreur"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ erreur }}
          </v-alert>

          <template v-if="etape === 'confirmer'">
            <p class="text-body-2 mb-4">
              Pour votre sécurité, nous envoyons un code à <b>{{ moyensConnexion.email }}</b> avant {{ action === 'suppression' ? 'de supprimer votre compte' : 'de modifier vos moyens de connexion' }}.
            </p>
            <v-btn
              color="secondary"
              rounded="pill"
              block
              :loading="envoi"
              @click="envoyerConfirmation"
            >
              Recevoir le code
            </v-btn>
          </template>

          <v-form
            v-else-if="etape === 'code'"
            @submit.prevent="validerCode"
          >
            <p class="text-body-2 mb-3">
              Code envoyé à <b>{{ moyensConnexion.email }}</b>.
            </p>
            <v-otp-input
              v-model="code"
              length="6"
              type="number"
              variant="outlined"
              autofocus
              :disabled="envoi"
              @finish="validerCode"
            />
            <v-btn
              type="submit"
              color="secondary"
              rounded="pill"
              block
              class="mt-4"
              :loading="envoi"
              :disabled="code.length !== 6"
            >
              Confirmer
            </v-btn>
          </v-form>

          <!-- Changement d'adresse : la nouvelle adresse -->
          <v-form
            v-else-if="action === 'email' && etape === 'saisir'"
            @submit.prevent="demanderEmail"
          >
            <p class="text-body-2 mb-3">
              Vous vous connecterez désormais avec cette adresse. Nous envoyons un code à <b>{{ moyensConnexion.email }}</b> et un autre à la nouvelle adresse : il faudra saisir les deux.
            </p>
            <v-text-field
              v-model="nouvelEmail"
              label="Nouvelle adresse email"
              type="email"
              autocomplete="email"
              variant="outlined"
              autofocus
            />
            <ul class="infos text-body-2 text-primary-light-2 mb-4">
              <li>Les dossiers déjà dans votre espace y restent.</li>
              <li>Ceux réservés avec la nouvelle adresse s'y ajouteront. Pour une autre adresse encore, utilisez <NuxtLink to="/mon-espace/rattacher">Retrouver un dossier</NuxtLink>.</li>
              <li>L'adresse de vos réservations ne change pas : nos emails (confirmation, rappels de solde) partent toujours à celle donnée lors de la réservation. Pour la changer, écrivez à votre conseiller.</li>
            </ul>
            <v-btn
              type="submit"
              color="secondary"
              rounded="pill"
              block
              :loading="envoi"
              :disabled="!!erreurNouvelEmail(nouvelEmail, moyensConnexion.email)"
            >
              Recevoir les codes
            </v-btn>
          </v-form>

          <!-- Changement d'adresse : les deux codes -->
          <v-form
            v-else-if="action === 'email' && etape === 'codes'"
            @submit.prevent="confirmerEmail"
          >
            <p class="text-body-2 mb-4">
              Saisissez les codes reçus. Votre adresse ne change qu'une fois les deux confirmés.
            </p>
            <div
              v-for="c in codesEmail"
              :key="c.cle"
              class="mb-3"
            >
              <div class="text-body-2 d-flex align-center ga-1">
                Code reçu à <b>{{ c.email }}</b>
                <v-icon
                  v-if="c.valide"
                  :icon="mdiCheckCircle"
                  color="green"
                  size="16"
                />
              </div>
              <v-otp-input
                v-model="c.code"
                length="6"
                type="number"
                variant="outlined"
                :disabled="envoi || c.valide"
              />
            </div>
            <v-btn
              type="submit"
              color="secondary"
              rounded="pill"
              block
              :loading="envoi"
              :disabled="!codesEmail.some(c => !c.valide && c.code.length === 6)"
            >
              Confirmer
            </v-btn>
          </v-form>

          <!-- Suppression du compte -->
          <v-form
            v-else-if="action === 'suppression'"
            @submit.prevent="supprimer"
          >
            <p class="text-body-2 font-weight-medium mb-1">
              Ce qui est effacé
            </p>
            <ul class="infos text-body-2 mb-3">
              <li>votre accès à l'espace : code, Google, mot de passe, adresses rattachées ;</li>
              <li>votre profil voyageur : pièce d'identité et sa copie, régime, allergies, contact d'urgence ;</li>
              <li>votre accord pour apparaître auprès des autres voyageurs du groupe.</li>
            </ul>
            <p class="text-body-2 font-weight-medium mb-1">
              Ce qui est conservé
            </p>
            <ul class="infos text-body-2 mb-3">
              <li>vos réservations, paiements et factures : nous devons les garder (obligations comptables) ;</li>
              <li>les profils que vous avez remplis pour d'autres voyageurs : ils leur sont utiles pour partir.</li>
            </ul>
            <p class="text-body-2 text-primary-light-2 mb-4">
              Pour un voyage à venir, votre conseiller vous redemandera vos informations de passeport. Si vous revenez plus tard avec la même adresse, un nouveau compte retrouvera vos réservations. Pour vos autres droits sur vos données, voir notre <NuxtLink
                to="/politique-de-confidentialite"
                target="_blank"
              >politique de confidentialité</NuxtLink>.
            </p>
            <v-checkbox
              v-model="conservationComprise"
              density="compact"
              hide-details
              class="mb-3"
              label="J'ai compris : mon compte et mon profil sont effacés, mes réservations sont conservées."
            />
            <v-text-field
              v-model="motConfirmation"
              :label="`Saisissez ${MOT_SUPPRESSION} pour confirmer`"
              variant="outlined"
              autocomplete="off"
              spellcheck="false"
            />
            <v-btn
              type="submit"
              color="error"
              rounded="pill"
              block
              :loading="envoi"
              :disabled="!suppressionConfirmee({ conservationComprise, confirmation: motConfirmation })"
            >
              Supprimer définitivement mon compte
            </v-btn>
          </v-form>

          <v-form
            v-else
            @submit.prevent="enregistrer"
          >
            <!-- Champ caché : les gestionnaires de mots de passe associent ainsi le mot de passe à l'email. -->
            <input
              type="email"
              autocomplete="username"
              :value="moyensConnexion.email"
              class="d-none"
              readonly
            >
            <v-text-field
              v-model="nouveau"
              label="Nouveau mot de passe"
              :type="voir ? 'text' : 'password'"
              autocomplete="new-password"
              variant="outlined"
              autofocus
              :append-inner-icon="voir ? mdiEyeOff : mdiEye"
              @click:append-inner="voir = !voir"
            />
            <v-text-field
              v-model="confirmation"
              label="Confirmez le mot de passe"
              :type="voir ? 'text' : 'password'"
              autocomplete="new-password"
              variant="outlined"
              :error-messages="confirmation && confirmation !== nouveau ? 'Les deux mots de passe diffèrent' : ''"
            />
            <ul class="regles mb-4">
              <li
                v-for="r in regles"
                :key="r.texte"
                :class="r.ok ? 'text-green' : 'text-primary-light-2'"
              >
                <v-icon
                  :icon="r.ok ? mdiCheckCircle : mdiCircleOutline"
                  size="14"
                  class="mr-1"
                />{{ r.texte }}
              </li>
            </ul>
            <v-btn
              type="submit"
              color="secondary"
              rounded="pill"
              block
              :loading="envoi"
              :disabled="!valide"
            >
              Enregistrer
            </v-btn>
          </v-form>
        </v-card>
      </v-defaults-provider>
    </v-dialog>
  </div>
</template>

<script setup>
import { mdiAccountRemoveOutline, mdiAt, mdiCheckCircle, mdiCircleOutline, mdiClose, mdiEmailOutline, mdiEye, mdiEyeOff, mdiGoogle, mdiLockOutline } from '@mdi/js'

definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Connexion et sécurité — Odysway', robots: 'noindex, nofollow' })

const {
  moi,
  moyensConnexion,
  confirmationRequise,
  envoyerCode,
  verifierCode,
  definirMotDePasse,
  demanderChangementEmail,
  confirmerChangementEmail,
  supprimerCompte,
  chargerMoi,
} = useEspace()

// Un compte de l'équipe ne change pas d'adresse et ne se supprime pas ici (le serveur refuse aussi).
const equipe = computed(() => moi.value?.compte?.equipe === true)

const dialogue = ref(false)
// motDePasse | email | suppression
const action = ref('motDePasse')
// confirmer → code (reconfirmation) → saisir → codes (email seulement)
const etape = ref('saisir')
const code = ref('')
const nouveau = ref('')
const confirmation = ref('')
const voir = ref(false)
const envoi = ref(false)
const erreur = ref(null)
const succes = ref(null)

const nouvelEmail = ref('')
const codesEmail = ref([])
const conservationComprise = ref(false)
const motConfirmation = ref('')

const titre = computed(() => {
  if (etape.value === 'confirmer' || etape.value === 'code') return 'Confirmez votre identité'
  if (action.value === 'email') return etape.value === 'codes' ? 'Confirmez les deux adresses' : 'Changer d\'adresse email'
  if (action.value === 'suppression') return 'Supprimer votre compte'
  return moyensConnexion.value.motDePasse ? 'Nouveau mot de passe' : 'Définir un mot de passe'
})

// Les règles toujours affichées, cochées au fil de la saisie.
const REGLES = [
  `Au moins ${LONGUEUR_MIN} caractères`,
  'Au moins 5 caractères différents',
  'Ne pas reprendre votre adresse email',
]
const regles = computed(() => {
  const manques = reglesNonRespectees(nouveau.value, moyensConnexion.value.email)
  return REGLES.map(texte => ({ texte, ok: !!nouveau.value && !manques.includes(texte) }))
})
const valide = computed(() => !reglesNonRespectees(nouveau.value, moyensConnexion.value.email).length && confirmation.value === nouveau.value)

// Les trois actions exigent une connexion de moins de 10 minutes.
const ouvrir = (quoi) => {
  action.value = quoi
  erreur.value = null
  code.value = ''
  nouveau.value = ''
  confirmation.value = ''
  nouvelEmail.value = ''
  codesEmail.value = []
  conservationComprise.value = false
  motConfirmation.value = ''
  etape.value = confirmationRequise() ? 'confirmer' : 'saisir'
  dialogue.value = true
}

const envoyerConfirmation = async () => {
  erreur.value = null
  envoi.value = true
  try {
    await envoyerCode(moyensConnexion.value.email, { creer: false })
    etape.value = 'code'
  }
  catch (err) {
    erreur.value = messageErreurAuth(err)
  }
  finally {
    envoi.value = false
  }
}

const validerCode = async () => {
  if (code.value.length !== 6 || envoi.value) return
  erreur.value = null
  envoi.value = true
  try {
    // Nouvelle session, toute récente : l'action peut suivre.
    await verifierCode(moyensConnexion.value.email, code.value)
    etape.value = 'saisir'
  }
  catch (err) {
    erreur.value = messageErreurAuth(err)
    code.value = ''
  }
  finally {
    envoi.value = false
  }
}

const enregistrer = async () => {
  if (!valide.value || envoi.value) return
  erreur.value = null
  envoi.value = true
  const remplacement = moyensConnexion.value.motDePasse
  try {
    await definirMotDePasse(nouveau.value)
    dialogue.value = false
    succes.value = remplacement
      ? 'Mot de passe modifié.'
      : 'Mot de passe enregistré. La prochaine fois, choisissez « Mot de passe » sur la page de connexion.'
  }
  catch (err) {
    erreur.value = messageErreurAuth(err)
    if (err?.code === 'reauthentication_needed') etape.value = 'confirmer'
  }
  finally {
    envoi.value = false
  }
}

const demanderEmail = async () => {
  const probleme = erreurNouvelEmail(nouvelEmail.value, moyensConnexion.value.email)
  if (probleme || envoi.value) {
    erreur.value = probleme
    return
  }
  erreur.value = null
  envoi.value = true
  try {
    await demanderChangementEmail(nouvelEmail.value)
    nouvelEmail.value = nouvelEmail.value.trim().toLowerCase()
    // L'ancienne d'abord : c'est la preuve que le titulaire de l'adresse actuelle est d'accord.
    codesEmail.value = [
      { cle: 'ancienne', email: moyensConnexion.value.email, code: '', valide: false },
      { cle: 'nouvelle', email: nouvelEmail.value, code: '', valide: false },
    ]
    etape.value = 'codes'
  }
  catch (err) {
    erreur.value = messageErreurEmail(err) || messageErreurAuth(err)
    if (err?.code === 'reauthentication_needed') etape.value = 'confirmer'
  }
  finally {
    envoi.value = false
  }
}

const confirmerEmail = async () => {
  if (envoi.value) return
  erreur.value = null
  envoi.value = true
  try {
    let user = null
    for (const c of codesEmail.value) {
      if (c.valide || c.code.length !== 6) continue
      try {
        user = await confirmerChangementEmail(c.email, c.code) || user
        c.valide = true
      }
      catch (err) {
        c.code = ''
        throw err
      }
    }
    if (changementEmailTermine(user, nouvelEmail.value)) {
      dialogue.value = false
      succes.value = `Adresse modifiée : connectez-vous désormais avec ${nouvelEmail.value}. Vos dossiers restent dans votre espace ; nos emails de réservation continuent de partir à l'adresse donnée lors de la réservation.`
      chargerMoi({ forcer: true }).catch(() => {})
    }
    else {
      erreur.value = 'Saisissez aussi le code reçu à l\'autre adresse.'
    }
  }
  catch (err) {
    erreur.value = messageErreurAuth(err)
  }
  finally {
    envoi.value = false
  }
}

const supprimer = async () => {
  const corps = { conservationComprise: conservationComprise.value, confirmation: motConfirmation.value }
  if (!suppressionConfirmee(corps) || envoi.value) return
  erreur.value = null
  envoi.value = true
  try {
    await supprimerCompte(corps)
    await navigateTo({ path: '/mon-espace/connexion', query: { compte: 'supprime' } }, { replace: true })
  }
  catch (err) {
    if (err?.data?.data?.raison === 'connexion_ancienne') etape.value = 'confirmer'
    erreur.value = err?.data?.statusMessage || 'La suppression n\'a pas abouti. Réessayez dans un instant.'
  }
  finally {
    envoi.value = false
  }
}

onMounted(() => chargerMoi().catch(() => {}))
</script>

<style scoped>
.moyen + .moyen {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.08);
}
.regles {
  list-style: none;
  padding: 0;
  font-size: 13px;
  line-height: 1.8;
}
.infos {
  padding-left: 18px;
  line-height: 1.6;
}
/* Dans la modale, un style global ramène l'interligne des paragraphes à 14px. */
.dialogue p {
  line-height: 1.5;
}
</style>
