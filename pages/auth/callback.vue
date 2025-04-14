<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-text class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <div class="mt-4">
              Completing sign in...
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'

const router = useRouter()
const { supabase } = useSupabase()

onMounted(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    if (session) {
      router.push('/')
    } else {
      router.push('/signin')
    }
  } catch (err) {
    console.error('Error handling auth callback:', err)
    router.push('/signin')
  }
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style> 