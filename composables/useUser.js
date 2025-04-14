import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'

export const useUser = () => {
  const { supabase, user: supabaseUser, session: supabaseSession } = useSupabase()
  const authState = ref({
    isConnected: false,
    userEmail: '',
    user: null
  })

  // Initialize auth state
  supabase.auth.getSession().then(({ data: { session } }) => {
    authState.value = {
      isConnected: !!session?.user,
      userEmail: session?.user?.email || '',
      user: session?.user || null
    }
  })

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    authState.value = {
      isConnected: !!session?.user,
      userEmail: session?.user?.email || '',
      user: session?.user || null
    }
  })

  const isConnected = computed(() => authState.value.isConnected)
  const userEmail = computed(() => authState.value.userEmail)
  const user = computed(() => authState.value.user)

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      authState.value = {
        isConnected: false,
        userEmail: '',
        user: null
      }
    } catch (err) {
      console.error('Error signing out:', err)
      throw err
    }
  }

  return {
    authState,
    isConnected,
    userEmail,
    user,
    signOut,
    checkAuthState: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        authState.value = {
          isConnected: !!user,
          userEmail: user?.email || '',
          user: user || null
        }
      } catch (err) {
        console.error('Error checking auth state:', err)
        authState.value = {
          isConnected: false,
          userEmail: '',
          user: null
        }
      }
    }
  }
} 