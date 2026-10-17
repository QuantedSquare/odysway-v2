import { createClient } from '@supabase/supabase-js'

// Session de l'Espace Voyageur (/mon-espace), dans le navigateur seulement.
//
// Supabase Auth de BackOffice-PROD : code à 6 chiffres par email, ou Google.
// Le jeton part en `Authorization: Bearer` vers /api/v1/espace/** ; le
// serveur le revérifie à chaque appel et ne sert que les dossiers du compte.

let client = null

const supabaseEspace = () => {
  if (client) return client
  const { public: { espace } } = useRuntimeConfig()
  client = createClient(espace.supabaseUrl, espace.supabaseKey, {
    auth: {
      // Clé dédiée : rien à partager avec une autre session Supabase du domaine.
      storageKey: 'odysway-espace',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
  return client
}

export const useEspace = () => {
  const session = useState('espace-session', () => null)
  const pret = useState('espace-pret', () => false)
  const moi = useState('espace-moi', () => null)

  const init = async () => {
    if (import.meta.server || pret.value) return
    const sb = supabaseEspace()
    const { data } = await sb.auth.getSession()
    session.value = data.session
    sb.auth.onAuthStateChange((_evt, s) => {
      session.value = s
      if (!s) moi.value = null
    })
    pret.value = true
  }

  const envoyerCode = async (email) => {
    const { error } = await supabaseEspace().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      // Un email inconnu reçoit aussi un compte (état vide + rattachement) :
      // refuser révélerait quelles adresses sont clientes.
      options: { shouldCreateUser: true },
    })
    if (error) throw error
  }

  const verifierCode = async (email, code) => {
    const { data, error } = await supabaseEspace().auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    })
    if (error) throw error
    session.value = data.session
  }

  const connexionGoogle = async (suite = '/mon-espace') => {
    const retour = new URL('/mon-espace/connexion', window.location.origin)
    retour.searchParams.set('suite', suite)
    const { error } = await supabaseEspace().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: retour.toString() },
    })
    if (error) throw error
  }

  const deconnexion = async () => {
    await supabaseEspace().auth.signOut()
    session.value = null
    moi.value = null
    await navigateTo('/mon-espace/connexion')
  }

  /** Appel authentifié vers /api/v1/espace/<chemin>. Une 401 renvoie à la connexion. */
  const api = async (chemin, options = {}) => {
    await init()
    const { data } = await supabaseEspace().auth.getSession()
    const jeton = data.session?.access_token
    if (!jeton) {
      await navigateTo('/mon-espace/connexion')
      throw new Error('Connexion requise')
    }
    try {
      return await $fetch(`/api/v1/espace/${chemin}`, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${jeton}` },
      })
    }
    catch (err) {
      if (err?.statusCode === 401) {
        await supabaseEspace().auth.signOut()
        await navigateTo('/mon-espace/connexion')
      }
      throw err
    }
  }

  /** Compte et dossiers ; mémorisé pour la navigation entre pages. */
  const chargerMoi = async ({ forcer = false } = {}) => {
    if (moi.value && !forcer) return moi.value
    moi.value = await api('moi')
    return moi.value
  }

  return { session, pret, moi, init, envoyerCode, verifierCode, connexionGoogle, deconnexion, api, chargerMoi }
}
