<template>
  <div>
    <NuxtLayout>
      <v-container class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>{{ isSettingNewPassword ? 'Set New Password' : 'Reset Password' }}</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form @submit.prevent="handleSubmit" ref="form">
                  <v-text-field
                    v-if="!isSettingNewPassword"
                    v-model="email"
                    label="Email"
                    name="email"
                    :prepend-icon="mdiEmail"
                    type="email"
                    :rules="emailRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-if="isSettingNewPassword"
                    v-model="password"
                    label="New Password"
                    name="password"
                    :prepend-icon="mdiLock"
                    :append-icon="showPassword ? mdiEye : mdiEyeOff"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="passwordRules"
                    @click:append="showPassword = !showPassword"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-if="isSettingNewPassword"
                    v-model="confirmPassword"
                    label="Confirm New Password"
                    name="confirmPassword"
                    :prepend-icon="mdiLock"
                    :append-icon="showConfirmPassword ? mdiEye : mdiEyeOff"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    :rules="confirmPasswordRules"
                    @click:append="showConfirmPassword = !showConfirmPassword"
                    required
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  :loading="loading"
                  @click="handleSubmit"
                  :disabled="loading"
                >
                  {{ isSettingNewPassword ? 'Set Password' : 'Send Reset Link' }}
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
                v-if="success"
                type="success"
                class="ma-4"
              >
                {{ success }}
                <v-btn
                  v-if="!isSettingNewPassword"
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'
import { mdiEmail, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js'

const router = useRouter()
const route = useRoute()
const { resetPassword, updatePassword } = useSupabase()

const form = ref()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')
const isSettingNewPassword = ref(false)

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters',
]

const confirmPasswordRules = [
  v => !!v || 'Please confirm your password',
  v => v === password.value || 'Passwords do not match',
]

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    if (isSettingNewPassword.value) {
      const { error: updateError } = await updatePassword(password.value)
      if (updateError) throw updateError
      success.value = 'Password updated successfully!'
      setTimeout(() => {
        router.push('/signin')
      }, 2000)
    } else {
      const { error: resetError } = await resetPassword(email.value)
      if (resetError) throw resetError
      success.value = 'Password reset link sent! Please check your email.'
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Check if we're setting a new password (coming from email link)
  const accessToken = route.query.access_token
  if (accessToken) {
    isSettingNewPassword.value = true
  }
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style> 