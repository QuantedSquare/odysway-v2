<template>
  <div>
    <NuxtLayout>
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
                    :prepend-icon="mdiEmail"
                    type="email"
                    :rules="emailRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    label="Password"
                    name="password"
                    :prepend-icon="mdiLock"
                    :append-icon="showPassword ? mdiEye : mdiEyeOff"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="passwordRules"
                    @click:append="showPassword = !showPassword"
                    required
                  ></v-text-field>
                </v-form>
                <v-divider class="my-4"></v-divider>
                <div class="text-center">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    @click="handleGoogleSignIn"
                    :loading="googleLoading"
                    :disabled="loading || googleLoading"
                    class="mb-2"
                  >
                    <v-icon left>{{mdiGoogle}}</v-icon>
                    Sign in with Google
                  </v-btn>
                </div>
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
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  variant="text"
                  color="primary"
                  @click="router.push('/forgot-password')"
                >
                  Forgot Password?
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
              <v-alert
                v-if="showVerificationAlert"
                type="warning"
                class="ma-4"
              >
                {{ verificationMessage }}
                <v-btn
                  variant="text"
                  color="warning"
                  @click="handleResetPassword"
                  :loading="resetting"
                  class="ml-2"
                >
                  Reset Password
                </v-btn>
              </v-alert>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'
import { useUser } from '~/composables/useUser'

const router = useRouter()
const route = useRoute()
const { signIn, resetPassword, signInWithGoogle } = useSupabase()
const { checkAuthState } = useUser()
import { mdiEmail, mdiLock, mdiEyeOff, mdiGoogle} from '@mdi/js'
const form = ref()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const resetting = ref(false)
const error = ref('')
const showVerificationAlert = ref(false)
const googleLoading = ref(false)
const verificationMessage = ref('')

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

  console.log('Starting sign in with:', { email: email.value })
  loading.value = true
  error.value = ''
  showVerificationAlert.value = false
  verificationMessage.value = ''

  try {
    const { data, error: signInError } = await signIn(email.value, password.value)
    console.log('Sign in result:', { data, signInError })
    
    if (signInError) {
      console.log('Handling sign in error:', signInError)
      switch (signInError.status) {
        case 'NEEDS_PASSWORD_RESET':
          console.log('Password reset needed')
          // Show success message - the reset email was already sent by the signIn function
          verificationMessage.value = 'A password reset link has been sent to your email. Please check your inbox to set your password.'
          showVerificationAlert.value = true
          break
        case 'WRONG_PASSWORD':
          console.log('Wrong password')
          error.value = 'Incorrect password. Please try again.'
          break
        default:
          console.log('Other error:', signInError)
          error.value = signInError.message || 'An error occurred during sign in'
      }
      return
    }
    
    if (data?.user) {
      console.log('Sign in successful, redirecting to home')
      router.push('/')
    }
  } catch (err) {
    console.error('Unexpected error in handleSignIn:', err)
    error.value = err.message || 'An error occurred during sign in'
  } finally {
    loading.value = false
    resetting.value = false
  }
}

const handleGoogleSignIn = async () => {
  googleLoading.value = true
  error.value = ''

  try {
    const { data, error: signInError } = await signInWithGoogle()
    if (signInError) throw signInError
    
    // If successful, redirect to home
    if (data?.user) {
      router.push('/')
    }
  } catch (err) {
    error.value = err.message || 'Failed to sign in with Google'
  } finally {
    googleLoading.value = false
  }
}

const handleResetPassword = async () => {
  resetting.value = true
  error.value = ''

  try {
    const { error: resetError } = await resetPassword(email.value)
    if (resetError) throw resetError
    
    verificationMessage.value = 'A password reset link has been sent to your email. Please check your inbox to set your password.'
    showVerificationAlert.value = true
  } catch (err) {
    error.value = err.message || 'Failed to send reset password email'
  } finally {
    resetting.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
