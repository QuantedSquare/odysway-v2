<template>
  <div>
    <NuxtLayout>
      <v-container class="fill-height">
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            sm="8"
            md="6"
            lg="4"
          >
            <v-card class="elevation-12">
              <v-toolbar
                color="primary"
                dark
                flat
              >
                <v-toolbar-title>Sign Up</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form
                  ref="form"
                  @submit.prevent="handleSignUp"
                >
                  <v-text-field
                    v-model="email"
                    label="Email"
                    name="email"
                    :prepend-icon="mdiEmail"
                    type="email"
                    :rules="emailRules"
                    required
                  />
                  <v-text-field
                    v-model="password"
                    label="Password"
                    name="password"
                    :prepend-icon="mdiLock"
                    :append-icon="showPassword ? mdiEye : mdiEyeOff"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="passwordRules"
                    required
                    @click:append="showPassword = !showPassword"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="primary"
                  :loading="loading"
                  :disabled="loading"
                  @click="handleSignUp"
                >
                  Sign Up
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
                <v-btn
                  v-if="showSignInButton"
                  variant="text"
                  color="error"
                  class="mt-2"
                  @click="router.push('/signin')"
                >
                  Go to Sign In
                </v-btn>
              </v-alert>
              <v-alert
                v-if="showVerificationAlert"
                type="warning"
                class="ma-4"
              >
                Please check your email to verify your account
              </v-alert>
              <v-alert
                v-if="showSuccessAlert"
                type="success"
                class="ma-4"
              >
                Account created successfully! You can now sign in.
                <v-btn
                  variant="text"
                  color="success"
                  class="mt-2"
                  @click="router.push('/signin')"
                >
                  Go to Sign In
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
import { useRouter } from 'vue-router'
import { mdiEmail, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js'
import { useSupabase } from '~/composables/useSupabase'

const router = useRouter()
const { signUp, checkEmailExists } = useSupabase()

const form = ref()
const email = ref('ottmann.alex+1@gmail.com')
const password = ref('123.Odysway!')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const showVerificationAlert = ref(false)
const showSuccessAlert = ref(false)
const showSignInButton = ref(false)

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters',
]

const handleSignUp = async () => {
  const { valid } = await form.value.validate()

  if (!valid) return

  console.log('Starting sign up with:', { email: email.value })
  loading.value = true
  error.value = ''
  showVerificationAlert.value = false
  showSignInButton.value = false
  showSuccessAlert.value = false

  try {
    const { data, error: signUpError } = await signUp(email.value, password.value)
    console.log('Sign up result:', { data, signUpError })

    if (signUpError) {
      console.log('Handling sign up error:', signUpError)
      switch (signUpError.status) {
        case 'EMAIL_EXISTS':
          error.value = 'An account with this email already exists. Please sign in instead.'
          showSignInButton.value = true
          break
        case 'EMAIL_EXISTS_UNVERIFIED':
          error.value = 'An account with this email exists but is not verified. Please sign in to verify your account.'
          showSignInButton.value = true
          break
        case 'ALREADY_SIGNED_IN':
          error.value = 'You are already signed in with this email.'
          break
        default:
          console.log('Other error:', signUpError)
          error.value = signUpError.message || 'An error occurred during sign up'
      }
      return
    }

    if (data?.user) {
      console.log('Sign up successful')
      showSuccessAlert.value = true
      // Clear the form
      email.value = ''
      password.value = ''
    }
  }
  catch (err) {
    console.error('Unexpected error in handleSignUp:', err)
    error.value = err.message || 'An error occurred during sign up'
  }
  finally {
    loading.value = false
  }
}
</script>

  <style scoped>
  .fill-height {
    min-height: 100vh;
  }
  </style>
