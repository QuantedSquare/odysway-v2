<template>
  <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
    <v-container class="py-10 py-md-16 connexion">
      <v-card class="pa-6 pa-md-8 mx-auto">
        <div class="text-overline text-secondary font-weight-bold">
          Espace Voyageur
        </div>
        <h1 class="text-h5 font-weight-bold mb-2">
          {{ etape === 'code' ? 'Saisissez votre code' : 'Accédez à vos voyages' }}
        </h1>
        <p class="text-body-2 text-primary-light-2 mb-6">
          <template v-if="etape === 'code'">
            Nous venons d'envoyer un code à 6 chiffres à <b>{{ email }}</b>. Il est valable quelques minutes.
          </template>
          <template v-else>
            Pas de mot de passe ni de compte à créer : utilisez l'adresse email de votre réservation, nous vous envoyons un code.
          </template>
        </p>

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
          v-if="etape === 'email'"
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

        <p class="text-caption text-primary-light-2 mt-6 mb-0">
          Vous avez réservé avec plusieurs adresses ? Connectez-vous avec l'une d'elles, vous pourrez rattacher les autres depuis votre espace.
        </p>
      </v-card>
    </v-container>
  </v-defaults-provider>
</template>

<script setup>
import { mdiGoogle } from '@mdi/js'

definePageMeta({ layout: 'no-footer' })
useSeoMeta({ title: 'Connexion — Espace Voyageur', robots: 'noindex, nofollow' })

const route = useRoute()
const { init, session, envoyerCode, verifierCode, connexionGoogle } = useEspace()

const etape = ref('email')
const email = ref('')
const code = ref('')
const erreur = ref(null)
const envoi = ref(false)
const envoiGoogle = ref(false)
const attente = ref(0)
let minuteur = null

const emailValide = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

// Seule une page de l'espace peut servir de destination : pas de redirection
// ouverte vers un autre site.
const suite = computed(() => {
  const s = String(route.query.suite || '')
  return s.startsWith('/mon-espace') && !s.startsWith('//') ? s : '/mon-espace'
})

const messageErreur = (err) => {
  const m = String(err?.message || '').toLowerCase()
  if (err?.status === 429 || m.includes('rate limit') || m.includes('security purposes')) return 'Trop de demandes rapprochées. Patientez une minute avant de réessayer.'
  if (m.includes('expired') || m.includes('invalid')) return 'Ce code est incorrect ou a expiré. Demandez-en un nouveau.'
  return 'Une erreur est survenue. Réessayez dans un instant.'
}

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
    erreur.value = messageErreur(err)
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
    erreur.value = messageErreur(err)
    code.value = ''
  }
  finally {
    envoi.value = false
  }
}

const google = async () => {
  erreur.value = null
  envoiGoogle.value = true
  try {
    await connexionGoogle(suite.value)
  }
  catch (err) {
    erreur.value = messageErreur(err)
    envoiGoogle.value = false
  }
}

const changerEmail = () => {
  etape.value = 'email'
  code.value = ''
  erreur.value = null
}

// Retour de Google : supabase-js échange le code de l'URL à l'initialisation,
// la session arrive par onAuthStateChange.
watch(session, (s) => {
  if (s) navigateTo(suite.value, { replace: true })
})

onMounted(async () => {
  await init()
  if (session.value) navigateTo(suite.value, { replace: true })
  if (route.query.error_description) erreur.value = 'La connexion avec Google n\'a pas abouti. Réessayez ou recevez un code par email.'
})

onBeforeUnmount(() => clearInterval(minuteur))
</script>

<style scoped>
.connexion .v-card {
  max-width: 460px;
}
</style>
