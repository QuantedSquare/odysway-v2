<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Sign In</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleSignIn" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                :rules="emailRules"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
                @click:append="showPassword = !showPassword"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="loading"
              @click="handleSignIn"
              :disabled="loading"
            >
              Sign In
            </v-btn>
          </v-card-actions>
          <v-alert
            v-if="error"
            type="error"
            class="ma-4"
            closable
            @click:close="error = ''"
          >
            {{ error }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'

const router = useRouter()
const { signIn } = useSupabase()

const form = ref()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters',
]

const handleSignIn = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    const { data, error: signInError } = await signIn(email.value, password.value)
    
    if (signInError) throw signInError
    
    if (data?.user) {
      router.push('/')
    }
  } catch (err) {
    error.value = err.message || 'An error occurred during sign in'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
