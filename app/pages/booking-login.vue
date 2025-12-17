<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    style="height: 100vh;"
  >
    <v-card width="400">
      <v-card-title class="text-center">
        Back Office Login
      </v-card-title>
      <v-card-text>
        <v-btn
          color="primary"
          block
          :loading="loading"
          @click="onGoogleLogin"
        >
          Se connecter avec Google
        </v-btn>
        <div class="text-subtitle-2 mt-4">
          Accès réservé aux emails @odysway.com ou superadmins autorisés.
        </div>
        <v-alert
          v-if="error"
          type="error"
          class="mt-4"
        >
          {{ error }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

useSeoMeta({
  htmlAttrs: {
    lang: 'fr',
  },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})
const loading = ref(false)
const error = ref('')
const route = useRoute()

const errorMap = {
  state: 'La connexion a expiré, merci de recommencer.',
  access_denied: 'Accès refusé sur Google.',
  missing_code: 'Code de connexion manquant.',
  token_exchange: 'Impossible de vérifier Google. Réessayez.',
  missing_token: 'Jeton Google manquant.',
  unauthorized: 'Accès réservé aux comptes autorisés.',
  server_config: 'Configuration serveur manquante.',
  verification: 'Erreur de vérification Google.',
}

const syncErrorFromQuery = () => {
  const code = route.query.error
  if (typeof code === 'string') {
    error.value = errorMap[code] || 'Connexion impossible. Réessayez.'
  }
  else {
    error.value = ''
  }
}

watch(() => route.query.error, syncErrorFromQuery, { immediate: true })

const onGoogleLogin = () => {
  error.value = ''
  loading.value = true
  try {
    window.location.href = '/api/v1/auth/google/login'
  }
  catch {
    error.value = 'Erreur de connexion.'
    loading.value = false
  }
}
</script>
