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
        <v-form @submit.prevent="onLogin">
          <v-text-field
            v-model="id"
            label="Identifiant"
            required
            outlined
            class="mb-4"
          />
          <v-text-field
            v-model="password"
            label="Mot de passe"
            type="password"
            required
            outlined
            class="mb-4"
          />
          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
          >
            Se connecter
          </v-btn>
        </v-form>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const id = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const onLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id.value, password: password.value }),
      credentials: 'include',
    })
    const data = await res.json()
    if (res.ok && data.success) {
      router.push('/booking-management')
    }
    else {
      error.value = data.message || 'Identifiant ou mot de passe incorrect.'
    }
  }
  catch {
    error.value = 'Erreur de connexion.'
  }
  finally {
    loading.value = false
  }
}
</script>
