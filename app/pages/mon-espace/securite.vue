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
          @click="ouvrir"
        >
          {{ moyensConnexion.motDePasse ? 'Modifier' : 'Définir un mot de passe' }}
        </v-btn>
      </div>
    </v-card>

    <v-dialog
      v-model="dialogue"
      max-width="460"
      :persistent="envoi"
    >
      <!-- La modale est rendue hors de la page : la casse normale des boutons doit y être redonnée. -->
      <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
        <v-card class="pa-6">
          <div class="d-flex align-start mb-3">
            <h2 class="text-h6 font-weight-bold">
              {{ etape === 'saisir' ? (moyensConnexion.motDePasse ? 'Nouveau mot de passe' : 'Définir un mot de passe') : 'Confirmez votre identité' }}
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
              Pour votre sécurité, nous envoyons un code à <b>{{ moyensConnexion.email }}</b> avant de modifier vos moyens de connexion.
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
import { mdiCheckCircle, mdiCircleOutline, mdiClose, mdiEmailOutline, mdiEye, mdiEyeOff, mdiGoogle, mdiLockOutline } from '@mdi/js'

definePageMeta({ layout: 'espace', middleware: 'espace' })
useSeoMeta({ title: 'Connexion et sécurité — Odysway', robots: 'noindex, nofollow' })

const { moyensConnexion, confirmationRequise, envoyerCode, verifierCode, definirMotDePasse, chargerMoi } = useEspace()

const dialogue = ref(false)
const etape = ref('saisir')
const code = ref('')
const nouveau = ref('')
const confirmation = ref('')
const voir = ref(false)
const envoi = ref(false)
const erreur = ref(null)
const succes = ref(null)

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

const ouvrir = () => {
  erreur.value = null
  code.value = ''
  nouveau.value = ''
  confirmation.value = ''
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
    // Nouvelle session, toute récente : le mot de passe peut être posé.
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
</style>
