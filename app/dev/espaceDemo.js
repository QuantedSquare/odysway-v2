// Démo locale de l'Espace Voyageur : données de la maquette, aucun appel à
// Supabase ni à /api/v1/espace. Chargé par useEspace.js UNIQUEMENT sous
// `import.meta.dev` avec NUXT_PUBLIC_ESPACE_DEMO=true : absent de tout build.
//
// Code de connexion : 123456. Mot de passe : celui défini dans la page Sécurité
// (gardé dans sessionStorage). « Continuer avec Google » ouvre une session
// vieille de 2 heures, pour voir la reconfirmation par code avant le mot de passe.

const CODE = '123456'
const CLE = 'odysway-espace-demo'

const lire = (cle, defaut) => {
  try {
    return JSON.parse(sessionStorage.getItem(`${CLE}:${cle}`)) ?? defaut
  }
  catch {
    return defaut
  }
}
const ecrire = (cle, valeur) => {
  try {
    sessionStorage.setItem(`${CLE}:${cle}`, JSON.stringify(valeur))
  }
  catch {
    // navigation privée : la démo repart de zéro au rechargement
  }
}

const jeton = (methode, ageMinutes = 0) => {
  const charge = { sub: 'demo', amr: [{ method: methode, timestamp: Math.floor(Date.now() / 1000) - ageMinutes * 60 }] }
  return `demo.${btoa(JSON.stringify(charge)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.demo`
}

const nouvelleSession = (email, methode, ageMinutes = 0) => ({
  access_token: jeton(methode, ageMinutes),
  user: {
    id: 'demo',
    email,
    identities: methode === 'oauth' ? [{ provider: 'email' }, { provider: 'google' }] : [{ provider: 'email' }],
    user_metadata: { mot_de_passe: !!lire('motDePasse', null) },
  },
})

const erreur = (code, message) => ({ code, message })

export const creerAuthDemo = () => {
  const abonnes = []
  const changer = (s) => {
    ecrire('session', s)
    abonnes.forEach(f => f(s ? 'SIGNED_IN' : 'SIGNED_OUT', s))
  }
  return {
    getSession: () => Promise.resolve({ data: { session: lire('session', null) } }),
    onAuthStateChange: (f) => {
      abonnes.push(f)
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signInWithOtp: ({ email }) => Promise.resolve().then(() => {
      ecrire('emailCode', email)
      return { error: null }
    }),
    verifyOtp: ({ email, token }) => Promise.resolve().then(() => {
      if (token !== CODE) return { data: {}, error: erreur('otp_expired', 'Token has expired or is invalid') }
      const s = nouvelleSession(email, 'otp')
      changer(s)
      return { data: { session: s }, error: null }
    }),
    signInWithPassword: ({ email, password }) => Promise.resolve().then(() => {
      const attendu = lire('motDePasse', null)
      if (!attendu || attendu.email !== email || attendu.valeur !== password) {
        return { data: {}, error: erreur('invalid_credentials', 'Invalid login credentials') }
      }
      const s = nouvelleSession(email, 'password')
      changer(s)
      return { data: { session: s }, error: null }
    }),
    signInWithOAuth: ({ options }) => Promise.resolve().then(() => {
      changer(nouvelleSession('camille.rousseau@email.fr', 'oauth', 120))
      window.location.assign(options.redirectTo)
      return { error: null }
    }),
    updateUser: ({ password }) => Promise.resolve().then(() => {
      const s = lire('session', null)
      if (!s) return { data: {}, error: erreur('session_not_found', 'No session') }
      ecrire('motDePasse', { email: s.user.email, valeur: password })
      const user = { ...s.user, user_metadata: { ...s.user.user_metadata, mot_de_passe: true } }
      ecrire('session', { ...s, user })
      return { data: { user }, error: null }
    }),
    signOut: () => Promise.resolve().then(() => {
      changer(null)
      return { error: null }
    }),
  }
}

const auj = () => new Date().toISOString().slice(0, 10)
const joursAvant = date => Math.round((Date.parse(date) - Date.parse(auj())) / 86400000)

const nepal = () => ({
  id: 17037,
  role: 'titulaire',
  slug: 'trek-pays-sherpas-nepal',
  titre: 'Trek au pays des Sherpas',
  pays: 'Népal',
  depart: '2027-03-14',
  retour: '2027-03-25',
  duree: 12,
  joursAvantDepart: joursAvant('2027-03-14'),
  etat: 'a_venir',
  nbVoyageurs: 3,
  groupe: true,
  conseiller: 'Léa',
  option: null,
  paiement: { total: 2890, paye: 870, reste: 2020, echeance: '2027-01-13', delaiJours: 60, joursAvantEcheance: joursAvant('2027-01-13'), statut: 'a_regler' },
})

const maroc = () => ({
  id: 15188,
  role: 'titulaire',
  slug: 'immersion-berberes-maroc',
  titre: 'Immersion chez les Berbères',
  pays: 'Maroc',
  depart: '2025-05-12',
  retour: '2025-05-19',
  duree: 8,
  joursAvantDepart: null,
  etat: 'passe',
  nbVoyageurs: 2,
  groupe: true,
  conseiller: 'Léa',
  option: null,
  paiement: { total: 1980, paye: 1980, reste: 0, echeance: '2025-03-13', delaiJours: 60, joursAvantEcheance: joursAvant('2025-03-13'), statut: 'solde' },
})

const voyageurs = () => lire('voyageurs', [
  { slot: 1, prenom: 'Camille', nom: 'Rousseau', titulaire: true, moi: true, visibleGroupe: false, peutChangerVisibilite: true, invitation: null, email: null, peutInviter: false },
  { slot: 2, prenom: 'Julien', nom: 'Rousseau', titulaire: false, moi: false, visibleGroupe: true, peutChangerVisibilite: false, invitation: 'rejoint', email: 'julien.rousseau@email.fr', peutInviter: false },
  { slot: 3, prenom: 'Inès', nom: 'Rousseau', titulaire: false, moi: false, visibleGroupe: false, peutChangerVisibilite: true, invitation: null, email: null, peutInviter: true },
])

export const reponseDemo = async (chemin, options = {}, session) => {
  await new Promise(r => setTimeout(r, 250))
  const corps = options.body || {}

  if (chemin === 'moi') {
    return { compte: { email: session.user.email, prenom: 'Camille', nom: 'Rousseau' }, aujourdhui: auj(), dossiers: [nepal(), maroc()] }
  }

  const visibilite = /^dossiers\/\d+\/voyageurs\/(\d+)\/visibilite$/.exec(chemin)
  if (visibilite) {
    ecrire('voyageurs', voyageurs().map(v => (v.slot === +visibilite[1] ? { ...v, visibleGroupe: corps.visible } : v)))
    return { slot: +visibilite[1], visibleGroupe: corps.visible }
  }

  const invitation = /^dossiers\/\d+\/voyageurs\/(\d+)\/invitation$/.exec(chemin)
  if (invitation) {
    ecrire('voyageurs', voyageurs().map(v => (v.slot === +invitation[1] ? { ...v, email: corps.email, invitation: corps.email ? 'envoyee' : null } : v)))
    return { slot: +invitation[1], invitation: corps.email ? 'envoyee' : null, email: corps.email }
  }

  const dossier = /^dossiers\/(\d+)$/.exec(chemin)
  if (dossier) {
    const base = +dossier[1] === 15188 ? maroc() : nepal()
    return {
      ...base,
      lienPaiement: base.paiement.reste > 0 ? '/checkout?type=balance&booked_id=demo&step=1' : null,
      carnet: null,
      paiements: { complet: true, paiements: [{ le: '2026-09-04T10:00:00Z', montant: 870, rembourse: 0, moyen: 'carte', statut: 'paye', via: 'Stripe' }] },
      voyageurs: voyageurs(),
      compagnons: { visibles: ['Paul D.', 'Hélène M.'], autres: 4 },
    }
  }

  if (chemin === 'rattachement/code') return { envoye: true }
  if (chemin === 'rattachement/verifier') {
    if (corps.code !== CODE) throw Object.assign(new Error('Code'), { statusCode: 400, data: { statusMessage: 'Code incorrect ou expiré. Demandez-en un nouveau.' } })
    return { contacts: 1, dossiers: 2 }
  }

  throw Object.assign(new Error('Démo'), { statusCode: 404, data: { statusMessage: 'Dossier introuvable.' } })
}
