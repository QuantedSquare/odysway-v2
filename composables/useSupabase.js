import { createClient } from '@supabase/supabase-js'
import { computed, ref } from 'vue'

let supabaseInstance = null

export const useSupabase = () => {
  const config = useRuntimeConfig()

  if (!supabaseInstance) {
    supabaseInstance = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )
  }

  const supabase = supabaseInstance
  const user = ref(null)
  const session = ref(null)

  // Initialize auth state
  supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
    session.value = currentSession
    user.value = currentSession?.user ?? null
  })

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, currentSession) => {
    session.value = currentSession
    user.value = currentSession?.user ?? null
  })

  const signIn = async (email, password) => {
    try {
      console.log('Starting sign in process for:', email)
      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in response:', { data, error })

      if (error) {
        console.log('Sign in error:', error.message)
        // If we get an invalid credentials error, we need to check if it's because of no password
        if (error.message.includes('Invalid login credentials')) {
          console.log('Invalid credentials, checking if user exists without password')
          // Try to send a password reset email - if it succeeds, the user exists but has no password
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          console.log('Password reset attempt:', { resetError })

          if (!resetError) {
            console.log('User exists but has no password')
            // If reset email was sent successfully, the user exists but has no password
            return { 
              data: null, 
              error: {
                ...error,
                status: 'NEEDS_PASSWORD_RESET',
                message: 'No password set. Please check your email to set your password.'
              }
            }
          }

          console.log('Wrong password case')
          // If we get here, it's a wrong password
          return { 
            data: null, 
            error: {
              ...error,
              status: 'WRONG_PASSWORD',
              message: 'Incorrect password. Please try again.'
            }
          }
        }

        if (error.message.includes('Email not confirmed')) {
          console.log('Email not confirmed case')
          return { 
            data: null, 
            error: {
              ...error,
              status: 'NEEDS_PASSWORD_RESET'
            }
          }
        }

        throw error
      }

      console.log('Sign in successful, updating local state')
      // Update local state
      session.value = data.session
      user.value = data.user

      console.log('Current user state:', user.value)
      console.log('Current session state:', session.value)

      return { data, error: null }
    } catch (error) {
      console.error('Unexpected error during sign in:', error)
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signUp = async (email, password) => {
    console.log('Starting sign up process for:', email)
    try {
      // First check if the email exists
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email === email) {
        return { 
          data: null, 
          error: {
            message: 'You are already signed in with this email.',
            status: 'ALREADY_SIGNED_IN'
          }
        }
      }

      // Try to sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Sign up response:', { data, error })

      if (error) {
        if (error.message.includes('User already registered')) {
          return { 
            data: null, 
            error: {
              message: 'An account with this email already exists. Please sign in instead.',
              status: 'EMAIL_EXISTS'
            }
          }
        }
        throw error
      }

      // If we get here, it means the sign up was successful
      return { 
        data: { 
          user: data.user,
          status: 'NEW_ACCOUNT'
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error during sign up:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    console.log('Starting sign out process')
    const { error } = await supabase.auth.signOut()
    console.log('Sign out response:', { error })
    return { error }
  }

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  }

  const resetPassword = async (email) => {
    console.log('Starting password reset for:', email)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      })

      console.log('Password reset response:', { error })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error during password reset:', error)
      return { error }
    }
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
      email_confirm: true // This will mark the email as verified
    })
    return { data, error }
  }

  const checkEmailExists = async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error checking email:', error)
      return { exists: false, error }
    }

    return { exists: !!data, error: null }
  }

  return {
    supabase,
    signIn,
    signUp,
    signOut,
    getSession,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    checkEmailExists,
    user: computed(() => user.value),
    session: computed(() => session.value),
  }
} 