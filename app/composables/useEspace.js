import { createClient } from '@supabase/supabase-js'

// Session de l'Espace Voyageur (/mon-espace), dans le navigateur seulement.
//
// Supabase Auth de BackOffice-PROD : code à 6 chiffres par email, Google, puis
// mot de passe facultatif défini depuis l'espace. Le jeton part en
// `Authorization: Bearer` vers /api/v1/espace/** ; le serveur le revérifie à
// chaque appel et ne sert que les dossiers du compte.
//
// Mode démo (NUXT_PUBLIC_ESPACE_DEMO=true) : serveur de dev SEULEMENT —
// `import.meta.dev` vaut false dans tout build, le code de démo n'y est même
// pas embarqué. Données de la maquette, aucun appel à Supabase ni à l'API.

let client = null
let auth = null

// Toujours appelé derrière `import.meta.dev &&` : en build, la condition vaut
// false à la compilation et le bundler retire l'import de la démo.
const demoActive = () => useRuntimeConfig().public.espace?.demo === true

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

const authEspace = async () => {
  if (auth) return auth
  if (import.meta.dev && demoActive()) {
    const { creerAuthDemo } = await import('~/dev/espaceDemo.js')
    auth = creerAuthDemo()
  }
  else {
    auth = supabaseEspace().auth
  }
  return auth
}

const normaliser = email => String(email || '').trim().toLowerCase()

export const useEspace = () => {
  const session = useState('espace-session', () => null)
  const pret = useState('espace-pret', () => false)
  const moi = useState('espace-moi', () => null)

  const init = async () => {
    if (import.meta.server || pret.value) return
    const a = await authEspace()
    const { data } = await a.getSession()
    session.value = data.session
    a.onAuthStateChange((_evt, s) => {
      session.value = s
      if (!s) moi.value = null
    })
    pret.value = true
  }

  /**
   * Envoie un code de connexion. `creer: false` pour une simple confirmation
   * d'identité (compte déjà ouvert). Le lien de l'email, s'il y en a un dans le
   * modèle Supabase, ramène aussi sur la page de connexion.
   */
  const envoyerCode = async (email, { creer = true } = {}) => {
    const { error } = await (await authEspace()).signInWithOtp({
      email: normaliser(email),
      options: {
        // Un email inconnu reçoit aussi un compte (état vide + rattachement) :
        // refuser révélerait quelles adresses sont clientes.
        shouldCreateUser: creer,
        emailRedirectTo: new URL('/mon-espace/connexion', window.location.origin).toString(),
      },
    })
    if (error) throw error
  }

  const verifierCode = async (email, code) => {
    const { data, error } = await (await authEspace()).verifyOtp({
      email: normaliser(email),
      token: String(code).trim(),
      type: 'email',
    })
    if (error) throw error
    session.value = data.session
  }

  const connexionMotDePasse = async (email, motDePasse) => {
    const { data, error } = await (await authEspace()).signInWithPassword({ email: normaliser(email), password: motDePasse })
    if (error) throw error
    session.value = data.session
  }

  const connexionGoogle = async (suite = '/mon-espace') => {
    const retour = new URL('/mon-espace/connexion', window.location.origin)
    retour.searchParams.set('suite', suite)
    const { error } = await (await authEspace()).signInWithOAuth({
      provider: 'google',
      options: { redirectTo: retour.toString() },
    })
    if (error) throw error
  }

  /** Définir la connexion doit-elle être reconfirmée par un code avant ? */
  const confirmationRequise = () => !connexionRecente(session.value?.access_token)

  /**
   * Pose ou remplace le mot de passe du compte. Appel direct à Supabase Auth :
   * ses propres règles s'appliquent (longueur minimale, mots de passe ayant
   * fuité). `mot_de_passe` dans user_metadata ne sert qu'à l'affichage.
   */
  const definirMotDePasse = async (motDePasse) => {
    const { data, error } = await (await authEspace()).updateUser({ password: motDePasse, data: { mot_de_passe: true } })
    if (error) throw error
    if (session.value && data?.user) session.value = { ...session.value, user: data.user }
  }

  /** Moyens de connexion du compte, pour la page Sécurité. */
  const moyensConnexion = computed(() => {
    const user = session.value?.user
    const fournisseurs = new Set((user?.identities || []).map(i => i.provider))
    return {
      email: user?.email || null,
      google: fournisseurs.has('google'),
      motDePasse: user?.user_metadata?.mot_de_passe === true,
    }
  })

  const deconnexion = async () => {
    await (await authEspace()).signOut()
    session.value = null
    moi.value = null
    await navigateTo('/mon-espace/connexion')
  }

  /** Appel authentifié vers /api/v1/espace/<chemin>. Une 401 renvoie à la connexion. */
  const api = async (chemin, options = {}) => {
    await init()
    const a = await authEspace()
    const { data } = await a.getSession()
    const jeton = data.session?.access_token
    if (!jeton) {
      await navigateTo('/mon-espace/connexion')
      throw new Error('Connexion requise')
    }
    if (import.meta.dev && demoActive()) {
      const { reponseDemo } = await import('~/dev/espaceDemo.js')
      return reponseDemo(chemin, options, data.session)
    }
    try {
      return await $fetch(`/api/v1/espace/${chemin}`, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${jeton}` },
      })
    }
    catch (err) {
      if (err?.statusCode === 401) {
        await a.signOut()
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

  return {
    session,
    pret,
    moi,
    init,
    envoyerCode,
    verifierCode,
    connexionMotDePasse,
    connexionGoogle,
    confirmationRequise,
    definirMotDePasse,
    moyensConnexion,
    deconnexion,
    api,
    chargerMoi,
  }
}
