<template>
  <div>
    <!-- Un seul élément racine : un v-defaults-provider seul n'en rend pas, ce qui casse les transitions de page.
         Ce commentaire reste DANS la div : avant elle, il compterait comme second nœud racine en dev. -->
    <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
      <v-container class="py-10 py-md-16 connexion">
        <v-card class="pa-6 pa-md-8 mx-auto">
          <div class="text-overline text-secondary font-weight-bold">
            Espace Voyageur
          </div>
          <template v-if="indisponible">
            <h1 class="text-h5 font-weight-bold mb-2">
              Espace voyageur momentanément indisponible
            </h1>
            <p class="text-body-2 text-primary-light-2 mb-5">
              Nous ne pouvons pas vous connecter pour le moment. Réessayez un peu plus tard ; pour toute question sur votre voyage, notre équipe reste joignable.
            </p>
            <v-btn
              to="/contact"
              color="secondary"
              rounded="pill"
              block
              size="large"
            >
              Nous contacter
            </v-btn>
          </template>
          <template v-else>
            <h1 class="text-h5 font-weight-bold mb-2">
              {{ etape === 'code' ? 'Saisissez votre code' : 'Accédez à vos voyages' }}
            </h1>
            <p class="text-body-2 text-primary-light-2 mb-5">
              <template v-if="etape === 'code'">
                Nous venons d'envoyer un code à 6 chiffres à <b>{{ email }}</b>. Il est valable quelques minutes.
              </template>
              <template v-else-if="mode === 'motDePasse'">
                Connectez-vous avec le mot de passe défini dans votre espace.
              </template>
              <template v-else>
                Pas de compte à créer : utilisez l'adresse email de votre réservation, nous vous envoyons un code.
              </template>
            </p>

            <v-btn-toggle
              v-if="etape === 'email'"
              v-model="mode"
              mandatory
              divided
              density="comfortable"
              variant="outlined"
              color="primary"
              rounded="pill"
              class="mb-5 w-100 mode"
            >
              <v-btn
                value="code"
                class="flex-grow-1"
              >
                Recevoir un code
              </v-btn>
              <v-btn
                value="motDePasse"
                class="flex-grow-1"
              >
                Mot de passe
              </v-btn>
            </v-btn-toggle>

            <v-alert
              v-if="erreur"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ erreur }}
            </v-alert>

            <v-form
              v-if="etape === 'email' && mode === 'code'"
              @submit.prevent="demanderCode"
            >
              <v-text-field
                v-model="email"
                label="Adresse email"
                type="email"
                autocomplete="email"
                variant="outlined"
                :rules="[v => emailValide(v) || 'Adresse email invalide']"
                autofocus
              />
              <v-btn
                type="submit"
                color="secondary"
                rounded="pill"
                block
                size="large"
                :loading="envoi"
                :disabled="!emailValide(email)"
              >
                Recevoir mon code
              </v-btn>
            </v-form>

            <v-form
              v-else-if="etape === 'email'"
              @submit.prevent="seConnecterMotDePasse"
            >
              <v-text-field
                v-model="email"
                label="Adresse email"
                type="email"
                autocomplete="username"
                variant="outlined"
                :rules="[v => emailValide(v) || 'Adresse email invalide']"
                autofocus
              />
              <v-text-field
                v-model="motDePasse"
                label="Mot de passe"
                :type="voirMotDePasse ? 'text' : 'password'"
                autocomplete="current-password"
                variant="outlined"
                :append-inner-icon="voirMotDePasse ? mdiEyeOff : mdiEye"
                @click:append-inner="voirMotDePasse = !voirMotDePasse"
              />
              <v-btn
                type="submit"
                color="secondary"
                rounded="pill"
                block
                size="large"
                :loading="envoi"
                :disabled="!emailValide(email) || !motDePasse"
              >
                Me connecter
              </v-btn>
              <div class="text-center mt-3">
                <v-btn
                  variant="text"
                  size="small"
                  @click="motDePasseOublie"
                >
                  Mot de passe oublié ? Recevoir un code
                </v-btn>
              </div>
            </v-form>

            <v-form
              v-else
              @submit.prevent="verifier"
            >
              <v-otp-input
                v-model="code"
                length="6"
                type="number"
                variant="outlined"
                autofocus
                :disabled="envoi"
                @finish="verifier"
              />
              <v-btn
                type="submit"
                color="secondary"
                rounded="pill"
                block
                size="large"
                class="mt-4"
                :loading="envoi"
                :disabled="code.length !== 6"
              >
                Me connecter
              </v-btn>
              <div class="d-flex justify-space-between mt-4">
                <v-btn
                  variant="text"
                  size="small"
                  @click="changerEmail"
                >
                  Changer d'adresse
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  :disabled="attente > 0 || envoi"
                  @click="demanderCode"
                >
                  {{ attente > 0 ? `Renvoyer (${attente} s)` : 'Renvoyer le code' }}
                </v-btn>
              </div>
            </v-form>

            <template v-if="etape === 'email' && avecGoogle">
              <div class="d-flex align-center ga-3 my-5 text-caption text-primary-light-2">
                <v-divider />ou<v-divider />
              </div>
              <v-btn
                variant="outlined"
                rounded="pill"
                block
                size="large"
                :prepend-icon="mdiGoogle"
                :loading="envoiGoogle"
                @click="google"
              >
                Continuer avec Google
              </v-btn>
            </template>

            <p class="text-caption text-primary-light-2 mt-6 mb-0">
              Vous avez réservé avec plusieurs adresses ? Connectez-vous avec l'une d'elles, vous pourrez rattacher les autres depuis votre espace.
            </p>
          </template>
        </v-card>
      </v-container>
    </v-defaults-provider>
  </div>
</template>

<script setup>
import { mdiEye, mdiEyeOff, mdiGoogle } from '@mdi/js'

definePageMeta({ layout: 'no-footer' })
useSeoMeta({ title: 'Connexion — Espace Voyageur', robots: 'noindex, nofollow' })

const route = useRoute()
const { init, session, indisponible, envoyerCode, verifierCode, connexionMotDePasse, googleDisponible, connexionGoogle, reprendreSuiteGoogle } = useEspace()

// Dernier mode choisi sur cet appareil : confort seulement.
const CLE_MODE = 'odysway-espace-mode'
const lireMode = () => {
  try {
    return localStorage.getItem(CLE_MODE) === 'motDePasse' ? 'motDePasse' : 'code'
  }
  catch {
    return 'code'
  }
}

const mode = ref('code')
const etape = ref('email')
const email = ref('')
const motDePasse = ref('')
const voirMotDePasse = ref(false)
const code = ref('')
const erreur = ref(null)
const envoi = ref(false)
const envoiGoogle = ref(false)
// Calculé au montage (window) : sur une adresse que Supabase ne connaît pas,
// Google renverrait sur Ulysse, le bouton n'est donc pas proposé.
const avecGoogle = ref(false)
const attente = ref(0)
let minuteur = null

const emailValide = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

// Seule une page de l'espace peut servir de destination : pas de redirection
// ouverte vers un autre site.
const destinationSure = (valeur) => {
  const s = String(valeur || '')
  return s.startsWith('/mon-espace') && !s.startsWith('//') ? s : '/mon-espace'
}
const suite = ref(destinationSure(route.query.suite))

watch(mode, (m) => {
  erreur.value = null
  try {
    localStorage.setItem(CLE_MODE, m)
  }
  catch {
    // stockage indisponible : le mode par défaut reviendra
  }
})

const lancerAttente = () => {
  attente.value = 60
  clearInterval(minuteur)
  minuteur = setInterval(() => {
    attente.value -= 1
    if (attente.value <= 0) clearInterval(minuteur)
  }, 1000)
}

const demanderCode = async () => {
  if (!emailValide(email.value)) return
  erreur.value = null
  envoi.value = true
  try {
    await envoyerCode(email.value)
    etape.value = 'code'
    code.value = ''
    lancerAttente()
  }
  catch (err) {
    erreur.value = messageErreurAuth(err)
  }
  finally {
    envoi.value = false
  }
}

const verifier = async () => {
  if (code.value.length !== 6 || envoi.value) return
  erreur.value = null
  envoi.value = true
  try {
    await verifierCode(email.value, code.value)
    await navigateTo(suite.value, { replace: true })
  }
  catch (err) {
    erreur.value = messageErreurAuth(err)
    code.value = ''
  }
  finally {
    envoi.value = false
  }
}

const seConnecterMotDePasse = async () => {
  if (!emailValide(email.value) || !motDePasse.value || envoi.value) return
  erreur.value = null
  envoi.value = true
  try {
    await connexionMotDePasse(email.value, motDePasse.value)
    await navigateTo(suite.value, { replace: true })
  }
  catch (err) {
    // Un seul message, que l'email existe ou non.
    erreur.value = messageErreurAuth(err)
    motDePasse.value = ''
  }
  finally {
    envoi.value = false
  }
}

// Pas de réinitialisation à part : on se connecte par code, puis on redéfinit
// son mot de passe dans l'espace (la connexion est alors récente).
const motDePasseOublie = async () => {
  mode.value = 'code'
  await demanderCode()
}

const google = async () => {
  erreur.value = null
  envoiGoogle.value = true
  try {
    await connexionGoogle(suite.value)
  }
  catch (err) {
    erreur.value = messageErreurAuth(err)
    envoiGoogle.value = false
  }
}

const changerEmail = () => {
  etape.value = 'email'
  code.value = ''
  erreur.value = null
}

// Retour de Google ou d'un lien email : supabase-js échange le code de l'URL à
// l'initialisation, la session arrive par onAuthStateChange.
watch(session, (s) => {
  if (s) navigateTo(suite.value, { replace: true })
})

onMounted(async () => {
  mode.value = lireMode()
  avecGoogle.value = googleDisponible()
  // Retour de Google : la destination n'est pas dans l'URL (voir useEspace).
  const suiteGoogle = reprendreSuiteGoogle()
  if (suiteGoogle && !route.query.suite) suite.value = destinationSure(suiteGoogle)
  await init()
  if (session.value) return navigateTo(suite.value, { replace: true })
  // Refus de Google (`error_description`) ou code impossible à échanger (lien
  // ouvert dans un autre navigateur, retour déjà consommé) : on le dit, au
  // lieu de réafficher le formulaire comme si de rien n'était.
  if (route.query.error_description || route.query.code) {
    erreur.value = 'La connexion n\'a pas abouti. Réessayez ou recevez un code par email.'
    navigateTo({ query: { suite: route.query.suite } }, { replace: true })
  }
})

onBeforeUnmount(() => clearInterval(minuteur))
</script>

<style scoped>
.connexion .v-card {
  max-width: 460px;
}
.mode .v-btn {
  flex: 1 1 50%;
}
</style>
