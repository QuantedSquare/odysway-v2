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
  // Variable Vercel oubliée : une erreur nommée plutôt que celle de supabase-js,
  // que init() transforme en « espace indisponible ».
  const manquants = reglagesEspaceManquants(espace)
  if (manquants.length) {
    throw Object.assign(new Error(`Configuration de l'Espace Voyageur incomplète : ${manquants.join(', ')}`), { code: ESPACE_INDISPONIBLE })
  }
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

const CLE_SUITE_GOOGLE = 'odysway-espace-suite'

export const useEspace = () => {
  const session = useState('espace-session', () => null)
  const pret = useState('espace-pret', () => false)
  const moi = useState('espace-moi', () => null)
  // Le client Supabase n'a pas pu démarrer (configuration absente…) : la page
  // de connexion l'annonce au lieu de laisser des boutons sans effet.
  const indisponible = useState('espace-indisponible', () => false)

  /** Ne lève jamais : en cas d'échec, `indisponible` passe à vrai. */
  const init = async () => {
    if (import.meta.server || pret.value || indisponible.value) return
    try {
      const a = await authEspace()
      const { data } = await a.getSession()
      session.value = data.session
      a.onAuthStateChange((_evt, s) => {
        session.value = s
        if (!s) moi.value = null
      })
      pret.value = true
    }
    catch (err) {
      console.error('[espace] initialisation impossible :', err)
      session.value = null
      indisponible.value = true
    }
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

  // L'URL de retour doit être EXACTEMENT une URL autorisée dans Supabase Auth :
  // le moindre paramètre en plus et Supabase renvoie vers son Site URL (Ulysse),
  // avec le code. La destination attend donc dans l'onglet, pas dans l'URL.
  const connexionGoogle = async (suite = '/mon-espace') => {
    try {
      sessionStorage.setItem(CLE_SUITE_GOOGLE, suite)
    }
    catch {
      // stockage indisponible : retour sur l'accueil de l'espace
    }
    const { error } = await (await authEspace()).signInWithOAuth({
      provider: 'google',
      options: { redirectTo: new URL('/mon-espace/connexion', window.location.origin).toString() },
    })
    if (error) throw error
  }

  /** Destination mémorisée avant de partir chez Google ; lue une seule fois. */
  const reprendreSuiteGoogle = () => {
    try {
      const suite = sessionStorage.getItem(CLE_SUITE_GOOGLE)
      sessionStorage.removeItem(CLE_SUITE_GOOGLE)
      return suite
    }
    catch {
      return null
    }
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

  /**
   * Demande le changement d'email du COMPTE (Supabase Auth). Avec « Secure
   * email change », un code part à l'ancienne ET à la nouvelle adresse ; rien
   * ne change avant les deux. L'email du contact AC n'est jamais touché, et les
   * dossiers déjà rattachés le restent (lien sur le contact AC, pas l'email).
   */
  const demanderChangementEmail = async (nouveau) => {
    const { error } = await (await authEspace()).updateUser(
      { email: normaliser(nouveau) },
      { emailRedirectTo: new URL('/mon-espace/securite', window.location.origin).toString() },
    )
    if (error) throw error
  }

  /**
   * Valide le code reçu à `email` (l'ancienne ou la nouvelle adresse). Renvoie
   * le compte à jour quand le changement est fait, sinon null (l'autre code
   * reste attendu : Supabase ne renvoie alors qu'un message, pas de session).
   */
  const confirmerChangementEmail = async (email, code) => {
    const { data, error } = await (await authEspace()).verifyOtp({
      email: normaliser(email),
      token: String(code).trim(),
      type: 'email_change',
    })
    if (error) throw error
    if (!data?.session) return null
    session.value = data.session
    moi.value = null
    return data.session.user
  }

  /**
   * Supprime le compte (DELETE /api/v1/espace/moi), puis oublie la session
   * locale : le compte n'existe plus, inutile de prévenir Supabase.
   */
  const supprimerCompte = async (confirmation) => {
    const resultat = await api('moi', { method: 'DELETE', body: confirmation })
    try {
      await (await authEspace()).signOut({ scope: 'local' })
    }
    catch {
      // session déjà invalide côté Supabase
    }
    session.value = null
    moi.value = null
    return resultat
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
    if (indisponible.value) {
      await navigateTo('/mon-espace/connexion')
      throw Object.assign(new Error('Espace voyageur indisponible'), { code: ESPACE_INDISPONIBLE })
    }
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
    indisponible,
    init,
    envoyerCode,
    verifierCode,
    connexionMotDePasse,
    connexionGoogle,
    reprendreSuiteGoogle,
    confirmationRequise,
    definirMotDePasse,
    demanderChangementEmail,
    confirmerChangementEmail,
    supprimerCompte,
    moyensConnexion,
    deconnexion,
    api,
    chargerMoi,
  }
}
